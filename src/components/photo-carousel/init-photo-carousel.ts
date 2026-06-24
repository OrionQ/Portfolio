import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import AutoScroll from "embla-carousel-auto-scroll";

/** Matches AmbientStarfield DRIFT_SPEED — one carousel loop per full starfield rotation. */
const AMBIENT_DRIFT_RAD_S = 0.012;
const LOOP_DURATION_MS = ((2 * Math.PI) / AMBIENT_DRIFT_RAD_S) * 1000;
const RESUME_DELAY_MS = 100;
const FRAMES_PER_SECOND = 60;

type CarouselRoot = HTMLElement & {
  __carouselCleanup?: () => void;
};

const isMotionPaused = () =>
  document.documentElement.classList.contains("motion-paused");

const measureSetWidth = (track: HTMLElement, setSize: number) => {
  let width = 0;

  for (let i = 0; i < setSize; i++) {
    const slide = track.children[i];
    if (!(slide instanceof HTMLElement)) continue;
    const marginRight = Number.parseFloat(getComputedStyle(slide).marginRight) || 0;
    width += slide.offsetWidth + marginRight;
  }

  return width;
};

const autoScrollSpeed = (setWidth: number) =>
  setWidth / ((LOOP_DURATION_MS / 1000) * FRAMES_PER_SECOND);

const syncAutoScroll = (emblaApi: EmblaCarouselType, reduced: boolean) => {
  const autoScroll = emblaApi.plugins()?.autoScroll;
  if (!autoScroll) return;

  if (reduced || isMotionPaused()) autoScroll.stop();
  else autoScroll.play();
};

export const initPhotoCarousels = () => {
  document.querySelectorAll("[data-photo-carousel]").forEach((root) => {
    if (!(root instanceof HTMLElement)) return;
    if (root.dataset.carouselReady === "true") return;
    root.dataset.carouselReady = "true";

    const viewport = root.querySelector(".photo-carousel__viewport");
    const track = root.querySelector(".photo-carousel__track");
    if (!(viewport instanceof HTMLElement) || !(track instanceof HTMLElement)) return;

    const setSize = Number.parseInt(root.dataset.setSize || "0", 10);
    if (!setSize) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setWidth = measureSetWidth(track, setSize);

    const emblaApi = EmblaCarousel(
      viewport,
      {
        loop: true,
        dragFree: true,
        align: "start",
        containScroll: false,
        watchDrag: true,
        watchResize: true,
        watchSlides: true,
      },
      [
        AutoScroll({
          direction: "forward",
          speed: autoScrollSpeed(setWidth),
          startDelay: RESUME_DELAY_MS,
          playOnInit: !reduced && !isMotionPaused(),
          stopOnFocusIn: false,
          stopOnInteraction: false,
          stopOnMouseEnter: false,
        }),
      ],
    );

    const syncMotion = () => syncAutoScroll(emblaApi, reduced);

    emblaApi.on("pointerDown", () => {
      viewport.classList.add("is-dragging");
      root.classList.add("is-dragging");
    });

    emblaApi.on("pointerUp", () => {
      viewport.classList.remove("is-dragging");
      root.classList.remove("is-dragging");
    });

    const onMotionPauseChange = () => syncMotion();
    window.addEventListener("motion-pause-change", onMotionPauseChange);

    const motionObserver = new MutationObserver(onMotionPauseChange);
    motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const rootEl = root as CarouselRoot;
    rootEl.__carouselCleanup?.();

    rootEl.__carouselCleanup = () => {
      window.removeEventListener("motion-pause-change", onMotionPauseChange);
      motionObserver.disconnect();
      emblaApi.destroy();
    };
  });
};

export const teardownPhotoCarousels = () => {
  document.querySelectorAll("[data-photo-carousel]").forEach((root) => {
    if (!(root instanceof HTMLElement)) return;
    const rootEl = root as CarouselRoot;
    rootEl.__carouselCleanup?.();
    delete root.dataset.carouselReady;
    delete rootEl.__carouselCleanup;
  });
};
