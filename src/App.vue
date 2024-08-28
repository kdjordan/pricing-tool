<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-foreground tracking-wider">
    <TheHeader class="w-full z-10" />
    <div class="flex flex-grow overflow-hidden">
      <SideNav class="z-20" />
      <div class="flex flex-col flex-grow">
        <main class="flex-grow p-4 overflow-auto ml-[200px]">
          <router-view />
        </main>
        <TheFooter class="ml-[200px]"/>
      </div>
    </div>
    <span class="ml-[300px]">{{ userProfileInfo }}</span> 
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue';
import SideNav from './components/SideNav.vue';
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import { initAppWithSampleData } from './utils/initApp';
import { deleteAllDbsApi } from './API/api'; // Import the existing function
import { useDBstate } from '@/stores/dbStore'; // Import the store
import { DBName } from '../types/app-types';
import { useUserProfileStore } from './stores/userProfileStore';

const DBstore = useDBstate(); // Get the store instance
const userProfileStore = useUserProfileStore();

const userProfileInfo = computed(() => {
  if (userProfileStore.isLoggedIn) {
    return `Logged in as ${userProfileStore.profile?.name} (${userProfileStore.profile?.subscriptionType} user)`;
  } else {
    return 'Not logged in';
  }
});

const cleanupDatabases = () => {
  const dbsToDelete = Object.values(DBName);
  deleteAllDbsApi(dbsToDelete);
};

onMounted(async () => {
  try {
    // Initialize with dummy data and sample DB
    // First parameter: isPaid (true for paid user, false for free user)
    // Second parameter: loadSampleDB (true to load sample data, false to skip)
    await initAppWithSampleData(false, true);
    console.log('App initialized with sample data');
    
    // Add event listener for beforeunload
    window.addEventListener('beforeunload', cleanupDatabases);
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', cleanupDatabases);
});
</script>

<style>
.aborder {
  border: 1px solid red;
}
</style>