// Small status toast, top-right so it doesn't collide with the progress counter (top-left).

const TOAST_ID = "course-capture-toast";
const VISIBLE_MS = 4000;
const ERROR_VISIBLE_MS = 8000;

let hideTimer: number | undefined;

export type ToastKind = "info" | "success" | "error";

const BACKGROUNDS: Readonly<Record<ToastKind, string>> = {
  info: "rgba(0, 0, 0, 0.85)",
  success: "rgba(22, 101, 52, 0.92)",
  error: "rgba(153, 27, 27, 0.92)",
};

function element(body: HTMLElement): HTMLDivElement {
  const existing = document.getElementById(TOAST_ID);
  if (existing instanceof HTMLDivElement) return existing;
  const toast = document.createElement("div");
  toast.id = TOAST_ID;
  toast.setAttribute("role", "status");
  Object.assign(toast.style, {
    position: "fixed",
    top: "15px",
    right: "15px",
    zIndex: "999999",
    maxWidth: "360px",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "8px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "14px",
    lineHeight: "1.35",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    pointerEvents: "none",
    transition: "opacity 0.4s ease, transform 0.4s ease",
    opacity: "0",
    transform: "translateY(-10px)",
  });
  body.appendChild(toast);
  return toast;
}

export function showToast(message: string, kind: ToastKind = "info"): void {
  // Payloads can arrive before <body> exists when the script runs at document-start.
  const body = document.querySelector("body");
  if (body === null) {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        showToast(message, kind);
      },
      { once: true },
    );
    return;
  }
  const toast = element(body);
  toast.textContent = message;
  toast.style.backgroundColor = BACKGROUNDS[kind];
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(
    () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
    },
    kind === "error" ? ERROR_VISIBLE_MS : VISIBLE_MS,
  );
}
