import { defineStore } from 'pinia'
import { UserProfile } from '../../types/app-types'

export const useUserProfileStore = defineStore('userProfile', {
  state: () => ({
    profile: null as UserProfile | null,
  }),
  getters: {
    isLoggedIn: (state) => state.profile !== null,
    isPaidUser: (state) => state.profile?.subscriptionType === 'paid',
    canUseXlsx: (state) => state.profile?.subscriptionType === 'paid',
  },
  actions: {
    setProfile(profile: UserProfile) {
      this.profile = profile
    },
    clearProfile() {
      this.profile = null
    },
    updateSubscription(type: 'free' | 'paid') {
      if (this.profile) {
        this.profile.subscriptionType = type
      }
    },
    // Add this new action
    setupDummyProfile(isPaid: boolean = false) {
      this.profile = {
        id: 'dummy-id',
        name: isPaid ? 'Paid User' : 'Free User',
        email: isPaid ? 'paid@example.com' : 'free@example.com',
        subscriptionType: isPaid ? 'paid' : 'free',
      }
    },
  },
})