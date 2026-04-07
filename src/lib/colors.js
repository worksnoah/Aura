import ColorThief from "colorthief";

const fallback = [
  "rgb(34, 20, 64)",
  "rgb(11, 12, 24)",
  "rgb(88, 40, 140)",
  "rgb(18, 28, 54)"
];

export async function extractGradientColors(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const thief = new ColorThief();
        const palette = thief.getPalette(img, 4);
        const colors = palette.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);
        resolve(colors.length ? colors : fallback);
      } catch (error) {
        resolve(fallback);
      }
    };

    img.onerror = () => resolve(fallback);
  });
}
