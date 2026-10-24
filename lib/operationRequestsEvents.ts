const EVENT_NAME = "operation-requests:changed"

export function emitOperationRequestsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME))
  }
}

export function subscribeToOperationRequestsChanged(
  callback: () => void
): () => void {
  if (typeof window === "undefined") return () => {}

  window.addEventListener(EVENT_NAME, callback)
  return () => window.removeEventListener(EVENT_NAME, callback)
}
