/* XanderCV — theme toggle + certificate lightbox (no dependencies) */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var stored = null;
  try { stored = localStorage.getItem("xcv-theme"); } catch (e) {}

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  applyTheme(stored || systemTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("xcv-theme", next); } catch (e) {}
    });
  }

  if (!stored && window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      applyTheme(e.matches ? "dark" : "light");
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var frameImg = lightbox.querySelector("img");
    var frameCaption = lightbox.querySelector("figcaption");
    var lastFocus = null;

    function openLightbox(img) {
      lastFocus = document.activeElement;
      frameImg.src = img.getAttribute("data-full") || img.src;
      frameImg.alt = img.alt || "";
      frameCaption.textContent = img.alt || "";
      lightbox.setAttribute("open", "");
      document.body.style.overflow = "hidden";
      lightbox.querySelector("button").focus();
    }

    function closeLightbox() {
      lightbox.removeAttribute("open");
      document.body.style.overflow = "";
      frameImg.removeAttribute("src");
      if (lastFocus) lastFocus.focus();
    }

    document
      .querySelectorAll("[data-lightbox]")
      .forEach(function (el) {
        el.addEventListener("click", function () {
          var img = el.querySelector("img");
          if (img) openLightbox(img);
        });
      });

    lightbox
      .querySelector(".lightbox-close")
      .addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.hasAttribute("open")) {
        closeLightbox();
      }
    });
  }
})();