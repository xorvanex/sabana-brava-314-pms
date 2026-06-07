/** Devuelve { period_start, period_end } en YYYY-MM-DD para un mes calendario. */
export function getMonthPeriod(mes, anio) {
  const month = Number(mes);
  const year = Number(anio);
  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, "0");
  return {
    period_start: `${year}-${mm}-01`,
    period_end: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}