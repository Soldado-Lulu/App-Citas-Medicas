// Calcula los próximos 2 días hábiles (sin sábados ni domingos)
// y utilidades simples de fecha (YYYY-MM-DD)
export function nextTwoBusinessDays(from = new Date()): [Date, Date] {
  const out: Date[] = [];
  const d = new Date(from);
  d.setDate(d.getDate() + 1); // empezamos desde mañana
  while (out.length < 2) {
    const wd = d.getDay(); // 0=Domingo, 6=Sábado
    if (wd !== 0 && wd !== 6) out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return [out[0], out[1]];
}

export function ymd(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
