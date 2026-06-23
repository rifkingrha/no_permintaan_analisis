<script setup>
import { ref } from 'vue';
const userRole = ref('');

  const role = JSON.parse(localStorage.getItem('userAccount'))?.role;
  userRole.value = role || ''
//const accountRole = ref(JSON.parse(localStorage.getItem('userAccount')).role);

defineProps({
  isCollapsed: Boolean
});
</script>

<style scoped>
.tooltip:after, .tooltip:before {
  transform: translateX(-15%) translateY(-50%) !important;
}

.overflow-y-auto {
  overflow-y: auto !important;
  overflow-x: clip !important; 
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.2);
  border-radius: 10px;
}
.shrink-0 { flex-shrink: 0; }
</style>

<template>
  <div 
    class="menu p-4 h-full bg-base-300 text-base-content grid grid-rows-[1fr_auto] overflow-visible transition-all duration-300"
    :class="isCollapsed ? 'w-20' : 'w-80'"
  >
    <div class="overflow-y-auto overflow-x-visible pr-2 custom-scrollbar">
      <h3 class="font-extrabold mb-6 px-4 truncate" v-show="!isCollapsed">Sanbe Farma</h3>
      <h3 class="font-extrabold mb-6 text-center" v-show="isCollapsed">SF</h3>

      <ul class="p-0">
        <li>
          <router-link to="/" active-class="active" class="flex gap-3" :class="{'tooltip tooltip-right': isCollapsed}" data-tip="Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 11c0-3.771 0-5.657 1.172-6.828C5.343 3 7.229 3 11 3h2c3.771 0 5.657 0 6.828 1.172C21 5.343 21 7.229 21 11v2c0 3.771 0 5.657-1.172 6.828C18.657 21 16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172C3 18.657 3 16.771 3 13z"/>
                    <path stroke-linecap="square" stroke-linejoin="round" d="M12 8v8m4-4H8"/>
                </g>
            </svg>
            <!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> -->
            <span v-show="!isCollapsed">No Permintaan Analisis Baru</span>
          </router-link>
        </li>
        <li>
          <router-link to="/list/no_analisis" active-class="active" class="flex gap-3" :class="{'tooltip tooltip-right': isCollapsed}" data-tip="Dashboard">
            <svg data-v-dcc85afd="" class="feather feather-trash-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path data-v-dcc85afd="" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 5h6m-6 4h6M10 3v4h4V3h-4Z"></path></svg>
            <!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> -->
            <span v-show="!isCollapsed">List No Permintaan Analisis Baru</span>
          </router-link>
        </li>
          <li v-if="userRole === 'admin'">
            <details class="group" open>
              <summary class="flex justify-between items-center gap-3 after:content-none">
                <div class="flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">  <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" /></svg>
                  Master Data
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <ul>
                <li><router-link to="/mst_department" active-class="active">Departmen</router-link></li>
                <li><router-link to="/mst_jenis_sampel" active-class="active">Jenis Sampel</router-link></li>
                <li><router-link to="/mst_jenis_check" active-class="active">Jenis Pemeriksaan</router-link></li>
                <li><router-link to="/mst_reason" active-class="active">Reason</router-link></li>
              </ul>
            </details>
          </li>
      </ul>
    </div>

    <div class="pt-4 border-t border-base-100 bg-base-300 overflow-visible" v-if="userRole === 'admin'"> 
      <ul class="p-0">
        <li>
          <details class="group flex flex-col-reverse">
            <ul v-show="!isCollapsed" class="mb-2">
              <li><router-link to="/access-level" active-class="active">Access Level</router-link></li>
              <li><router-link to="/user-account" active-class="active">User Account Management</router-link></li>
            </ul>
            <summary class="flex justify-between items-center gap-3 cursor-pointer after:content-none" :class="{'tooltip tooltip-right': isCollapsed}" data-tip="Settings">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                <span v-show="!isCollapsed">Settings</span>
              </div>
              <svg v-show="!isCollapsed" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            </summary>
          </details>
        </li>
      </ul>
    </div>
  </div>
</template>