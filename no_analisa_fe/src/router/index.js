import { createWebHistory, createRouter } from 'vue-router';
import routes from './routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// --- THE NAVIGATION GUARD ---
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
  