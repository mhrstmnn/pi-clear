# 🧹 Clear

> Hardened fork of [`pi-clear`](https://www.npmjs.com/package/pi-clear) (npm, by pierre-mike).
> The original crashes on current pi versions with `Extension "command:clear" error: This extension ctx is stale after session replacement or reload` — this fork fixes that by moving post-replacement work into `withSession`, per the current extension API.

Adds `/clear` and `/c` commands (plus bare-message interception) to wipe the conversation context and start a fresh session with a full runtime reload.

## Install

```bash
pi install npm:pi-clear
```

## What it does

Registers two slash commands and an input interceptor. Both commands wait for the agent to be idle, start a new session (all post-replacement work runs in `withSession` on the fresh context), reload the runtime, and notify you that the slate is clean.

## Commands

| Command | Description |
|---|---|
| `/clear` | Clear context and start a fresh session |
| `/c` | Alias for `/clear` |

## Bare message interception

Typing `clear` or `c` as a plain message (without the `/` prefix) is intercepted so those words are never sent to the LLM. Session replacement is command-only, so this path shows a hint to use `/clear` instead of clearing directly.
