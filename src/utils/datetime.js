// Работа с датами без сторонних библиотек

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Понедельник недели, содержащей дату */
export function startOfWeek(d) {
  const x = startOfDay(d)
  const day = (x.getDay() + 6) % 7 // 0 = понедельник
  return addDays(x, -day)
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

export function toISODate(d) {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 'YYYY-MM-DD' + 'HH:MM' → Date */
export function combine(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`)
}

export function formatTime(d) {
  const x = new Date(d)
  return `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]
const MONTHS_NOM = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function formatDayShort(d) {
  const x = new Date(d)
  return `${x.getDate()} ${MONTHS_GEN[x.getMonth()]}`
}

export function formatMonthYear(d) {
  const x = new Date(d)
  return `${MONTHS_NOM[x.getMonth()]} ${x.getFullYear()}`
}

export function formatDateTime(d) {
  const x = new Date(d)
  return `${formatDayShort(x)}, ${formatTime(x)}`
}

/** Пересекаются ли интервалы [aStart,aEnd) и [bStart,bEnd) */
export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}
