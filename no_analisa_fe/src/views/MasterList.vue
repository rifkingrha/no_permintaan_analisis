<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { useRoute } from "vue-router";
import { apiRequest } from '../services/apiService';
import { debounce } from 'lodash';
import BaseToast from '@/components/BaseToast.vue';

const route = useRoute();
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const isLocked = ref(true);

const triggerToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// --- DYNAMIC CONFIGURATION ---
const apiMap = {
  mst_department: { title: "Department", endpoint: "/master/mst_department" },
  mst_jenis_check: { title: "Check", endpoint: "/master/mst_jenis_check" },
  mst_jenis_sampel: { title: "Sampel", endpoint: "/master/mst_jenis_sampel" },
  mst_reason: { title: "Reason", endpoint: "/master/mst_reason" },
};

const getConfig = () => {
  const cfg = apiMap[route.params.master];
  if (!cfg) throw new Error("API config not found");
  return cfg;
};

// --- STATE MANAGEMENT ---
const currentView = ref('list');
const isLoading = ref(true);
const fTitle = ref('');
const masterData = ref([]);
const newFilter = ref({ id: '', code: '', name: '', description: '' });
const editingItem = ref(null);
const accountRole = ref(JSON.parse(localStorage.getItem('userAccount')).role);

// Search, Pagination, & Sorting State (Same as UserAccountPage)
const showConfirmModal = ref(false);
const itemToDeleteId = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const pageLimitOptions = [5, 10, 25, 50];
const sortColumn = ref('id');
const sortDirection = ref('ASC');
const searchInputRef = ref(null);

// --- METHODS ---

const fetchMasterData = async () => {
  isLoading.value = true;
  const config = getConfig();
  fTitle.value = config.title;
  
  const isSearching = !!searchQuery.value;
  const params = new URLSearchParams();

  params.append('page', currentPage.value);
  params.append('limit', itemsPerPage.value);
  if (searchQuery.value) params.append('_q', searchQuery.value);
  params.append('_sort', sortColumn.value);
  params.append('_order', sortDirection.value);

  try {
    const response = await apiRequest(`${config.endpoint}?${params.toString()}`);
    masterData.value = response.data;
    totalItems.value = response.count || response.data.length;
  } catch (error) {
    console.error('Failed to fetch master data:', error);
  } finally {
    isLoading.value = false;
    if (isSearching && searchInputRef.value) {
      nextTick(() => {
        searchInputRef.value.focus();
      });
    }
  }
};

