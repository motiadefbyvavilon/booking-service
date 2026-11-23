<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useBookingStore } from './stores/booking'
import ToastStack from './components/ToastStack.vue'

const store = useBookingStore()
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="2" y="4" width="24" height="22" rx="5" class="brand-frame" />
          <path d="M2 11h24" class="brand-line" />
          <circle cx="9" cy="17.5" r="2.4" class="brand-dot" />
          <circle cx="16.5" cy="17.5" r="2.4" class="brand-dot accent" />
          <circle cx="9" cy="7.5" r="1.6" class="brand-dot faint" />
        </svg>
        <div>
          <div class="brand-name">РесурсТайм</div>
          <div class="brand-sub">бронирование ресурсов</div>
        </div>
      </div>

      <nav class="nav" aria-label="Основная навигация">
        <RouterLink to="/" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="1.5" y="2.5" width="15" height="14" rx="3" stroke="currentColor" stroke-width="1.5" />
            <path d="M1.5 7h15M6 1.5v2M12 1.5v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Календарь
        </RouterLink>
        <RouterLink to="/resources" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2.5 6.5 9 2.7l6.5 3.8v7.6L9 17.9l-6.5-3.8V6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" transform="translate(0 -0.9) scale(0.95)" />
            <path d="M9 7.5v4M6.8 5.7l4.4 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Ресурсы
        </RouterLink>
        <RouterLink to="/notifications" class="nav-item">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 2a4.5 4.5 0 0 0-4.5 4.5c0 3-1.2 4.6-2 5.5h13c-.8-.9-2-2.5-2-5.5A4.5 4.5 0 0 0 9 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M7 14.5a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Уведомления
          <span v-if="store.unreadCount" class="nav-badge">{{ store.unreadCount }}</span>
        </RouterLink>
      </nav>

      <footer class="sidebar-foot">
        Учебный проект · Vue 3 + Vite
      </footer>
    </aside>

    <main class="main">
      <RouterView />
    </main>

    <ToastStack />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100dvh;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: sticky;
  top: 0;
  height: 100dvh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
}

.brand-frame {
  fill: var(--accent-soft);
  stroke: var(--accent);
  stroke-width: 1.5;
}

.brand-line {
  stroke: var(--accent);
  stroke-width: 1.5;
}

.brand-dot {
  fill: var(--accent-strong);
}

.brand-dot.accent {
  fill: var(--warn);
}

.brand-dot.faint {
  fill: var(--accent);
  opacity: 0.5;
}

.brand-name {
  font-weight: 800;
  font-size: 17px;
  line-height: 1.15;
}

.brand-sub {
  font-size: 12px;
  color: var(--text-faint);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-m);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: background-color 0.15s ease-out, color 0.15s ease-out;
}

.nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
}

.nav-item.router-link-active {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.nav-badge {
  margin-left: auto;
  background: var(--danger);
  color: var(--surface);
  font-size: 12px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.sidebar-foot {
  margin-top: auto;
  padding: 0 8px;
  font-size: 12px;
  color: var(--text-faint);
}

.main {
  flex: 1;
  min-width: 0;
  padding: 28px 32px 48px;
}

@media (max-width: 860px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
  }
  .brand-sub,
  .sidebar-foot {
    display: none;
  }
  .nav {
    flex-direction: row;
    flex: 1;
    justify-content: flex-end;
  }
  .nav-item {
    padding: 8px 10px;
    font-size: 14px;
  }
  .main {
    padding: 16px;
  }
}
</style>
