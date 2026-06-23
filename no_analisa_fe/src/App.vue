<template>
  <div :data-theme="currentTheme"> 
    
    <template v-if="route.path === '/login'">
      <router-view />
    </template>

    <div v-else class="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle" v-model="isSidebarCollapsed" />
      
      <div class="drawer-content flex flex-col min-h-screen">
        <div class="navbar bg-base-100 shadow-md sticky top-0 z-10">
          <div class="flex-none">
            <label for="my-drawer-2" class="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div class="flex-1 px-2 mx-2 text-xl font-bold">
            Sistem Penomoran Permintaan Analisis Baru
          </div>

          <label class="swap swap-rotate mr-2">
              <ul>
                <li><router-link to="/audittrails" active-class="active">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="swap-off fill-current w-6 h-6" viewBox="0 0 24 24">
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5zM3 12v-2h2v2zm0 1h2v2H4a1 1 0 0 1-1-1zm3 2v-2h7v1a1 1 0 0 1-1 1zm7-3H6v-2h7z"/>
                  </svg>
                </router-link></li>
              </ul>
            </label>
          <div class="flex-none gap-2">

            <!-- <div class="dropdown dropdown-end" @click="handleOpenNotifications">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <div class="indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  
                  <span v-if="unreadCount > 0" class="badge badge-xs badge-error indicator-item"></span>
                </div>
              </div>
              
              <div tabindex="0" class="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow-xl border border-base-200">
                <div class="card-body">
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-lg">Notifications</h3>
                    <span v-if="unreadCount > 0" class="badge badge-sm badge-primary">{{ unreadCount }} New</span>
                  </div>
                  
                  <div class="max-h-64 overflow-y-auto pr-1">
                    <div v-for="notif in notifications" :key="notif.id" 
                        class="py-3 px-3 rounded-lg border-b border-base-100 last:border-0 hover:bg-base-200 cursor-default"
                        :class="[
                          'transition-all duration-20000 ease-in-out', 
                          !notif.is_read 
                            ? 'bg-blue-50/70 dark:bg-blue-900/10' 
                            : 'opacity-70 bg-transparent'
                        ]">
                        
                        <div class="flex justify-between items-start">
                            <p class="text-sm leading-tight mr-2" 
                              :class="['transition-all duration-20000', !notif.is_read ? 'font-bold text-base-content' : 'font-normal text-base-content/80']">
                                {{ notif.message }}
                            </p>
                            
                            <div v-if="!notif.is_read" class="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0 transition-opacity duration-1000"></div>
                        </div>
                        
                        <span class="text-[10px] mt-1 block opacity-50 italic">{{ getTimeAgo(notif.createdAt) }}</span>
                    </div>

                    <div v-if="hasMore" class="p-2 pt-4">
                        <button @click.stop="loadMore" class="btn btn-ghost btn-xs btn-block text-primary normal-case hover:bg-transparent underline">
                            View Older Notifications
                        </button>
                    </div>

                    <div v-else-if="notifications.length > 0" class="text-center p-4 text-[10px] opacity-30 italic">
                        No more notifications
                    </div>

                    <div v-else class="text-center py-8 opacity-40 italic">
                        No notifications yet
                    </div>
                  </div> 
                  </div>
              </div>
            </div> -->

            <label class="swap swap-rotate mr-2">
              <input type="checkbox" @change="toggleTheme" :checked="currentTheme === 'light'" />
              <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM18.36,6.34a1,1,0,0,0-1.41-1.41l-.71.71a1,1,0,0,0,1.41,1.41ZM12,9a3,3,0,1,0,3,3A3,3,0,0,0,12,9Zm0,6a3,3,0,1,0,3,3A3,3,0,0,0,12,15ZM19,11h1a1,1,0,0,0,0-2H19a1,1,0,0,0,0,2Zm-1.36-5.66a1,1,0,0,0-1.41,1.41l.71.71a1,1,0,0,0,1.41-1.41ZM20,12a1,1,0,0,0-1-1H18a1,1,0,0,0,0,2h1A1,1,0,0,0,20,12ZM17.64,17l-.71.71a1,1,0,0,0,1.41,1.41l.71-.71A1,1,0,0,0,17.64,17Z"/></svg>
              <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-9.5,3.9A8.5,8.5,0,0,1,14.5,4.5,8.58,8.58,0,0,1,16.5,3a1,1,0,0,0-.7-1.7,9.55,9.55,0,0,0-6.18,0A1,1,0,0,0,9.5,3a8.58,8.58,0,0,1-2,12.08,8.55,8.55,0,0,0,6.18,0A1,1,0,0,0,13,21.64ZM12.18,17.91A6.5,6.5,0,0,0,14.5,6.33,6.58,6.58,0,0,0,20.08,12.5,6.55,6.55,0,0,0,12.18,17.91Z"/></svg>
            </label>

            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                  <span class="text-xl font-bold">{{ userInitial }}</span>
                </div>
              </div>
              <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
                <li class="px-4 py-2 border-b border-base-200 mb-2">
                  <p class="font-bold text-sm truncate">{{ username }}</p>
                  <p class="text-xs opacity-60 truncate">{{ userEmail }}</p>
                </li>
                <li><router-link to="/profile" active-class="active">Profile Settings</router-link></li>
                <li><a @click="handleLogout" class="text-error font-semibold">Logout</a></li>
              </ul>
            </div>
          </div>
        </div>

        <router-view /> 
      </div> 
      
      <div class="drawer-side z-20">
        <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
        <TheSidebar :is-collapsed="isSidebarCollapsed" />
      </div>
    </div>
    <GlobalModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import TheSidebar from './components/TheSidebar.vue';
