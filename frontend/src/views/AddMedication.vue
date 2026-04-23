<template>
  <div class="add-medication-page">
    <van-nav-bar
      :title="isEdit ? '编辑药物' : '添加药物'"
      left-text="返回"
      @click-left="goBack"
    />

    <van-form @submit="handleSubmit">
      <!-- 药物照片 -->
      <van-cell-group title="药物照片" inset>
        <div class="photo-section">
          <div v-if="formData.photo" class="photo-preview">
            <van-image :src="formData.photo" fit="cover" />
            <van-icon
              name="cross"
              class="delete-icon"
              @click="removePhoto"
            />
          </div>
          <van-uploader
            v-else
            :after-read="onPhotoRead"
            :max-size="5 * 1024 * 1024"
            @oversize="onPhotoOversize"
          >
            <div class="upload-placeholder">
              <van-icon name="photograph" size="40" color="#999" />
              <p>点击上传照片</p>
            </div>
          </van-uploader>
        </div>
      </van-cell-group>

      <!-- 添加方式 -->
      <van-cell-group title="添加方式" inset>
        <div class="add-method">
          <van-button
            type="primary"
            plain
            icon="scan"
            @click="showScanner = true"
          >
            📷 扫码添加
          </van-button>
          <van-button
            type="default"
            plain
            icon="edit"
            @click="focusNameInput"
          >
            📝 手动添加
          </van-button>
        </div>
      </van-cell-group>

      <!-- 基本信息 -->
      <van-cell-group title="基本信息" inset>
        <van-field
          ref="nameInputRef"
          v-model="formData.name"
          name="name"
          label="药物名称"
          placeholder="请输入药物名称"
          :rules="[{ required: true, message: '请输入药物名称' }]"
          @blur="checkAllergy"
        />

        <van-field
          v-model="formData.memberName"
          readonly
          clickable
          name="member"
          label="使用者"
          placeholder="请选择使用者"
          :rules="[{ required: true, message: '请选择使用者' }]"
          @click="showMemberPicker = true"
        >
          <template #button>
            <van-icon name="arrow-down" />
          </template>
        </van-field>

        <van-field
          v-model="formData.dosage"
          name="dosage"
          label="用法用量"
          placeholder="如：每日 3 次，每次 1 片"
        />

        <van-field
          v-model="formData.totalQuantity"
          name="totalQuantity"
          label="药物总量"
          placeholder="如：30 片"
        />
      </van-cell-group>

      <!-- 日期信息 -->
      <van-cell-group title="日期信息" inset>
        <van-field
          v-model="formData.startDate"
          readonly
          clickable
          name="startDate"
          label="开始用药日期"
          placeholder="请选择"
          @click="showStartDatePicker = true"
        />

        <van-field
          v-model="formData.endDate"
          readonly
          clickable
          name="endDate"
          label="预计吃完日期"
          placeholder="请选择"
          @click="showEndDatePicker = true"
        />

        <van-field
          v-model="formData.expiryDate"
          readonly
          clickable
          name="expiryDate"
          label="过期日期"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择过期日期' }]"
          @click="showExpiryDatePicker = true"
        />
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group title="备注" inset>
        <van-field
          v-model="formData.notes"
          type="textarea"
          rows="3"
          name="notes"
          label="备注"
          placeholder="请输入备注信息"
        />
      </van-cell-group>

      <!-- 过敏警告 -->
      <van-notice-bar
        v-if="allergyWarning"
        type="danger"
        left-icon="warning-o"
      >
        {{ allergyWarning }}
      </van-notice-bar>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <van-button round block type="primary" native-type="submit">
          {{ isEdit ? '保存修改' : '添加药物' }}
        </van-button>
      </div>
    </van-form>

    <!-- 使用者选择器 -->
    <van-popup v-model:show="showMemberPicker" position="bottom">
      <van-picker
        :columns="memberColumns"
        @confirm="onMemberConfirm"
        @cancel="showMemberPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showStartDatePicker" position="bottom">
      <van-datetime-picker
        v-model="startDateValue"
        type="date"
        title="选择开始用药日期"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndDatePicker" position="bottom">
      <van-datetime-picker
        v-model="endDateValue"
        type="date"
        title="选择预计吃完日期"
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showExpiryDatePicker" position="bottom">
      <van-datetime-picker
        v-model="expiryDateValue"
        type="date"
        title="选择过期日期"
        @confirm="onExpiryDateConfirm"
        @cancel="showExpiryDatePicker = false"
      />
    </van-popup>

    <!-- 扫码器 -->
    <van-popup v-model:show="showScanner" position="bottom" :style="{ height: '80%' }">
      <div class="scanner-container">
        <div class="scanner-header">
          <van-button type="default" size="small" @click="showScanner = false">
            取消
          </van-button>
          <span>扫描药品条形码</span>
          <van-button type="primary" size="small" @click="showScanner = false">
            完成
          </van-button>
        </div>
        <div id="qr-reader" style="width: 100%; height: 100%;"></div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMedicationStore } from '../stores/medication'
import { getFamilyMembers } from '../api/family'
import { uploadImage } from '../api/upload'
import { checkAllergy as checkAllergyApi } from '../api/medication'
import { showToast, showLoadingToast, closeToast } from 'vant'
import dayjs from 'dayjs'
import { Html5Qrcode } from 'html5-qrcode'

const router = useRouter()
const route = useRoute()
const medicationStore = useMedicationStore()

const isEdit = computed(() => !!route.params.id)
const medicationId = computed(() => route.params.id)

