import z from "zod";

const symbols = z.enum([
  "asterisk",
  "four-dots",
  "hashtag",
  "pause",
  "plus",
  "rectangle",
  "thunder",
]);

const card = z.object({
  category: z.string(),
  symbol: symbols,
});
export type Card = z.infer<typeof card>;

const deck = z.object({
  cards: z.array(card),
});
export type Deck = z.infer<typeof deck>;
