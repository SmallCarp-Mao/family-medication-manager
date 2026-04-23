<template>
  <div class="profile-page">
    <van-nav-bar title="我的" />

    <div class="content">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <van-image
          round
          width="64"
          height="64"
          :src="userStore.user?.avatar"
        >
          <template #error>
            <van-icon name="user-o" size="32" />
          </template>
        </van-image>
        <div class="user-info">
          <div class="nickname">{{ userStore.user?.nickname || '未登录' }}</div>
          <van-tag :type="userStore.isAdmin ? 'danger' : 'default'" size="small">
            {{ userStore.isAdmin ? '管理员' : '成员' }}
          </van-tag>
        </div>
      </div>

      <!-- 家庭信息 -->
      <van-cell-group title="家庭" inset>
        <van-cell
          v-if="userStore.hasFamily"
          title="家庭管理"
          is-link
          @click="router.push('/family')"
        >
          <template #icon>
            <van-icon name="home-o" />
          </template>
        </van-cell>
        <van-cell
          v-if="userStore.hasFamily"
          title="家庭成员"
          :value="`${family?.members?.length || 0} 人`"
          is-link
          @click="router.push('/family')"
        >
          <template #icon>
            <van-icon name="friends-o" />
          </template>
        </van-cell>
        <van-cell
          v-else
          title="创建/加入家庭"
          is-link
          @click="router.push('/family')"
        >
          <template #icon>
            <van-icon name="home-o" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 数据管理 -->
      <van-cell-group title="数据" inset>
        <van-cell
          title="导出数据"
          is-link
          @click="router.push('/export')"
        >
          <template #icon>
            <van-icon name="down" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 其他 -->
      <van-cell-group title="其他" inset>
        <van-cell title="关于" is-link @click="showAbout = true">
          <template #icon>
            <van-icon name="info-o" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 退出登录 -->
      <div class="logout-section">
        <van-button
          type="danger"
          plain
          block
          @click="handleLogout"
        >
          退出登录
        </van-button>
      </div>
    </div>

    <!-- 关于弹窗 -->
    <van-dialog
      v-model:show="showAbout"
      title="关于"
      :show-confirm-button="false"
    >
      <div class="about-content">
        <div class="app-icon">💊</div>
        <h3>家庭药物管理</h3>
        <p>守护家人用药安全</p>
        <van-divider />
        <p class="version">版本 1.0.0</p>
        <p class="copyright">© 2024 Family Medication Manager</p>
      </div>
      <div class="about-close">
        <van-button type="primary" block @click="showAbout = false">
          关闭
        </van-button>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { showConfirmDialog, showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const showAbout = ref(false)
const family = ref(null)

const loadData = async () => {
  if (userStore.hasFamily) {
    try {
      family.value = await userStore.fetchFamily()
    } catch (error) {
      console.error('加载家庭信息失败:', error)
    }
  }
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定要退出登录吗？',
    })
    userStore.logout()
    showToast.success('已退出登录')
    router.replace('/login')
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 56px 16px 16px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.logout-section {
  margin-top: 24px;
  padding: 0 16px;
}

.about-content {
  padding: 32px 24px;
  text-align: center;
}

.app-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.about-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.about-content p {
  margin: 4px 0;
  color: #666;
}

.version {
  font-size: 14px;
  color: #999;
}

.copyright {
  font-size: 12px;
  color: #bbb;
}

.about-close {
  padding: 16px;
  border-top: 1px solid #eee;
}
</style>
