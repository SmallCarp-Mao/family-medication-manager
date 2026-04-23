<template>
  <div class="login-page">
    <div class="logo-section">
      <div class="logo">💊</div>
      <h1>家庭药物管理</h1>
      <p>守护家人用药安全</p>
    </div>

    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="formData.openid"
          name="openid"
          label="OpenID"
          placeholder="请输入测试 OpenID"
          :rules="[{ required: true, message: '请输入 OpenID' }]"
        />
        <van-field
          v-model="formData.nickname"
          name="nickname"
          label="昵称"
          placeholder="请输入昵称"
        />
      </van-cell-group>

      <div class="btn-group">
        <van-button round block type="primary" native-type="submit">
          登录
        </van-button>
      </div>
    </van-form>

    <div class="tips">
      <p>💡 这是测试登录页面</p>
      <p>生产环境将使用微信公众号 OAuth</p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const formData = reactive({
  openid: '',
  nickname: '测试用户',
})

const handleLogin = async () => {
  try {
    await userStore.login(formData.openid, formData.nickname, null)
    showToast.success('登录成功')

    // 检查是否有家庭
    if (userStore.hasFamily) {
      router.replace('/home')
    } else {
      // 没有家庭，先创建或加入
      router.replace('/family')
    }
  } catch (error) {
    showToast({
      type: 'fail',
      message: '登录失败: ' + (error.message || '未知错误')
    })
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 60px 20px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.logo-section {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.logo {
  font-size: 80px;
  margin-bottom: 20px;
}

.logo-section h1 {
  font-size: 28px;
  margin: 0 0 10px;
}

.logo-section p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.btn-group {
  margin: 30px 16px 16px;
}

.tips {
  margin-top: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.tips p {
  margin: 5px 0;
}
</style>
