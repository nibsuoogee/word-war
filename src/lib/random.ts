import type { Card } from "@/types";

/**
 * A fast, seedable, psuedo-random number generator for Javascript.
 */
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle an array
 */
export function arrayShuffle(
  cards: any[],
  randomNumberGenerator: () => number,
): Card[] {
  var m = cards.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(randomNumberGenerator() * m--);

    // And swap it with the current element.
    t = cards[m];
    cards[m] = cards[i];
    cards[i] = t;
  }

  return cards;
}
