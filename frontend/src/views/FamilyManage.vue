<template>
  <div class="family-manage-page">
    <van-nav-bar
      title="家庭管理"
      left-text="返回"
      @click-left="goBack"
    />

    <div v-if="!userStore.hasFamily" class="no-family">
      <div class="empty-icon">🏠</div>
      <p>您还没有加入任何家庭</p>
      <van-button type="primary" @click="showCreateFamily = true">
        创建家庭
      </van-button>
      <van-button type="default" plain @click="goToJoin">
        加入家庭
      </van-button>
    </div>

    <div v-else class="content">
      <!-- 家庭信息 -->
      <van-cell-group title="家庭信息" inset>
        <van-cell title="家庭名称" :value="family?.name" />
        <van-cell title="邀请码" :value="family?.inviteCode" />
        <van-cell>
          <template #title>
            <van-button
              type="primary"
              size="small"
              icon="share-o"
              @click="handleInvite"
            >
              邀请成员
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 成员列表 -->
      <van-cell-group title="家庭成员" inset>
        <van-cell
          v-for="member in members"
          :key="member.id"
          :title="member.name"
          :label="member.relation || '家人'"
          is-link
          @click="goToMember(member.id)"
        >
          <template #icon>
            <van-icon name="user-o" style="margin-right: 8px;" />
          </template>
          <template #right-icon>
            <van-icon
              v-if="isAdmin"
              name="delete-o"
              color="#E74C3C"
              @click.stop="handleDeleteMember(member)"
            />
          </template>
        </van-cell>

        <van-cell>
          <template #title>
            <van-button
              type="default"
              size="small"
              icon="plus"
              @click="handleAddMember"
            >
              添加成员
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 创建家庭弹窗 -->
    <van-dialog
      v-model:show="showCreateFamily"
      title="创建家庭"
      show-cancel-button
      @confirm="handleCreateFamily"
    >
      <van-field
        v-model="familyName"
        label="家庭名称"
        placeholder="请输入家庭名称"
        style="padding: 16px;"
      />
    </van-dialog>

    <!-- 邀请弹窗 -->
    <van-dialog
      v-model:show="showInviteDialog"
      title="邀请成员"
      :show-confirm-button="false"
    >
      <div class="invite-content">
        <p>分享邀请链接给家人：</p>
        <van-field
          v-model="inviteUrl"
          readonly
          is-link
          @click="copyInviteUrl"
        >
          <template #button>
            <van-button size="small" type="primary" @click="copyInviteUrl">
              复制
            </van-button>
          </template>
        </van-field>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { createFamily, generateInvite, getFamilyMembers, deleteMember as deleteMemberApi } from '../api/family'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const family = ref(null)
const members = ref([])
const showCreateFamily = ref(false)
const showInviteDialog = ref(false)
const familyName = ref('')
const inviteUrl = ref('')

const isAdmin = userStore.isAdmin

const loadData = async () => {
  try {
    if (userStore.hasFamily) {
      await Promise.all([loadFamily(), loadMembers()])
    }
  } catch (error) {
    showToast.fail('加载失败')
  }
}

const loadFamily = async () => {
  family.value = await userStore.fetchFamily()
}

const loadMembers = async () => {
  members.value = await getFamilyMembers()
}

const handleCreateFamily = async () => {
  if (!familyName.value.trim()) {
    showToast('请输入家庭名称')
    return
  }

  try {
    await createFamily(familyName.value)
    showToast.success('创建成功')
    showCreateFamily.value = false
    await userStore.fetchUser()
    await loadData()
  } catch (error) {
    showToast.fail('创建失败')
  }
}

const handleInvite = async () => {
  try {
    const res = await generateInvite()
    inviteUrl.value = res.inviteUrl
    showInviteDialog.value = true
  } catch (error) {
    showToast.fail('生成邀请失败')
  }
}

const copyInviteUrl = () => {
  navigator.clipboard.writeText(inviteUrl.value)
  showToast.success('已复制邀请链接')
}

const handleAddMember = () => {
  router.push('/family/invite')
}

const handleDeleteMember = async (member) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除成员 ${member.name} 吗？`,
    })

    await deleteMemberApi(member.id)
    showToast.success('已删除')
    await loadMembers()
  } catch (error) {
    if (error !== 'cancel') {
      showToast.fail('删除失败')
    }
  }
}

const goToMember = (id) => {
  router.push(`/member/${id}`)
}

const goToJoin = () => {
  router.push('/join')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.family-manage-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding: 56px 16px 16px;
}

.no-family {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 16px;
}

.empty-icon {
  font-size: 80px;
  opacity: 0.5;
}

.no-family p {
  color: #999;
  margin: 0;
}

.invite-content {
  padding: 16px;
}

.invite-content p {
  margin: 0 0 12px;
  color: #666;
}
</style>
