<script setup>
import { ref, onMounted } from 'vue';
import { apiRequest } from '../services/apiService';
import { computed, nextTick } from "vue";
import { debounce, method } from 'lodash';
import { format } from 'date-fns';
import { watch } from 'vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

// --- STATE TO CONTROL VIEW & DATA ---
const currentView = ref('list');
const isLoading = ref(true);
const reportData = ref([]);
const openFunction = ref(false)
const showConfirmModal = ref(false);
const itemToDeleteId = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const pageLimitOptions = [5, 10, 25, 50];
const sortColumn = ref('createdAt');
const sortDirection = ref('DESC');
const searchInputRef = ref(null);
const selectedDept = ref([]);
const selectedSampel = ref([]);
const selectedCheck = ref([]);
const deptOptions = ref([]);
const sampelOptions = ref([]);
const checkOptions = ref([]);
const startDateFrom = ref('');
const startDateTo = ref('');
const ids = '';
const userAccount = JSON.parse(localStorage.getItem('userAccount')) || {};

// MODIFIED METHOD: fetchNoAnalisisHistory
const fetchNoAnalisisHistory = async () => {
    isLoading.value = true;
    const isSearching = !!searchQuery.value
    const params = new URLSearchParams();
    
    params.append('page', currentPage.value);
    params.append('limit', itemsPerPage.value);
    params.append('role', userAccount.role);
    params.append('dept', userAccount.dept);

    if (searchQuery.value) {
        params.append('_q', searchQuery.value);
    }

    // if(role == "admin") {
    //     if (selectedDept.value) {
    //         params.append('dept_code', selectedDept.value.map(v => v.code).join(','))
    //     }
    // }

    if (userAccount.role === "admin") {
            if (selectedDept.value.length) {
                params.append('dept_code', selectedDept.value.map(v => v.code).join(','));
            }
        } else {
        if (userAccount.dept) {
            params.append('dept_code', userAccount.dept); // 🔒 paksa dari login
        }
    }

    if(selectedSampel.value){
        params.append('sampel_code', selectedSampel.value.map(v => v.code).join(','))
    }

    if(selectedCheck.value){
        params.append('check_code', selectedCheck.value.map(v => v.code).join(','))
    }

    if(startDateFrom.value){
        params.append('date_from', startDateFrom.value)
    }

    if(startDateTo.value){
        params.append('date_to', startDateTo.value)
    }
    
    params.append('_sort', sortColumn.value);
    params.append('_order', sortDirection.value);


    const urlWithParams = `/list/no_analisis?${params.toString()}`;

    try {
        const response = await apiRequest(urlWithParams);

        console.log( 'Data Filter :', response.data);
        reportData.value = response.data;
        totalItems.value = response.count || response.data.length;

    } catch (error) {
        console.error('Failed to fetch List No Analisis data:', error);
    } finally {
        isLoading.value = false;

        if (isSearching && searchInputRef.value) {
            nextTick(() => {
                searchInputRef.value.focus();
            });
        }
    }
};

const search = debounce(() => {
    currentPage.value = 1;
    fetchNoAnalisisHistory();
}, 400);


const clearSearch = (searchType) => {
    if(searchType){
        console.log('search type exists')
        if(searchType === 'departmen'){
            if(userAccount.role === 'admin') {
                selectedDept.value = [];
            }  
        } else if(searchType === 'sampel'){
            selectedSampel.value = [];  
        } else if(searchType === 'check'){
            selectedCheck.value = [];  
        } else if(searchType === 'dateFrom'){
            startDateFrom.value = '';
        } else if(searchType === 'dateTo'){
            startDateTo.value = '';
        }
        currentPage.value = 1;
        fetchNoAnalisisHistory();
    } else {
        console.log('no search type')
        searchQuery.value = '';
        currentPage.value = 1;
        if(role === 'admin') {
            selectedDept.value = [];
        }  
        selectedSampel.value = [];  
        selectedCheck.value = [];  
        startDateFrom.value = '';
        startDateTo.value = '';
        fetchNoAnalisisHistory();
    }
};

