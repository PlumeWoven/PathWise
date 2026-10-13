import confetti from "canvas-confetti";

// Every celebration burst goes through here: brand colours, and no particles at all
// when the person has asked for reduced motion (canvas-confetti ignores it by default).
// Each caller also confirms success in text, so nothing is lost without the burst.
export const burst = (options: confetti.Options = {}) =>
  confetti({
    colors: ["#e8913c", "#5fa3ab", "#ede7dc", "#2e6b72"],
    disableForReducedMotion: true,
    ...options,
  });
