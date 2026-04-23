<template>
  <div class="invite-member-page">
    <van-nav-bar
      title="邀请成员"
      left-text="返回"
      @click-left="goBack"
    />

    <div class="content">
      <div class="invite-card">
        <div class="card-icon">✉️</div>
        <h2>邀请家人加入</h2>
        <p>分享邀请链接或邀请码给家人</p>

        <div class="invite-methods">
          <div class="method-item">
            <h3>方式一：复制链接</h3>
            <p>将邀请链接发送给家人</p>
            <van-button
              type="primary"
              block
              :loading="generating"
              @click="generateAndCopyLink"
            >
              {{ generating ? '生成中...' : '生成邀请链接' }}
            </van-button>
          </div>

          <div class="method-item">
            <h3>方式二：邀请码</h3>
            <p>家人输入邀请码加入</p>
            <van-button
              type="default"
              plain
              block
              :loading="generating"
              @click="generateAndShowCode"
            >
              {{ generating ? '生成中...' : '获取邀请码' }}
            </van-button>
          </div>
        </div>

        <div v-if="inviteData" class="invite-result">
          <van-divider>邀请信息</van-divider>
          <div v-if="inviteResult === 'link'" class="result-item">
            <label>邀请链接</label>
            <div class="result-value">
              {{ inviteData.inviteUrl }}
              <van-button size="small" type="primary" @click="copyLink">
                复制
              </van-button>
            </div>
          </div>
          <div v-else class="result-item">
            <label>邀请码</label>
            <div class="code-display">
              {{ inviteData.inviteCode }}
            </div>
            <van-button size="small" type="primary" @click="copyCode">
              复制邀请码
            </van-button>
          </div>
          <p class="expiry-tip">
            有效期至：{{ formatExpiryDate(inviteData.expiresAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { generateInvite } from '../api/family'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()

const generating = ref(false)
const inviteData = ref(null)
const inviteResult = ref('') // 'link' or 'code'

const generateAndCopyLink = async () => {
  try {
    generating.value = true
    const res = await generateInvite()
    inviteData.value = res
    inviteResult.value = 'link'

    // 自动复制
    navigator.clipboard.writeText(res.inviteUrl)
    showToast.success('邀请链接已复制')
  } catch (error) {
    showToast.fail('生成邀请失败')
  } finally {
    generating.value = false
  }
}

const generateAndShowCode = async () => {
  try {
    generating.value = true
    const res = await generateInvite()
    inviteData.value = res
    inviteResult.value = 'code'
    showToast.success('邀请码已生成')
  } catch (error) {
    showToast.fail('生成邀请失败')
  } finally {
    generating.value = false
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(inviteData.value.inviteUrl)
  showToast.success('已复制邀请链接')
}

const copyCode = () => {
  navigator.clipboard.writeText(inviteData.value.inviteCode)
  showToast.success('已复制邀请码')
}

const formatExpiryDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.invite-member-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 56px 16px 16px;
}

.invite-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.card-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.invite-card h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.invite-card p {
  color: #999;
  margin: 0 0 32px;
}

.invite-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-item {
  text-align: left;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
}

.method-item h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.method-item p {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.invite-result {
  margin-top: 24px;
  text-align: left;
}

.result-item {
  margin-bottom: 16px;
}

.result-item label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.result-value {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 8px;
  font-size: 14px;
  word-break: break-all;
}

.code-display {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 4px;
  padding: 16px;
  background: #f0f0f0;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 12px;
  font-family: 'Courier New', monospace;
}

.expiry-tip {
  margin: 16px 0 0;
  color: #999;
  font-size: 12px;
  text-align: center;
}
</style>