const fetchDropdownOptions = async () => {
  try {
    const [dept, sampel, check] = await Promise.all([
      apiRequest('/list/no_analisis_dept'),
      apiRequest('/list/no_analisis_sampel'),
      apiRequest('/list/no_analisis_check')
    ]);
    deptOptions.value = dept.data;
    sampelOptions.value = sampel.data;
    checkOptions.value = check.data;
  } catch (error) {
    console.error('Failed to load dropdown options:', error);
  }
};

const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages.value) {
        currentPage.value = pageNumber;
        fetchNoAnalisisHistory();
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
    fetchNoAnalisisHistory();
};

const handleSort = (column) => {
    if (sortColumn.value === column) {
        if (sortDirection.value === 'ASC') {
            sortDirection.value = 'DESC';
        }
        else if (sortDirection.value === 'DESC') {
            sortColumn.value = 'no';
            sortDirection.value = 'ASC';
        }
    } else {
        sortColumn.value = column;
        sortDirection.value = 'ASC';
    }
    currentPage.value = 1;
    fetchNoAnalisisHistory();
};

// DETAIL VIEW
const showDetailModal = ref(false);
const selectedDetail = ref(null);

const openDetailView = (item) => {
    selectedDetail.value = item;
    showDetailModal.value = true;
};

const exportExcel  = (report) => {
    const params = new URLSearchParams()

    params.append('role', userAccount.role);
    params.append('dept', userAccount.dept);

    if (searchQuery.value) {
        params.append('_q', searchQuery.value);
    }

    if (selectedDept.value) {
       params.append('dept_code', selectedDept.value.map(v => v.code).join(','))
    }

    if(selectedCheck.value){
        params.append('check_code', selectedCheck.value.map(v => v.code).join(','))
    }

    if(selectedSampel.value){
        params.append('sampel_code', selectedSampel.value.map(v => v.code).join(','))
    }

    if(startDateFrom.value){
        params.append('createdAt', startDateFrom.value)
    }

    if(startDateTo.value){
        params.append('createdAt', startDateTo.value)
    }

  const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
  const urlWithParams = API_BASE_URL + `/report/filter_history_excel?${params.toString()}`;
  console.log(urlWithParams);
  
  window.open(urlWithParams, '_blank')
}

onMounted(() => {
    fetchDropdownOptions();
    fetchNoAnalisisHistory();
    
    console.log("user", userAccount);

    if(userAccount.role != "admin") {
        if (userAccount.dept) {
            selectedDept.value = userAccount.dept; // ✅ auto select
            // deptOptions.value = deptname;
            // isLockedDept.value = true;     // 🔒 optional: lock dropdown
        }
    }

    document.addEventListener('click', e => {
    if (!e.target.closest('.relative')) {
      openFunction.value = false
    }
  })
});

watch(
  [selectedDept, selectedSampel, selectedCheck],
  ([deptVal, sampelVal, checkVal]) => {

    const deptValIds = userAccount.role === "admin" ? (deptVal?.map(v => v.code) || []) : (userAccount.dept ? [userAccount.dept] : []);
    const sampelValIds  = sampelVal?.map(v => v.code) || []
    const checkValIds = checkVal?.map(v => v.code) || []

    console.log('Dept:', deptValIds.join(','))
    console.log('Sampel:', sampelValIds.join(','))
    console.log('Check:', checkValIds.join(','))

    fetchNoAnalisisHistory()    
  },
  { deep: true }
)