import { useRoute, useRouter } from 'vue-router';
import GlobalModal from './components/GlobalModal.vue';
import { apiRequest } from './services/apiService';
import { formatDistanceToNow } from 'date-fns';
import { useIdleLogout } from '@/composables/useIdleLogout'

const route = useRoute();
const router = useRouter();
const currentTheme = ref('light'); 
const themes = ["light", "dark", "cupcake", "abyss", "aqua", "garden"];
const isSidebarCollapsed = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const currentOffset = ref(0);
const hasMore = ref(true);
let notificationTimer = null;

// 60 menit
useIdleLogout(60 * 60 * 1000);

const user = computed(() => {
  const data = localStorage.getItem('userAccount');
  return data ? JSON.parse(data) : null;
});

const username = computed(() => user.value?.username || 'Guest');
const userEmail = computed(() => user.value?.email || '');
const userInitial = computed(() => username.value.charAt(0).toUpperCase());

const handleLogout = async () => {
  const response = await apiRequest('/auth/logout', {
    method: 'DELETE',
    body: JSON.stringify({refreshToken : localStorage.getItem('refreshToken')})
  });
  localStorage.clear();
  router.push('/login');
};

function toggleTheme() {
  const currentIndex = themes.indexOf(currentTheme.value);
  const nextIndex = (currentIndex + 1) % themes.length;
  currentTheme.value = themes[nextIndex];
  document.documentElement.setAttribute('data-theme', currentTheme.value);
}

// const fetchNotifications = async (isLoadMore = false) => {
//     try {
//         if (!isLoadMore) currentOffset.value = 0;

//         const response = await apiRequest(`/notifications?offset=${currentOffset.value}`);
        
//         if (response?.success) {
//             if (isLoadMore) {
//                 notifications.value = [...notifications.value, ...response.data];
//             } else {
//                 notifications.value = response.data;
//             }

//             // Use the specific count from the backend for the badge
//             unreadCount.value = response.unreadTotal; 

//             currentOffset.value += response.data.length;
//             hasMore.value = response.data.length === 5;
//         }
//     } catch (err) {
//         console.error("Fetch failed", err);
//     }
// };

// const loadMore = () => {
//     fetchNotifications(true);
// };

// const handleOpenNotifications = async () => {
//   if (unreadCount.value > 0) {
//       // 1. Immediately update UI state so the colors change and badge disappears
//       const unreadIds = notifications.value.filter(n => !n.is_read).map(n => n.id);
      
//       notifications.value = notifications.value.map(notif => ({
//           ...notif,
//           is_read: true
//       }));
//       unreadCount.value = 0;
//       try {
//           await apiRequest('/notifications/mark-all-read', { 
//               method: 'PUT',
//               body: JSON.stringify({ ids: unreadIds }) 
//           });
//       } catch (err) {
//           console.error("Failed to sync read status:", err);
//       }
//   }
// };

const getTimeAgo = (date) => {
  return date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : '';
};

// watch(user, (newUser) => {
//   if (newUser) {
//     console.log("User logged in, fetching notifications...");
//     console.log(newUser)
//     fetchNotifications(); 
//   } else {
//     notifications.value = [];
//     unreadCount.value = 0;
//   }
// }, { immediate: true });

// watch(() => route.path, (newPath, oldPath) => {
//   if (oldPath === '/login' && newPath !== '/login') {
//     console.log("Navigation from login detected. Syncing notifications...");
//     console.log("Current User: ", user.value)
//     fetchNotifications();
//   }
// });

// onMounted(() => {
//   fetchNotifications();
//   // notificationTimer = setInterval(fetchNotifications, 300000);
//   notificationTimer = setInterval(fetchNotifications, 30000);
// });

// onUnmounted(() => {
//   if (notificationTimer) {
//     clearInterval(notificationTimer);
//   }
// });
</script>