// backend/src/domain/slots.ts
export function hhmmToMinutes(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr ?? 0);
  const m = Number(mStr ?? 0);
  return h * 60 + m;
}

export function minutesToISO(dateISO: string, totalMin: number): string {
  // Genera un ISO con la hora 'totalMin' en ese día, en UTC.
  const d = new Date(dateISO);
  const base = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  base.setUTCMinutes(totalMin);
  return base.toISOString();
}

/** Genera intervalos [start,end) cada 'stepMin' entre start_hhmm y end_hhmm */
export function buildSlotsForWindow(
  dateISO: string,
  start_hhmm: string,
  end_hhmm: string,
  stepMin: number
) {
  const a = hhmmToMinutes(start_hhmm);
  const b = hhmmToMinutes(end_hhmm);
  const slots: Array<{ start: string; end: string }> = [];
  for (let t = a; t + stepMin <= b; t += stepMin) {
    slots.push({
      start: minutesToISO(dateISO, t),
      end: minutesToISO(dateISO, t + stepMin),
    });
  }
  return slots;
}
