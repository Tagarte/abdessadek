(() => {
  "use strict";

  /* ============================================================
     CONFIGURATION
     ============================================================ */
  const CONTACT_EMAIL = "abdessadektagarte1@gmail.com";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  // ✅ CORRIGÉ : on vérifie réellement que l'email est valide
  const configured = isEmail(CONTACT_EMAIL) && !CONTACT_EMAIL.includes("exemple.com");

  const root = document.documentElement;
  const siteHeader = $("#siteHeader");
  const mobileNav = $("#mobileNav");
  const menuToggle = $("#menuToggle");
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");
  const backToTop = $("#backToTop");
  const form = $("#contactForm");
  const formFeedback = $("#formFeedback");
  const emailDisplay = $("#emailDisplay");
  const navLinks = $$("[data-nav]");
  const sections = $$("main section[id]");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = reducedMotion ? "auto" : "smooth";

  $("#year") && ($("#year").textContent = new Date().getFullYear());

  /* ============================================================
     LANGUE (FR / EN)
     ============================================================ */
  const LANG_KEY = "portfolio-lang";
  const langButtons = $$(".lang-btn");

  const MESSAGES = {
    fr: {
      name: "Au moins 2 caractères.",
      email: "Adresse e-mail invalide.",
      subject: "Au moins 3 caractères.",
      message: "Au moins 10 caractères.",
      formInvalid: "Vérifiez les champs signalés.",
      emptyFields: "Veuillez remplir tous les champs.",
      notConfigured: "L'adresse e-mail de destination n'est pas configurée.",
      opening: "Gmail s'ouvre avec ton message préparé.",
      blocked: "Ouverture bloquée. Autorise les fenêtres pop-up puis réessaie.",
    },
    en: {
      name: "At least 2 characters.",
      email: "Invalid email address.",
      subject: "At least 3 characters.",
      message: "At least 10 characters.",
      formInvalid: "Please check the highlighted fields.",
      emptyFields: "Please fill in all fields.",
      notConfigured: "The destination email address is not configured.",
      opening: "Gmail is opening with your message ready.",
      blocked: "Opening blocked. Allow pop-ups and try again.",
    },
  };
  const t = (key) => (MESSAGES[root.lang] || MESSAGES.fr)[key];

  function applyLang(lang) {
    const isEn = lang === "en";

    // Textes
    $$("[data-fr]").forEach((el) => {
      const v = isEn ? el.dataset.en : el.dataset.fr;
      if (v != null) el.textContent = v;
    });

    // Placeholders
    $$("[data-placeholder-fr]").forEach((el) => {
      el.placeholder = isEn
        ? el.dataset.placeholderEn
        : el.dataset.placeholderFr;
    });

    // lang attribute
    root.lang = isEn ? "en" : "fr";

    // Boutons
    langButtons.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (_) {}
  }

  function getInitialLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "fr" || saved === "en") return saved;
    } catch (_) {}
    return navigator.language?.startsWith("en") ? "en" : "fr";
  }

  applyLang(getInitialLang());

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (!lang || lang === root.lang) return;
      applyLang(lang);
    });
  });

  /* ============================================================
     THÈME
     ============================================================ */
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === "dark";
    themeIcon && (themeIcon.textContent = dark ? "☀" : "☾");
    themeToggle?.setAttribute(
      "aria-label",
      dark ? "Activer le mode clair" : "Activer le mode sombre",
    );
    themeToggle?.setAttribute("aria-pressed", String(dark));
    $('meta[name="theme-color"]')?.setAttribute(
      "content",
      dark ? "#0a0e1a" : "#f5f4fb",
    );
  }
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("portfolio-theme");
  } catch (_) {}
  applyTheme(savedTheme || "dark");
  themeToggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch (_) {}
  });

  /* ============================================================
     STARFIELD
     ============================================================ */
  (function initStarfield() {
    if (reducedMotion) return;
    const canvas = $("#starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars = [];
    let w = 0,
      h = 0;
    let scrollY = 0;
    let rafId = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(180, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        z: Math.random() * 0.8 + 0.2,
        tw: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const dark = root.dataset.theme !== "light";

      stars.forEach((s) => {
        s.tw += 0.012;
        const alpha = 0.35 + Math.sin(s.tw) * 0.35;
        const py = (s.y - scrollY * s.z * 0.35) % h;
        const y = py < 0 ? py + h : py;

        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(200, 210, 255, ${alpha})`
          : `rgba(80, 70, 160, ${alpha * 0.6})`;
        ctx.fill();

        if (s.r > 1.1) {
          ctx.beginPath();
          ctx.arc(s.x, y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = dark
            ? `rgba(150, 170, 255, ${alpha * 0.12})`
            : `rgba(120, 100, 200, ${alpha * 0.1})`;
          ctx.fill();
        }
      });

      rafId = requestAnimationFrame(draw);
    }

    window.addEventListener(
      "scroll",
      () => {
        scrollY = window.scrollY;
      },
      { passive: true },
    );
    window.addEventListener("resize", resize);

    resize();
    draw();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        draw();
      }
    });
  })();

  /* ============================================================
     HEADER SCROLL
     ============================================================ */
  function updateHeader() {
    siteHeader?.classList.toggle("scrolled", window.scrollY > 30);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ============================================================
     MENU MOBILE
     ============================================================ */
  function closeMenu() {
    mobileNav?.setAttribute("hidden", "");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  }
  function openMenu() {
    mobileNav?.removeAttribute("hidden");
    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "Fermer le menu");
  }
  menuToggle?.addEventListener("click", () => {
    mobileNav?.hasAttribute("hidden") ? openMenu() : closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ============================================================
     NAVIGATION
     ============================================================ */
  function updateActiveLink(id) {
    $$("[data-nav]").forEach((a) => {
      const active = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  navLinks.forEach((a) =>
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href?.startsWith("#")) return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", href);
      target.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      closeMenu();
      updateActiveLink(href.slice(1));
    }),
  );
  window.addEventListener("popstate", () => {
    const id = location.hash.slice(1) || "accueil";
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior });
    updateActiveLink(id);
  });
  if (location.hash) updateActiveLink(location.hash.slice(1));

  /* ============================================================
     OBSERVERS
     ============================================================ */
  if ("IntersectionObserver" in window) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) updateActiveLink(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => sectionObs.observe(s));

    if (!reducedMotion) {
      const revealObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08 },
      );

      $$(
        ".section-header, .about-copy, .about-focus, .skill-card, .project-card, .timeline-item, .education-item, .contact-form, .contact-card",
      ).forEach((el) => {
        el.classList.add("reveal");
        revealObs.observe(el);
      });
    }
  }

  /* ============================================================
     FILTRES PROJETS
     ============================================================ */
  const filterButtons = $$(".filter-button");
  const projectCards = $$(".project-card");
  const emptyProjects = $("#emptyProjects");
  filterButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      let shown = 0;
      projectCards.forEach((card) => {
        const vis =
          filter === "all" ||
          (card.dataset.category || "").split(" ").includes(filter);
        card.hidden = !vis;
        if (vis) shown++;
      });
      if (emptyProjects) emptyProjects.hidden = shown > 0;
    }),
  );

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  const onScrollBT = () =>
    backToTop?.classList.toggle("visible", window.scrollY > 420);
  window.addEventListener("scroll", onScrollBT, { passive: true });
  onScrollBT();
  backToTop?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: scrollBehavior }),
  );

  /* ============================================================
     FORMULAIRE + EMAIL
     ============================================================ */
  if (formFeedback) {
    formFeedback.setAttribute("role", "status");
    formFeedback.setAttribute("aria-live", "polite");
  }
  function setFeedback(msg, err = false) {
    if (!formFeedback) return;
    formFeedback.textContent = msg;
    formFeedback.style.color = err ? "#ff5c7a" : "";
  }

  // Affiche l'email réel (plus de "À compléter" inutile)
  if (emailDisplay) {
    emailDisplay.textContent = configured ? CONTACT_EMAIL : "À compléter dans js/app.js";
  }
  if (configured) {
    const card = $("#emailCard");
    if (card) card.href = `mailto:${CONTACT_EMAIL}`;
  }

  /* Règles de validation */
  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : t("name")),
    email: (v) => (isEmail(v) ? "" : t("email")),
    subject: (v) => (v.trim().length >= 3 ? "" : t("subject")),
    message: (v) => (v.trim().length >= 10 ? "" : t("message")),
  };
  const touched = new Set();

  function validateField(field, show = false) {
    if (!field || !rules[field.id]) return true;
    const msg = rules[field.id](field.value);
    const err = document.getElementById(`${field.id}Error`);
    field.setAttribute("aria-invalid", String(Boolean(msg)));
    if (err) err.textContent = show || touched.has(field.id) ? msg : "";
    return !msg;
  }

  Object.keys(rules).forEach((id) => {
    const f = document.getElementById(id);
    if (!f) return;
    f.addEventListener("blur", () => {
      touched.add(id);
      validateField(f, true);
    });
    f.addEventListener("input", () => validateField(f, touched.has(id)));
  });

  /* ============================================================
     SUBMIT — validation + ouverture Gmail
     ============================================================ */
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = Object.keys(rules)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    // Marque tous les champs comme touchés
    fields.forEach((f) => touched.add(f.id));

    // ✅ CORRIGÉ : validation complète avant envoi
    const allValid = fields
      .map((f) => validateField(f, true))
      .every(Boolean);

    if (!allValid) {
      setFeedback(t("formInvalid"), true);
      fields
        .find((f) => f.getAttribute("aria-invalid") === "true")
        ?.focus();
      return;
    }

    if (!configured) {
      setFeedback(t("notConfigured"), true);
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    // Message multilingue
    const isEn = root.lang === "en";
    const body = isEn
      ? `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
      : `Nom : ${data.name}\nE-mail : ${data.email}\n\n${data.message}`;

    // Ouverture Gmail
    const gmailUrl = new URL("https://mail.google.com/mail/");
    gmailUrl.searchParams.set("view", "cm");
    gmailUrl.searchParams.set("fs", "1");
    gmailUrl.searchParams.set("to", CONTACT_EMAIL);
    gmailUrl.searchParams.set("su", data.subject);
    gmailUrl.searchParams.set("body", body);

    const newWindow = window.open(gmailUrl.toString(), "_blank");

    if (newWindow) {
      setFeedback(t("opening"));
    } else {
      setFeedback(t("blocked"), true);
    }
  });
})();