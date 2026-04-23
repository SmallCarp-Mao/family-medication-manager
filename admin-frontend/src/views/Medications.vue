<template>
  <div class="medications-page">
    <h2>药物管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="keyword"
            placeholder="搜索药物名称"
            clearable
            @clear="loadMedications"
          >
            <template #append>
              <el-button :icon="Search" @click="loadMedications" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="status" placeholder="选择状态" clearable @change="loadMedications">
            <el-option label="使用中" value="ACTIVE" />
            <el-option label="已归档" value="ARCHIVED" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 药物列表 -->
    <el-card class="table-card">
      <el-table :data="medications" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="药物名称" width="150" />
        <el-table-column label="所属家庭" width="150">
          <template #default="{ row }">
            {{ row.family?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="使用成员" width="120">
          <template #default="{ row }">
            {{ row.member?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="dosage" label="用法用量" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '使用中' : '已归档' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" label="过期日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.expiryDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadMedications"
          @current-change="loadMedications"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getMedications } from '../api/admin'
import dayjs from 'dayjs'

const loading = ref(false)
const medications = ref([])
const keyword = ref('')
const status = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const loadMedications = async () => {
  loading.value = true
  try {
    const data = await getMedications({
      page: page.value,
      limit: pageSize.value,
      keyword: keyword.value,
      status: status.value
    })
    medications.value = data.medications
    total.value = data.total
  } catch (error) {
    console.error('获取药物列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  loadMedications()
})
</script>

<style scoped>
.medications-page h2 {
  margin-bottom: 20px;
  color: #333;
}

.search-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
