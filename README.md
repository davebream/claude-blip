<div align="center">

# claude-blip

A minimal statusline for Claude Code. One file, zero dependencies.

[![npm](https://img.shields.io/npm/v/claude-blip)](https://www.npmjs.com/package/claude-blip)
[![install size](https://packagephobia.com/badge?p=claude-blip)](https://packagephobia.com/result?p=claude-blip)

![variants](variants.gif)

*green when fresh, yellow when warm, red when you're cooked*

</div>

## Install

```sh
npx claude-blip
```

Restart Claude Code.

## Segments

| Segment | Shows | Style |
|---------|-------|-------|
| Project | Directory name | dim |
| Branch | Current git branch | dim |
| Model | opus, sonnet, haiku | dim |
| Context | Usage bar + token count | green / yellow / red |

The context bar scales to 80% - roughly where Claude starts compressing history.

Terminal too narrow? Segments drop from the left. Context bar stays.

## Scopes

```sh
npx claude-blip              # global (default)
npx claude-blip --project    # .claude/settings.json (shareable)
npx claude-blip --local      # .claude/settings.local.json (gitignored)
npx claude-blip --uninstall  # clean removal
```

## How it works

Claude Code pipes session JSON via stdin. This script reads it, formats one line, writes it to stdout. ~140 lines of Node.js.

<details>
<summary>Debug mode</summary>

Set `debug: true` in the CONFIG object at top of `statusline.js` to dump the full JSON payload to stderr.

</details>

## License

MIT
