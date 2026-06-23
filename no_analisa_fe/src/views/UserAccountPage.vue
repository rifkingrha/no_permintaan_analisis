<script setup>
import { ref, onMounted } from 'vue';
import { apiRequest } from '../services/apiService';
import { computed, nextTick } from "vue";
import { debounce } from 'lodash';
import { useMessage } from '@/services/useMessage';
const { show } = useMessage();

// --- STATE TO CONTROL VIEW & DATA ---
const currentView = ref('list');
const isLoading = ref(true);
const userAccountData = ref([]);
const newUserAccount = ref({
  username: '',
  email: '',
  password: '',
  accessLevelId: '',
  dept_code: '',
});
const editingUserAccount = ref(null);
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
const accessLevelOptions = ref([]);
const usernameError = ref('');
const selectedDept = ref([]);
const deptOptions = ref([]);

// --- METHODS ---
const showAddForm = () => {
  resetForm();
  currentView.value = 'add';
};

const loadEditForm = (account) => {
  editingUserAccount.value = account;
  
  newUserAccount.value.username = account.username;
  newUserAccount.value.email = account.email;
  newUserAccount.value.password = '';
  newUserAccount.value.accessLevelId = account.accessLevelId || '';
  newUserAccount.value.dept_code = account.dept_code || '';
  currentView.value = 'add';
};

const resetForm = () => {
  editingUserAccount.value = null;
  newUserAccount.value.username = '';
  newUserAccount.value.email = '';
  newUserAccount.value.password = '';
  newUserAccount.value.accessLevelId = '';
  newUserAccount.value.dept_code = '';
};

const showListView = () => {
  currentView.value = 'list';
};

const checkUsername = async () => {
  let username = newUserAccount.value.username
  try {
    if (newUserAccount.value.username.length < 3) {
      usernameError.value = "Username too short";
      return;
    }

    const response = await apiRequest(`/user-accounts/check-username/${username}`,
      { method: 'POST' }
    );
    console.log(response.exists)
    if(!response.exists) {
      usernameError.value = '';
    } else {
      usernameError.value = 'Username is already taken.';
    }
  } catch (error) {
    console.error('Failed to check username availability:', error);
  }
};

const fetchUserAccounts = async () => {
  isLoading.value = true;
  const isSearching = !!searchQuery.value;
  const params = new URLSearchParams();

  params.append('page', currentPage.value);
  params.append('limit', itemsPerPage.value);

  if (searchQuery.value) {
    params.append('_q', searchQuery.value);
  }
  params.append('_sort', sortColumn.value);
  params.append('_order', sortDirection.value);
  
  const urlWithParams = `/user-accounts?${params.toString()}`;

  try {
    const response = await apiRequest(urlWithParams);
    userAccountData.value = response.data;
    totalItems.value = response.count || response.data.length;
  } catch (error) {
    console.error('Failed to fetch userAccount data:', error);
  } finally {
    isLoading.value = false;
    if (isSearching && searchInputRef.value) {
      nextTick(() => {
        searchInputRef.value.focus();
      });
    }
  }
};

const fetchAccessLevelOptions = async () => {
  try {
    const accessLevel = await apiRequest('/access-levels')
    accessLevelOptions.value = accessLevel.data
  } catch (error) {
    console.error('Failed to load dropdown options:', error);
  }
};

const fetchDepartmenOptions = async () => {
  try {
    const dept = await apiRequest('/master/mst_department');
    deptOptions.value = dept.data;
  } catch (error) {
    console.error('Failed to load dropdown options:', error);
  }
};

const saveUserAccount = async () => {
  if (!newUserAccount.value.username || !newUserAccount.value.email) {
    show('Invalid Username', 'Please fill out the Username and Email.', 'error');
    return;
  }
  if( usernameError.value ) {
    show('Invalid Username', usernameError.value, 'error');
    return;
  }
  const payload = {
    username: newUserAccount.value.username,
    email: newUserAccount.value.email,
    accessLevelId : newUserAccount.value.accessLevelId,
    dept_code : newUserAccount.value.dept_code
  };

  // Only include password if it's a new account or user typed a new one
  if (!editingUserAccount.value || newUserAccount.value.password) {
    payload.password = newUserAccount.value.password;
  }

  try {
    if (editingUserAccount.value) {
      const updateURL = `/user-accounts/${editingUserAccount.value.id}`;
      await apiRequest(updateURL, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await apiRequest('/user-accounts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    await fetchUserAccounts();
  } catch (error) {
    console.error('Failed to save user account:', error);
    alert('Failed to save data.');
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
    await apiRequest(`/user-accounts/${id}`, { method: 'DELETE' });
    await fetchUserAccounts();
  } catch (error) {
    console.error('Failed to delete user account:', error);
    alert('Failed to delete data.');
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
  fetchUserAccounts();
}, 400);

const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
  search();
};

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    fetchUserAccounts();
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
  fetchUserAccounts();
};

const handleSort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'ASC';
  }
  currentPage.value = 1;
  fetchUserAccounts();
};

