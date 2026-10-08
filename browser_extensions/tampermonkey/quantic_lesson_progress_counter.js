// ==UserScript==
// @name         Quantic Lesson Progress Counter
// @namespace    http://tampermonkey.net
// @version      1.1
// @description  Counts filled progress indicators vs total indicators and displays a temporary notification.
// @author       Neil Hendren
// @updateURL    https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/browser_extensions/tampermonkey/quantic_lesson_progress_counter.js
// @downloadURL  https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/browser_extensions/tampermonkey/quantic_lesson_progress_counter.js
// @match        https://app.quantic.edu/*
// @match        https://*.quantic.edu/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  let lastCountKey = "";

  function showProgressToast(completed, total) {
    let toast = document.getElementById("quantic-progress-toast");

    // Create container element if it doesn't exist yet
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "quantic-progress-toast";
      Object.assign(toast.style, {
        position: "fixed",
        top: "15px",
        left: "15px",
        zIndex: "999999",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#ffffff",
        padding: "8px 16px",
        borderRadius: "8px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "16px",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        pointerEvents: "none",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        opacity: "0",
        transform: "translateY(-10px)",
      });
      document.body.appendChild(toast);
    }

    // Update text
    toast.textContent = `${completed}/${total}`;

    // Reveal toast
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    // Clear existing timeout if present
    if (toast.dataset.timeoutId) {
      clearTimeout(Number(toast.dataset.timeoutId));
    }

    // Fade out and hide after 3 seconds
    const timeoutId = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
    }, 3000);

    toast.dataset.timeoutId = String(timeoutId);
  }

  function checkProgress() {
    const totalIndicators = document.querySelectorAll("button.indicator");
    const filledIndicators = document.querySelectorAll(
      "button.indicator.filled",
    );

    if (totalIndicators.length === 0) return;

    const countKey = `${filledIndicators.length}/${totalIndicators.length}`;

    // Only show if the count has changed or on initial load of a new screen
    if (countKey !== lastCountKey) {
      lastCountKey = countKey;
      showProgressToast(filledIndicators.length, totalIndicators.length);
    }
  }

  // Observe dynamic SPA layout updates
  const observer = new MutationObserver(() => {
    checkProgress();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  // Initial check
  checkProgress();
})();
