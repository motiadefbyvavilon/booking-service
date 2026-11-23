<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useBookingStore } from '../stores/booking'

const props = defineProps({
  resource: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const store = useBookingStore()

const TYPES = ['Помещение', 'Оборудование', 'Специалист', 'Транспорт', 'Другое']
const COLORS = ['#2f8f7b', '#b0762a', '#4a6fa5', '#8a5ba6', '#c05b4d', '#5b8c3f']

const form = reactive({ id: null, name: '', type: 'Помещение', capacity: 1, owner: '', color: COLORS[0] })
const error = ref('')

watch(
  () => props.resource,
  (r) => {
    if (r) Object.assign(form, { id: r.id, name: r.name, type: r.type, capacity: r.capacity, owner: r.owner, color: r.color })
  },
  { immediate: true },
)

const isEdit = computed(() => Boolean(props.resource))

function submit() {
  error.value = ''
  const result = store.saveResource({ ...form, capacity: Number(form.capacity) || 1 })
  if (!result.ok) {
    error.value = result.error
    return
  }
  emit('close')
}

function onBackdrop(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <div class="backdrop" @mousedown="onBackdrop">
    <div class="modal card" role="dialog" aria-modal="true" :aria-label="isEdit ? 'Редактирование ресурса' : 'Новый ресурс'">
      <header class="modal-head">
        <h2>{{ isEdit ? 'Редактирование ресурса' : 'Новый ресурс' }}</h2>
        <button class="icon-btn" type="button" aria-label="Закрыть" @click="emit('close')">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="m4 4 10 10M14 4 4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </header>

      <form class="modal-body" @submit.prevent="submit">
        <div v-if="error" class="alert" role="alert">{{ error }}</div>

        <div class="field">
          <label for="rf-name">Название</label>
          <input id="rf-name" v-model="form.name" type="text" placeholder="Например: переговорная «Волга»" required />
        </div>

        <div class="row">
          <div class="field">
            <label for="rf-type">Тип</label>
            <select id="rf-type" v-model="form.type">
              <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="field">
            <label for="rf-capacity">Вместимость</label>
            <input id="rf-capacity" v-model="form.capacity" type="number" min="1" max="500" required />
          </div>
        </div>

        <div class="field">
          <label for="rf-owner">Ответственное лицо</label>
          <input id="rf-owner" v-model="form.owner" type="text" placeholder="ФИО ответственного" required />
        </div>

        <div class="field">
          <label>Цвет метки</label>
          <div class="colors">
            <button
              v-for="c in COLORS"
              :key="c"
              type="button"
              class="color-dot"
              :class="{ active: form.color === c }"
              :style="{ background: c }"
              :aria-label="`Выбрать цвет ${c}`"
              :aria-pressed="form.color === c"
              @click="form.color = c"
            />
          </div>
        </div>

        <footer class="modal-foot">
          <button class="btn btn-ghost" type="button" @click="emit('close')">Закрыть</button>
          <button class="btn btn-primary" type="submit">{{ isEdit ? 'Сохранить' : 'Добавить ресурс' }}</button>
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
  max-width: 480px;
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

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.colors {
  display: flex;
  gap: 10px;
}

.color-dot {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease-out, border-color 0.15s ease-out;
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.active {
  border-color: var(--text);
  transform: scale(1.1);
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
}
</style>
