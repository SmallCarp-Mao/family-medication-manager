<template>
  <div class="member-detail-page">
    <van-nav-bar
      :title="member?.name"
      left-text="返回"
      @click-left="goBack"
    >
      <template #right>
        <van-icon
          name="edit"
          size="20"
          @click="showEditDialog = true"
        />
      </template>
    </van-nav-bar>

    <div v-if="loading" class="loading">
      <van-loading size="40" color="#4A90E2">加载中...</van-loading>
    </div>

    <div v-else-if="member" class="content">
      <!-- 基本信息 -->
      <van-cell-group title="基本信息" inset>
        <van-cell title="姓名" :value="member.name" />
        <van-cell title="关系" :value="member.relation || '家人'" />
      </van-cell-group>

      <!-- 过敏信息 -->
      <van-cell-group title="⚠️ 过敏信息" inset>
        <div v-if="member.allergies && member.allergies.length > 0">
          <van-cell
            v-for="(allergy, index) in member.allergies"
            :key="index"
            :title="allergy.drug"
            :label="`严重程度: ${allergy.severity || '未知'}`"
          >
            <template #icon>
              <van-icon name="warning-o" color="#E74C3C" />
            </template>
          </van-cell>
        </div>
        <van-cell v-else title="暂无过敏记录" />
      </van-cell-group>

      <!-- 病史 -->
      <van-cell-group title="📋 病史" inset>
        <div v-if="member.medicalHistory && member.medicalHistory.length > 0">
          <van-cell
            v-for="(history, index) in member.medicalHistory"
            :key="index"
            :title="history.condition"
            :label="`诊断时间: ${formatDate(history.diagnosedAt)}`"
          >
            <template #icon>
              <van-icon name="description" />
            </template>
          </van-cell>
        </div>
        <van-cell v-else title="暂无病史记录" />
      </van-cell-group>

      <!-- 关联药物 -->
      <van-cell-group title="💊 关联药物" inset>
        <div v-if="member.medications && member.medications.length > 0">
          <van-cell
            v-for="med in member.medications"
            :key="med.id"
            :title="med.name"
            :label="`${med.dosage || ''} ${med.totalQuantity ? '(' + med.totalQuantity + ')' : ''}`"
            is-link
            @click="goToMedication(med.id)"
          >
            <template #icon>
              <van-icon name="bag" />
            </template>
          </van-cell>
        </div>
        <van-cell v-else title="暂无关联药物" />
      </van-cell-group>
    </div>

    <!-- 编辑弹窗 -->
    <van-popup
      v-model:show="showEditDialog"
      position="bottom"
      :style="{ height: '70%' }"
    >
      <div class="edit-dialog">
        <van-nav-bar
          title="编辑成员信息"
          left-text="取消"
          right-text="保存"
          @click-left="showEditDialog = false"
          @click-right="handleSave"
        />

        <van-form @submit="handleSave">
          <van-cell-group inset>
            <van-field
              v-model="editForm.name"
              label="姓名"
              placeholder="请输入姓名"
              :rules="[{ required: true, message: '请输入姓名' }]"
            />
            <van-field
              v-model="editForm.relation"
              label="关系"
              placeholder="如：爸爸、妈妈、本人"
            />
          </van-cell-group>

          <van-cell-group title="过敏信息" inset>
            <div
              v-for="(allergy, index) in editForm.allergies"
              :key="index"
              class="allergy-item"
            >
              <van-field
                v-model="allergy.drug"
                label="过敏药物"
                placeholder="如：青霉素"
              />
              <van-field
                v-model="allergy.severity"
                label="严重程度"
                placeholder="如：严重、轻微"
              />
              <van-button
                size="small"
                type="danger"
                plain
                @click="removeAllergy(index)"
              >
                删除
              </van-button>
            </div>
            <van-button
              type="default"
              size="small"
              icon="plus"
              @click="addAllergy"
            >
              添加过敏信息
            </van-button>
          </van-cell-group>

          <van-cell-group title="病史" inset>
            <div
              v-for="(history, index) in editForm.medicalHistory"
              :key="index"
              class="history-item"
            >
              <van-field
                v-model="history.condition"
                label="疾病/症状"
                placeholder="如：高血压"
              />
              <van-field
                v-model="history.diagnosedAt"
                label="诊断时间"
                type="date"
              />
              <van-button
                size="small"
                type="danger"
                plain
                @click="removeHistory(index)"
              >
                删除
              </van-button>
            </div>
            <van-button
              type="default"
              size="small"
              icon="plus"
              @click="addHistory"
            >
              添加病史
            </van-button>
          </van-cell-group>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getMemberDetail, updateMember } from '../api/family'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const member = ref(null)
const showEditDialog = ref(false)

const editForm = reactive({
  name: '',
  relation: '',
  allergies: [],
  medicalHistory: [],
})

const loadData = async () => {
  try {
    loading.value = true
    const id = parseInt(route.params.id)
    member.value = await getMemberDetail(id)
  } catch (error) {
    showToast.fail('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const initEditForm = () => {
  editForm.name = member.value.name
  editForm.relation = member.value.relation || ''
  editForm.allergies = member.value.allergies
    ? [...member.value.allergies]
    : []
  editForm.medicalHistory = member.value.medicalHistory
    ? [...member.value.medicalHistory]
    : []
}

const addAllergy = () => {
  editForm.allergies.push({ drug: '', severity: '' })
}

const removeAllergy = (index) => {
  editForm.allergies.splice(index, 1)
}

const addHistory = () => {
  editForm.medicalHistory.push({
    condition: '',
    diagnosedAt: dayjs().format('YYYY-MM-DD'),
  })
}

const removeHistory = (index) => {
  editForm.medicalHistory.splice(index, 1)
}

const handleSave = async () => {
  try {
    await updateMember(member.value.id, {
      name: editForm.name,
      relation: editForm.relation,
      allergies: editForm.allergies.filter(a => a.drug),
      medicalHistory: editForm.medicalHistory.filter(h => h.condition),
    })
    showToast.success('保存成功')
    showEditDialog.value = false
    await loadData()
  } catch (error) {
    showToast.fail('保存失败')
  }
}

const goToMedication = (id) => {
  router.push(`/medication/${id}`)
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await loadData()
  initEditForm()
})
</script>

<style scoped>
.member-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
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

.allergy-item,
.history-item {
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 8px;
}

.allergy-item .van-button,
.history-item .van-button {
  margin-top: 8px;
}

.edit-dialog {
  height: 100%;
  overflow-y: auto;
}
</style>
