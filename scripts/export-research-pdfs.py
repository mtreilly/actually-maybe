# /// script
# requires-python = ">=3.12"
# dependencies = ["reportlab==5.0.1"]
# ///
"""Export private Markdown notes as dated PDFs for handwritten review."""

import argparse
import json
import os
import shutil
import subprocess
import tempfile
from datetime import date
from html import escape
from itertools import count
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    XPreformatted,
)
from reportlab.platypus.tableofcontents import TableOfContents

PAGE_SIZE = (540, 720)
LEFT_MARGIN = 36
ANNOTATION_MARGIN = 120
BODY_SIZE = 14
LINE_HEIGHT = 21
ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = Path("/System/Library/Fonts/Supplemental")
BOOKMARK_IDS = count()
CODE_SIZE = 10


def register_fonts() -> None:
    for suffix, filename in [
        ("", "Arial.ttf"),
        ("-Bold", "Arial Bold.ttf"),
        ("-Italic", "Arial Italic.ttf"),
        ("-BoldItalic", "Arial Bold Italic.ttf"),
        ("-Unicode", "Arial Unicode.ttf"),
    ]:
        path = FONT_DIR / filename
        if not path.is_file():
            raise FileNotFoundError(f"Required macOS font is missing: {path}")
        pdfmetrics.registerFont(TTFont("Review" + suffix, str(path)))
    pdfmetrics.registerFontFamily(
        "Review", normal="Review", bold="Review-Bold",
        italic="Review-Italic", boldItalic="Review-BoldItalic",
    )


def inline_text(nodes: list, links: bool = True) -> str:
    result = []
    for node in nodes:
        kind, content = node["t"], node.get("c")
        if kind == "Str":
            result.append(escaped_text(content))
        elif kind in {"Space", "SoftBreak"}:
            result.append(" ")
        elif kind == "LineBreak":
            result.append("<br/>")
        elif kind in {"Strong", "Emph"}:
            tag = "b" if kind == "Strong" else "i"
            result.append(f"<{tag}>{inline_text(content, links)}</{tag}>")
        elif kind == "Code":
            result.append(f'<font name="Review-Unicode">{escaped_text(content[1])}</font>')
        elif kind == "Link":
            label = inline_text(content[1], links)
            target = content[2][0]
            # External references stay clickable; unresolved local links stay readable.
            if links and target.startswith(("https://", "http://", "mailto:")):
                label = f'<link href="{escape(target, quote=True)}"><u>{label}</u></link>'
            result.append(label)
        else:
            raise ValueError(f"Unsupported inline Markdown: {kind}")
    return "".join(result)


def escaped_text(text: str) -> str:
    normal = pdfmetrics.getFont("Review").face.charToGlyph
    fallback = pdfmetrics.getFont("Review-Unicode").face.charToGlyph
    result = []
    for char in text:
        if ord(char) in normal:
            result.append(escape(char))
        elif ord(char) in fallback:
            result.append(f'<font name="Review-Unicode">{escape(char)}</font>')
        else:
            raise ValueError(f"No review font supports {char!r} (U+{ord(char):04X})")
    return "".join(result)


def paragraph_style(depth: int = 0, quote: bool = False) -> ParagraphStyle:
    return ParagraphStyle(
        "Body", fontName="Review", fontSize=BODY_SIZE, leading=LINE_HEIGHT,
        spaceAfter=9, leftIndent=depth * 14 + (12 if quote else 0),
        rightIndent=6 if quote else 0, textColor=colors.black,
        borderColor=colors.grey if quote else None,
        borderWidth=0.5 if quote else 0, borderPadding=6 if quote else 0,
        splitLongWords=True, allowWidows=0, allowOrphans=0,
    )


def heading(text: str, level: int) -> Paragraph:
    style = ParagraphStyle(
        "Heading", fontName="Review-Bold", fontSize=20 if level <= 2 else 16,
        leading=25 if level <= 2 else 22, spaceBefore=18, spaceAfter=12,
        keepWithNext=True,
    )
    item = Paragraph(text, style)
    item.review_heading = (level, f"heading-{next(BOOKMARK_IDS)}")
    return item


def wrap_code(code: str, depth: int) -> str:
    width = PAGE_SIZE[0] - LEFT_MARGIN - ANNOTATION_MARGIN - depth * 14
    if width <= 0:
        raise ValueError("Code is nested too deeply to fit the review page")
    lines = []
    for original in code.expandtabs(4).split("\n"):
        line, used = "", 0.0
        for char in original:
            if ord(char) not in pdfmetrics.getFont("Review-Unicode").face.charToGlyph:
                raise ValueError(f"No code font supports {char!r} (U+{ord(char):04X})")
            size = pdfmetrics.stringWidth(char, "Review-Unicode", CODE_SIZE)
            if used + size > width and line:
                lines.append(line)
                line, used = "", 0.0
            line += char
            used += size
        lines.append(line)
    return "\n".join(lines)


