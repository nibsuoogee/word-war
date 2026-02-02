import z from "zod";

export const page = z.enum(["menu", "game", "results"]);
export type Page = z.infer<typeof page>;

export const cardSymbol = z.enum([
  "asterisk",
  "four-dots",
  "hashtag",
  "pause",
  "plus",
  "rectangle",
  "thunder",
]);
export type CardSymbol = z.infer<typeof cardSymbol>;

const card = z.object({
  category: z.string(),
  cardSymbol: cardSymbol,
});
export type Card = z.infer<typeof card>;

const deck = z.object({
  cards: z.array(card),
});
export type Deck = z.infer<typeof deck>;

const playerState = z.object({
  points: z.number(),
  physicalDeck: z.array(card),
  virtualDeckPosition: z.number(),
});
export type PlayerState = z.infer<typeof playerState>;
