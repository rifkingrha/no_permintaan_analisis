<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { apiRequest } from '../services/apiService';
import { debounce } from 'lodash';
import { format, addMonths } from 'date-fns';
import { useMessage } from '@/services/useMessage';
import BaseToast from '@/components/BaseToast.vue';

const { show } = useMessage();

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const triggerToast = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// --- STATE TO CONTROL VIEW & DATA ---
const currentView = ref('list');
const isLoading = ref(true);
const isLocked = ref(true);
const isLockedDept = ref(true);
const showAddModal = ref(false);
const showConfirmModal = ref(false);
const noAnalisisData = ref([]);
const newNoAnalisis = ref({
  code: '',
  dept_code: '',
  dept_name: '',
  sampel_code: '',
  sampel_name: '',
  check_code: '',
  check_name: '',
  user_id: '',
  user_name: '',
  created_date: format(new Date(), "yyyy-MM-dd"),
});

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const pageLimitOptions = [5, 10, 25, 50];
const sortColumn = ref('createdAt');
const sortDirection = ref('DESC');
const searchInputRef = ref(null);
const selectedCheck = ref([]);
const checkOptions = ref([]);
const selectedSampel = ref([]);
const sampelOptions = ref([]);
const selectedDept = ref([]);
const deptOptions = ref([]);
const selectedReason = ref([]);
const reasonOptions = ref([]);
const generatedCode = ref('')
const itemToAbort = ref({});
const AbortRemark = ref('');
const canProductEmpty = ref(false);
const lookupLimit = 5;
const lookupLoading = ref(false);
const highlightedCode = ref(null);
const highlightedRow = ref(null);
const showAbortModal = ref(false);
const abortLoading = ref(false);
const userAccount = JSON.parse(localStorage.getItem('userAccount')) || {};
const activeStatus = ref('1');

// --- METHODS ---
const resetForm = () => {
  newNoAnalisis.value.code = '';
  newNoAnalisis.value.dept_code = '';
  newNoAnalisis.value.dept_name = '';
  newNoAnalisis.value.sampel_code = '';
  newNoAnalisis.value.sampel_name = '';
  newNoAnalisis.value.check_code = '';
  newNoAnalisis.value.check_name = '';
  newNoAnalisis.value.user_id = '';
  newNoAnalisis.value.user_name = '';
  newNoAnalisis.value.receipt_date = format(new Date(), "yyyy-MM-dd");
};

const showListView = () => {
  currentView.value = 'list';
};

// MODIFIED METHOD: fetchNoAnalisis
const fetchNoAnalisis= async () => {
  isLoading.value = true;
  const isSearching = !!searchQuery.value;
  const params = new URLSearchParams();

  params.append('page', currentPage.value);
  params.append('limit', itemsPerPage.value);
  params.append('role', userAccount.role);
  params.append('dept', userAccount.dept);
  params.append('status', activeStatus.value);
  
  if (searchQuery.value) {
    params.append('_q', searchQuery.value);
  }
  params.append('_sort', sortColumn.value);
  params.append('_order', sortDirection.value);

  const urlWithParams = `/no_analisis?${params.toString()}`;

  try {
    const response = await apiRequest(urlWithParams);

    noAnalisisData.value = response.data;

    totalItems.value = response.count || response.data.length;

  } catch (error) {
    console.error('Failed to fetch Receipt Filter data:', error);
  } finally {
    isLoading.value = false;

    if (isSearching && searchInputRef.value) {
      nextTick(() => {
        searchInputRef.value.focus();
      });
    }
  }
};


const changeStatusTab = (status) => {
  activeStatus.value = status;
  currentPage.value = 1;
  fetchNoAnalisis();
};

const fetchReasonOptions = async () => {
  try {
    const reason = await apiRequest('/master/mst_reason');
    reasonOptions.value = reason.data;
  } catch (error) {
    console.error('Failed to load dropdown options:', error);
  }
};

const fetchCheckOptions = async () => {
  try {
    const check = await apiRequest('/master/mst_jenis_check');
    checkOptions.value = check.data;
  } catch (error) {
    console.error('Failed to load dropdown options:', error);
  }
};

