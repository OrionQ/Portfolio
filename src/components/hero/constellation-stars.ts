/**
 * Stick-figure layouts matched to standard sky-chart references, mirrored
 * horizontally, with point spacing tightened directly in the coordinates.
 *
 * Cancer: vertical chain (Iota → Asellus Borealis → Asellus Australis hub)
 *   forking at the hub to Al Tarf and Acubens.
 * Orion: hourglass + belt + feet. Club is a stem forking into two junctions,
 *   each rising to its own tip. Shield is NOT a straight chain — it forks
 *   from a hub (which also connects to the belt) into an upper branch and
 *   a lower branch, each ending in its own tip.
 */
export type RawConstellation = {
  label: string;
  lead: number;
  pts: [number, number][];
  edges: [number, number][];
  mags: number[];
  /** Dots + lines only — no SVG illustration on reveal. */
  chartOnly?: boolean;
};

/**
 * Cancer — vertical chain forking into a "Y" at the bottom hub.
 */
export const CANCER_STARS: RawConstellation = {
  label: "CANCER",
  lead: 2, // Asellus Australis (δ Cnc) — the fork hub
  chartOnly: true,
  pts: [
    [1, -77], // 0 Iota — top
    [-4, -24], // 1 Asellus Borealis (γ) — mid
    [0, 0], // 2 Asellus Australis (δ) — hub / fork point
    [26, 47], // 3 Al Tarf (β) — branch, brightest
    [-50, 66], // 4 Acubens (α) — branch
  ],
  mags: [4.0, 4.7, 3.9, 3.5, 4.25],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
  ],
};

/**
 * Orion — mirrored, tightened spacing, shield rebuilt as a forked hub
 * rather than a single chain.
 */
export const ORION_STARS: RawConstellation = {
  label: "ORION",
  lead: 7, // Rigel (β) — brightest, bottom
  chartOnly: true,
  pts: [
    // —— main body ——
    [28, -50], // 0 Betelgeuse (α) — shoulder, large
    [-1, -65], // 1 Bellatrix (γ) — shoulder
    [-15, -44], // 2 hub — dim joint between Bellatrix, belt, and shield
    [7, 4], // 3 Alnitak (ζ) — belt
    [0, 0], // 4 Alnilam (ε) — belt center
    [-6, -6], // 5 Mintaka (δ) — belt
    [16, 50], // 6 Saiph (κ) — foot
    [-32, 40], // 7 Rigel (β) — foot, largest
    // —— club: stem forking into two junctions, each to its own tip ——
    [38, -63], // 8 stem joint
    [51, -90], // 9 junction C
    [45, -93], // 10 junction D
    [39, -122], // 11 tip (from junction D)
    [27, -126], // 12 tip (from junction C)
    // —— shield: hub forking into an upper branch and a lower branch ——
    [-68, -49], // 13 shield hub (also ties back to belt via point 2)
    [-65, -60], // 14 upper branch joint
    [-58, -68], // 15 upper tip
    [-65, -41], // 16 lower branch joint
    [-62, -23], // 17 lower branch joint 2
    [-55, -18], // 18 lower tip
  ],
  mags: [
    0.5, 1.6, 3.5, 0.9, 0.7, 1.0, 2.1, 0.1, // body — belt (3–5) boosted
    4.2, 4.3, 4.4, 4.5, 4.6, // club
    3.3, 3.6, 3.9, 3.8, 4.2, 4.5, // shield
  ],
  edges: [
    // hourglass body
    [0, 1], // shoulders
    [1, 2], // Bellatrix → hub
    [2, 5], // hub → Mintaka (ties shield side into the belt)
    [0, 3], // Betelgeuse → Alnitak
    [3, 4],
    [4, 5], // belt
    [3, 6], // Alnitak → Saiph
    [5, 7], // Mintaka → Rigel
    [6, 7], // feet bar
    // club — stem forks into two junctions, crossing to opposite tips
    [0, 8],
    [8, 9],
    [8, 10],
    [9, 11], // crossing
    [10, 12], // crossing
    // shield — hub forks into upper and lower branches
    [2, 13],
    [13, 14],
    [14, 15],
    [13, 16],
    [16, 17],
    [17, 18],
  ],
};

export const isChartConstellation = (label: string) =>
  label === "CANCER" || label === "ORION";

/** Alnitak, Alnilam, Mintaka — indices in ORION_STARS.pts */
export const ORION_BELT = [3, 4, 5] as const;

/** Brighter stars (lower magnitude) render larger. */
export const magnitudeScale = (mag: number, isLead: boolean) => {
  const base = 1.55 - mag * 0.11;
  const clamped = base < 0.72 ? 0.72 : base > 1.42 ? 1.42 : base;
  return isLead ? clamped * 1.18 : clamped;
};