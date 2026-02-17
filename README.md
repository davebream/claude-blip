<div align="center">

# claude-blip

*green when fresh, yellow when warm, red when you're cooked*

[![npm](https://img.shields.io/npm/v/claude-blip)](https://www.npmjs.com/package/claude-blip)
[![install size](https://packagephobia.com/badge?p=claude-blip)](https://packagephobia.com/result?p=claude-blip)

![variants](variants.gif)

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

## Uninstall

```sh
npx claude-blip --uninstall
```

## How it works

Claude Code pipes session JSON via stdin. This script reads it, formats one line, writes it to stdout. ~140 lines of Node.js.

## License

MIT
