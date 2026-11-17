import { expect, test } from "bun:test";
import type { ExtensionAPI, ExtensionCommandContext, RegisteredCommand } from "@earendil-works/pi-coding-agent";
import clearExtension from "../index";

type CommandOptions = Omit<RegisteredCommand, "name" | "sourceInfo">;

function loadCommands(): Map<string, CommandOptions> {
  const commands = new Map<string, CommandOptions>();
  const pi = {
    on: () => {},
    registerCommand: (name: string, options: CommandOptions) => commands.set(name, options),
  };
  clearExtension(pi as unknown as ExtensionAPI);
  return commands;
}

// /clear is the only command: a /c alias was dropped, so one name clears the context.
test("the clear extension registers /clear and no other command", () => {
  expect([...loadCommands().keys()]).toEqual(["clear"]);
});

// pi's /new aborts a running turn; /clear lets it finish, then starts the session without a
// second reload (newSession already builds a fresh runtime) and notifies on the fresh ctx.
test("/clear waits for the running turn, then starts a fresh session without reloading", async () => {
  const calls: string[] = [];
  const freshContext = {
    ui: { notify: (message: string) => calls.push(`notify on the fresh ctx: ${message}`) },
    reload: async () => calls.push("reload on the fresh ctx"),
  };
  const context = {
    waitForIdle: async () => calls.push("waitForIdle"),
    newSession: async (options?: { withSession?: (fresh: typeof freshContext) => Promise<void> }) => {
      calls.push("newSession");
      await options?.withSession?.(freshContext);
      return { cancelled: false };
    },
    reload: async () => calls.push("reload"),
  };
  await loadCommands().get("clear")?.handler("", context as unknown as ExtensionCommandContext);
  expect(calls).toEqual(["waitForIdle", "newSession", "notify on the fresh ctx: Context cleared — fresh session started"]);
});
