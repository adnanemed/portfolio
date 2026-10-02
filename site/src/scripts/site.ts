// Site-wide behaviors, ported from the approved preview script:
// preloader, custom cursor, magnetic mega CTA, scroll reveals,
// Casablanca clock, hero dual-state swap, WhatsApp float.
// All motion gated behind prefers-reduced-motion + feature checks.
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Preloader: counter + progress line (scaleX).
     Full animation on the first page view per session only. */
  const pre = document.getElementById("preloader");
  const count = document.getElementById("count");
  const bar = document.getElementById("bar");
  const seen = (() => {
    try {
      return sessionStorage.getItem("stacklabLoaded") === "1";
    } catch {
      return false;
    }
  })();
  const finish = () => {
    try {
      sessionStorage.setItem("stacklabLoaded", "1");
    } catch {
      /* private mode */
    }
  };
  if (reduced || !pre || seen) {
    if (pre) pre.style.display = "none";
    document.body.classList.add("loaded");
    finish();
  } else {
    let n = 0;
    const done = () => {
      pre.classList.add("done");
      document.body.classList.add("loaded");
      finish();
    };
    const iv = setInterval(() => {
      n += Math.floor(Math.random() * 12) + 4;
      if (n >= 100) {
        n = 100;
        clearInterval(iv);
        setTimeout(done, 350);
      }
      if (count) count.textContent = n + "%";
      if (bar) bar.style.transform = "scaleX(" + n / 100 + ")";
    }, 90);
  }

  /* Custom cursor: fine pointers only, press feedback */
  const cursor = document.getElementById("cursor");
  if (!reduced && finePointer && cursor) {
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.style.opacity = "1";
    });
    document.addEventListener("mouseleave", () => (cursor.style.opacity = "0"));
    window.addEventListener("mousedown", () => cursor.classList.add("down"));
    window.addEventListener("mouseup", () => cursor.classList.remove("down"));
    (function loop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.transform =
        "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    const hoverables = "a, button, [role='button'], .case, .shot";
    document.addEventListener("mouseover", (e) => {
      if ((e.target as Element).closest?.(hoverables))
        cursor.classList.add("big");
    });
    document.addEventListener("mouseout", (e) => {
      if ((e.target as Element).closest?.(hoverables))
        cursor.classList.remove("big");
    });
  }

  /* Magnetic pull on [data-magnetic] (lerp on rAF) */
  const mag = document.querySelector<HTMLElement>("[data-magnetic]");
  if (!reduced && finePointer && mag) {
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    let active = false, rafId: number | null = null;
    const tick = () => {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;
      mag.style.transform =
        "translate(" + curX.toFixed(2) + "px," + curY.toFixed(2) + "px)";
      if (
        active ||
        Math.abs(targetX - curX) > 0.3 ||
        Math.abs(targetY - curY) > 0.3
      ) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };
    mag.addEventListener("pointerenter", () => {
      active = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
    mag.addEventListener("pointermove", (e) => {
      const r = mag.getBoundingClientRect();
      targetX = (e.clientX - (r.left + r.width / 2)) * 0.2;
      targetY = (e.clientY - (r.top + r.height / 2)) * 0.3;
    });
    mag.addEventListener("pointerleave", () => {
      active = false;
      targetX = 0;
      targetY = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      curX = 0;
      curY = 0;
      mag.style.transform = "translate(0px,0px)";
    });
  }

  /* Scroll reveal — reduced motion or no IO: everything visible */
  const targets = document.querySelectorAll(".sr");
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("in"));
  }

  /* Casablanca clock (decorative, aria-hidden) */
  const clock = document.getElementById("clock");
  if (clock) {
    let fmt: Intl.DateTimeFormat | null = null;
    try {
      fmt = new Intl.DateTimeFormat(
        document.documentElement.lang === "en" ? "en-GB" : "fr-FR",
        {
          timeZone: "Africa/Casablanca",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );
    } catch {
      /* older engines */
    }
    const tickClock = () => {
      const time = fmt
        ? fmt.format(new Date())
        : new Date().toLocaleTimeString();
      clock.textContent =
        clock.getAttribute("data-city") + " — " + time;
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* Hero dual-state swap: 4s cycle, pauses on hover/focus */
  const swap = document.getElementById("heroSwap");
  const heroTitle = document.getElementById("heroTitle");
  if (swap && heroTitle && !reduced) {
    let showB = false;
    let paused = false;
    heroTitle.addEventListener("pointerenter", () => (paused = true));
    heroTitle.addEventListener("pointerleave", () => (paused = false));
    heroTitle.addEventListener("focusin", () => (paused = true));
    heroTitle.addEventListener("focusout", () => (paused = false));
    setInterval(() => {
      if (paused) return;
      showB = !showB;
      swap.classList.toggle("show-b", showB);
    }, 4000);
  }

  /* WhatsApp float: appears after 400px of scroll */
  const waFloat = document.querySelector<HTMLElement>(".wa-float");
  if (waFloat) {
    const onScroll = () =>
      waFloat.classList.toggle("show", window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