onMounted(() => {
  fetchUserAccounts();
  fetchAccessLevelOptions();
  fetchDepartmenOptions();
});
</script>

<template>
  <main class="p-6 bg-base-200 flex-grow min-h-screen">
    <h2 class="text-3xl font-semibold mb-6">
      <span v-if="currentView === 'list'">User Account Management</span>
      <span v-else-if="editingUserAccount">Edit User: {{ editingUserAccount.username }}</span>
      <span v-else>Add New User Account</span>
    </h2>

    <div v-if="currentView === 'list'" class="bg-base-100 p-6 shadow-xl rounded-box">
      <div class="flex justify-between items-center mb-6">
        <div class="relative w-full max-w-xs">
          <input type="text" placeholder="Search by Username or Email..." class="input input-bordered w-full pr-10"
            v-model="searchQuery" @keyup.enter="search" @input="search" ref="searchInputRef" />
          <button v-if="searchQuery" @click="clearSearch" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button class="btn btn-primary" @click="showAddForm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New User
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
                <th @click="handleSort('username')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">Username <span v-if="sortColumn === 'username'">{{ sortDirection === 'ASC' ? '▲' : '▼' }}</span></div>
                </th>
                <th @click="handleSort('email')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">Email <span v-if="sortColumn === 'email'">{{ sortDirection === 'ASC' ? '▲' : '▼' }}</span></div>
                </th>
                <th @click="handleSort('accessLevelId')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">Access Level <span v-if="sortColumn === 'accessLevelId'">{{ sortDirection === 'ASC' ? '▲' : '▼' }}</span></div>
                </th>
                <th @click="handleSort('dept_code')" class="cursor-pointer hover:bg-base-200">
                  <div class="flex items-center gap-1">Department <span v-if="sortColumn === 'dept_code'">{{ sortDirection === 'ASC' ? '▲' : '▼' }}</span></div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in userAccountData" :key="user.id">
                <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.access.role }}</td>
                <td>{{ user.department?.name || '-' }} </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-ghost" @click="loadEditForm(user)">Edit</button>
                    <button class="btn btn-sm btn-error" @click="showDeleteConfirm(user.id)">Delete</button>
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
      <form @submit.prevent="saveUserAccount" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-bold">Username</span>
          </label>
          <input 
            v-model="newUserAccount.username" 
            placeholder="Username"
            @blur="checkUsername"
            type="text" 
            :class="['input input-bordered w-full', usernameError ? 'input-error' : '']"
          />
          <label v-if="usernameError" class="label">
            <span class="label-text-alt text-error font-semibold">{{ usernameError }}</span>
          </label>
        </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Email</span></label>
            <input type="email" placeholder="Email" class="input input-bordered w-full" v-model="newUserAccount.email" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Access Level</span></label>
            <select class="select select-bordered w-full" v-model="newUserAccount.accessLevelId" required>
              <option value="">Select Access Level</option>
              <option v-for="access in accessLevelOptions" :key="access.id" :value="access.id">
                {{ access.role }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Departmen</span></label>
            <select class="select select-bordered w-full" v-model="newUserAccount.dept_code" required>
              <option disabled value="">Select Departemen</option>
              <option v-for="access in deptOptions" :key="access.id" :value="access.code">
                {{ access.name }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Password</span>
              <span v-if="editingUserAccount" class="label-text-alt text-info italic">Leave blank to keep current</span>
            </label>
            <input type="password" placeholder="Password" class="input input-bordered w-full" v-model="newUserAccount.password" :required="!editingUserAccount" />
          </div>
        </div>


        <div class="flex justify-end gap-4 pt-4">
          <button type="button" class="btn btn-ghost" @click="showListView">Cancel</button>
          <button type="submit" class="btn btn-primary">
            {{ editingUserAccount ? 'Save Changes' : 'Create Account' }}
          </button>
        </div>
      </form>
    </div>

    <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showConfirmModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg text-error">Confirm Deletion</h3>
        <p class="py-4">Are you sure you want to delete this User Account?</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="cancelDelete">Cancel</button>
          <button class="btn btn-error" @click="executeDelete">Yes, Delete</button>
        </div>
      </div>
    </dialog>
  </main>
</template>