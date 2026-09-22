#!/usr/bin/env node
/*
 * build-certs.mjs — regenerate certs.html from the images in ./certs/
 *
 * Usage:
 *   1. Drop a scan/screenshot of a new certificate into certs/
 *   2. Name the file so it reads like the title, e.g.  "01 First Aid Level 3.jpg".
 *      (An optional numeric prefix 01-, 02-... controls the order.)
 *   3. Run:   node tools/build-certs.mjs
 *
 * Titles are derived from the file names and are used as captions/alt text.
 */

import { readdirSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const CERT_DIR = new URL("../certs/", import.meta.url).pathname;
const OUT = fileURLToPath(new URL("../certs.html", import.meta.url));

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function titleFromFile(name) {
  const base = basename(name, extname(name));
  const withoutOrder = base.replace(/^(\d+)[\s_-]*/, "");
  const words = withoutOrder.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  return words === "" ? base : words;
}

function naturalCompare(a, b) {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const files = readdirSync(CERT_DIR)
  .filter((f) => EXTENSIONS.includes(extname(f).toLowerCase()))
  .sort(naturalCompare);

const certs = files.map((f) => ({
  file: f,
  title: titleFromFile(f),
  src: "certs/" + encodeURIComponent(f).replace(/%2F/gi, "/"),
}));

const gridMarkup = certs.length
  ? certs
      .map(
        (c) => `                    <li class="cert">
                        <button type="button" data-lightbox aria-haspopup="dialog">
                            <figure>
                                <img src="${escapeHtml(c.src)}" alt="${escapeHtml(c.title)}" loading="lazy">
                                <figcaption>${escapeHtml(c.title)}</figcaption>
                            </figure>
                        </button>
                    </li>`
      )
      .join("\n")
  : `                    <li class="cert"><p class="cert-empty">Certifications will appear here as they are added.</p></li>`;

const page = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certifications — Xander Theron</title>
    <meta name="description" content="Certificates and qualifications earned by Xander Theron.">
    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="styles.css">
    <script src="main.js" defer></script>
</head>

<body>
    <a class="skip-link" href="#main">Skip to content</a>

    <nav class="nav" aria-label="Primary">
        <div class="container nav-inner">
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="certs.html" aria-current="page">Certifications</a></li>
                <li><a href="blog.html">Blog</a></li>
            </ul>
            <div class="nav-actions">
                <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false"><span class="icon-dark">Dark</span><span class="icon-light">Light</span></button>
            </div>
        </div>
    </nav>

    <main id="main">
        <div class="container">
            <header class="hero">
                <div>
                    <p class="hero-eyebrow">Certifications</p>
                    <h1 class="hero-title">Proof of the learning</h1>
                    <p class="hero-summary">
                        The certificates behind the CV. New ones are added as I earn them —
                        click any card to view it in full.
                    </p>
                </div>
            </header>

            <section aria-labelledby="certs-heading">
                <p class="section-label" id="certs-heading">Certificates</p>
                <ul class="cert-grid">
${gridMarkup}
                </ul>
            </section>
        </div>
    </main>

    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Certificate viewer">
        <button class="lightbox-close" type="button" aria-label="Close">×</button>
        <figure class="lightbox-figure">
            <img alt="">
            <figcaption></figcaption>
        </figure>
    </div>

    <footer>
        <div class="container">
            <div class="footer-grid">
                <p class="footer-name">Xander Theron</p>
                <ul class="footer-links">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="https://github.com/Cea89585" rel="noopener">GitHub</a></li>
                    <li><a href="mailto:xander.theron@gmail.com">Email</a></li>
                </ul>
            </div>
            <p class="footer-legal">© 2026 Xander Theron. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
`;

writeFileSync(OUT, page, "utf8");

console.log(
  certs.length
    ? `Built certs.html with ${certs.length} certificate${certs.length === 1 ? "" : "s"}:`
    : "Built certs.html — no certificates found in certs/ yet."
);
for (const c of certs) {
  console.log(`  - ${c.title}`);
}