const generatePdf = async (report) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
    const params = new URLSearchParams()

    if (searchQuery.value) {
        params.append('_q', searchQuery.value);
    }

     if (userAccount.role === "admin") {
        if (selectedDept.value.length) {
            params.append(
            'dept_code',
            selectedDept.value.map(v => v.code).join(',')
            );
        }
        } else {
        if (userAccount.dept) {
            params.append('dept_code', userAccount.dept); // 🔒 paksa dari login
        }
    }

    // if (selectedDept.value) {
    //    params.append('dept_code', selectedDept.value.map(v => v.code).join(','))
    // }

    if(selectedCheck.value){
        params.append('check_code', selectedCheck.value.map(v => v.code).join(','))
    }

    if(selectedSampel.value){
        params.append('sampel_code', selectedSampel.value.map(v => v.code).join(','))
    }

    if(startDateFrom.value){
        params.append('createdAt', startDateFrom.value)
    }

    if(startDateTo.value){
        params.append('createdAt', startDateTo.value)
    }

    const urlWithParams = API_BASE_URL + `/list/no_analisis_pdf?${params.toString()}`;

    const response = await fetch(urlWithParams, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        printed_by:JSON.parse(localStorage.getItem('userAccount'))?.username || ''
      })
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || 'Gagal generate PDF')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')

  } catch (err) {
    console.error('GENERATE PDF ERROR 👉', err)
    alert(err.message)
  }
}


</script>

<template>
    <main class="p-6 bg-base-200 flex-grow min-h-screen">
        <h2 class="text-3xl font-semibold mb-6">
            <span>History Nomor Permintaan Analisis</span>
        </h2>

        <div class="bg-base-100 p-6 shadow-xl rounded-box">
            
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            
            <div class="form-control w-full">
                <label class="label"><span class="label-text font-semibold">General Search</span></label>
                <div class="relative">
                    <input type="text" placeholder="Search.." class="input input-bordered w-full pr-10"
                        v-model="searchQuery" @keyup.enter="search" @input="search" />
                    <button v-if="searchQuery" @click="clearSearch()" class="absolute inset-y-0 right-0 pr-3 text-error cursor-pointer">
                        ✕
                    </button>
                </div>
            </div>
            <div class="form-control w-full">
                <label class="label"><span class="label-text font-semibold">Jenis Pemeriksaan</span></label>
                <div class="relative">
                    <Multiselect
                        v-model="selectedCheck"
                        :options="checkOptions"
                        :multiple="true"
                        :close-on-select="false"
                        :clear-on-select="false"
                        :preserve-search="true"
                        placeholder="Select Jenis Pemeriksaan"
                        label="name"
                        track-by="code"
                        >
                        <template #option="{ option }">
                            <div class="flex items-center gap-2">
                            <input type="checkbox" :checked="selectedCheck.includes(option)" />
                            <span>{{ option.name }}</span>
                            </div>
                        </template>
                    </Multiselect>
                </div>
            </div>

            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text font-semibold">Departmen</span>
                </label>
                    <Multiselect
                        v-if="userAccount.role === 'admin'"
                        v-model="selectedDept"
                        :options="deptOptions"
                        :multiple="true"
                        :close-on-select="false"
                        :clear-on-select="false"
                        :preserve-search="true"
                        placeholder="Select Departmen"
                        label="name"
                        track-by="code">
                        <template #option="{ option }">
                            <div class="flex items-center gap-2">
                                <input
                                type="checkbox"
                                :checked="selectedDept.some(d => d.code === option.code)"
                                />
                                <span>{{ option.name }}</span>
                            </div>
                        </template>
                    </Multiselect>

                    <select
                        v-else
                        v-model="selectedDept"
                        class="select select-bordered"
                        disabled>
                        <option value="">Select Departmen</option>
                        <option
                        v-for="opt in deptOptions"
                        :key="opt.id"
                        :value="opt.code"
                        >
                        {{ opt.name }}
                        </option>
                    </select>
            </div>

            <div class="form-control w-full">
                <label class="label"><span class="label-text font-semibold">Jenis Sampel</span></label>
                <div class="relative">
                    <Multiselect
                        v-model="selectedSampel"
                        :options="sampelOptions"
                        :multiple="true"
                        :close-on-select="false"
                        :clear-on-select="false"
                        :preserve-search="true"
                        placeholder="Select Jenis Sampel"
                        label="name"
                        track-by="code"
                        >
                        <template #option="{ option }">
                            <div class="flex items-center gap-2">
                            <input type="checkbox" :checked="selectedSampel.includes(option)" />
                            <span>{{ option.name }}</span>
                            </div>
                        </template>
                    </Multiselect>
                </div>
            </div>

            <div class="form-control w-full">
                <label class="label"><span class="label-text font-semibold">Date From</span></label>
                <div class="relative">
                    <input type="date" class="input input-bordered w-full" v-model="startDateFrom" @change="search" />
                    <button v-if="startDateFrom" @click="clearSearch('dateFrom')" class="absolute inset-y-0 right-8 text-error cursor-pointer">✕</button>
                </div>
            </div>

            <div class="form-control w-full">
                <label class="label"><span class="label-text font-semibold">Date To</span></label>
                <div class="relative">
                    <input type="date" class="input input-bordered w-full" v-model="startDateTo" @change="search" />
                    <button v-if="startDateTo" @click="clearSearch('dateTo')" class="absolute inset-y-0 right-8 text-error cursor-pointer">✕</button>
                </div>
            </div>

        </div>
            <div class="flex justify-end items-end mb-6 gap-4 border-t pt-4">
                <button @click="clearSearch()" class="btn btn-outline btn-error btn-sm gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Reset All Filters
                </button>
                <button
  v-if="userAccount.role === 'admin'"
  @click="generatePdf(reportData)"
  class="btn btn-outline btn-sm gap-2 hover:btn-error transition-all duration-300 shadow-sm hover:shadow-md"
