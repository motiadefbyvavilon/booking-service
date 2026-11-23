<script setup>
import { computed, ref } from 'vue'
import { useBookingStore } from '../stores/booking'
import ResourceModal from '../components/ResourceModal.vue'

const store = useBookingStore()

const modalOpen = ref(false)
const editing = ref(null)
const confirmDelete = ref(null)

const upcomingByResource = computed(() => {
  const map = {}
  const now = new Date()
  for (const r of store.resources) {
    map[r.id] = store.bookings.filter((b) => {
      if (b.resourceId !== r.id) return false
      return new Date(`${b.date}T${b.end}:00`) >= now
    }).length
  }
  return map
})

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(resource) {
  editing.value = resource
  modalOpen.value = true
}

function askDelete(resource) {
  confirmDelete.value = resource
}

function doDelete() {
  store.deleteResource(confirmDelete.value.id)
  confirmDelete.value = null
}
</script>

<template>
  <section class="resources-page">
    <header class="page-head">
      <div>
        <h1>Ресурсы</h1>
        <p class="subtitle">Добавление, редактирование и удаление общих ресурсов, назначение ответственных</p>
      </div>
      <button class="btn btn-primary" type="button" @click="openCreate">+ Добавить ресурс</button>
    </header>

    <div v-if="store.resources.length" class="cards">
      <article v-for="r in store.resources" :key="r.id" class="card res-card">
        <span class="res-color" :style="{ background: r.color }" aria-hidden="true" />
        <div class="res-main">
          <div class="res-title-row">
            <h2 class="res-name">{{ r.name }}</h2>
            <span class="badge">{{ r.type }}</span>
          </div>
          <dl class="res-meta">
            <div>
              <dt>Ответственный</dt>
              <dd>{{ r.owner }}</dd>
            </div>
            <div>
              <dt>Вместимость</dt>
              <dd>{{ r.capacity }}</dd>
            </div>
            <div>
              <dt>Ближайшие бронирования</dt>
              <dd>{{ upcomingByResource[r.id] }}</dd>
            </div>
          </dl>
        </div>
        <div class="res-actions">
          <button class="btn btn-ghost btn-sm" type="button" @click="openEdit(r)">Изменить</button>
          <button class="btn btn-danger btn-sm" type="button" @click="askDelete(r)">Удалить</button>
        </div>
      </article>
    </div>

    <p v-else class="empty card">Ресурсов пока нет — добавьте первый, чтобы начать бронировать.</p>

    <Transition name="fade">
      <ResourceModal v-if="modalOpen" :resource="editing" @close="modalOpen = false" />
    </Transition>

    <Transition name="fade">
      <div v-if="confirmDelete" class="backdrop" @mousedown.self="confirmDelete = null">
        <div class="card confirm" role="alertdialog" aria-modal="true" aria-label="Подтверждение удаления">
          <h2>Удалить ресурс?</h2>
          <p>
            «{{ confirmDelete.name }}» будет удалён вместе со всеми его бронированиями
            (всего: {{ store.bookingsForResource(confirmDelete.id).length }}). Действие необратимо.
          </p>
          <div class="confirm-actions">
            <button class="btn btn-ghost" type="button" @click="confirmDelete = null">Оставить</button>
            <button class="btn btn-danger" type="button" @click="doDelete">Удалить</button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.resources-page {
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

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.res-card {
  display: flex;
  gap: 14px;
  padding: 18px;
  position: relative;
}

.res-color {
  width: 6px;
  border-radius: 999px;
  flex-shrink: 0;
}

.res-main {
  flex: 1;
  min-width: 0;
}

.res-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.res-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.res-meta {
  display: flex;
  gap: 24px;
  margin: 12px 0 0;
  flex-wrap: wrap;
}

.res-meta dt {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  font-weight: 600;
}

.res-meta dd {
  margin: 2px 0 0;
  font-size: 14.5px;
  font-weight: 600;
}

.res-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: center;
}

.empty {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
}

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

.confirm {
  max-width: 420px;
  padding: 24px;
}

.confirm h2 {
  margin: 0 0 8px;
  font-size: 19px;
}

.confirm p {
  margin: 0 0 20px;
  color: var(--text-secondary);
  font-size: 14.5px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
