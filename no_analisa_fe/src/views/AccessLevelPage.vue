<script setup>
import { ref, onMounted } from 'vue';
import { apiRequest } from '../services/apiService';
import { computed, nextTick } from "vue";
import { debounce } from 'lodash';

// --- STATE TO CONTROL VIEW & DATA ---
const currentView = ref('list');
const isLoading = ref(true);
const accessLevelData = ref([]);
const newAccessLevel = ref({
  role: '',
  description: '',
});
const editingAccessLevel = ref(null);
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
const showAddForm = () => {
  resetForm();
  currentView.value = 'add';
};

const loadEditForm = (accessLevel) => {
  editingAccessLevel.value = accessLevel;

  newAccessLevel.value.role = accessLevel.role;
  newAccessLevel.value.description = accessLevel.description;

  currentView.value = 'add';
};

const resetForm = () => {
  editingAccessLevel.value = null;
  newAccessLevel.value.role = '';
  newAccessLevel.value.description = '';
};

const showListView = () => {
  currentView.value = 'list';
};

// MODIFIED METHOD: fetchAccessLevel
const fetchAccessLevel = async () => {
  isLoading.value = true;
  const isSearching = !!searchQuery.value
  const params = new URLSearchParams();

  params.append('page', currentPage.value);
  params.append('limit', itemsPerPage.value);

  if (searchQuery.value) {
    params.append('_q', searchQuery.value);
  }
  params.append('_sort', sortColumn.value);
  params.append('_order', sortDirection.value);
  const urlWithParams = `/access-levels?${params.toString()}`;

  try {
    const response = await apiRequest(urlWithParams);

    accessLevelData.value = response.data;

    totalItems.value = response.count || response.data.length;

    console.log('Fetched accessLevel data:', response.data);

  } catch (error) {
    console.error('Failed to fetch accessLevel data:', error);
  } finally {
    isLoading.value = false;

    if (isSearching && searchInputRef.value) {
      nextTick(() => {
        searchInputRef.value.focus();
      });
    }
  }
};

const saveAccessLevel = async () => {
  if (!newAccessLevel.value.role) {
    alert('Please fill out the Role.');
    return;
  }

  const accessLevelPayload = {
    role: newAccessLevel.value.role,
    description: newAccessLevel.value.description,
  };

  try {
    if (editingAccessLevel.value) {
      const updateURL = `/access-levels/${editingAccessLevel.value.id}`;
      await apiRequest(updateURL, {
        method: 'PUT',
        body: JSON.stringify(accessLevelPayload),
      });
    } else {
      await apiRequest('/access-levels', {
        method: 'POST',
        body: JSON.stringify(accessLevelPayload),
      });
    }

    await fetchAccessLevel();

  } catch (error) {
    console.error('Failed to save access level:', error);
    alert('Failed to save data. See console for details.');
    return;
  }

  resetForm();
  showListView();
};

const executeDelete = async () => {
  const id = itemToDeleteId.value;

  cancelDelete();

  if (!id) return;

  try {
    await apiRequest(`/access-levels/${id}`, {
      method: 'DELETE',
    });
    await fetchAccessLevel();

  } catch (error) {
    console.error('Failed to delete access level:', error);
    alert('Failed to delete data. See console for details.');
    return;
  }
};

const showDeleteConfirm = (id) => {
  itemToDeleteId.value = id;
  showConfirmModal.value = true;
};

const cancelDelete = () => {
  showConfirmModal.value = false;
  itemToDeleteId.value = null;
};

const search = debounce(() => {
  currentPage.value = 1;
  fetchAccessLevel();
}, 400);


const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
  search();
};

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    fetchAccessLevel();
  }
};

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value);
});

const displayRange = computed(() => {
  if (totalItems.value === 0) {
    return "Showing 0 items";
  }

  const start = (currentPage.value - 1) * itemsPerPage.value + 1;

  const endTheoretical = currentPage.value * itemsPerPage.value;
  const end = Math.min(endTheoretical, totalItems.value);

  return `Showing ${start} to ${end} of ${totalItems.value} entries`;
});

const handleLimitChange = () => {
  currentPage.value = 1;

  fetchAccessLevel();
};

const handleSort = (column) => {
  if (sortColumn.value === column) {
    if (sortDirection.value === 'ASC') {
      sortDirection.value = 'DESC';
    }
    else if (sortDirection.value === 'DESC') {
      sortColumn.value = 'id';
      sortDirection.value = 'ASC';
    }
  } else {
    sortColumn.value = column;
    sortDirection.value = 'ASC';
  }

  currentPage.value = 1;
  fetchAccessLevel();
};

