<template>
  <div class="export-page">
    <van-nav-bar
      title="导出数据"
      left-text="返回"
      @click-left="goBack"
    />

    <div class="content">
      <div class="export-card">
        <div class="card-icon">📊</div>
        <h2>导出用药记录</h2>
        <p>将家庭用药记录导出为 Excel 文件</p>

        <div class="export-info">
          <div class="info-item">
            <van-icon name="calendar-o" />
            <span>导出范围：全部记录</span>
          </div>
          <div class="info-item">
            <van-icon name="file-o" />
            <span>文件格式：Excel (.xlsx)</span>
          </div>
          <div class="info-item">
            <van-icon name="shield-o" />
            <span>包含信息：药物详情、使用者、日期、状态等</span>
          </div>
        </div>

        <van-button
          type="primary"
          block
          size="large"
          :loading="exporting"
          @click="handleExport"
        >
          {{ exporting ? '导出中...' : '开始导出' }}
        </van-button>

        <div class="tips">
          <p>💡 提示</p>
          <p>• 导出文件可用于就医时给医生查看</p>
          <p>• 建议定期导出备份家庭用药记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const exporting = ref(false)

const handleExport = async () => {
  try {
    exporting.value = true

    // 获取 Token
    const token = localStorage.getItem('token')

    // 构建下载链接
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    const url = `${baseUrl}/api/export/medications`

    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = `家庭用药记录_${new Date().toISOString().split('T')[0]}.xlsx`

    // 添加 Authorization 头
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        link.href = blobUrl
        link.click()
        URL.revokeObjectURL(blobUrl)
        showToast.success('导出成功')
      })
      .catch(error => {
        console.error('导出失败:', error)
        showToast.fail('导出失败')
      })
  } catch (error) {
    showToast.fail('导出失败')
  } finally {
    exporting.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.export-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 56px 16px 16px;
}

.export-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
}

.card-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.export-card h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.export-card p {
  color: #999;
  margin: 0 0 32px;
}

.export-info {
  text-align: left;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.tips {
  margin-top: 32px;
  padding: 16px;
  background: #fff7e6;
  border-radius: 8px;
  text-align: left;
}

.tips p {
  margin: 0;
  font-size: 13px;
  color: #e67e22;
  line-height: 1.8;
}

.tips p:first-child {
  font-weight: 600;
  margin-bottom: 4px;
}
</style>
