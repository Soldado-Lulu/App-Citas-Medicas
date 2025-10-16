// Regla "dos días hábiles": desde "from", devuelve N días que no sean fin de semana ni feriados.
// allowWeekends=true para permitir sábados/domingo si el hospital lo desea.

export function nextAllowedDays(
  from = new Date(),
  howMany = 2,
  allowWeekends = false,
  holidays: string[] = []
) {
  const days: Date[] = [];
  let d = new Date(from);
  let tries = 0;
  while (days.length < howMany && tries < 14) {
    d.setDate(d.getDate() + 1);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getDay(); // 0=Dom, 6=Sáb
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = holidays.includes(iso);
    if ((allowWeekends || !isWeekend) && !isHoliday) days.push(new Date(d));
    tries++;
  }
  return days;
}