const fetchSampelOptions = async () => {
  try {
    const sampel = await apiRequest('/master/mst_jenis_sampel');
    sampelOptions.value = sampel.data;
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

const showFailConfirmModal = ref(false);

const search = debounce(() => {
  currentPage.value = 1;
  fetchNoAnalisis();
}, 400);


const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
  fetchNoAnalisis();
};

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    fetchNoAnalisis();
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
  fetchNoAnalisis();
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
  fetchNoAnalisis();
};


const openFilterModal = async () => {
  filterSearch.value = '';
  filterPage.value = 1;
  showFilterModal.value = true;
  await fetchFiltersLookup();
};

const showConfirm = () => {
  showConfirmModal.value = true;
};

const hideConfirm = () => {
  showConfirmModal.value = false;
};

const handleCreate = () => {
  showAddModal.value = true;

  isLocked.value = false;
  generatedCode.value = '';
  selectedCheck.value = '';
  selectedSampel.value = '';
  
  if(userAccount.role == "admin"){
    selectedDept.value = '';
    isLockedDept.value = false;
  } else {
    selectedDept.value = userAccount.dept;
    isLockedDept.value = true;
  }
};

const closeAddModal = () => {
  showAddModal.value = false;

  generatedCode.value = '';
  selectedCheck.value = '';
  selectedSampel.value = '';
  AbortRemark.value = '';
};

const generateCode = async () => {
    
    if (!selectedDept.value || !selectedSampel.value || !selectedCheck.value) {
        alert('Semua field wajib diisi');
        return
    }
    
    hideConfirm();
    
    try {
        const payload = {
        dept_code: selectedDept.value,
        sampel_code: selectedSampel.value,
        check_code: selectedCheck.value,
        user_id: userAccount.id || ''
        }

        console.log({
        dept: selectedDept.value,
        sampel: selectedSampel.value,
        check: selectedCheck.value
        })

        const res = await apiRequest('/no_analisis', {
        method: 'POST',
        body: JSON.stringify(payload)
        })

         if (res.success) {
            triggerToast('Create No Permintaan Analisis success', 'success');

            generatedCode.value = res.data.code   // 🔥 ambil dari backend
            isLocked.value = true;
            isLockedDept.value = true;
            changeStatusTab('1');
        }

        console.log('Saved:', res.data)

        await fetchNoAnalisis();
        triggerHighlight(res.data.code);

          // close modal perlahan
        setTimeout(() => {
          showAddModal.value = false;
        }, 5000);

    } catch (error) {
        console.error(error)
    }
};


// helper trigger highlight
const triggerHighlight = (code) => {
  highlightedCode.value = code;

  // auto remove setelah animasi
  setTimeout(() => {
    highlightedCode.value = null;
  }, 5000);
};

const handleFilterSearch = debounce(() => {
  filterPage.value = 1;
  fetchFiltersLookup();
}, 400);


const showAbortConfirm = async (abortAnalisis) => {
  selectedReason.value = '';
  itemToAbort.value.id = abortAnalisis.id
  itemToAbort.value.code = abortAnalisis.code
  showAbortModal.value = true;
};

const cancelAbort = () => {
  showAbortModal.value = false;
  itemToAbort.value.id = null;
};

const executeAbort = async () => {

  // =========================
  // VALIDASI REASON
  // =========================
  if (!selectedReason.value) {
    triggerToast(
      'Please select reason',
      'error'
    );
    return;
  }

  // =========================
  // VALIDASI REMARK
  // =========================
  if (
    selectedReason.value === 'LN' &&
    !AbortRemark.value?.trim()
  ) {
    triggerToast(
      'Please input remark',
      'error'
    );
    return;
  }

  try {

    abortLoading.value = true;

    const response = await apiRequest(
      `/no_analisis/${itemToAbort.value.id}/abort`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason_code: selectedReason.value,
          remark:
            selectedReason.value === 'LN'
              ? AbortRemark.value
              : selectedReason.value,
          abort_by: userAccount.username || ''
        })
      }
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Abort failed'
      );
    }

    // =========================
    // SUCCESS
    // =========================
    triggerToast(
      'Abort success',
      'success'
    );

    showAbortModal.value = false;

    selectedReason.value = '';
    AbortRemark.value = '';

    await fetchNoAnalisis();

  } catch (err) {

    console.error(err);

    triggerToast(
      err.message || 'Abort failed',
      'error'
    );

  } finally {

    abortLoading.value = false;

  }
};