// 表单数据
const formData = ref({
  name: '',
  memberId: null,
  memberName: '',
  photo: '',
  dosage: '',
  totalQuantity: '',
  startDate: '',
  endDate: '',
  expiryDate: '',
  notes: '',
})

// 日期选择器值
const startDateValue = ref(new Date())
const endDateValue = ref(new Date())
const expiryDateValue = ref(new Date())

// 弹窗显示
const showMemberPicker = ref(false)
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showExpiryDatePicker = ref(false)
const showScanner = ref(false)

// 成员列表
const memberColumns = ref([])
const familyMembers = ref([])

// 过敏警告
const allergyWarning = ref('')

// 名称输入框引用
const nameInputRef = ref(null)

// 扫码器实例
let html5QrCode = null

// 加载家庭成员
const loadMembers = async () => {
  try {
    const members = await getFamilyMembers()
    familyMembers.value = members
    memberColumns.value = members.map(m => ({
      text: m.name,
      value: m.id,
    }))
  } catch (error) {
    showToast.fail('加载家庭成员失败')
  }
}

// 选择使用者
const onMemberConfirm = ({ selectedOptions }) => {
  const member = selectedOptions[0]
  formData.value.memberId = member.value
  formData.value.memberName = member.text
  showMemberPicker.value = false
}

// 日期确认
const onStartDateConfirm = () => {
  formData.value.startDate = dayjs(startDateValue.value).format('YYYY-MM-DD')
  showStartDatePicker.value = false
}

const onEndDateConfirm = () => {
  formData.value.endDate = dayjs(endDateValue.value).format('YYYY-MM-DD')
  showEndDatePicker.value = false
}

const onExpiryDateConfirm = () => {
  formData.value.expiryDate = dayjs(expiryDateValue.value).format('YYYY-MM-DD')
  showExpiryDatePicker.value = false
}

// 上传照片
const onPhotoRead = async (file) => {
  showLoadingToast({
    message: '上传中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const res = await uploadImage(file.file)
    formData.value.photo = res.url
    closeToast()
    showToast.success('上传成功')
  } catch (error) {
    closeToast()
    showToast.fail('上传失败')
  }
}

const onPhotoOversize = () => {
  showToast.fail('图片大小不能超过 5MB')
}

const removePhoto = () => {
  formData.value.photo = ''
}

// 检查过敏
const checkAllergy = async () => {
  if (!formData.value.name) return

  try {
    const res = await checkAllergyApi(formData.value.name)
    if (res.hasAllergy) {
      const names = res.allergicMembers.map(m => m.memberName).join('、')
      allergyWarning.value = `⚠️ 检测到 ${names} 对此药物过敏！`
    } else {
      allergyWarning.value = ''
    }
  } catch (error) {
    console.error('检查过敏失败:', error)
  }
}

// 聚焦名称输入框
const focusNameInput = () => {
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

// 初始化扫码器
const initScanner = async () => {
  await nextTick()
  const element = document.getElementById('qr-reader')
  if (!element) return

  try {
    html5QrCode = new Html5Qrcode('qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        // 扫码成功
        formData.value.name = decodedText
        showScanner.value = false
        html5QrCode.stop()
        checkAllergy()
      }
    )
  } catch (error) {
    console.error('初始化扫码器失败:', error)
    showToast.fail('无法启动相机')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    showLoadingToast({
      message: isEdit.value ? '保存中...' : '添加中...',
      forbidClick: true,
      duration: 0,
    })

    const data = {
      ...formData.value,
      memberId: formData.value.memberId,
    }

    if (isEdit.value) {
      await medicationStore.updateMedication(medicationId.value, data)
      showToast.success('保存成功')
    } else {
      await medicationStore.addMedication(data)
      showToast.success('添加成功')
    }

    closeToast()
    router.back()
  } catch (error) {
    closeToast()
    showToast.fail(isEdit.value ? '保存失败' : '添加失败')
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 加载药物详情（编辑模式）
const loadMedication = async () => {
  if (!isEdit.value) return

  try {
    const med = await medicationStore.fetchMedications()
    const medication = med.find(m => m.id === parseInt(medicationId.value))

    if (medication) {
      formData.value = {
        name: medication.name,
        memberId: medication.memberId,
        memberName: medication.member?.name || '',
        photo: medication.photo || '',
        dosage: medication.dosage || '',
        totalQuantity: medication.totalQuantity || '',
        startDate: medication.startDate ? dayjs(medication.startDate).format('YYYY-MM-DD') : '',
        endDate: medication.endDate ? dayjs(medication.endDate).format('YYYY-MM-DD') : '',
        expiryDate: dayjs(medication.expiryDate).format('YYYY-MM-DD'),
        notes: medication.notes || '',
      }
    }
  } catch (error) {
    showToast.fail('加载药物信息失败')
  }
}

onMounted(async () => {
  await loadMembers()
  await loadMedication()
})

onUnmounted(() => {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {})
  }
})
</script>

<style scoped>
.add-medication-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.photo-section {
  padding: 16px;
}

.photo-preview {
  position: relative;
  width: 120px;
  height: 120px;
}

.photo-preview :deep(.van-image) {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.delete-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #999;
}

.upload-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.upload-placeholder p {
  margin: 8px 0 0;
  font-size: 12px;
  color: #999;
}

.add-method {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.submit-section {
  padding: 24px 16px;
}

.scanner-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #eee;
}

.scanner-header span {
  font-weight: 600;
}
</style>
