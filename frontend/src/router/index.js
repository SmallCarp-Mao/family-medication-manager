import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/AuthCallback.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medication/add',
    name: 'AddMedication',
    component: () => import('../views/AddMedication.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medication/:id',
    name: 'MedicationDetail',
    component: () => import('../views/MedicationDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/medication/:id/edit',
    name: 'EditMedication',
    component: () => import('../views/AddMedication.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family',
    name: 'FamilyManage',
    component: () => import('../views/FamilyManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/family/invite',
    name: 'InviteMember',
    component: () => import('../views/InviteMember.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/join',
    name: 'JoinFamily',
    component: () => import('../views/JoinFamily.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/member/:id',
    name: 'MemberDetail',
    component: () => import('../views/MemberDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/export',
    name: 'ExportData',
    component: () => import('../views/ExportData.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 需要认证但未登录，跳转到登录页
    next({ name: 'Login' })
  } else if (to.name === 'Login' && userStore.isLoggedIn) {
    // 已登录用户访问登录页，跳转到首页
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
