export function usDateFormat(date: string) {
  const [day, year, month] = date.split('/')
  return `${year}/${day}/${month}`
}