<template>
  <div class="dashboard">
    <h2>数据概览</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409eff">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.users || 0 }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67c23a">
              <el-icon :size="30"><House /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.families || 0 }}</div>
              <div class="stat-label">家庭总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #e6a23c">
              <el-icon :size="30"><FirstAidKit /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.medications || 0 }}</div>
              <div class="stat-label">药物总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #f56c6c">
              <el-icon :size="30"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.expiredMedications || 0 }}</div>
              <div class="stat-label">过期药物</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计 -->
    <el-row :gutter="20" class="detail-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>详细信息</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="家庭成员总数">
              {{ stats.members || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="管理员数量">
              {{ stats.admins || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="最近7天新增用户">
              {{ stats.newUsers || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/users')">
              查看用户
            </el-button>
            <el-button type="success" @click="$router.push('/families')">
              查看家庭
            </el-button>
            <el-button type="warning" @click="$router.push('/medications')">
              查看药物
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats } from '../api/admin'

const stats = ref({
  users: 0,
  families: 0,
  members: 0,
  medications: 0,
  expiredMedications: 0,
  admins: 0,
  newUsers: 0
})

const loadStats = async () => {
  try {
    const data = await getStats()
    stats.value = data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard h2 {
  margin-bottom: 20px;
  color: #333;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.detail-row {
  margin-top: 20px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-actions .el-button {
  width: 100%;
}
</style>
