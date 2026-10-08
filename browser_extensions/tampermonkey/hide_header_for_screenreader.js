// ==UserScript==
// @name         Hide Header for Screenreader
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Hide elements on Quantic pages
// @author       Neil Hendren
// @updateURL    https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/browser_extensions/tampermonkey/hide_header_for_screenreader.js
// @downloadURL  https://raw.githubusercontent.com/NeilTheSeal/quantic_ai_monorepo/refs/heads/main/browser_extensions/tampermonkey/hide_header_for_screenreader.js
// @match        https://app.quantic.edu/course/*/lesson/*
// @match        https://*.quantic.edu/course/*/lesson/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  console.log("Now hiding header...");

  // Example using MutationObserver to account for dynamic SPA rendering:
  const observer = new MutationObserver((mutations, obs) => {
    const header = document.querySelector(".app-header"); // Adjust selector to target exact header
    if (header) {
      header.style.display = "none";
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
