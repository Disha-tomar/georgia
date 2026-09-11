import type { FoodPick } from '../data/types';

const LABEL = ['', 'cheap', 'mid-range', 'expensive'] as const;

/**
 * Price tier as dots — one, two or three.
 *
 * Two notes on why it looks like this. The lari sign ₾ (U+20BE) is missing
 * from the bundled font subsets and renders as tofu, so the data keeps ₾/₾₾/₾₾₾
 * as its semantic value but the screen never shows it. And the dots are not
 * padded out to three with dimmed placeholders: at this size opacity alone was
 * indistinguishable, so the tier reads by *length*, which is unambiguous.
 */
export function PriceTier({ price }: { price: FoodPick['price'] }) {
  const n = price.length;
  return (
    <span className="fp" title={LABEL[n]} aria-label={LABEL[n]}>
      {'●'.repeat(n)}
    </span>
  );
}
