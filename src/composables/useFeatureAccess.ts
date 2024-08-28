import { computed } from 'vue'
import { useUserProfileStore } from '../stores/userProfileStore'
import { Feature } from '../../types/app-types'

export function useFeatureAccess() {
  const userProfileStore = useUserProfileStore()

  const canUseXlsx = computed(() => userProfileStore.canUseFeature(Feature.XLSX_SUPPORT))
  const canUseAdvancedAnalytics = computed(() => userProfileStore.canUseFeature(Feature.ADVANCED_ANALYTICS))
  const canUseBulkProcessing = computed(() => userProfileStore.canUseFeature(Feature.BULK_PROCESSING))

  return {
    canUseXlsx,
    canUseAdvancedAnalytics,
    canUseBulkProcessing,
  }
}