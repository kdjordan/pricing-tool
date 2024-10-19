import { defineStore } from 'pinia'

export const useSharedDBstate = defineStore('sharedStore', {
  state: () => ({
    reportsGenerated: false,
  }),
})