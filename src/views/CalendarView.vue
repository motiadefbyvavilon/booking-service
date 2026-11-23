<script setup>
import { computed, ref } from 'vue'
import { useBookingStore } from '../stores/booking'
import {
  startOfWeek, addDays, isSameDay, toISODate, combine,
  formatTime, formatDayShort, formatMonthYear, WEEKDAYS_SHORT,
} from '../utils/datetime'
import BookingModal from '../components/BookingModal.vue'

const store = useBookingStore()

const DAY_START = 8
const DAY_END = 21
const SLOT_MIN = 30
const SLOT_HEIGHT = 34 // px на 30 минут

const weekOffset = ref(0)
const resourceFilter = ref('')

const weekStart = computed(() => addDays(startOfWeek(new Date()), weekOffset.value * 7))
const days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart.value, i)))
const weekLabel = computed(() => `${formatMonthYear(weekStart.value)} · ${formatDayShort(days.value[0])} — ${formatDayShort(days.value[6])}`)

const hours = computed(() => {
  const list = []
  for (let h = DAY_START; h < DAY_END; h++) list.push(`${String(h).padStart(2, '0')}:00`)
  return list
})
const totalMinutes = (DAY_END - DAY_START) * 60

const visibleBookings = computed(() =>
  store.bookings.filter((b) => !resourceFilter.value || b.resourceId === resourceFilter.value),
)

function bookingsForDay(day) {
  const iso = toISODate(day)
  return visibleBookings.value.filter((b) => b.date === iso)
}

function blockStyle(b) {
  const start = combine(b.date, b.start)
  const end = combine(b.date, b.end)
  const topMin = start.getHours() * 60 + start.getMinutes() - DAY_START * 60
  const durMin = (end - start) / 60000
  const resource = store.resourceById(b.resourceId)
  return {
    top: `${(topMin / SLOT_MIN) * SLOT_HEIGHT}px`,
    height: `${Math.max((durMin / SLOT_MIN) * SLOT_HEIGHT - 3, 20)}px`,
    '--event-color': resource ? resource.color : '#2f8f7b',
  }
}

// ── Модальное окно ────────────────────────────────────────────
const modalOpen = ref(false)
const editing = ref(null)
const prefill = ref({})

function openCreate(day = null, hour = null) {
  editing.value = null
  const date = day ? toISODate(day) : toISODate(new Date())
  const start = hour != null ? `${String(hour).padStart(2, '0')}:00` : '10:00'
  const endH = hour != null ? hour + 1 : 11
  prefill.value = {
    date,
    start,
    end: `${String(Math.min(endH, DAY_END)).padStart(2, '0')}:00`,
    resourceId: resourceFilter.value || '',
  }
  modalOpen.value = true
}

function openEdit(booking) {
  editing.value = booking
  prefill.value = {}
  modalOpen.value = true
}

function slotClick(day, hour) {
  openCreate(day, hour)
}

function goToday() {
  weekOffset.value = 0
}
</script>

