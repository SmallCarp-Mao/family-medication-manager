<template>
  <div class="families-page">
    <h2>家庭管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-input
        v-model="keyword"
        placeholder="搜索家庭名称或邀请码"
        clearable
        @clear="loadFamilies"
        style="width: 300px"
      >
        <template #append>
          <el-button :icon="Search" @click="loadFamilies" />
        </template>
      </el-input>
    </el-card>

    <!-- 家庭列表 -->
    <el-card class="table-card">
      <el-table :data="families" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="家庭名称" width="200" />
        <el-table-column prop="inviteCode" label="邀请码" width="120" />
        <el-table-column label="成员统计">
          <template #default="{ row }">
            用户: {{ row._count?.users || 0 }} |
            成员: {{ row._count?.members || 0 }} |
            药物: {{ row._count?.medications || 0 }}
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
          @size-change="loadFamilies"
          @current-change="loadFamilies"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getFamilies } from '../api/admin'
import dayjs from 'dayjs'

const loading = ref(false)
const families = ref([])
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const loadFamilies = async () => {
  loading.value = true
  try {
    const data = await getFamilies({
      page: page.value,
      limit: pageSize.value,
      keyword: keyword.value
    })
    families.value = data.families
    total.value = data.total
  } catch (error) {
    console.error('获取家庭列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadFamilies()
})
</script>

<style scoped>
.families-page h2 {
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
