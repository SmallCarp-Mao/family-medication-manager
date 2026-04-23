<template>
  <div class="medication-detail-page">
    <van-nav-bar
      title="药物详情"
      left-text="返回"
      @click-left="goBack"
    >
      <template #right>
        <van-icon
          v-if="isAdmin"
          name="edit"
          size="20"
          @click="goToEdit"
        />
      </template>
    </van-nav-bar>

    <div v-if="loading" class="loading">
      <van-loading size="40" color="#4A90E2">加载中...</van-loading>
    </div>

    <div v-else-if="medication" class="content">
      <!-- 药物照片 -->
      <div class="photo-section">
        <van-image
          v-if="medication.photo"
          :src="medication.photo"
          fit="cover"
          width="100%"
          height="200"
        />
        <div v-else class="photo-placeholder">
          <div class="placeholder-icon">💊</div>
        </div>
      </div>

      <!-- 基本信息 -->
      <van-cell-group title="基本信息" inset>
        <van-cell title="药物名称" :value="medication.name" />
        <van-cell title="使用者" :value="medication.member?.name" />
        <van-cell
          v-if="medication.dosage"
          title="用法用量"
          :value="medication.dosage"
        />
        <van-cell
          v-if="medication.totalQuantity"
          title="药物总量"
          :value="medication.totalQuantity"
        />
      </van-cell-group>

      <!-- 日期信息 -->
      <van-cell-group title="日期信息" inset>
        <van-cell
          v-if="medication.startDate"
          title="开始用药日期"
          :value="formatDate(medication.startDate)"
        />
        <van-cell
          v-if="medication.endDate"
          title="预计吃完日期"
          :value="formatDate(medication.endDate)"
        />
        <van-cell
          title="过期日期"
          :value="formatDate(medication.expiryDate)"
          :class="{ 'expired': isExpired }"
        />
      </van-cell-group>

      <!-- 过敏信息 -->
      <van-cell-group
        v-if="allergyInfo"
        title="⚠️ 过敏信息"
        inset
      >
        <van-notice-bar type="danger" left-icon="warning-o">
          {{ allergyInfo }}
        </van-notice-bar>
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group
        v-if="medication.notes"
        title="备注"
        inset
      >
        <van-cell>
          <template #value>
            <div class="notes">{{ medication.notes }}</div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 状态信息 -->
      <van-cell-group title="状态信息" inset>
        <van-cell title="状态">
          <template #value>
            <van-tag :type="medication.status === 'ACTIVE' ? 'success' : 'default'">
              {{ medication.status === 'ACTIVE' ? '使用中' : '已归档' }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell
          title="添加时间"
          :value="formatDateTime(medication.createdAt)"
        />
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="actions">
        <van-button
          v-if="medication.status === 'ACTIVE'"
          type="primary"
          block
          @click="handleArchive"
        >
          标记为已吃完/停用
        </van-button>
        <van-button
          v-if="isAdmin"
          type="danger"
          plain
          block
          @click="handleDelete"
        >
          删除药物
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMedicationStore } from '../stores/medication'
import { useUserStore } from '../stores/user'
import { getFamilyMembers } from '../api/family'
import { showConfirmDialog, showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const medicationStore = useMedicationStore()
const userStore = useUserStore()

const loading = ref(true)
const medication = ref(null)
const familyMembers = ref([])

const isAdmin = computed(() => userStore.isAdmin)

const isExpired = computed(() => {
  if (!medication.value) return false
  return dayjs(medication.value.expiryDate).isBefore(dayjs(), 'day')
})

const allergyInfo = computed(() => {
  if (!medication.value || !familyMembers.value.length) return null

  const member = familyMembers.value.find(m => m.id === medication.value.memberId)
  if (!member || !member.allergies) return null

  const allergies = member.allergies.filter(allergy => {
    const medName = medication.value.name.toLowerCase()
    const allergyName = (allergy.drug || '').toLowerCase()
    return medName.includes(allergyName) || allergyName.includes(medName)
  })

  if (allergies.length === 0) return null

  return `${member.name} 对此药物过敏：${allergies.map(a => `${a.drug}(${a.severity})`).join('、')}`
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const loadData = async () => {
  try {
    loading.value = true
    const id = parseInt(route.params.id)

    // 加载药物详情
    const medications = await medicationStore.fetchMedications()
    medication.value = medications.find(m => m.id === id)

    if (!medication.value) {
      showToast.fail('药物不存在')
      router.back()
      return
    }

    // 加载家庭成员（用于检查过敏）
    familyMembers.value = await getFamilyMembers()
  } catch (error) {
    showToast.fail('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const handleArchive = async () => {
  try {
    await showConfirmDialog({
      title: '确认归档',
      message: '确定要将此药物标记为已吃完/停用吗？',
    })

    await medicationStore.archiveMedication(medication.value.id)
    showToast.success('已归档')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      showToast.fail('操作失败')
    }
  }
}

const handleDelete = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除此药物吗？此操作不可恢复！',
    })

    await medicationStore.deleteMedication(medication.value.id)
    showToast.success('已删除')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      showToast.fail('删除失败')
    }
  }
}

const goBack = () => {
  router.back()
}

const goToEdit = () => {
  router.push(`/medication/${medication.value.id}/edit`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.medication-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.content {
  padding: 56px 16px 16px;
}

.photo-section {
  margin-bottom: 16px;
}

.photo-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.placeholder-icon {
  font-size: 64px;
  opacity: 0.3;
}

.expired {
  color: #E74C3C !important;
}

.notes {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #666;
}

.actions {
  margin-top: 24px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
