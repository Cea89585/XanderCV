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

  /* ---------- Notes feed (WordPress.com) ---------- */
  var noteList = document.getElementById("note-list");
  var notesSection = noteList && noteList.closest(".notes-section");

  function decodeEntities(str) {
    var el = document.createElement("div");
    el.innerHTML = str || "";
    return el.textContent;
  }

  function renderNotes() {
    if (!noteList) return;

    var url =
      "https://public-api.wordpress.com/rest/v1.1/sites/xandertheron.wordpress.com/posts?number=3&fields=title,URL,date,categories";

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("feed unavailable");
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.posts || !data.posts.length) throw new Error("no posts");
        noteList.innerHTML = "";
        data.posts.forEach(function (post) {
          var li = document.createElement("li");
          li.className = "note";

          var a = document.createElement("a");
          a.href = post.URL;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = decodeEntities(post.title) || "Untitled post";

          var meta = document.createElement("span");
          meta.className = "note-meta";
          var catNames = post.categories ? Object.keys(post.categories) : [];
          var label = catNames.length ? catNames[0].toUpperCase() : "NOTES";
          meta.textContent = label + " · " + yearOf(post.date);

          li.appendChild(a);
          li.appendChild(meta);
          noteList.appendChild(li);

          if (notesSection) notesSection.classList.add("is-visible");
        });
      })
      .catch(function () {
        noteList.innerHTML =
          '<li class="note note-placeholder"><span>Notes temporarily unavailable — read them on the blog instead.</span><span class="note-meta">FIELD</span></li>';
        if (notesSection) notesSection.classList.add("is-visible");
      });
  }

  function yearOf(date) {
    if (!date) return "2026";
    return String(date).slice(0, 4);
  }

  renderNotes();
})();