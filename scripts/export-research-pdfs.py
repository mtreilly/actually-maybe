# /// script
# requires-python = ">=3.12"
# dependencies = ["reportlab==5.0.1"]
# ///
"""Export private Markdown notes as dated PDFs for handwritten review."""

import argparse
import json
import subprocess
import textwrap
from datetime import date
from html import escape
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


def register_fonts() -> None:
    for suffix, filename in [
        ("", "Arial.ttf"),
        ("-Bold", "Arial Bold.ttf"),
        ("-Italic", "Arial Italic.ttf"),
        ("-BoldItalic", "Arial Bold Italic.ttf"),
        ("-Unicode", "Arial Unicode.ttf"),
    ]:
        pdfmetrics.registerFont(TTFont("Review" + suffix, str(FONT_DIR / filename)))
    pdfmetrics.registerFontFamily(
        "Review", normal="Review", bold="Review-Bold",
        italic="Review-Italic", boldItalic="Review-BoldItalic",
    )


def inline_text(nodes: list, links: bool = True) -> str:
    result = []
    for node in nodes:
        kind, content = node["t"], node.get("c")
        if kind == "Str":
            result.append(escape(content))
        elif kind in {"Space", "SoftBreak"}:
            result.append(" ")
        elif kind == "LineBreak":
            result.append("<br/>")
        elif kind in {"Strong", "Emph"}:
            tag = "b" if kind == "Strong" else "i"
            result.append(f"<{tag}>{inline_text(content, links)}</{tag}>")
        elif kind == "Code":
            result.append(f'<font name="Review-Unicode">{escape(content[1])}</font>')
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


def paragraph_style(depth: int = 0, quote: bool = False) -> ParagraphStyle:
    return ParagraphStyle(
        "Body", fontName="Review", fontSize=BODY_SIZE, leading=LINE_HEIGHT,
        spaceAfter=9, leftIndent=depth * 14 + (12 if quote else 0),
        rightIndent=6 if quote else 0, textColor=colors.black,
        borderColor=colors.grey if quote else None,
        borderWidth=0.5 if quote else 0, borderPadding=6 if quote else 0,
        splitLongWords=True, allowWidows=0, allowOrphans=0,
    )


def heading(text: str, level: int, key: str) -> Paragraph:
    style = ParagraphStyle(
        "Heading", fontName="Review-Bold", fontSize=20 if level <= 2 else 16,
        leading=25 if level <= 2 else 22, spaceBefore=18, spaceAfter=12,
        keepWithNext=True,
    )
    item = Paragraph(text, style)
    item.review_heading = (level, key)
    return item


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
            level, attributes, inlines = content
            story.append(heading(inline_text(inlines, False), level, attributes[0]))
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
            code = "\n".join(
                textwrap.fill(line, width=64, subsequent_indent="  ",
                              replace_whitespace=False, drop_whitespace=False)
                if line else "" for line in content[1].splitlines()
            )
            style = ParagraphStyle(
                "Code", fontName="Review-Unicode", fontSize=10, leading=15,
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


def export_document(source: Path, output: Path, revision: str) -> None:
    result = subprocess.run(
        ["pandoc", str(source), "--from=markdown", "--to=json"],
        capture_output=True, text=True, check=True,
    )
    blocks = json.loads(result.stdout)["blocks"]
    if not blocks or blocks[0]["t"] != "Header":
        raise ValueError(f"Expected a document title in {source}")
    title = inline_text(blocks[0]["c"][2], False)
    body = blocks[1:]
    story = [Paragraph(title, ParagraphStyle(
        "Title", fontName="Review-Bold", fontSize=26, leading=32, spaceAfter=16,
    )), Paragraph(f"Research notes · {revision}", paragraph_style()), Spacer(1, 12)]
    if sum(node["t"] == "Header" for node in body) >= 10:
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
    story.extend([PageBreak(), heading("Review notes", 2, "review-notes")])
    document = ReviewDocument(
        str(output), pagesize=PAGE_SIZE, leftMargin=LEFT_MARGIN,
        rightMargin=ANNOTATION_MARGIN, topMargin=36, bottomMargin=42,
        title=Paragraph(title, paragraph_style()).getPlainText(),
    )
    document.review_date = revision
    document.multiBuild(story, onFirstPage=footer, onLaterPages=footer)
    print(output.relative_to(ROOT))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat())
    args = parser.parse_args()
    revision = date.fromisoformat(args.date).isoformat()
    register_fonts()
    output_dir = ROOT / "output/pdf"
    output_dir.mkdir(parents=True, exist_ok=True)
    for source in sorted((ROOT / "research").glob("*.md")):
        if source.name != "README.md":
            export_document(source, output_dir / f"{source.stem}-{revision}.pdf", revision)


if __name__ == "__main__":
    main()
