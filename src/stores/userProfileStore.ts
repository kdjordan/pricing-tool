import { defineStore } from 'pinia'
import { UserProfile, Feature, FeatureFlags } from '../../types/app-types'


export const useUserProfileStore = defineStore('userProfile', {
  state: () => ({
    profile: null as (UserProfile & { features: FeatureFlags }) | null,
  }),
  getters: {
    isLoggedIn: (state) => state.profile !== null,
    isPaidUser: (state) => state.profile?.subscriptionType === 'paid',
    canUseFeature: (state) => (feature: Feature) => state.profile?.features[feature] || false,
  },
  actions: {
    setProfile(profile: UserProfile, features: FeatureFlags) {
      this.profile = { ...profile, features }
    },
    clearProfile() {
      this.profile = null
    },
    updateSubscription(type: 'free' | 'paid') {
      if (this.profile) {
        this.profile.subscriptionType = type
        // Update features based on new subscription type
        this.updateFeatures(type)
      }
    },
    updateFeatures(subscriptionType: 'free' | 'paid') {
      if (this.profile) {
        this.profile.features = {
          [Feature.XLSX_SUPPORT]: subscriptionType === 'paid',
          [Feature.ADVANCED_ANALYTICS]: subscriptionType === 'paid',
          [Feature.BULK_PROCESSING]: subscriptionType === 'paid',
          // Set more features based on subscription type
        }
      }
    },
    setupDummyProfile(isPaid: boolean = false) {
      const subscriptionType = isPaid ? 'paid' : 'free'
      this.setProfile(
        {
          id: 'dummy-id',
          name: isPaid ? 'Paid User' : 'Free User',
          email: isPaid ? 'paid@example.com' : 'free@example.com',
          subscriptionType,
        },
        {
          [Feature.XLSX_SUPPORT]: isPaid,
          [Feature.ADVANCED_ANALYTICS]: isPaid,
          [Feature.BULK_PROCESSING]: isPaid,
          // Set more features based on isPaid
        }
      )
    },
  },
})