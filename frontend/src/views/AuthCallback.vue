<template>
  <div class="auth-callback">
    <van-loading size="40" color="#4A90E2">登录中...</van-loading>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  const { token } = route.query

  if (token) {
    // 保存 token
    localStorage.setItem('token', token)

    try {
      // 获取用户信息
      await userStore.fetchUser()
      showToast.success('登录成功')

      // 跳转到首页
      router.replace('/home')
    } catch (error) {
      showToast.fail('获取用户信息失败')
      router.replace('/login')
    }
  } else {
    showToast.fail('登录失败')
    router.replace('/login')
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f5f5;
}
</style>
