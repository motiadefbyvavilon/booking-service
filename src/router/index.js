import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../views/CalendarView.vue'
import ResourcesView from '../views/ResourcesView.vue'
import NotificationsView from '../views/NotificationsView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'calendar', component: CalendarView, meta: { title: 'Календарь' } },
    { path: '/resources', name: 'resources', component: ResourcesView, meta: { title: 'Ресурсы' } },
    { path: '/notifications', name: 'notifications', component: NotificationsView, meta: { title: 'Уведомления' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title} — РесурсТайм`
})
