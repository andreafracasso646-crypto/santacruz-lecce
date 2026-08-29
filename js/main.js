(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ── 1. ROSONE ─────────────────────────────────────────────── */
  const NS = "http://www.w3.org/2000/svg";
  function buildRose(svg, petals) {
    const cx = 100, cy = 100;
    const add = (tag, attrs) => {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      svg.appendChild(el);
      return el;
    };
    [92, 66, 40, 15].forEach((r, k) => add("circle", { cx, cy, r, stroke: "", "stroke-width": k === 0 ? 2.6 : 1.9, opacity: .95 }));
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      add("line", {
        x1: cx + Math.cos(a) * 15, y1: cy + Math.sin(a) * 15,
        x2: cx + Math.cos(a) * 92, y2: cy + Math.sin(a) * 92,
        stroke: "", "stroke-width": 1.1, opacity: .6
      });
      add("circle", { cx: cx + Math.cos(a) * 53, cy: cy + Math.sin(a) * 53, r: 13, stroke: "", "stroke-width": 1.9, opacity: .9 });
      add("circle", {
        cx: cx + Math.cos(a + Math.PI / petals) * 79,
        cy: cy + Math.sin(a + Math.PI / petals) * 79,
        r: 6, stroke: "", "stroke-width": 1.7, opacity: .85, class: "acc"
      });
    }
    return svg.querySelectorAll("circle, line");
  }
  const roseParts = buildRose(document.getElementById("rose"), 16);
  const loaderParts = buildRose(document.getElementById("loaderRose"), 12);

  /* ── 2. ORARI + stato apertura ─────────────────────────────── */
  const GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const chiusura = d => (d === 6 ? 2 : 1);
  const apertura = 9;

  (function orari() {
    const box = document.getElementById("orari");
    const oggi = new Date().getDay();
    [1, 2, 3, 4, 5, 6, 0].forEach(d => {
      box.insertAdjacentHTML("beforeend",
        `<div class="orari__row" data-today="${d === oggi}">
           <span class="orari__day">${GIORNI[d]}</span>
           <span>09:00 — 0${chiusura(d)}:00</span>
         </div>`);
    });
  })();

  (function stato() {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    const prev = (now.getDay() + 6) % 7;
    const aperto = h >= apertura || h < chiusura(prev);
    document.getElementById("status").dataset.open = aperto;
    document.getElementById("statusText").textContent =
      aperto ? "Aperto ora — si entra" : "Chiuso — riapre alle 9:00";
  })();

  /* ── 3. Split text ─────────────────────────────────────────── */
  function split(el, mode) {
    if (mode === "chars") {
      const chars = Array.from(el.textContent);
      el.textContent = "";
      chars.forEach(c => {
        const w = document.createElement("span"); w.className = "ch";
        const i = document.createElement("span"); i.className = "ch-i";
        i.textContent = c === " " ? "\u00A0" : c;
        w.appendChild(i); el.appendChild(w);
      });
      return el.querySelectorAll(".ch-i");
    }
    el.innerHTML = el.innerHTML.split(/(<br\s*\/?>)/i).map(seg => {
      if (/^<br/i.test(seg)) return seg;
      return seg.split(" ").filter(Boolean)
        .map(w => `<span class="wd"><span class="wd-i">${w}</span></span>`).join(" ");
    }).join("");
    return el.querySelectorAll(".wd-i");
  }

  /* ── 4. Titoli che riempiono la riga, sempre su una riga ────── */
  function fit(box, el, maxPx) {
    const probe = 200;
    // margine: la misura non conta il letter-spacing negativo dopo l'ultima
    // lettera né lo sbordo delle grazie, quindi si sta un filo sotto la riga.
    const safety = .992;
    el.style.fontSize = probe + "px";
    const w = el.getBoundingClientRect().width;
    if (!w) return;
    const size = Math.min(probe * (box.clientWidth / w) * safety, maxPx || Infinity);
    el.style.fontSize = size + "px";
  }
  const fitTargets = [
    [document.getElementById("fitTitle"), document.querySelector(".hero__title"), 320],
    [document.getElementById("fitFine"), document.querySelector(".fine__title"), 190]
  ];
  const fitAll = () => fitTargets.forEach(([b, e, m]) => fit(b, e, m));

  /* ── 5. Fallback ───────────────────────────────────────────── */
  const loader = document.getElementById("loader");
  const panels = [document.getElementById("panelT"), document.getElementById("panelB")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!window.gsap || reduce) {
    loader.remove(); panels.forEach(p => p.remove());
    document.querySelectorAll(".reveal").forEach(el => (el.style.opacity = 1));
    fitAll();
    if (document.fonts) document.fonts.ready.then(fitAll);
    window.addEventListener("resize", fitAll);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", force3D: true });

  /* ── 6. Sequenza di caricamento ────────────────────────────── */
  const heroChars = split(document.querySelector(".hero__title"), "chars");
  const heroSub = split(document.querySelector(".hero__sub"), "words");
  document.querySelectorAll("[data-split='words']").forEach(el => { if (!el.closest(".hero")) split(el, "words"); });
  split(document.querySelector(".fine__title"), "chars");

  fitAll();
  if (document.fonts) document.fonts.ready.then(() => { fitAll(); ScrollTrigger.refresh(); });
  let rid;
  window.addEventListener("resize", () => { clearTimeout(rid); rid = setTimeout(fitAll, 120); });

  [roseParts, loaderParts].forEach(set => set.forEach(p => {
    const len = p.getTotalLength ? p.getTotalLength() : 300;
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  }));

  gsap.set(heroChars, { yPercent: 118 });
  gsap.set(heroSub, { yPercent: 110, opacity: 0 });
  gsap.set(".status, .hero__cue", { opacity: 0, y: 14 });
  gsap.set("#heroRose", { scale: .84, opacity: 0 });
  gsap.set(".nav", { yPercent: -180, opacity: 0 });

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .to(loaderParts, { strokeDashoffset: 0, duration: 1.25, stagger: { each: .012, from: "center" }, ease: "power2.inOut" })
    .to("#loaderRose", { rotate: 45, scale: 1.05, duration: 1, ease: "power2.inOut" }, "-=.7")
    .to(".loader__word", { opacity: 0, duration: .4 }, "-=.4")
    .to("#loaderRose", { opacity: 0, scale: .9, duration: .5 }, "-=.2")
    .set(loader, { display: "none" })
    .to(panels[0], { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "panels")
    .to(panels[1], { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, "panels")
    .to("#heroRose", { opacity: .4, scale: 1, duration: 1.8, ease: "expo.out" }, "panels+=.3")
    .to(roseParts, { strokeDashoffset: 0, duration: 1.6, stagger: { each: .008, from: "center" }, ease: "power2.out" }, "panels+=.3")
    .to(heroChars, { yPercent: 0, duration: 1.3, stagger: .035, ease: "expo.out" }, "panels+=.45")
    .to(heroSub, { yPercent: 0, opacity: 1, duration: .9, stagger: .04 }, "-=.8")
    .to(".status", { opacity: 1, y: 0, duration: .7 }, "-=.5")
    .to(".hero__cue", { opacity: 1, y: 0, duration: .7 }, "-=.55")
    .to(".nav", { yPercent: 0, opacity: 1, duration: .9, ease: "expo.out" }, "-=.7")
    .set(panels, { display: "none" })
    // Titolo atterrato: si tolgono i transform inline lasciati da GSAP.
    // Con i wrapper .ch in overflow:hidden, i layer di compositing per-lettera
    // facevano slittare i primi glifi e "santa" si sovrapponeva.
    .set([heroChars, heroSub], { clearProps: "transform" });

  gsap.to(".hero__cue span", { scaleY: .3, transformOrigin: "top", duration: 1.4, repeat: -1, yoyo: true, ease: "power1.inOut" });

  /* ── 7. Luce che segue il cursore ──────────────────────────── */
  const light = document.getElementById("heroLight");
  const hero = document.querySelector(".hero");
  if (window.matchMedia("(pointer:fine)").matches) {
    const xTo = gsap.quickTo(light, "x", { duration: .9, ease: "power3" });
    const yTo = gsap.quickTo(light, "y", { duration: .9, ease: "power3" });
    hero.addEventListener("pointerenter", () => gsap.to(light, { opacity: 1, duration: .8 }));
    hero.addEventListener("pointerleave", () => gsap.to(light, { opacity: 0, duration: .8 }));
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      xTo(e.clientX - r.left); yTo(e.clientY - r.top);
    });
  }

  /* ── 8. Parallasse hero ────────────────────────────────────── */
  gsap.to("#heroRose", {
    rotate: 46, yPercent: 18, scale: 1.2, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .8 }
  });
  gsap.to(".hero__inner", {
    yPercent: -20, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: .6 }
  });

  /* ── 9. Reveal ─────────────────────────────────────────────── */
  gsap.set(".reveal", { y: 32 });
  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, stagger: .12, overwrite: true }),
    onEnterBack: b => gsap.to(b, { opacity: 1, y: 0, duration: .8, stagger: .08, overwrite: true })
  });

  /* ── 10. Titoli di sezione ─────────────────────────────────── */
  gsap.utils.toArray(".sec__title, .fine__title").forEach(t => {
    gsap.from(t.querySelectorAll(".wd-i, .ch-i"), {
      yPercent: 118, duration: 1.1, stagger: .05, ease: "expo.out",
      clearProps: "transform",
      scrollTrigger: { trigger: t, start: "top 88%" }
    });
  });

  /* ── 11. Carta orizzontale (pin su desktop) ────────────────── */
  gsap.matchMedia().add("(min-width: 900px)", () => {
    const trackEl = document.getElementById("cartaTrack");
    const dist = () => trackEl.scrollWidth - trackEl.parentElement.clientWidth + 64;
    const tw = gsap.to(trackEl, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: "#carta", start: "top 8%", end: () => "+=" + dist(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    return () => tw.scrollTrigger && tw.scrollTrigger.kill();
  });

  /* ── 12. Nicchie: apertura a scorrimento + parallasse ──────── */
  gsap.utils.toArray(".frame").forEach(f => {
    gsap.fromTo(f, { clipPath: "inset(0% 0% 100% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: f, start: "top 88%" }
    });
    gsap.fromTo(f.querySelector(".frame__media"),
      { yPercent: -12, scale: 1.2 },
      { yPercent: 12, scale: 1.2, ease: "none",
        scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ── 13. Righe orari ───────────────────────────────────────── */
  gsap.from(".orari__row", {
    opacity: 0, x: -18, duration: .7, stagger: .06,
    scrollTrigger: { trigger: "#orari", start: "top 88%" }
  });

  /* ── 14. Bottoni magnetici ─────────────────────────────────── */
  document.querySelectorAll("[data-magnetic]").forEach(el => {
    const xTo = gsap.quickTo(el, "x", { duration: .5, ease: "elastic.out(1,.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: .5, ease: "elastic.out(1,.4)" });
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * .35);
      yTo((e.clientY - r.top - r.height / 2) * .5);
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });

  /* ── 15. Inclinazione proporzionale alla velocità di scroll ── */
  const proxy = { skew: 0 };
  const skewSetter = gsap.quickSetter(".card, .frame", "skewY", "deg");
  const clamp = gsap.utils.clamp(-3, 3);

  ScrollTrigger.create({
    onUpdate: self => {
      const v = self.getVelocity();
      const skew = clamp(v / -480);
      if (Math.abs(skew) > Math.abs(proxy.skew)) {
        proxy.skew = skew;
        gsap.to(proxy, {
          skew: 0, duration: .8, ease: "power3", overwrite: true,
          onUpdate: () => skewSetter(proxy.skew)
        });
      }
    }
  });

  /* ── 16. Navigazione interna ───────────────────────────────── */
  document.querySelectorAll('.nav a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute("href"));
      if (t) window.scrollTo({ top: t.offsetTop - 20, behavior: "smooth" });
    });
  });

  window.addEventListener("load", () => { fitAll(); ScrollTrigger.refresh(); });
})();
