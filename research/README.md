Consists of ongoing research notes, random things for potential blog posts. This is not to be published, it's just for me to read and use as sources.

## Reviewing on reMarkable

Keep Markdown as the source. Export dated PDFs for tablet review, with generous
annotation margins, page numbers, and a contents page for long documents. Upload
new revisions separately so existing handwritten comments stay with their draft.

Generate both PDFs on this Mac (requires Pandoc and uv):

```bash
uv run scripts/export-research-pdfs.py
```

Exports go into the ignored `output/pdf/` directory. To select a revision date,
pass `--date YYYY-MM-DD`. The exporter preserves the notes, keeps external links
clickable, and adds a blank page for review notes.

Existing dated PDFs are protected. Use `--overwrite` only when intentionally
regenerating local files; it does not change any copy on the tablet. Each PDF is
rendered to a temporary file and published atomically, so rendering failures
cannot leave an incomplete destination or damage the previous copy. A batch
can still finish one document before a later document fails.

### Supported notes and verification

The exporter reads top-level `research/*.md`, excluding `README.md`. Each note
must start with a `#` title. Supported content: headings, paragraphs, emphasis,
bullet and decimal-numbered lists, block quotes, horizontal rules, inline code,
fenced code, and links. Code wraps to the available width. Ten or more top-level
`##` sections produce linked contents; headings have flat PDF bookmarks.

Tables, images, footnotes, raw HTML, and other unimplemented Pandoc nodes fail
explicitly. Unsupported font glyphs also fail. External HTTP(S) and email links
are clickable; local-file and fragment links retain their label only. Ordered
lists render as decimal numbers. The Mac's Arial and Arial Unicode fonts are
embedded; this script is not currently portable to Linux or Windows.

Run the focused regression checks after changing the exporter:

```bash
uv run scripts/test-research-pdfs.py
```

They check preservation of existing copies, explicit local replacement,
bookmark collisions, code widths, invalid titles, unsupported content, and
unsupported glyphs. They run locally without a cloud connection and are
separate from the site's `pnpm test` command.

Before uploading a new layout, export the actual notes and use `pdftoppm` to
render representative pages into ignored `tmp/pdfs/`. Check text extraction
against the source, inspect contents, long code lines, and section transitions,
and confirm that annotation space remains clear. Automated checks do not prove
every future layout will be readable.

Use the maintained [ddvk/rmapi CLI](https://github.com/ddvk/rmapi) for cloud
transfers and [remarkable-mcp](https://github.com/SamMorrowDrums/remarkable-mcp)
to browse the library, read highlights, and export annotated PDFs.

```bash
rmapi -ni ls /
rmapi mkdir /Research
rmapi put path/to/dated-draft.pdf /Research
```

Create `/Research` once. Avoid `put --force`, which removes existing annotations.
Replacing only PDF content can also misalign handwriting if pagination changes.
Transfer requires the user's authorisation; generating local PDFs does not
authorise uploading new private notes. After upload, use MCP `remarkable_browse`
with `path: "/Research"` and confirm the exact document names. Inspect `_error`
inside tool results as well as the MCP error flag. Cloud confirmation does not
prove that the tablet has synced; it needs a network connection.

### Local setup

The Mac has `rmapi` installed in `~/.local/bin` from ddvk/rmapi commit
`aa60dac8a8dbb1b4eb6a25f2caf2f3daea573373`, and `remarkable-mcp` 2.1.0 installed
with `uv tool install remarkable-mcp`.

- `.env` stores `REMARKABLE_PAIRING_CODE`. The code is single-use, and does not
  authenticate future sessions after registration.
- `rmapi` stores its reusable credentials in `~/.rmapi`.
- Project MCP settings and the device token live in `.codex/config.toml`. This
  local file and `.env` are ignored by Git and have owner-only permissions.
- The MCP uses `REMARKABLE_TOKEN` because its token parser does not accept
  rmapi's YAML format. `PYMUPDF_MESSAGE=fd:2` keeps dependency messages off the
  MCP protocol's stdout stream.

Restart the project session after configuring the MCP to load its tools. Verify
with `remarkable_status` and `remarkable_browse`. Cloud mode requires Connect
according to the MCP documentation. No desktop-app automation is needed.
