<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useBookingStore } from '../stores/booking'
import { formatDateTime, combine } from '../utils/datetime'
import { downloadICS } from '../utils/ics'

const props = defineProps({
  /** null → создание; объект бронирования → редактирование */
  booking: { type: Object, default: null },
  prefill: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['close'])

const store = useBookingStore()

const form = reactive({
  title: '',
  resourceId: '',
  date: '',
  start: '',
  end: '',
  participants: [],
  ...props.prefill,
})

const participantInput = ref('')
const serverError = ref('')
const conflictList = ref([])

watch(
  () => props.booking,
  (b) => {
    if (b) {
      Object.assign(form, {
        title: b.title,
        resourceId: b.resourceId,
        date: b.date,
        start: b.start,
        end: b.end,
        participants: [...b.participants],
      })
    }
  },
  { immediate: true },
)

const isEdit = computed(() => Boolean(props.booking))
const selectedResource = computed(() => store.resourceById(form.resourceId))

function addParticipant() {
  const name = participantInput.value.trim()
  if (!name) return
  if (!form.participants.includes(name)) form.participants.push(name)
  participantInput.value = ''
}

function removeParticipant(name) {
  form.participants = form.participants.filter((p) => p !== name)
}

function submit() {
  serverError.value = ''
  conflictList.value = []
  const payload = { ...form }
  const result = isEdit.value
    ? store.updateBooking(props.booking.id, payload)
    : store.createBooking(payload)

  if (!result.ok) {
    serverError.value = result.error
    conflictList.value = result.conflicts || []
    return
  }
  emit('close')
}

function cancelBooking() {
  store.cancelBooking(props.booking.id)
  emit('close')
}

function exportICS() {
  downloadICS(props.booking, selectedResource.value)
  store.pushToast('Файл .ics сохранён — импортируйте его в свой календарь', 'success')
}

function onBackdrop(e) {
  if (e.target === e.currentTarget) emit('close')
}

function conflictLabel(c) {
  const r = store.resourceById(c.resourceId)
  return `«${c.title}» — ${r ? r.name : ''}, ${formatDateTime(combine(c.date, c.start))}–${c.end}`
}
</script>

<template>
  <div class="backdrop" @mousedown="onBackdrop">
    <div class="modal card" role="dialog" aria-modal="true" :aria-label="isEdit ? 'Редактирование бронирования' : 'Новое бронирование'">
      <header class="modal-head">
        <h2>{{ isEdit ? 'Редактирование бронирования' : 'Новое бронирование' }}</h2>
        <button class="icon-btn" type="button" aria-label="Закрыть" @click="emit('close')">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="m4 4 10 10M14 4 4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </header>

      <form class="modal-body" @submit.prevent="submit">
        <div v-if="serverError" class="alert" role="alert">
          <strong>{{ serverError }}</strong>
          <ul v-if="conflictList.length">
            <li v-for="c in conflictList" :key="c.id">{{ conflictLabel(c) }}</li>
          </ul>
          <span v-if="conflictList.length" class="alert-hint">Выберите другое время или другой ресурс.</span>
        </div>

        <div class="field">
          <label for="bf-title">Название</label>
          <input id="bf-title" v-model="form.title" type="text" placeholder="Например: планёрка отдела" required />
        </div>

        <div class="field">
          <label for="bf-resource">Ресурс</label>
          <select id="bf-resource" v-model="form.resourceId" required>
            <option value="" disabled>Выберите ресурс</option>
            <option v-for="r in store.resources" :key="r.id" :value="r.id">
              {{ r.name }} · {{ r.type }}
            </option>
          </select>
        </div>

        <p v-if="selectedResource" class="resource-hint">
          Ответственный: <strong>{{ selectedResource.owner }}</strong> · вместимость: {{ selectedResource.capacity }}
        </p>

        <div class="row">
          <div class="field">
            <label for="bf-date">Дата</label>
            <input id="bf-date" v-model="form.date" type="date" required />
          </div>
          <div class="field">
            <label for="bf-start">Начало</label>
            <input id="bf-start" v-model="form.start" type="time" step="900" required />
          </div>
          <div class="field">
            <label for="bf-end">Окончание</label>
            <input id="bf-end" v-model="form.end" type="time" step="900" required />
          </div>
        </div>

        <div class="field">
          <label for="bf-participant">Участники</label>
          <div class="participant-input">
            <input
              id="bf-participant"
              v-model="participantInput"
              type="text"
              placeholder="Имя участника"
              @keydown.enter.prevent="addParticipant"
            />
            <button class="btn btn-ghost btn-sm" type="button" @click="addParticipant">Добавить</button>
          </div>
          <div v-if="form.participants.length" class="chips">
            <span v-for="p in form.participants" :key="p" class="chip">
              {{ p }}
              <button type="button" class="chip-x" :aria-label="`Убрать ${p}`" @click="removeParticipant(p)">×</button>
            </span>
          </div>
        </div>

        <footer class="modal-foot">
          <div class="foot-left">
            <button v-if="isEdit" class="btn btn-danger btn-sm" type="button" @click="cancelBooking">
              Отменить бронирование
            </button>
            <button v-if="isEdit" class="btn btn-ghost btn-sm" type="button" @click="exportICS">
              Экспорт в календарь (.ics)
            </button>
          </div>
          <div class="foot-right">
            <button class="btn btn-ghost" type="button" @click="emit('close')">Закрыть</button>
            <button class="btn btn-primary" type="submit">
              {{ isEdit ? 'Сохранить изменения' : 'Забронировать' }}
            </button>
          </div>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: oklch(24% 0.02 60 / 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: var(--z-modal);
}

.modal {
  width: 100%;
  max-width: 560px;
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  padding: 0;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.modal-head h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-s);
  background: transparent;
  color: var(--text-secondary);
  transition: background-color 0.15s ease-out;
}

.icon-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px 24px;
}

.alert {
  background: var(--danger-soft);
  border: 1px solid var(--danger);
  color: var(--danger);
  border-radius: var(--radius-m);
  padding: 12px 14px;
  font-size: 14px;
}

.alert ul {
  margin: 8px 0 4px;
  padding-left: 18px;
  color: var(--text);
}

.alert-hint {
  display: block;
  margin-top: 6px;
  color: var(--text-secondary);
}

.row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 12px;
}

.resource-hint {
  margin: -6px 0 0;
  font-size: 13.5px;
  color: var(--text-secondary);
}

.participant-input {
  display: flex;
  gap: 8px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  border-radius: 999px;
  padding: 4px 8px 4px 12px;
  font-size: 13.5px;
  font-weight: 600;
}

.chip-x {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 16px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 999px;
}

.modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.foot-left,
.foot-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