const isOtherReason = computed(() => selectedReason.value === 'LN');

watch(selectedReason, (val) => {
  if (val !== 'LN') {
    AbortRemark.value = '';
  }
});

onMounted(() => {
  fetchReasonOptions();
  fetchCheckOptions();
  fetchSampelOptions();
  fetchDepartmenOptions();
  fetchNoAnalisis();

  console.log("user", userAccount);
  if(userAccount.role != "admin") {
        if (userAccount.dept) {
            selectedDept.value = userAccount.dept; // ✅ auto select
            isLockedDept.value = true;     // 🔒 optional: lock dropdown
        }
  }
});
</script>

<style>
  /* 🔥 Highlight base */
.highlight-animate {
  animation: highlightFadeBlink 3s ease forwards;
}

/* 🔥 Keyframe: blink + fade */
@keyframes highlightFadeBlink {
  0% {
    background-color: #fef08a; /* kuning terang */
  }

  20% {
    background-color: #fde047;
  }

  40% {
    background-color: #fef08a;
  }

  60% {
    background-color: #fef9c3;
  }

  80% {
    background-color: #fffbeb;
  }

  100% {
    background-color: transparent;
  }
}


/* =========================
   MODAL ANIMATION
========================= */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(15px);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* =========================
   MODAL BOX SMOOTH EFFECT
========================= */

.modal-box {
  animation: modalPop 0.25s ease;
}

@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

