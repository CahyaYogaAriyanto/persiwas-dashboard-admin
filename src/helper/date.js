export const indoDateToISO = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return new Date(
    year,
    month - 1,
    day,
    0, 0, 0
  ).toISOString();
};
