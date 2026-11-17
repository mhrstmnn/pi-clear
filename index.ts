import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

// /clear is pi's /new under Claude Code's name, but lets a running turn finish first instead of
// aborting it mid-edit. newSession already builds a fresh runtime, so no reload follows.
async function clearSession(ctx: ExtensionCommandContext) {
  await ctx.waitForIdle();
  await ctx.newSession({
    withSession: async (fresh) => {
      fresh.ui.notify("Context cleared — fresh session started", "info");
    },
  });
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("clear", {
    description: "Clear the conversation context and start a fresh session",
    handler: async (_args, ctx) => clearSession(ctx),
  });

  // A bare "clear" typed as a message would reach the model as an instruction: a hint instead.
  // Not "c", a common answer to lettered options. Only with a UI, where the hint is seen; an input
  // handler can't replace the session itself.
  pi.on("input", async (event, ctx) => {
    if (event.source !== "interactive" || !ctx.hasUI || event.images?.length) return;
    if (event.text.trim().toLowerCase() !== "clear") return;
    ctx.ui.notify("Use /clear to clear the context and start a fresh session", "info");
    return { action: "handled" };
  });
}
