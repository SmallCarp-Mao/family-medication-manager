import { defineStore } from 'pinia'
import {
  getMedications,
  addMedication,
  updateMedication,
  archiveMedication,
  deleteMedication,
  getExpiredMedications,
  checkAllergy,
} from '../api/medication'

export const useMedicationStore = defineStore('medication', {
  state: () => ({
    medications: [],
    expiredMedications: [],
    loading: false,
  }),

  actions: {
    /**
     * 获取药物列表
     */
    async fetchMedications(params) {
      this.loading = true
      try {
        const res = await getMedications(params)
        this.medications = res
        return res
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取过期药物
     */
    async fetchExpiredMedications() {
      try {
        const res = await getExpiredMedications()
        this.expiredMedications = res
        return res
      } catch (error) {
        console.error('获取过期药物失败:', error)
        return []
      }
    },

    /**
     * 添加药物
     */
    async addMedication(data) {
      const res = await addMedication(data)
      this.medications.unshift(res)
      return res
    },

    /**
     * 更新药物
     */
    async updateMedication(id, data) {
      const res = await updateMedication(id, data)
      const index = this.medications.findIndex(m => m.id === id)
      if (index !== -1) {
        this.medications[index] = res
      }
      return res
    },

    /**
     * 归档药物
     */
    async archiveMedication(id) {
      const res = await archiveMedication(id)
      const index = this.medications.findIndex(m => m.id === id)
      if (index !== -1) {
        this.medications[index] = res
      }
      return res
    },

    /**
     * 删除药物
     */
    async deleteMedication(id) {
      await deleteMedication(id)
      this.medications = this.medications.filter(m => m.id !== id)
    },

    /**
     * 检查过敏
     */
    async checkAllergy(drugName) {
      const res = await checkAllergy(drugName)
      return res
    },
  },
})
