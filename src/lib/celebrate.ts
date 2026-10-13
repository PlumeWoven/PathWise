import confetti from "canvas-confetti";

// Every celebration burst goes through here: brand colours (amber-orange, orange, chalk), and no particles at all
// when the person has asked for reduced motion (canvas-confetti ignores it by default).
// Each caller also confirms success in text, so nothing is lost without the burst.
export const burst = (options: confetti.Options = {}) =>
  confetti({
    colors: ["#e8913c", "#fb7a2c", "#efebe3", "#c2560f"],
    disableForReducedMotion: true,
    ...options,
  });