onMounted(() => {
  fetchAccessLevel();
});
</script>

<template>
  <main class="p-6 bg-base-200 flex-grow min-h-screen">
    <h2 class="text-3xl font-semibold mb-6">
      <span v-if="currentView === 'list'">Access Level Management</span>
      <span v-else-if="editingAccessLevel">Edit Access Level: {{ editingAccessLevel.role }}</span>
      <span v-else>Add New Access Level</span>
    </h2>

    <div v-if="currentView === 'list'" class="bg-base-100 p-6 shadow-xl rounded-box">

      <div class="flex justify-between items-center mb-6">

        <div class="relative w-full max-w-xs">
          <input type="text" placeholder="Search by Role or Description..." class="input input-bordered w-full pr-10"
            v-model="searchQuery" @keyup.enter="search" @input="search" ref="searchInputRef" />

          <button v-if="searchQuery" @click="clearSearch"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
            aria-label="Clear Search">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button class="btn btn-primary" @click="showAddForm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Access Level
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

                <th @click="handleSort('role')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">
                    Role
                    <span v-if="sortColumn === 'role'">
                      <span v-if="sortDirection === 'ASC'">▲</span>
                      <span v-else>▼</span>
                    </span>
                  </div>
                </th>

                <th @click="handleSort('description')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">
                    Description
                    <span v-if="sortColumn === 'description'">
                      <span v-if="sortDirection === 'ASC'">▲</span>
                      <span v-else>▼</span>
                    </span>
                  </div>
                </th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(accessLevel, index) in accessLevelData" :key="accessLevel.id">
                <td>{{ index + 1 }}</td>
                <td>{{ accessLevel.role }}</td>
                <td>{{ accessLevel.description }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-ghost" @click="loadEditForm(accessLevel)">Edit</button>
                    <button class="btn btn-sm btn-error" @click="showDeleteConfirm(accessLevel.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colspan="7" class="text-right">Total: {{accessLevelData?.length || 0}} Access Levels</th>
              </tr>
            </tfoot>
          </table>
          <div class="flex justify-between mt-6">

            <div class="flex items-center">

              <div class="flex items-center gap-2 text-sm opacity-70 mr-6"> <span>Show</span>
                <select class="select select-bordered select-sm" v-model.number="itemsPerPage"
                  @change="handleLimitChange">
                  <option v-for="limit in pageLimitOptions" :key="limit" :value="limit">
                    {{ limit }}
                  </option>
                </select>
              </div>

              <span class="text-sm opacity-70">
                {{ displayRange }}
              </span>
            </div>

            <div class="join">
              <button class="join-item btn" :disabled="currentPage === 1" @click="goToPage(1)">
                «« </button>

              <button class="join-item btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                «
              </button>

              <button class="join-item btn">Page {{ currentPage }} of {{ totalPages }}</button>

              <button class="join-item btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                »
              </button>

              <button class="join-item btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
                »» </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentView === 'add'" class="bg-base-100 p-10 shadow-xl rounded-box mx-auto max-w-4xl">
      <form @submit.prevent="saveAccessLevel" class="space-y-6">

        <div class="columns-2xl">
          <label class="label"><span class="label-text">Role</span></label>
          <input type="text" placeholder="Role" class="input input-bordered w-full" v-model="newAccessLevel.role" />
        </div>

        <div class="columns-1xl">
          <label class="label"><span class="label-text">Description</span></label>
          <textarea placeholder="Description" class="textarea textarea-bordered w-full"
            v-model="newAccessLevel.description"></textarea>
        </div>

        <div class="flex justify-end gap-4 pt-4">
          <button type="button" class="btn btn-ghost" @click="showListView">Cancel</button>
          <button type="submit" class="btn btn-primary">
            {{ editingAccessLevel ? 'Save Changes' : 'Save Access Level' }}
          </button>
        </div>
      </form>
    </div>

    <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showConfirmModal }">
      <div class="modal-box bg-base-100 text-base-content">
        <h3 class="font-bold text-lg text-error">Confirm Deletion</h3>

        <p class="py-4">
          Are you sure you want to permanently delete this Access Level? This action cannot be undone.
        </p>

        <div class="modal-action">
          <button class="btn btn-ghost" @click="cancelDelete">Cancel</button>
          <button class="btn btn-error" @click="executeDelete">Yes, Delete</button>
        </div>
      </div>
    </dialog>
  </main>
</template>