const saveData = async () => {
  if (!newFilter.value.code || !newFilter.value.name) {
    triggerToast('Code & Name wajib diisi', 'error')
    return;
  }

  const config = getConfig();
  const payload = {
    code: newFilter.value.code,
    name: newFilter.value.name,
    description: newFilter.value.description,
    user_id: JSON.parse(localStorage.getItem('userAccount')).id,
  };

  try {
    let res

    if (editingItem.value) {
      res = await apiRequest(`${config.endpoint}/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await apiRequest(config.endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    // console.log(JSON.stringify(payload));

    // ✅ TANGKAP MESSAGE DARI BACKEND

    if (res?.success) {
      triggerToast(res.message || 'Data saved successfully')
    }

    await fetchMasterData();
    showListView();

  } catch (error) {
    console.error('Failed to save data:', error);
    triggerToast(res.message || 'Failed to save data', 'error')
  }
};

const executeDelete = async () => {
  const id = itemToDeleteId.value;
  const config = getConfig();
  cancelDelete();
  if (!id) return;

  try {
    let res;

    res = await apiRequest(`${config.endpoint}/${id}`, { method: 'DELETE' });
    
    if (res?.success) {
      triggerToast(res.message || 'Delete Data successfully')
    }
    await fetchMasterData();
  } catch (error) {
    console.error('Failed to delete data:', error);
    triggerToast(res.message || 'Failed to delete data', 'error');
  }
};


// --- FORM & VIEW CONTROLS ---
const showAddForm = async () => {
  resetForm();
  currentView.value = 'add';
  isLocked.value = false;
};

const showEditForm = (item) => {
  editingItem.value = item;
  isLocked.value = true;
  newFilter.value = { ...item };
  currentView.value = 'add'; 
};

const resetForm = () => {
  editingItem.value = null;
  newFilter.value = { id: '', code: '', name: '', description: '' };
};

const showListView = () => {
  currentView.value = 'list';
};

const showDeleteConfirm = (id) => {
  itemToDeleteId.value = id;
  showConfirmModal.value = true;
};

const cancelDelete = () => {
  showConfirmModal.value = false;
  itemToDeleteId.value = null;
};

// --- SEARCH & TABLE HELPERS ---
const search = debounce(() => {
  currentPage.value = 1;
  fetchMasterData();
}, 400);

const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
  search();
};

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    fetchMasterData();
  }
};

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const displayRange = computed(() => {
  if (totalItems.value === 0) return "Showing 0 items";
  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(currentPage.value * itemsPerPage.value, totalItems.value);
  return `Showing ${start} to ${end} of ${totalItems.value} entries`;
});

const handleLimitChange = () => {
  currentPage.value = 1;
  fetchMasterData();
};

const handleSort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'ASC';
  }
  currentPage.value = 1;
  fetchMasterData();
};

// --- WATCHER ---
watch(
  () => route.params.master, 
  () => {
    currentPage.value = 1;
    searchQuery.value = '';
    fetchMasterData();
  }, 
  { immediate: true }
);
</script>

<template>
  <main class="p-6 bg-base-200 flex-grow min-h-screen">
    <h2 class="text-3xl font-semibold mb-6">
      <span v-if="currentView === 'list'">Master Data {{ fTitle }}</span>
      <span v-else-if="editingItem">Edit {{ fTitle }}: {{ editingItem.code }}</span>
      <span v-else>Add New {{ fTitle }}</span>
    </h2>

    <div v-if="currentView === 'list'" class="bg-base-100 p-6 shadow-xl rounded-box">
      <div class="flex justify-between items-center mb-6">
        <div class="relative w-full max-w-xs">
          <input type="text" placeholder="Search..." class="input input-bordered w-full pr-10"
            v-model="searchQuery" @keyup.enter="search" @input="search" ref="searchInputRef" />
          <button v-if="searchQuery" @click="clearSearch" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button class="btn btn-primary" @click="showAddForm" v-if="accountRole ==='admin' || accountRole === 'supervisor'">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New {{ fTitle }}
        </button>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-48">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="ml-3">Fetching data...</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="table w-full table-zebra">
            <thead>
              <tr>
                <th>No</th>
                <th @click="handleSort('code')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">Code <span v-if="sortColumn === 'code'">{{ sortDirection === 'ASC' ? '▲' : '▼' }}</span></div>
                </th>
                <th @click="handleSort('name')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">Name <span v-if="sortColumn === 'name'">{{ sortDirection === 'ASC' ? '▲' : '▼' }}</span></div>
                </th>
                <th @click="handleSort('description')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">Description <span v-if="sortColumn === 'description'">{{ sortDirection === 'ASC' ? '▲' : '▼' }}</span></div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in masterData" :key="item.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ item.code }}</td>
                <td class="font-bold">{{ item.name }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-ghost" v-if="accountRole ==='admin' || accountRole === 'supervisor'" @click="showEditForm(item)">Edit</button>
                    <button class="btn btn-sm btn-error" v-if="accountRole ==='admin'" @click="showDeleteConfirm(item.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-between mt-6">
            <div class="flex items-center">
              <div class="flex items-center gap-2 text-sm opacity-70 mr-6">
                <span>Show</span>
                <select class="select select-bordered select-sm" v-model.number="itemsPerPage" @change="handleLimitChange">
                  <option v-for="limit in pageLimitOptions" :key="limit" :value="limit">{{ limit }}</option>
                </select>
              </div>
              <span class="text-sm opacity-70">{{ displayRange }}</span>
            </div>
            <div class="join">
              <button class="join-item btn" :disabled="currentPage === 1" @click="goToPage(1)">««</button>
              <button class="join-item btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">«</button>
              <button class="join-item btn">Page {{ currentPage }} of {{ totalPages }}</button>
              <button class="join-item btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">»</button>
              <button class="join-item btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">»»</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentView === 'add'" class="bg-base-100 p-10 shadow-xl rounded-box mx-auto max-w-4xl">
      <form @submit.prevent="saveData" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Code</span></label>
            <!-- <input type="text" placeholder="Code" class="input input-bordered w-full" v-model="newFilter.code" readonly/> -->
            <input type="text" placeholder="Code" class="input input-bordered w-full" v-model="newFilter.code" required :disabled="isLocked"/>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Name</span></label>
            <input type="text" placeholder="Name" class="input input-bordered w-full" v-model="newFilter.name" required />
          </div>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-bold">Description</span></label>
          <textarea placeholder="Description" class="textarea textarea-bordered w-full h-32" v-model="newFilter.description"></textarea>
        </div>

        <div class="flex justify-end gap-4 pt-4">
          <button type="button" class="btn btn-ghost" @click="showListView">Cancel</button>
          <button type="submit" class="btn btn-primary">
            {{ editingItem ? 'Save Changes' : 'Create Data' }}
          </button>
        </div>
      </form>
    </div>

    <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showConfirmModal }">
      <div class="modal-box border-t-4 border-error">
        <h3 class="font-bold text-lg text-error">Confirm Deletion</h3>
        <p class="py-4">Are you sure you want to delete this {{ fTitle }}? This action cannot be undone.</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="cancelDelete">Cancel</button>
          <button class="btn btn-error" @click="executeDelete">Yes, Delete</button>
        </div>
      </div>
    </dialog>
  </main>

  <BaseToast
  :show="showToast"
  :message="toastMessage"
  :type="toastType"
  @close="showToast = false"
/>

</template>