<template>
  <main class="p-6 bg-base-200 flex-grow min-h-screen">
      <h3 class="text-3xl font-semibold mb-6">Pembuatan Nomor Permintaan Analisis Baru</h3>
        <div class="full">
            <div class="flex items-end gap-2 mb-4">
              <!-- SEARCH -->
              <div class="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search.."
                  class="input input-bordered w-full pr-10"
                  v-model="searchQuery"
                  @keyup.enter="search"
                  @input="search"
                />
              </div>
              <!-- BUTTON -->
              <button
                class="btn btn-primary whitespace-nowrap"
                @click="handleCreate"
              >
                + Add Permintaan No Analisis Baru
              </button>
            </div>     
            <!-- =========================
                STATUS TAB
            ========================= -->
            <div class="tabs tabs-boxed mb-4 w-fit bg-base-100 shadow">
              <button
                class="tab px-6"
                :class="activeStatus === '1' ? 'tab-active' : ''"
                @click="changeStatusTab('1')"
              >
                Active
              </button>

              <button
                class="tab px-6"
                :class="activeStatus === '0' ? 'tab-active' : ''"
                @click="changeStatusTab('0')"
              >
                Abort
              </button>

            </div>
            <!-- 🔹 TABLE -->
            <div class="bg-base-100 p-4 rounded-xl shadow overflow-x-auto">
              <table class="table table-zebra w-full">
                  <thead>
                  <tr>
                      <th>No</th>
                      <!-- <th>No. Permintaan Analisis</th> -->
                      <th @click="handleSort('code')" class="cursor-pointer hover:bg-base-200">
                          <div class="flex items-center gap-1">
                              No. Permintaan Analisis
                              <span v-if="sortColumn === 'code'">
                                  <span v-if="sortDirection === 'ASC'">▲</span>
                                  <span v-else>▼</span>
                              </span>
                          </div>
                      </th>
                      <!-- <th>Jenis Pemeriksaan</th> -->
                      <th @click="handleSort('check_code')" class="cursor-pointer hover:bg-base-200">
                          <div class="flex items-center gap-1">
                              Jenis Pemeriksaan
                              <span v-if="sortColumn === 'check_code'">
                                  <span v-if="sortDirection === 'ASC'">▲</span>
                                  <span v-else>▼</span>
                              </span>
                          </div>
                      </th>
                      <!-- <th>Jenis Sampel</th> -->
                      <th @click="handleSort('sampel_code')" class="cursor-pointer hover:bg-base-200">
                          <div class="flex items-center gap-1">
                              Jenis Sampel
                              <span v-if="sortColumn === 'sampel_code'">
                                  <span v-if="sortDirection === 'ASC'">▲</span>
                                  <span v-else>▼</span>
                              </span>
                          </div>
                      </th>
                      <!-- <th>Admin Entry</th> -->
                      <th @click="handleSort('user_id')" class="cursor-pointer hover:bg-base-200">
                          <div class="flex items-center gap-1">
                              Admin Entry
                              <span v-if="sortColumn === 'user_id'">
                                  <span v-if="sortDirection === 'ASC'">▲</span>
                                  <span v-else>▼</span>
                              </span>
                          </div>
                      </th>
                      <!-- <th>Tanggal</th> -->
                      <th @click="handleSort('createdAt')" class="cursor-pointer hover:bg-base-200">
                          <div class="flex items-center gap-1">
                              Tanggal
                              <span v-if="sortColumn === 'createdAt'">
                                  <span v-if="sortDirection === 'ASC'">▲</span>
                                  <span v-else>▼</span>
                              </span>
                          </div>
                      </th>
                      <th v-if="activeStatus === '0'">Abort</th>
                      <th v-if="activeStatus === '0'">Remark</th>
                      <th v-if="userAccount.role === 'admin' && activeStatus === '1'">Actions</th>
                  </tr>
                  </thead>

                  <tbody>
                  <tr v-for="(item, index) in noAnalisisData" 
                  :key="item.id" 
                  :ref="el => item.code === highlightedCode && (highlightedRow = el)"
                  :class="[
                    'transition-all duration-500',
                    item.code === highlightedCode ? 'highlight-animate' : ''
                  ]">
                      <td>{{ ((currentPage - 1) * itemsPerPage) + index + 1 }}</td>
                      <td>{{ item.code }}</td>
                      <td>{{ item.check.name }}</td>
                      <td>{{ item.sampel.name }}</td>
                      <td>{{ item.user.username }}</td>
                      <td>{{ format(item.createdAt, 'dd-MM-yyyy HH:mm') }} </td>
                      <td v-if="activeStatus === '0'">{{item.reason.name? item.reason.name : "-"}}</td>
                      <td v-if="activeStatus === '0'">{{item.reason_remark}}</td>
                      <td v-if="userAccount.role === 'admin' && activeStatus === '1'">
                        <div class="flex gap-2">
                          <button class="btn btn-sm btn-error" @click.stop="showAbortConfirm(item)">Abort</button>
                        </div>
                      </td>
                  </tr>
                  </tbody>
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

         <transition name="modal-fade">
            <dialog
              v-if="showAddModal"
              class="modal modal-bottom sm:modal-middle modal-open"
            >
              <div
                class="modal-box bg-base-100 text-base-content max-w-2xl shadow-2xl border border-base-300"
              >

                <!-- HEADER -->
                <div class="flex items-center justify-between mb-6">

                  <div>
                    <h3 class="font-bold text-2xl text-primary">
                      Pembuatan Permintaan No Analisis Baru
                    </h3>

                    <p class="text-sm opacity-70 mt-1">
                      Silahkan pilih jenis pemeriksaan dan sampel
                    </p>
                  </div>

                  <button
                    class="btn btn-sm btn-circle btn-ghost hover:btn-error"
                    @click="closeAddModal"
                  >
                    ✕
                  </button>

                </div>

                <!-- FORM -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <!-- Jenis Pemeriksaan -->
                  <div class="form-control">

                    <label class="label">
                      <span class="label-text font-semibold">
                        Jenis Pemeriksaan
                      </span>
                    </label>

                    <select
                      v-model="selectedCheck"
                      class="select select-bordered w-full focus:select-primary"
                      :disabled="isLocked"
                    >
                      <option value="">
                        Select Jenis Pemeriksaan
                      </option>

                      <option
                        v-for="opt in checkOptions"
                        :key="opt.id"
                        :value="opt.code"
                      >
                        {{ opt.name }}
                      </option>
                    </select>

                  </div>

                  <!-- Department -->
                  <div class="form-control">

                    <label class="label">
                      <span class="label-text font-semibold">
                        Departmen
                      </span>
                    </label>

                    <select
                      v-model="selectedDept"
                      class="select select-bordered w-full focus:select-primary"
                      :disabled="isLockedDept"
                    >
                      <option value="">
                        Select Departmen
                      </option>

                      <option
                        v-for="opt in deptOptions"
                        :key="opt.id"
                        :value="opt.code"
                      >
                        {{ opt.name }}
                      </option>
                    </select>

                  </div>

                  <!-- Jenis Sampel -->
                  <div class="form-control md:col-span-2">

                    <label class="label">
                      <span class="label-text font-semibold">
                        Jenis Sampel
                      </span>
                    </label>

                    <select
                      v-model="selectedSampel"
                      class="select select-bordered w-full focus:select-primary"
                      :disabled="isLocked"
                    >
                      <option value="">
                        Select Jenis Sampel
                      </option>

                      <option
                        v-for="opt in sampelOptions"
                        :key="opt.id"
                        :value="opt.code"
                      >
                        {{ opt.name }}
                      </option>
                    </select>

                  </div>

                  <!-- Generated Code -->
                  <div class="form-control md:col-span-2">

                    <label class="label">
                      <span class="label-text font-bold">
                        No. Permintaan Analisis Baru
                      </span>
                    </label>

                    <input
                      type="text"
                      placeholder="No. Permintaan Analisis Baru"
                      :value="generatedCode"
                      :class="[
                        'input input-bordered w-full tracking-wider transition-all duration-300',
                        generatedCode
                          ? 'bg-green-100 text-green-700 border-green-300 shadow-inner'
                          : 'bg-gray-100 text-gray-400'
                      ]"
                      readonly
                    />

                  </div>

                </div>

                <!-- ACTION -->
                <div class="modal-action mt-8">

                  <button
                    class="btn btn-ghost"
                    @click="closeAddModal"
                  >
                    Cancel
                  </button>

                  <button
                    class="btn btn-primary min-w-[180px]"
                    :class="{ loading: abortLoading }"
                    :disabled="abortLoading"
                    @click="showConfirm()"
                  >

                    <span v-if="!abortLoading">
                      Generate Code
                    </span>

                  </button>

                </div>

              </div>
            </dialog>
          </transition>

        <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showConfirmModal }">
            <div class="modal-box bg-base-100 text-base-content">
                <h3 class="font-bold text-lg text-primary">Konfirmasi Permintaan No Analisis Baru</h3>

                <p class="py-4">
                    Apakah anda yakin akan membuat permintaan no analisis baru?
                </p>

                <div class="modal-action">
                <button class="btn btn-ghost" @click="hideConfirm">Tidak</button>
                <button class="btn btn-primary" @click="generateCode">Ya, Buat Permintaan No Analisis</button>
                </div>
            </div>
        </dialog>

        <dialog class="modal modal-bottom sm:modal-middle":class="{ 'modal-open': showAbortModal }">
            <div class="modal-box bg-base-100 text-base-content">

              <!-- HEADER -->
              <div class="flex items-center gap-3 text-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-8 h-8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>

                <h3 class="font-bold text-xl">
                  Konfirmasi Abort No Permintaan Analisis Baru
                </h3>
              </div>

              <!-- CONTENT -->
              <p class="py-4">
                Apakah anda yakin akan melakukan Abort terhadap
                No Permintaan Analisis Baru:
                <b>{{ itemToAbort?.code || '-' }}</b> ?
              </p>

              <!-- FORM -->
              <div class="form-control w-full">

                <!-- Reason -->
                <label class="label">
                  <span class="label-text font-bold">
                    Reason
                  </span>
                </label>

                <select
                  v-model="selectedReason"
                  class="select select-bordered w-full"
                >
                  <option value="">Select Reason</option>

                  <option
                    v-for="opt in reasonOptions"
                    :key="opt.id"
                    :value="opt.code"
                  >
                    {{ opt.name }}
                  </option>
                </select>

                <!-- Remark -->
                <label class="label mt-4">
                  <span class="label-text font-bold">
                    Remark
                  </span>
                </label>

                <textarea
                  class="textarea textarea-bordered w-full h-24 mt-3"
                  v-model="AbortRemark"
                  placeholder="Input custom reason..."
                  :disabled="!isOtherReason"
                ></textarea>
              </div>

              <!-- ACTION -->
              <div class="modal-action">
                <button
                  class="btn btn-ghost"
                  @click="cancelAbort"
                >
                  Cancel
                </button>

                <button
                    class="btn btn-error"
                    :class="{ loading: abortLoading }"
                    :disabled="abortLoading"
                    @click="executeAbort"
                  >
                    <span v-if="!abortLoading">
                      Yes, Abort
                    </span>
                  </button>
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