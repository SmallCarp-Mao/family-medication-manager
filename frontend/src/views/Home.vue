<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="我的家" fixed>
      <template #right>
        <van-icon name="user-o" size="20" @click="goToProfile" />
      </template>
    </van-nav-bar>

    <!-- 药物列表 -->
    <div class="content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <!-- 活跃药物 -->
          <div
            v-for="med in activeMedications"
            :key="med.id"
            class="medication-card"
            :class="{ 'allergy-alert': hasAllergy(med) }"
            @click="goToDetail(med.id)"
          >
            <div class="card-header">
              <div class="med-info">
                <span class="med-name">{{ med.name }}</span>
                <van-tag v-if="hasAllergy(med)" type="danger" size="small">
                  ⚠️ 过敏
                </van-tag>
              </div>
              <van-image
                v-if="med.photo"
                :src="med.photo"
                width="60"
                height="60"
                fit="cover"
                radius="8"
              />
              <div v-else class="med-placeholder">💊</div>
            </div>

            <div class="card-body">
              <div class="info-row">
                <van-icon name="user-o" />
                <span>{{ med.member?.name || '未知' }}</span>
              </div>
              <div class="info-row" v-if="med.dosage">
                <van-icon name="clock-o" />
                <span>{{ med.dosage }}</span>
              </div>
              <div class="info-row" v-if="med.totalQuantity">
                <van-icon name="box-o" />
                <span>总量: {{ med.totalQuantity }}</span>
              </div>
              <div class="info-row expiry" :class="{ 'expired': isExpired(med.expiryDate) }">
                <van-icon name="calendar-o" />
                <span v-if="isExpired(med.expiryDate)">⚠️ 已过期</span>
                <span v-else>过期: {{ formatDate(med.expiryDate) }}</span>
              </div>
            </div>
          </div>

          <!-- 已归档药物 -->
          <div v-if="archivedMedications.length > 0" class="archived-section">
            <div class="section-title">已归档</div>
            <div
              v-for="med in archivedMedications"
              :key="med.id"
              class="medication-card archived"
              @click="goToDetail(med.id)"
            >
              <div class="card-header">
                <span class="med-name">{{ med.name }}</span>
                <van-tag type="default" size="small">已归档</van-tag>
              </div>
              <div class="card-body">
                <div class="info-row">
                  <van-icon name="user-o" />
                  <span>{{ med.member?.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 悬浮添加按钮 -->
    <van-floating-bubble
      axis="xy"
      icon="plus"
      magnetic="x"
      @click="goToAdd"
    />

    <!-- 过期提醒弹窗 -->
    <van-dialog
      v-model:show="showExpiryAlert"
      title="⚠️ 过期药物提醒"
      :show-confirm-button="true"
      confirm-button-text="我知道了"
    >
      <div class="expiry-alert-content">
        <p>以下药物已过期，请及时处理：</p>
        <div
          v-for="med in expiredMedications"
          :key="med.id"
          class="expiry-item"
        >
          <p><strong>{{ med.name }}</strong></p>
          <p class="expiry-date">{{ formatDate(med.expiryDate) }}</p>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicationStore } from '../stores/medication'
import { useUserStore } from '../stores/user'
import { getFamilyMembers } from '../api/family'
import dayjs from 'dayjs'

const router = useRouter()
const medicationStore = useMedicationStore()
const userStore = useUserStore()

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(true)
const showExpiryAlert = ref(false)
const expiredMedications = ref([])
const familyMembers = ref([])

// 活跃药物
const activeMedications = computed(() => {
  return medicationStore.medications.filter(m => m.status === 'ACTIVE')
})

// 已归档药物
const archivedMedications = computed(() => {
  return medicationStore.medications.filter(m => m.status === 'ARCHIVED')
})

// 判断是否过期
const isExpired = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day')
}

// 判断是否有过敏
const hasAllergy = (med) => {
  const member = familyMembers.value.find(m => m.id === med.memberId)
  if (!member || !member.allergies) return false

  return member.allergies.some(allergy => {
    const medName = med.name.toLowerCase()
    const allergyName = (allergy.drug || '').toLowerCase()
    return medName.includes(allergyName) || allergyName.includes(medName)
  })
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 加载数据
const loadData = async () => {
  try {
    await Promise.all([
      medicationStore.fetchMedications(),
      loadFamilyMembers(),
    ])

    // 检查过期药物
    const expired = await medicationStore.fetchExpiredMedications()
    if (expired.length > 0) {
      expiredMedications.value = expired
      showExpiryAlert.value = true
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 加载家庭成员
const loadFamilyMembers = async () => {
  try {
    familyMembers.value = await getFamilyMembers()
  } catch (error) {
    console.error('加载家庭成员失败:', error)
  }
}

// 下拉刷新
const onRefresh = async () => {
  await loadData()
  refreshing.value = false
}

// 上拉加载
const onLoad = () => {
  finished.value = true
}

// 跳转到详情
const goToDetail = (id) => {
  router.push(`/medication/${id}`)
}

// 跳转到添加页面
const goToAdd = () => {
  router.push('/medication/add')
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/profile')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.content {
  padding: 56px 16px 16px;
}

.medication-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.medication-card:active {
  transform: scale(0.98);
}

.medication-card.allergy-alert {
  border-left: 4px solid #E74C3C;
  background: linear-gradient(to right, #fff5f5, white);
}

.medication-card.archived {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.med-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.med-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.med-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  font-size: 32px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.info-row.expiry.expired {
  color: #E74C3C;
  font-weight: 600;
}

.archived-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #999;
  margin-bottom: 12px;
}

.expiry-alert-content {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.expiry-alert-content > p {
  margin: 0 0 12px;
  color: #E74C3C;
}

.expiry-item {
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 8px;
}

.expiry-item p {
  margin: 0;
}

.expiry-date {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
</style>
