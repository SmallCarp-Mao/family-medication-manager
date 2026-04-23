<template>
  <div class="admins-page">
    <h2>管理员管理</h2>

    <!-- 操作栏 -->
    <el-card class="action-card">
      <el-button type="primary" :icon="Plus" @click="showCreateDialog">
        添加管理员
      </el-button>
    </el-card>

    <!-- 管理员列表 -->
    <el-card class="table-card">
      <el-table :data="admins" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'SUPER_ADMIN' ? 'danger' : 'warning'">
              {{ row.role === 'SUPER_ADMIN' ? '超级管理员' : '管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleStatusChange(row)"
              :disabled="row.role === 'SUPER_ADMIN'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLogin ? formatDate(row.lastLogin) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加管理员"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="超级管理员" value="SUPER_ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAdmins, createAdmin, updateAdminStatus } from '../api/admin'
import dayjs from 'dayjs'

const loading = ref(false)
const admins = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = ref({
  email: '',
  name: '',
  password: '',
  role: 'ADMIN'
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const loadAdmins = async () => {
  loading.value = true
  try {
    const data = await getAdmins()
    admins.value = data.admins
  } catch (error) {
    console.error('获取管理员列表失败:', error)
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  form.value = {
    email: '',
    name: '',
    password: '',
    role: 'ADMIN'
  }
  dialogVisible.value = true
}

const handleCreate = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await createAdmin(form.value)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    loadAdmins()
  } catch (error) {
    ElMessage.error(error.error || '添加失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updateAdminStatus(row.id, row.isActive)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.isActive = !row.isActive
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadAdmins()
})
</script>

<style scoped>
.admins-page h2 {
  margin-bottom: 20px;
  color: #333;
}

.action-card {
  margin-bottom: 20px;
}
</style>
