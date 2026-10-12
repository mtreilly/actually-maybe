Consists of ongoing research notes, random things for potential blog posts. This is not to be published, it's just for me to read and use as sources.

## Reviewing on reMarkable

Keep Markdown as the source. Export dated PDFs for tablet review, with generous
annotation margins, page numbers, and a contents page for long documents. Upload
new revisions separately so existing handwritten comments stay with their draft.

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
