// One selection shared by every project-switching section on the page:
// "Dans les coulisses", "L'aperçu en direct" and "L'architecture, en clair".
//
// The chosen slug lives on <html data-active-project> so it survives
// Astro's component boundaries; changes travel as a window event that every
// navigator and every section listens to. Choosing a project in one section
// therefore moves all three, which is what makes the arrows feel like one
// control instead of three independent ones.

const KEY = "stacklab-project";

type Listener = (slug: string) => void;

function readInitial(): string {
  const attr = document.documentElement.getAttribute("data-active-project");
  if (attr) return attr;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
  } catch (e) {
    /* private mode — fall through to the first chip */
  }
  return "";
}

function slugAt(chips: HTMLButtonElement[], index: number): string {
  return chips[index]?.dataset.pnavChip ?? "";
}

/** Select a project globally and notify every section. */
export function selectProject(slug: string, opts: { persist?: boolean } = {}): void {
  if (!slug) return;
  document.documentElement.setAttribute("data-active-project", slug);
  if (opts.persist !== false) {
    try {
      localStorage.setItem(KEY, slug);
    } catch (e) {
      /* storage unavailable — selection still works for this page view */
    }
  }
  window.dispatchEvent(new CustomEvent("project:change", { detail: { slug } }));
}

/**
 * Wire one navigator to the global selection. Returns a function that applies
 * a slug to this navigator's chips without re-emitting (so listeners don't
 * loop when several sections react to the same change).
 */
export function bindNavigator(nav: HTMLElement): (slug: string) => void {
  const chips = [...nav.querySelectorAll<HTMLButtonElement>("[data-pnav-chip]")];
  if (!chips.length) return () => {};

  const apply = (slug: string) => {
    const index = chips.findIndex((c) => c.dataset.pnavChip === slug);
    const next = index >= 0 ? index : 0;
    chips.forEach((c, i) => c.setAttribute("aria-pressed", i === next ? "true" : "false"));
  };

  // Adopt whatever is already selected (saved choice, or the first project).
  const initial = readInitial() || slugAt(chips, 0);
  document.documentElement.setAttribute("data-active-project", initial);
  apply(initial);

  const pick = (i: number) => {
    selectProject(slugAt(chips, i));
    // preventScroll: focusing a chip that sits above the viewport would yank
    // the reader away from the section they just switched.
    chips[i]?.focus({ preventScroll: true });
  };

  chips.forEach((chip, i) => chip.addEventListener("click", () => pick(i)));
  nav
    .querySelector<HTMLButtonElement>('[data-pnav-dir="prev"]')
    ?.addEventListener("click", () => pick(currentIndex(chips) - 1));
  nav
    .querySelector<HTMLButtonElement>('[data-pnav-dir="next"]')
    ?.addEventListener("click", () => pick(currentIndex(chips) + 1));

  nav.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      pick(currentIndex(chips) - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      pick(currentIndex(chips) + 1);
    }
  });

  // The global selection event is dispatched on `window`, and a window-dispatched
  // event never bubbles *down* to the navigator — so this single window listener
  // updates the chips and then re-emits a bubbling `pnav:change` from the nav,
  // which is what the enclosing section (screenshots / live preview / flow map)
  // listens to.
  window.addEventListener("project:change", (e) => {
    apply((e as CustomEvent<{ slug: string }>).detail.slug);
    nav.dispatchEvent(
      new CustomEvent("pnav:change", { detail: { slug: currentSlug(nav) }, bubbles: true })
    );
  });

  return apply;
}

function currentIndex(chips: HTMLButtonElement[]): number {
  const i = chips.findIndex((c) => c.getAttribute("aria-pressed") === "true");
  return i < 0 ? 0 : i;
}

function currentSlug(nav: HTMLElement): string {
  const chip = nav.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
  return chip?.dataset.pnavChip ?? "";
}