>
  <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <path d="M19 11c0-.818 0-1.57-.152-1.937s-.441-.657-1.02-1.235l-4.736-4.736c-.499-.499-.748-.748-1.058-.896a2 2 0 0 0-.197-.082C11.514 2 11.161 2 10.456 2c-3.245 0-4.868 0-5.967.886a4 4 0 0 0-.603.603C3 4.59 3 6.211 3 9.456V14c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h8"/>
        
        <path d="M12 2.5V3c0 2.828 0 4.243.879 5.121C13.757 9 15.172 9 18 9h.5"/>

        <path d="M21 14h-2a1 1 0 0 0-1 1v1.5m0 0V19m0-2.5h2.5"/>

        <path d="M7 19v-2m0 0v-3h1.5a1.5 1.5 0 0 1 0 3zm5.5-3h1.286c.947 0 1.714.746 1.714 1.667v1.666c0 .92-.768 1.667-1.714 1.667H12.5z"/>
    </svg>

  <span class="font-medium">
    Export PDF
  </span>
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
                                    <div class="flex items-center gap-1">
                                        No. Permintaan Analisis
                                        <span v-if="sortColumn === 'code'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('check_code')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Jenis Pemeriksaan
                                        <span v-if="sortColumn === 'check_code'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('dept_code')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Departmen
                                        <span v-if="sortColumn === 'dept_code'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('sampel_code')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Jenis Sampel
                                        <span v-if="sortColumn === 'sampel_code'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>


                                <th @click="handleSort('createdAt')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Tanggal
                                        <span v-if="sortColumn === 'createdAt'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>
                                <th @click="handleSort('status')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Status
                                        <span v-if="sortColumn === 'status'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(noAnalisisHistory, index) in reportData" :key="noAnalisisHistory.id"
                                class="hover:bg-base-200 cursor-pointer" @click="openDetailView(noAnalisisHistory)">
                               <td>{{ ((currentPage - 1) * itemsPerPage) + index + 1 }}</td>
                                <td class="font-bold">{{ noAnalisisHistory.code }}</td>
                                <td>
                                    <span class="badge badge-info text-white mb-1 text-xs">
                                        Code
                                    </span>
                                    <p class="font-mono text-sm">{{ noAnalisisHistory.check_code? noAnalisisHistory.check_code : "-" }}</p>
                                    <span class="badge badge-info text-white mb-1 text-xs">
                                        Pemeriksaan
                                    </span>
                                    <p class="font-mono text-sm">{{ noAnalisisHistory.check_name? noAnalisisHistory.check_name : '-' }}</p>
                                </td>
                                <td>
                                    <span class="badge badge-info text-white mb-1 text-xs">
                                        Code
                                    </span>
                                    <p class="font-mono text-sm">{{  noAnalisisHistory.dept_code? noAnalisisHistory.dept_code : "-" }}</p>
                                    <span class="badge badge-info text-white mb-1 text-xs">
                                        Departmen
                                    </span>
                                    <p class="font-mono text-sm">{{  noAnalisisHistory.department_name? noAnalisisHistory.department_name : '-'}}</p>
                                </td>
                                <td>
                                    <span class="badge badge-info text-white mb-1 text-xs">
                                        Code
                                    </span>
                                    <p class="font-mono text-sm">{{  noAnalisisHistory.sampel_code? noAnalisisHistory.sampel_code : "-" }}</p>
                                    <span class="badge badge-info text-white mb-1 text-xs">
                                        Sampel
                                    </span>
                                    <p class="font-mono text-sm">{{ noAnalisisHistory.sampel_name? noAnalisisHistory.sampel_name : '-'}}</p>
                                </td>
                                <td class="font-mono text-sm">{{ format(noAnalisisHistory.createdAt, 'dd-MM-yyyy HH:mm') }}</td>
                                <td>
                                    <span
                                        class="badge text-white mb-1 text-xs"
                                        :class="{
                                            'bg-red-500': noAnalisisHistory.status === 'Abort',
                                            'bg-green-500': noAnalisisHistory.status === 'Active'
                                        }"
                                    >
                                        {{ noAnalisisHistory.status || '-' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="11" class="text-right">Total: {{ reportData.length }} Filter
                                </th>
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

                            <button class="join-item btn" :disabled="currentPage === 1"
                                @click="goToPage(currentPage - 1)">
                                «
                            </button>

                            <button class="join-item btn">Page {{ currentPage }} of {{ totalPages }}</button>

                            <button class="join-item btn" :disabled="currentPage === totalPages"
                                @click="goToPage(currentPage + 1)">
                                »
                            </button>

                            <button class="join-item btn" :disabled="currentPage === totalPages"
                                @click="goToPage(totalPages)">
                                »» </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- <dialog :class="['modal', showDetailModal ? 'modal-open' : '']">
            <div class="modal-box max-w-6xl border-t-4 border-primary">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h3 class="font-bold text-2xl text-primary">Filter History Report Details</h3>
                    </div>
                    <button class="btn btn-sm btn-circle btn-ghost" @click="showDetailModal = false">✕</button>
                </div>

                <div v-if="selectedDetail" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-base-200 p-4 rounded-lg">
                            <span class="text-xs uppercase font-bold opacity-50">Filter Unique Code</span>
                            <p class="text-lg font-mono font-bold">{{ selectedDetail.filter_code_no }}</p>
                        </div>
                        <div class="bg-base-200 p-4 rounded-lg">
                            <span class="text-xs uppercase font-bold opacity-50">Issuance Status</span>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="badge badge-primary">{{ selectedDetail.issuance_type }}</span>
                                <span :class="['badge', selectedDetail.status_issuance === 'Ready to Use' ? 'badge-success text-white' : 'badge-ghost']">
                                    {{ selectedDetail.status_issuance }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 border-y border-base-300 py-6">
                        <div class="space-y-3">
                            <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Product Info</h4>
                            <div>
                                <span class="text-xs opacity-60">Description</span>
                                <p class="font-semibold">{{ selectedDetail.product_desc? selectedDetail.product_desc : "-" }}</p>
                            </div>
                            <div>
                                <span class="text-xs opacity-60">Product Code</span>
                                <p class="font-mono text-sm">{{ selectedDetail.product_code? selectedDetail.product_code : "-" }}</p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Machine Usage Info</h4>
                            <div>
                                <span class="text-xs opacity-60">Machine Code</span>
                                <p class="font-semibold">{{ selectedDetail.machine_id? selectedDetail.machine_id : "-" }}</p>
                            </div>
                            <div>
                                <span class="text-xs opacity-60">Machine Name</span>
                                <p class="font-semibold">{{ selectedDetail.machine_usage? selectedDetail.machine_usage : "-" }}</p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Filter Info</h4>
                            <div>
                                <span class="text-xs opacity-60">Filter Code & Function</span>
                                <p class="text-sm">
                                    <span class="font-bold">{{ selectedDetail.filter_code? selectedDetail.filter_code : "-" }}</span><br>
                                    <span class="opacity-70">{{ selectedDetail.function_type?selectedDetail.function_type : "-" }}</span>
                                </p>
                            </div>
                            <div>
                                <span class="text-xs opacity-60">Cycle Usage</span>
                                <p class="text-sm">
                                    <span class="font-semibold">{{ selectedDetail.cycle_use }} out of {{ selectedDetail.cycle_usage }}</span><br>
                                </p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Integrity Tests</h4>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <span class="badge badge-info text-white text-[10px] h-4">Diffusion</span>
                                    <p class="font-bold">{{ selectedDetail.diffusion_test || '-' }}</p>
                                </div>
                                <div>
                                    <span class="badge badge-info text-white text-[10px] h-4">Bubble</span>
                                    <p class="font-bold">{{ selectedDetail.bubble_test || '-' }}</p>
                                </div>
                            </div>
                            <div class="pt-2 border-t">
                                <span class="badge badge-info text-white text-[10px] h-4">Result</span>
                                <p :class="['text-lg font-black', selectedDetail.status_test === 'Pass' ? 'text-success' : 'text-error']">
                                    {{ selectedDetail.status_test || 'N/A' }}
                                </p>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Batch Details</h4>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <span class="badge badge-info text-white text-[10px] h-4">Batch Number</span>
                                    <p class="font-bold">{{ selectedDetail.batch_no || '-' }}</p>
                                </div>
                                <div>
                                    <span class="badge badge-info text-white text-[10px] h-4">Clog Status</span>
                                    <p class="font-bold">{{ selectedDetail.status_batch || '-' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div class="p-2">
                            <span class="text-xs opacity-60 block">PIC</span>
                            <span class="font-bold">{{ selectedDetail.pic }}</span>
                        </div>
                        <div class="p-2 border-x border-base-300">
                            <span class="text-xs opacity-60 block">Start Date</span>
                            <span class="font-bold">{{ selectedDetail.start_date ? format(new Date(selectedDetail.start_date), 'dd-MM-yyyy') : '-' }}</span>
                        </div>
                        <div class="p-2">
                            <span class="text-xs opacity-60 block">End Date</span>
                            <span class="font-bold">{{ selectedDetail.end_date ? format(new Date(selectedDetail.end_date), 'dd-MM-yyyy') : '-' }}</span>
                        </div>
                    </div>

                    <div class="bg-warning/10 p-4 rounded-lg border border-warning/20">
                        <span class="text-xs uppercase font-bold text-warning-content opacity-70">Remarks</span>
                        <p class="mt-1 italic text-sm">{{ selectedDetail.remark || 'No remarks provided.' }}</p>
                    </div>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="showDetailModal = false">Close</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="showDetailModal = false">
                <button>close</button>
            </form>
        </dialog> -->
    </main>
</template>