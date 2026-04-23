import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '../stores/admin'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue')
      },
      {
        path: 'families',
        name: 'Families',
        component: () => import('../views/Families.vue')
      },
      {
        path: 'medications',
        name: 'Medications',
        component: () => import('../views/Medications.vue')
      },
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('../views/Admins.vue'),
        meta: { requiresSuperAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const adminStore = useAdminStore()

  if (to.meta.requiresAuth && !adminStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && adminStore.isLoggedIn) {
    next('/')
  } else if (to.meta.requiresSuperAdmin && adminStore.admin?.role !== 'SUPER_ADMIN') {
    next('/')
  } else {
    next()
  }
})

export default router
