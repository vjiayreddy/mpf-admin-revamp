/** Fashion / bespoke-tailoring slides for the login profession panel. */

export type LoginSlide = {
  src: string
  alt: string
  title: string
  caption: string
}

export const LOGIN_SLIDES: LoginSlide[] = [
  {
    src: "/login/slides/atelier.jpg",
    alt: "Bespoke clothing atelier",
    title: "The atelier",
    caption: "Where every stitch begins with craft.",
  },
  {
    src: "/login/slides/measuring.jpg",
    alt: "Tailor taking precise measurements",
    title: "Precision fit",
    caption: "Measured once. Perfected for life.",
  },
  {
    src: "/login/slides/fabric.jpg",
    alt: "Luxury fabric selection",
    title: "Chosen cloth",
    caption: "Textures and tones curated for each client.",
  },
  {
    src: "/login/slides/fitting.jpg",
    alt: "Finished tailored look",
    title: "The reveal",
    caption: "Style that feels personal — My Perfect Fit.",
  },
] as const

export const LOGIN_SLIDE_INTERVAL_MS = 5000
