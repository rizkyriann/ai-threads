import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export function keepDialogFocus(event: ReactKeyboardEvent<HTMLElement>, onEscape: () => void) {
  if (event.key === "Escape") {
    event.preventDefault();
    onEscape();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
    "button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
  );
  const first = focusable.item(0);
  const last = focusable.item(focusable.length - 1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
