/**
 * Tide data layer (server-side).
 *
 * Tide predictions come from the same committed build-time snapshot used by the
 * fetch-tide script (tides are updated on a daily cycle, so a fresh snapshot is
 * produced on every deployment build). The JSON snapshot is bundled with the
 * page, which keeps this component free of any runtime filesystem dependency.
 */
import snapshot from '../../public/data/tides.json';

export type TideEvent = { type: 'high' | 'low'; time: string; m: number };
export type TideDay = { date: string; events: TideEvent[] };
export type TidePayload = { station?: string; generated?: string; days: TideDay[] };

let cache: TidePayload | null | undefined;

export function getTideData(): TidePayload | null {
  if (cache !== undefined) return cache;
  cache =
    snapshot && Array.isArray((snapshot as TidePayload).days) && (snapshot as TidePayload).days.length > 0
      ? (snapshot as TidePayload)
      : null;
  return cache;
}
