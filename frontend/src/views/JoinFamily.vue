<template>
  <div class="join-family-page">
    <van-nav-bar
      title="加入家庭"
      left-text="返回"
      @click-left="goBack"
    />

    <div class="content">
      <div class="join-card">
        <div class="card-icon">🏠</div>
        <h2>加入家庭</h2>
        <p>输入邀请码加入家人的家庭</p>

        <van-form @submit="handleJoin">
          <van-cell-group inset>
            <van-field
              v-model="inviteCode"
              name="inviteCode"
              label="邀请码"
              placeholder="请输入6位邀请码"
              :rules="[
                { required: true, message: '请输入邀请码' },
                { pattern: /^[A-Z0-9]{6}$/, message: '邀请码格式不正确' }
              ]"
              maxlength="6"
              style="text-transform: uppercase;"
            />
          </van-cell-group>

          <div class="btn-group">
            <van-button
              round
              block
              type="primary"
              native-type="submit"
              :loading="joining"
            >
              加入家庭
            </van-button>
          </div>
        </van-form>

        <div class="tips">
          <p>💡 邀请码由家人通过"家庭管理"生成</p>
          <p>邀请码有效期为7天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { joinFamily as joinFamilyApi } from '../api/family'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const inviteCode = ref('')
const joining = ref(false)

const handleJoin = async () => {
  try {
    joining.value = true
    await joinFamilyApi(inviteCode.value.toUpperCase())
    showToast.success('成功加入家庭')

    // 更新用户信息
    await userStore.fetchUser()

    // 跳转到首页
    router.replace('/home')
  } catch (error) {
    showToast.fail(error.message || '加入失败')
  } finally {
    joining.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.join-family-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 56px 16px 16px;
}

.join-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
}

.card-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.join-card h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.join-card p {
  color: #999;
  margin: 0 0 32px;
}

.btn-group {
  margin: 24px 0;
}

.tips {
  margin-top: 32px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
  text-align: left;
}

.tips p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}
</style>