def render_blocks(blocks: list, depth: int = 0, quote: bool = False) -> list:
    story = []
    for node in blocks:
        kind, content = node["t"], node.get("c")
        if kind in {"Para", "Plain"}:
            style = paragraph_style(depth, quote)
            if len(content) == 1 and content[0]["t"] == "Strong":
                style.keepWithNext = True
                style.spaceBefore = 6
            story.append(Paragraph(inline_text(content), style))
        elif kind == "Header":
            level, _, inlines = content
            story.append(heading(inline_text(inlines, False), level))
        elif kind == "HorizontalRule":
            story.extend([Spacer(1, 10), HRFlowable(width="100%", color=colors.lightgrey)])
        elif kind == "BlockQuote":
            story.extend(render_blocks(content, depth, quote=True))
        elif kind in {"BulletList", "OrderedList"}:
            entries = content if kind == "BulletList" else content[1]
            start = 1 if kind == "BulletList" else content[0][0]
            for index, entry in enumerate(entries, start):
                items = render_blocks(entry, depth + 1, quote)
                if items and isinstance(items[0], Paragraph):
                    items[0].bulletText = "•" if kind == "BulletList" else f"{index}."
                    items[0].style.bulletIndent = depth * 14
                    items[0].style.bulletFontName = "Review"
                    items[0].style.bulletFontSize = BODY_SIZE
                story.extend(items)
        elif kind == "CodeBlock":
            code = wrap_code(content[1], depth)
            style = ParagraphStyle(
                "Code", fontName="Review-Unicode", fontSize=CODE_SIZE, leading=15,
                leftIndent=depth * 14, spaceBefore=4, spaceAfter=12,
            )
            story.append(XPreformatted(escape(code), style))
        else:
            raise ValueError(f"Unsupported block Markdown: {kind}")
    return story


class ReviewDocument(SimpleDocTemplate):
    def afterFlowable(self, flowable) -> None:
        if not hasattr(flowable, "review_heading"):
            return
        level, key = flowable.review_heading
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(flowable.getPlainText(), key, level=0)
        if level == 2:
            self.notify("TOCEntry", (0, flowable.getPlainText(), self.page, key))


def footer(canvas, document) -> None:
    canvas.saveState()
    canvas.setFont("Review", 9)
    canvas.drawString(LEFT_MARGIN, 22, "Private research · " + document.review_date)
    canvas.drawRightString(PAGE_SIZE[0] - 30, 22, str(document.page))
    canvas.restoreState()


def export_document(source: Path, output: Path, revision: str, *, overwrite: bool = False) -> None:
    if output.exists() and not overwrite:
        raise FileExistsError(f"Review copy already exists: {output}. Choose another date or use --overwrite locally.")
    result = subprocess.run(
        ["pandoc", str(source), "--from=markdown", "--to=json"],
        capture_output=True, text=True, check=True,
    )
    blocks = json.loads(result.stdout)["blocks"]
    if not blocks or blocks[0]["t"] != "Header" or blocks[0]["c"][0] != 1:
        raise ValueError(f"Expected an initial # document title in {source}")
    title = inline_text(blocks[0]["c"][2], False)
    body = blocks[1:]
    story = [Paragraph(title, ParagraphStyle(
        "Title", fontName="Review-Bold", fontSize=26, leading=32, spaceAfter=16,
    )), Paragraph(f"Research notes · {revision}", paragraph_style()), Spacer(1, 12)]
    if sum(node["t"] == "Header" and node["c"][0] == 2 for node in body) >= 10:
        story.append(Paragraph("Contents", ParagraphStyle(
            "ContentsTitle", fontName="Review-Bold", fontSize=18, leading=24,
            spaceBefore=16, spaceAfter=16,
        )))
        contents = TableOfContents()
        contents.levelStyles = [ParagraphStyle(
            "ContentsEntry", fontName="Review", fontSize=11, leading=16,
            spaceBefore=5, rightIndent=24,
        )]
        story.extend([contents, PageBreak()])
    story.extend(render_blocks(body))
    story.extend([PageBreak(), heading("Review notes", 2)])
    with tempfile.NamedTemporaryFile(dir=output.parent, suffix=".pdf", delete=False) as temporary:
        temporary_path = Path(temporary.name)
    try:
        document = ReviewDocument(
            str(temporary_path), pagesize=PAGE_SIZE, leftMargin=LEFT_MARGIN,
            rightMargin=ANNOTATION_MARGIN, topMargin=36, bottomMargin=42,
            title=Paragraph(title, paragraph_style()).getPlainText(),
        )
        document.review_date = revision
        document.multiBuild(story, onFirstPage=footer, onLaterPages=footer)
        if overwrite:
            os.replace(temporary_path, output)
        else:
            os.link(temporary_path, output)
    finally:
        temporary_path.unlink(missing_ok=True)
    print(output)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", type=date.fromisoformat, default=date.today())
    parser.add_argument("--overwrite", action="store_true", help="Replace local PDFs only; never uploads")
    args = parser.parse_args()
    if shutil.which("pandoc") is None:
        parser.error("Pandoc is required. Install it with brew install pandoc.")
    revision = args.date.isoformat()
    register_fonts()
    output_dir = ROOT / "output/pdf"
    output_dir.mkdir(parents=True, exist_ok=True)
    sources = [p for p in sorted((ROOT / "research").glob("*.md")) if p.name != "README.md"]
    if not sources:
        parser.error("No research Markdown files found")
    for source in sources:
        output = output_dir / f"{source.stem}-{revision}.pdf"
        if output.exists() and not args.overwrite:
            parser.error(f"Review copy already exists: {output}. Choose another date or use --overwrite locally.")
    for source in sources:
        export_document(source, output_dir / f"{source.stem}-{revision}.pdf", revision, overwrite=args.overwrite)


if __name__ == "__main__":
    main()
