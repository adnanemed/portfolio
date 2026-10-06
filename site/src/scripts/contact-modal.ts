// Contact modal — native <dialog> + delegation: any element carrying
// [data-contact-modal] opens it (buttons or links; link navigation is
// prevented). ESC + focus trap come free with showModal(); backdrop click
// and the close button close it; focus returns to the trigger on close.
// The closing animation is skipped under prefers-reduced-motion.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dlg = document.getElementById("contactModal") as HTMLDialogElement | null;

if (dlg) {
  let trigger: HTMLElement | null = null;

  // Open direction follows the trigger: explicit "top"/"bottom" wins,
  // otherwise the trigger's position in the viewport decides.
  const originFor = (el: HTMLElement): "top" | "bottom" => {
    const explicit = el.getAttribute("data-contact-modal");
    if (explicit === "top" || explicit === "bottom") return explicit;
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2 < window.innerHeight / 2 ? "top" : "bottom";
  };

  const closeWithAnimation = () => {
    if (!dlg.open) return;
    if (reduced) {
      dlg.close();
      return;
    }
    dlg.classList.add("closing");
    window.setTimeout(() => {
      dlg.classList.remove("closing");
      dlg.close();
    }, 260);
  };

  // Délégation : tous les CTA de contact du site ouvrent le modal.
  document.addEventListener("click", (e) => {
    const el = (e.target as Element | null)?.closest?.("[data-contact-modal]");
    if (!el) return;
    e.preventDefault();
    trigger = el as HTMLElement;
    if (!dlg.open) {
      dlg.dataset.origin = originFor(trigger);
      dlg.showModal();
    }
  });

  dlg.querySelector("[data-modal-close]")?.addEventListener("click", closeWithAnimation);

  // Clic sur le backdrop (le dialogue lui-même, en dehors de la carte)
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) closeWithAnimation();
  });

  // Focus rendu au déclencheur à la fermeture (ESC inclus)
  dlg.addEventListener("close", () => {
    trigger?.focus({ preventScroll: true });
    trigger = null;
  });
}
