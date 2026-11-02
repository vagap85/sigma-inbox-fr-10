export async function runAction(action: Record<string, unknown>): Promise<void> {
  if (action.type !== "mark-read" || typeof action.id !== "string") {
    throw new Error("Unsupported preview action");
  }
}
