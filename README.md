# 🧹 Clear

> Hardened fork of [`pi-clear`](https://www.npmjs.com/package/pi-clear) (npm, by pierre-mike).
> The original crashes on current pi versions with `Extension "command:clear" error: This extension ctx is stale after session replacement or reload` — this fork fixes that by moving post-replacement work into `withSession`, per the current extension API.

Adds `/clear`: pi's `/new` under Claude Code's name, but it lets a running turn finish first instead of aborting it mid-edit.

## Install

The npm package `pi-clear` is the original, so install this fork from GitHub:

```bash
pi install git:github.com/mhrstmnn/pi-clear
```

## What it does

`/clear` waits until the agent is idle, then starts a new session and notifies you on the fresh one. `newSession` already builds a fresh runtime, so no reload follows.

## Bare message interception

Typing `clear` as a plain message (without the `/` prefix) would reach the model as an instruction, so it shows a hint to use `/clear` instead; an input handler can't replace the session itself. This applies only to interactive input with a UI and no attached images: in print or JSON mode (`pi -p clear`) nobody would see the hint, so the message goes through.

A bare `c` is not intercepted, and there is no `/c` alias: `c` is a common answer to lettered options.

## Development

```bash
bun install
bun run check
bun test tests
```
