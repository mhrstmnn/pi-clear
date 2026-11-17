import { describe, expect, test } from "bun:test";
import type { ExtensionAPI, ExtensionContext, InputEvent, InputEventResult } from "@earendil-works/pi-coding-agent";
import clearExtension from "../index";

// The extension's input hook as pi calls it: every message that isn't a command passes it before
// it reaches the model, whether typed (idle, steered into a running turn or queued as a
// follow-up), sent by an extension or over RPC.

type InputHandler = (event: InputEvent, ctx: ExtensionContext) => Promise<InputEventResult | undefined>;

function loadInputHandler(): InputHandler {
  const handlers = new Map<string, unknown>();
  const pi = {
    on: (name: string, handler: unknown) => handlers.set(name, handler),
    registerCommand: () => {},
  };
  clearExtension(pi as unknown as ExtensionAPI);
  return handlers.get("input") as InputHandler;
}

// Sends one message through the hook: whether it stopped the message, and the notices it showed.
// hasUI is false in print and JSON mode, where nobody sees a notice.
async function send(text: string, event: Partial<InputEvent> = {}, hasUI = true): Promise<{ handled: boolean; notices: string[] }> {
  const notices: string[] = [];
  const ctx = { hasUI, ui: { notify: (message: string) => notices.push(message) } } as unknown as ExtensionContext;
  const result = await loadInputHandler()({ type: "input", text, source: "interactive", ...event }, ctx);
  return { handled: result?.action === "handled", notices };
}

const sent = { handled: false, notices: [] };
const whileIdleOrBusy = [undefined, "steer", "followUp"] as const;

describe("the clear extension's input hook", () => {
  test("a bare c reaches the model, idle or steered into a running turn", async () => {
    for (const text of ["c", "C", " c "]) {
      for (const streamingBehavior of whileIdleOrBusy) {
        expect(await send(text, { streamingBehavior })).toEqual(sent);
      }
    }
  });

  test("a clear not typed by the user, or with an image attached, reaches the model", async () => {
    expect(await send("clear", { source: "extension" })).toEqual(sent);
    expect(await send("clear", { source: "rpc" })).toEqual(sent);
    expect(await send("clear", { images: [{ type: "image", data: "", mimeType: "image/png" }] })).toEqual(sent);
  });

  test("a clear in print or JSON mode (pi -p clear) reaches the model instead of vanishing unseen", async () => {
    expect(await send("clear", {}, false)).toEqual(sent);
  });

  test("a typed clear shows the hint instead of being sent, also while pi is busy", async () => {
    for (const streamingBehavior of whileIdleOrBusy) {
      expect(await send(" Clear ", { streamingBehavior })).toEqual({
        handled: true,
        notices: ["Use /clear to clear the context and start a fresh session"],
      });
    }
  });
});
