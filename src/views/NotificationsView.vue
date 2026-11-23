<script setup>
import { useBookingStore } from '../stores/booking'
import { formatDateTime } from '../utils/datetime'

const store = useBookingStore()

const KIND_LABEL = {
  created: 'Создание',
  updated: 'Изменение',
  cancelled: 'Отмена',
}
</script>

<template>
  <section class="notifications-page">
    <header class="page-head">
      <div>
        <h1>Уведомления</h1>
        <p class="subtitle">Автоматические уведомления участников о новых, изменённых и отменённых бронированиях</p>
      </div>
      <button
        v-if="store.unreadCount"
        class="btn btn-ghost"
        type="button"
        @click="store.markAllRead()"
      >
        Отметить все прочитанными
      </button>
    </header>

    <div v-if="store.notifications.length" class="list">
      <article
        v-for="n in store.notifications"
        :key="n.id"
        class="card note"
        :class="{ unread: !n.read }"
      >
        <div class="note-top">
          <span class="badge" :class="`kind-${n.kind}`">{{ KIND_LABEL[n.kind] || 'Событие' }}</span>
          <time class="note-time">{{ formatDateTime(n.createdAt) }}</time>
        </div>
        <p class="note-text">{{ n.text }}</p>
        <p class="note-recipients">
          Отправлено участникам: {{ n.recipients.join(', ') }}
        </p>
      </article>
    </div>

    <div v-else class="card empty">
      <svg width="44" height="44" viewBox="0 0 18 18" fill="none" aria-hidden="true" class="empty-icon">
        <path d="M9 2a4.5 4.5 0 0 0-4.5 4.5c0 3-1.2 4.6-2 5.5h13c-.8-.9-2-2.5-2-5.5A4.5 4.5 0 0 0 9 2Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
        <path d="M7 14.5a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      </svg>
      <p>Уведомлений пока нет. Они появятся автоматически при создании первого бронирования.</p>
    </div>
  </section>
</template>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 760px;
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

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note {
  padding: 16px 18px;
  border-left: 3px solid transparent;
}

.note.unread {
  border-left-color: var(--accent);
  background: oklch(52% 0.1 175 / 0.05);
}

.note-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kind-created {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.kind-updated {
  background: var(--warn-soft);
  color: var(--warn);
}

.kind-cancelled {
  background: var(--danger-soft);
  color: var(--danger);
}

.note-time {
  font-size: 13px;
  color: var(--text-faint);
  font-family: var(--mono);
}

.note-text {
  margin: 10px 0 6px;
  font-size: 15px;
  font-weight: 500;
}

.note-recipients {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-secondary);
}

.empty {
  padding: 48px 32px;
  text-align: center;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  color: var(--text-faint);
}
</style>
