import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Shared clear logic — only callable from a command context, which has
// waitForIdle/newSession/reload.
//
// Session replacement and reload invalidate the ctx they were called on, so all
// post-replacement work must run inside `withSession` using the fresh ctx it
// supplies. Note that `fresh` is itself invalidated by `await fresh.reload()`,
// so the notification happens BEFORE the reload.
// biome-ignore lint/suspicious/noExplicitAny: Command context has additional methods not in ExtensionContext
async function clearSession(ctx: any) {
	await ctx.waitForIdle();
	await ctx.newSession({
		withSession: async (fresh) => {
			fresh.ui.notify(
				"Context cleared & runtime reloaded — fresh session started",
				"info",
			);
			await fresh.reload();
		},
	});
}

export default function (pi: ExtensionAPI) {
	// Register /clear command
	pi.registerCommand("clear", {
		description: "Clear the conversation context and start a fresh session",
		handler: async (_args, ctx) => clearSession(ctx),
	});

	// Register /c as a single-letter alias for /clear
	pi.registerCommand("c", {
		description: "Alias for /clear — fresh session + reload",
		handler: async (_args, ctx) => clearSession(ctx),
	});

	// Intercept bare "c" or "clear" typed as a plain message (no slash prefix).
	// Session replacement is command-only (input handlers receive a plain
	// ExtensionContext, and calling newSession from a lifecycle handler can
	// deadlock the runtime), so point the user at /clear and swallow the
	// message instead of sending "clear" to the LLM.
	pi.on("input", async (event, ctx) => {
		const trimmed = event.text.trim().toLowerCase();
		if (trimmed === "c" || trimmed === "clear") {
			ctx.ui.notify(
				"Use /clear to clear the context and start a fresh session",
				"info",
			);
			return { action: "handled" };
		}
	});
}
