// Генерация .ics файла для синхронизации бронирования с календарём пользователя

function pad(n) {
  return String(n).padStart(2, '0')
}

function toICSDate(d) {
  const x = new Date(d)
  return (
    `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}` +
    `T${pad(x.getHours())}${pad(x.getMinutes())}${pad(x.getSeconds())}`
  )
}

function escapeICS(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function bookingToICS(booking, resource) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ResursTime//Booking//RU',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@resurstime.local`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(booking.start)}`,
    `DTEND:${toICSDate(booking.end)}`,
    `SUMMARY:${escapeICS(booking.title)}`,
    `LOCATION:${escapeICS(resource ? resource.name : '')}`,
    `DESCRIPTION:${escapeICS(`Ресурс: ${resource ? resource.name : '—'}\\nУчастники: ${booking.participants.join(', ')}`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function downloadICS(booking, resource) {
  const blob = new Blob([bookingToICS(booking, resource)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `booking-${booking.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