<template>
  <section class="calendar-page">
    <header class="page-head">
      <div>
        <h1>Календарь бронирований</h1>
        <p class="subtitle">{{ weekLabel }}</p>
      </div>
      <div class="head-actions">
        <select v-model="resourceFilter" class="resource-filter" aria-label="Фильтр по ресурсу">
          <option value="">Все ресурсы</option>
          <option v-for="r in store.resources" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <div class="week-nav">
          <button class="btn btn-ghost btn-sm" type="button" @click="weekOffset--">← Назад</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="goToday">Сегодня</button>
          <button class="btn btn-ghost btn-sm" type="button" @click="weekOffset++">Вперёд →</button>
        </div>
        <button class="btn btn-primary" type="button" @click="openCreate()">+ Забронировать</button>
      </div>
    </header>

    <div class="calendar card">
      <div class="grid" :style="{ '--days': 7 }">
        <div class="corner" />
        <div
          v-for="(day, i) in days"
          :key="i"
          class="day-head"
          :class="{ today: isSameDay(day, new Date()) }"
        >
          <span class="dow">{{ WEEKDAYS_SHORT[i] }}</span>
          <span class="dnum">{{ day.getDate() }}</span>
        </div>

        <div class="time-col">
          <div v-for="h in hours" :key="h" class="time-label" :style="{ height: SLOT_HEIGHT * 2 + 'px' }">{{ h }}</div>
        </div>

        <div
          v-for="(day, di) in days"
          :key="di"
          class="day-col"
          :class="{ today: isSameDay(day, new Date()) }"
        >
          <button
            v-for="(h, hi) in hours"
            :key="h"
            class="slot"
            type="button"
            :style="{ height: SLOT_HEIGHT * 2 + 'px' }"
            :aria-label="`Забронировать ${formatDayShort(day)} с ${h}`"
            @click="slotClick(day, DAY_START + hi)"
          />
          <article
            v-for="b in bookingsForDay(day)"
            :key="b.id"
            class="event"
            :style="blockStyle(b)"
            role="button"
            tabindex="0"
            :aria-label="`${b.title}, ${b.start}–${b.end}`"
            @click="openEdit(b)"
            @keydown.enter="openEdit(b)"
          >
            <div class="event-time">{{ b.start }}–{{ b.end }}</div>
            <div class="event-title">{{ b.title }}</div>
            <div v-if="!resourceFilter" class="event-res">{{ store.resourceById(b.resourceId)?.name }}</div>
          </article>
        </div>
      </div>
    </div>

    <p v-if="!visibleBookings.length" class="empty">
      На этой неделе бронирований нет — нажмите «Забронировать» или выберите свободный слот.
    </p>

    <Transition name="fade">
      <BookingModal
        v-if="modalOpen"
        :booking="editing"
        :prefill="prefill"
        @close="modalOpen = false"
      />
    </Transition>
  </section>
</template>

<style scoped>
.calendar-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 14.5px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.resource-filter {
  border: 1px solid var(--border);
  border-radius: var(--radius-m);
  background: var(--surface);
  padding: 9px 12px;
  font-size: 14.5px;
  font-weight: 500;
  max-width: 240px;
}

.week-nav {
  display: flex;
  gap: 6px;
}

.calendar {
  overflow-x: auto;
  padding: 0 0 8px;
}

.grid {
  display: grid;
  grid-template-columns: 64px repeat(var(--days), minmax(120px, 1fr));
  min-width: 960px;
}

.corner {
  border-bottom: 1px solid var(--border);
}

.day-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 0 10px;
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.day-head .dow {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-faint);
}

.day-head .dnum {
  font-size: 17px;
  font-weight: 700;
}

.day-head.today .dnum {
  background: var(--accent);
  color: var(--surface);
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.time-col {
  display: flex;
  flex-direction: column;
}

.time-label {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--text-faint);
  text-align: right;
  padding: 0 8px 0 0;
  transform: translateY(-6px);
}

.day-col {
  position: relative;
  border-left: 1px solid var(--border);
}

.day-col.today {
  background: oklch(52% 0.1 175 / 0.045);
}

.slot {
  display: block;
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--surface-2);
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.12s ease-out;
}

.slot:hover {
  background: var(--accent-soft);
}

.event {
  position: absolute;
  left: 4px;
  right: 4px;
  background: var(--surface);
  border: 1px solid var(--event-color);
  border-left: 3px solid var(--event-color);
  border-radius: var(--radius-s);
  padding: 5px 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.15s ease-out, transform 0.15s ease-out;
  z-index: 1;
}

.event:hover,
.event:focus-visible {
  box-shadow: var(--shadow-card);
  transform: translateY(-1px);
  z-index: 2;
}

.event-time {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--event-color);
  font-weight: 500;
}

.event-title {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.25;
}

.event-res {
  font-size: 11px;
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 24px 0;
}
</style>
