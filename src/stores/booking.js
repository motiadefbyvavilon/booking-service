import { defineStore } from 'pinia'
import { overlaps, addDays, combine } from '../utils/datetime'

const STORAGE_KEY = 'resurstime-state-v1'

let idSeq = 1000
function nextId(prefix) {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

function seedState() {
  const monday = new Date()
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

  const resources = [
    { id: 'r-1', name: 'Конференц-зал «Байкал»', type: 'Помещение', capacity: 20, owner: 'Анна Соколова', color: '#2f8f7b' },
    { id: 'r-2', name: 'Переговорная «Амур»', type: 'Помещение', capacity: 6, owner: 'Анна Соколова', color: '#b0762a' },
    { id: 'r-3', name: 'Фотограф Иван Петров', type: 'Специалист', capacity: 1, owner: 'Мария Ким', color: '#4a6fa5' },
    { id: 'r-4', name: 'Проектор Epson EB-2250', type: 'Оборудование', capacity: 1, owner: 'Олег Гришин', color: '#8a5ba6' },
    { id: 'r-5', name: 'Комплект звукового оборудования', type: 'Оборудование', capacity: 1, owner: 'Олег Гришин', color: '#c05b4d' },
  ]

  const mk = (dayOffset, start, end, rest) => ({
    id: nextId('b'),
    date: dayOffsetToISO(monday, dayOffset),
    start,
    end,
    createdAt: new Date().toISOString(),
    ...rest,
  })

  const bookings = [
    mk(0, '10:00', '11:30', { resourceId: 'r-1', title: 'Планёрка отдела продаж', participants: ['Дмитрий Волков', 'Сара Оганесян', 'Игорь Ланской'], createdBy: 'Дмитрий Волков' }),
    mk(0, '14:00', '15:00', { resourceId: 'r-2', title: 'Интервью с кандидатом', participants: ['Мария Ким'], createdBy: 'Мария Ким' }),
    mk(1, '09:00', '12:00', { resourceId: 'r-3', title: 'Фотосессия для сайта', participants: ['Мария Ким', 'PR-команда'], createdBy: 'Мария Ким' }),
    mk(2, '13:00', '14:30', { resourceId: 'r-1', title: 'Демо для заказчика', participants: ['Игорь Ланской', 'Олег Гришин'], createdBy: 'Игорь Ланской' }),
    mk(2, '13:00', '14:30', { resourceId: 'r-4', title: 'Демо для заказчика', participants: ['Игорь Ланской', 'Олег Гришин'], createdBy: 'Игорь Ланской' }),
    mk(3, '11:00', '12:00', { resourceId: 'r-2', title: 'Синк команды дизайна', participants: ['Сара Оганесян'], createdBy: 'Сара Оганесян' }),
    mk(4, '15:00', '17:00', { resourceId: 'r-5', title: 'Запись подкаста', participants: ['Дмитрий Волков'], createdBy: 'Дмитрий Волков' }),
  ]

  return { resources, bookings, notifications: [] }
}

function dayOffsetToISO(monday, offset) {
  const d = addDays(monday, offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.resources) || !Array.isArray(parsed.bookings)) return seedState()
    return { notifications: [], ...parsed }
  } catch {
    return seedState()
  }
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    ...load(),
    toasts: [],
  }),

  getters: {
    resourceById: (s) => (id) => s.resources.find((r) => r.id === id) || null,

    bookingsForResource: (s) => (resourceId) =>
      s.bookings
        .filter((b) => b.resourceId === resourceId)
        .sort((a, b) => combine(a.date, a.start) - combine(b.date, b.start)),

    unreadCount: (s) => s.notifications.filter((n) => !n.read).length,
  },

  actions: {
    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ resources: this.resources, bookings: this.bookings, notifications: this.notifications }),
      )
    },

    /** Проверка конфликта: тот же ресурс, пересекающееся время */
    findConflicts({ resourceId, date, start, end, excludeId = null }) {
      const s = combine(date, start)
      const e = combine(date, end)
      return this.bookings.filter((b) => {
        if (b.resourceId !== resourceId || b.id === excludeId) return false
        return overlaps(s, e, combine(b.date, b.start), combine(b.date, b.end))
      })
    },

    /**
     * Создать бронирование. Возвращает { ok, error?, conflicts?, booking? }
     */
    createBooking(payload) {
      if (!payload.title?.trim()) return { ok: false, error: 'Укажите название бронирования' }
      if (!payload.resourceId) return { ok: false, error: 'Выберите ресурс' }
      if (!payload.date) return { ok: false, error: 'Выберите дату' }
      if (!payload.start || !payload.end) return { ok: false, error: 'Укажите время начала и окончания' }
      if (combine(payload.date, payload.end) <= combine(payload.date, payload.start)) {
        return { ok: false, error: 'Время окончания должно быть позже времени начала' }
      }
      if (!payload.participants?.length) return { ok: false, error: 'Добавьте хотя бы одного участника' }

      const conflicts = this.findConflicts(payload)
      if (conflicts.length) {
        return {
          ok: false,
          error: 'Конфликт бронирования: ресурс уже занят в это время',
          conflicts,
        }
      }

      const booking = {
        id: nextId('b'),
        ...payload,
        title: payload.title.trim(),
        createdAt: new Date().toISOString(),
      }
      this.bookings.push(booking)
      this.notifyParticipants(booking, 'created')
      this.persist()
      return { ok: true, booking }
    },

    updateBooking(id, payload) {
      const idx = this.bookings.findIndex((b) => b.id === id)
      if (idx === -1) return { ok: false, error: 'Бронирование не найдено' }
      if (combine(payload.date, payload.end) <= combine(payload.date, payload.start)) {
        return { ok: false, error: 'Время окончания должно быть позже времени начала' }
      }
      const conflicts = this.findConflicts({ ...payload, excludeId: id })
      if (conflicts.length) {
        return { ok: false, error: 'Конфликт бронирования: ресурс уже занят в это время', conflicts }
      }
      this.bookings[idx] = { ...this.bookings[idx], ...payload }
      this.notifyParticipants(this.bookings[idx], 'updated')
      this.persist()
      return { ok: true, booking: this.bookings[idx] }
    },

    cancelBooking(id) {
      const booking = this.bookings.find((b) => b.id === id)
      if (!booking) return
      this.bookings = this.bookings.filter((b) => b.id !== id)
      this.notifyParticipants(booking, 'cancelled')
      this.persist()
    },

    /** Уведомление всех участников о событии бронирования */
    notifyParticipants(booking, kind) {
      const resource = this.resources.find((r) => r.id === booking.resourceId)
      const verbs = {
        created: 'Новое бронирование',
        updated: 'Бронирование изменено',
        cancelled: 'Бронирование отменено',
      }
      this.notifications.unshift({
        id: nextId('n'),
        kind,
        text: `${verbs[kind]}: «${booking.title}», ${resource ? resource.name : 'ресурс'}, ${booking.date} ${booking.start}–${booking.end}`,
        recipients: [...booking.participants],
        createdAt: new Date().toISOString(),
        read: false,
      })
      const toastText = {
        created: 'Бронирование создано, участники уведомлены',
        updated: 'Изменения сохранены, участники уведомлены',
        cancelled: 'Бронирование отменено, участники уведомлены',
      }
      this.pushToast(toastText[kind], 'success')
    },

    markAllRead() {
      this.notifications.forEach((n) => (n.read = true))
      this.persist()
    },

    // ── Управление ресурсами ──────────────────────────────────
    saveResource(payload) {
      if (!payload.name?.trim()) return { ok: false, error: 'Укажите название ресурса' }
      if (!payload.owner?.trim()) return { ok: false, error: 'Укажите ответственное лицо' }
      if (payload.id) {
        const idx = this.resources.findIndex((r) => r.id === payload.id)
        if (idx === -1) return { ok: false, error: 'Ресурс не найден' }
        this.resources[idx] = { ...this.resources[idx], ...payload, name: payload.name.trim(), owner: payload.owner.trim() }
        this.pushToast('Ресурс обновлён', 'success')
      } else {
        this.resources.push({
          id: nextId('r'),
          type: 'Помещение',
          capacity: 1,
          color: '#2f8f7b',
          ...payload,
          name: payload.name.trim(),
          owner: payload.owner.trim(),
        })
        this.pushToast('Ресурс добавлен', 'success')
      }
      this.persist()
      return { ok: true }
    },

    deleteResource(id) {
      this.bookings = this.bookings.filter((b) => b.resourceId !== id)
      this.resources = this.resources.filter((r) => r.id !== id)
      this.pushToast('Ресурс и связанные бронирования удалены', 'success')
      this.persist()
    },

    // ── Тосты ─────────────────────────────────────────────────
    pushToast(text, tone = 'info') {
      const id = nextId('t')
      this.toasts.push({ id, text, tone })
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id)
      }, 4200)
    },
  },
})
