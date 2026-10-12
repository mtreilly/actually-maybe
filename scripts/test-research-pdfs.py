# /// script
# requires-python = ">=3.12"
# dependencies = ["reportlab==5.0.1", "pypdf==6.20.1", "pymupdf==1.28.2"]
# ///
"""Verify review PDF preservation, navigation, and layout with real Markdown."""

import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import pymupdf
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("research_pdf", ROOT / "scripts/export-research-pdfs.py")
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


class ResearchPdfTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        exporter.register_fonts()

    def setUp(self) -> None:
        scratch = ROOT / "tmp/pdfs"
        scratch.mkdir(parents=True, exist_ok=True)
        self.directory = tempfile.TemporaryDirectory(dir=scratch)
        self.addCleanup(self.directory.cleanup)
        self.source = Path(self.directory.name) / "notes.md"
        self.output = Path(self.directory.name) / "notes.pdf"

    def export(self, markdown: str) -> None:
        self.source.write_text(markdown, encoding="utf-8")
        exporter.export_document(self.source, self.output, "2026-10-13")

    def test_existing_review_copy_is_preserved(self) -> None:
        previous = b"existing annotated review copy"
        self.output.write_bytes(previous)
        with self.assertRaises(FileExistsError):
            self.export("# Draft\n\nReplacement text.\n")
        self.assertEqual(self.output.read_bytes(), previous)

    def test_source_heading_and_generated_notes_have_distinct_destinations(self) -> None:
        self.export("# Draft\n\n## Review notes\n\nOriginal research text.\n")
        reader = PdfReader(self.output)
        destinations = [reader.get_destination_page_number(item) for item in reader.outline]
        self.assertEqual(destinations, [0, len(reader.pages) - 1])

    def test_wide_code_stays_inside_annotation_margin(self) -> None:
        self.export("# Draft\n\n```text\n" + "W" * 130 + "\n```\n")
        with pymupdf.open(self.output) as document:
            for page in document:
                for block in page.get_text("dict")["blocks"]:
                    for line in block.get("lines", []):
                        if line["bbox"][1] < 675:
                            self.assertLessEqual(line["bbox"][2], 426)
            text = "".join(page.get_text() for page in document)
            self.assertEqual(text.count("W"), 130)

    def test_failed_export_does_not_leave_a_partial_pdf(self) -> None:
        with self.assertRaises(ValueError):
            self.export("# Draft\n\n| A | B |\n|---|---|\n| one | two |\n")
        self.assertFalse(self.output.exists())

    def test_explicit_local_overwrite_replaces_the_pdf(self) -> None:
        self.export("# Draft\n\nOriginal text.\n")
        self.source.write_text("# Draft\n\nRevised text.\n", encoding="utf-8")
        exporter.export_document(self.source, self.output, "2026-10-13", overwrite=True)
        text = "".join(page.extract_text() for page in PdfReader(self.output).pages)
        self.assertIn("Revised text.", text)
        self.assertNotIn("Original text.", text)
        self.assertEqual(sorted(p.name for p in self.output.parent.iterdir()), ["notes.md", "notes.pdf"])

    def test_document_requires_a_top_level_title(self) -> None:
        with self.assertRaises(ValueError):
            self.export("## Section without a document title\n\nText.\n")
        self.assertFalse(self.output.exists())

    def test_unsupported_glyph_does_not_silently_disappear(self) -> None:
        with self.assertRaises(ValueError):
            self.export("# Draft\n\nUnsupported emoji: 🦄\n")
        self.assertFalse(self.output.exists())

    def test_render_failure_preserves_previous_copy_and_cleans_temporary_file(self) -> None:
        previous = b"existing review PDF"
        self.output.write_bytes(previous)
        self.source.write_text("# Draft\n\nNew text.\n", encoding="utf-8")

        def fail_during_render(document, *args, **kwargs) -> None:
            Path(document.filename).write_bytes(b"partial PDF")
            raise RuntimeError("render interrupted")

        with patch.object(exporter.ReviewDocument, "multiBuild", fail_during_render):
            with self.assertRaises(RuntimeError):
                exporter.export_document(self.source, self.output, "2026-10-13", overwrite=True)
        self.assertEqual(self.output.read_bytes(), previous)
        self.assertEqual(sorted(p.name for p in self.output.parent.iterdir()), ["notes.md", "notes.pdf"])


if __name__ == "__main__":
    unittest.main()
