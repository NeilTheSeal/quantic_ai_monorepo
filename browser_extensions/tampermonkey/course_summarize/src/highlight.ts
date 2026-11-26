// Shows the answer key for the slide on screen: outlines the correct answer buttons and lists
// every correct answer in a small panel (bottom-right). The panel covers what outlines can't:
// typed answers, and cards that share one answer pool. Only ungraded lessons have keys (see
// answers.ts).
//
// The current slide is the last element with a `frame-guid` attribute (Quantic's
// `<componentized frame-guid=…>`); answer buttons carry the answer's id as `component-id`.
// A MutationObserver re-applies both as the AngularJS app swaps slides in and out.

import type { AnswerKey, FrameKey } from "./answers.ts";

const STYLE_ID = "course-capture-answer-style";
const PANEL_ID = "course-capture-answer-panel";
export const MARK_CLASS = "course-capture-correct-answer";

const UUID = /^[0-9a-f-]{36}$/i;

const CSS_TEXT = `
.${MARK_CLASS} {
  outline: 3px solid #22c55e !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.3) !important;
}
#${PANEL_ID} {
  position: fixed;
  right: 15px;
  bottom: 100px;
  z-index: 999998;
  max-width: 340px;
  max-height: 40vh;
  overflow: auto;
  padding: 8px 12px;
  border-left: 4px solid #22c55e;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.82);
  color: #ffffff;
  font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
#${PANEL_ID} .title { font-weight: 700; }
#${PANEL_ID} .instructions { opacity: 0.7; font-size: 12px; }
#${PANEL_ID} ol { margin: 4px 0 0; padding-left: 18px; }
#${PANEL_ID} .prompt { opacity: 0.8; }
#${PANEL_ID} .answer { color: #86efac; font-weight: 600; }
`;

export interface HighlighterOptions {
  doc: Document;
  /** Defers a re-apply to the next frame; tests pass a synchronous one. */
  schedule?: (callback: () => void) => void;
}

export class AnswerHighlighter {
  private readonly doc: Document;
  private readonly schedule: (callback: () => void) => void;
  private readonly keys = new Map<string, FrameKey>();
  /** Frames seen in graded or unflagged lessons: never keyed, even if keyed elsewhere first. */
  private readonly denied = new Set<string>();
  private enabled = false;
  private observer: MutationObserver | null = null;
  private pending = false;
  /** Frame whose panel is showing (null: none), so the observer doesn't rebuild it in a loop. */
  private panelFrame: string | null = null;

  constructor(options: HighlighterOptions) {
    this.doc = options.doc;
    this.schedule =
      options.schedule ??
      ((callback) => {
        options.doc.defaultView?.requestAnimationFrame(callback);
      });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  addKeys(update: AnswerKey): void {
    // A lesson can appear in more than one course; once a frame shows up in graded content,
    // drop its key for good rather than keep the one an ungraded copy supplied earlier.
    for (const frameId of update.gradedFrameIds) {
      this.denied.add(frameId);
      this.keys.delete(frameId);
    }
    for (const [frameId, key] of update.keys) {
      if (!this.denied.has(frameId)) this.keys.set(frameId, key);
    }
    this.requestApply();
  }

  setEnabled(enabled: boolean): void {
    if (enabled === this.enabled) return;
    this.enabled = enabled;
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }

  private start(): void {
    const view = this.doc.defaultView;
    if (view === null) return;
    this.injectStyle();
    this.observer = new view.MutationObserver(() => {
      this.requestApply();
    });
    // documentElement, not body: at document-start the body may not exist yet.
    this.observer.observe(this.doc.documentElement, { childList: true, subtree: true });
    this.requestApply();
  }

  private stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    for (const marked of this.doc.querySelectorAll(`.${MARK_CLASS}`)) {
      marked.classList.remove(MARK_CLASS);
    }
    this.doc.getElementById(PANEL_ID)?.remove();
    this.panelFrame = null;
  }

  private requestApply(): void {
    if (!this.enabled || this.pending) return;
    this.pending = true;
    this.schedule(() => {
      this.pending = false;
      if (this.enabled) this.apply();
    });
  }

  /**
   * The slide on screen: the last `[frame-guid]` element that isn't animating out (AngularJS
   * keeps the leaving slide in the DOM under `.ng-leave` until its animation ends).
   */
  private currentFrame(): Element | null {
    const frames = [...this.doc.querySelectorAll("[frame-guid]")];
    const entering = frames.filter((frame) => frame.closest(".ng-leave") === null);
    return entering.at(-1) ?? frames.at(-1) ?? null;
  }

  /** Marks and panel for the slide currently on screen. Idempotent. */
  apply(): void {
    const frame = this.currentFrame();
    const frameId = frame?.getAttribute("frame-guid") ?? null;
    const key = frameId === null ? undefined : this.keys.get(frameId);

    const wantedMarks = new Set<Element>();
    if (frame !== null && key !== undefined) {
      for (const id of key.highlightIds) {
        if (!UUID.test(id)) continue;
        for (const el of frame.querySelectorAll(`[component-id="${id}"]`)) wantedMarks.add(el);
      }
    }
    // Anything else marked is stale: another slide's, or a key that was withdrawn.
    for (const marked of this.doc.querySelectorAll(`.${MARK_CLASS}`)) {
      if (!wantedMarks.has(marked)) marked.classList.remove(MARK_CLASS);
    }
    for (const el of wantedMarks) el.classList.add(MARK_CLASS);

    const wanted = key === undefined ? null : frameId;
    if (wanted !== this.panelFrame) {
      this.panelFrame = wanted;
      this.renderPanel(key);
    }
  }

  private injectStyle(): void {
    if (this.doc.getElementById(STYLE_ID) !== null) return;
    const style = this.doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS_TEXT;
    (this.doc.querySelector("head") ?? this.doc.documentElement).appendChild(style);
  }

  private renderPanel(key: FrameKey | undefined): void {
    this.doc.getElementById(PANEL_ID)?.remove();
    const body = this.doc.querySelector("body");
    if (key === undefined || body === null) return;

    const panel = this.doc.createElement("div");
    panel.id = PANEL_ID;
    const title = this.doc.createElement("div");
    title.className = "title";
    title.textContent = "Answer key";
    panel.appendChild(title);
    if (key.instructions !== null) {
      const instructions = this.doc.createElement("div");
      instructions.className = "instructions";
      instructions.textContent = key.instructions;
      panel.appendChild(instructions);
    }
    const list = this.doc.createElement("ol");
    for (const challenge of key.challenges) {
      const item = this.doc.createElement("li");
      if (challenge.prompt !== null) {
        const prompt = this.doc.createElement("span");
        prompt.className = "prompt";
        prompt.textContent = `${challenge.prompt} → `;
        item.appendChild(prompt);
      }
      const answer = this.doc.createElement("span");
      answer.className = "answer";
      answer.textContent = challenge.correct.join(" / ");
      item.appendChild(answer);
      list.appendChild(item);
    }
    panel.appendChild(list);
    body.appendChild(panel);
  }
}
