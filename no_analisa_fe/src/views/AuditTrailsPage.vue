<script setup>
import { ref, onMounted } from 'vue';
import { apiRequest } from '../services/apiService';
import { computed, nextTick } from "vue";
import { debounce, method } from 'lodash';
import { format } from 'date-fns';

// --- STATE TO CONTROL VIEW & DATA ---
const currentView = ref('list');
const isLoading = ref(true);
const reportData = ref([]);
const showConfirmModal = ref(false);
const itemToDeleteId = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const pageLimitOptions = [5, 10, 25, 50];
const sortColumn = ref('id');
const sortDirection = ref('DESC');
const searchInputRef = ref(null);
const selectedFunction = ref('');
const selectedProduct = ref('');
const selectedMachineUsage = ref('');
const selectedFilterCode = ref('');
const selectedItem = ref('');
const functionOptions = ref([]);
const machineOptions = ref([]);
const filterOptions = ref([]);
const productOptions = ref([]);
const itemOptions = ref([]);
const startDateFrom = ref('');
const startDateTo = ref('');

// --- METHODS ---
const showAddForm = () => {
    currentView.value = 'add';
};

const showListView = () => {
    currentView.value = 'list';
};

// MODIFIED METHOD: fetchAuditTrails
const fetchAuditTrails = async () => {
    isLoading.value = true;
    const isSearching = !!searchQuery.value
    const params = new URLSearchParams();

    params.append('page', currentPage.value);
    params.append('limit', itemsPerPage.value);

    if (searchQuery.value) {
        params.append('_q', searchQuery.value);
    }

    if (selectedFunction.value) {
        params.append('filter_function', selectedFunction.value);
    }

    if(selectedProduct.value){
        params.append('product_code', selectedProduct.value)
    }

    if(selectedMachineUsage.value){
        params.append('machine_usage', selectedMachineUsage.value)
    }

    if(selectedFilterCode.value){
        params.append('filter_id', selectedFilterCode.value)
    }

    if(selectedItem.value){
        params.append('item_code', selectedItem.value)
    }

    if(startDateFrom.value){
        params.append('date_from', startDateFrom.value)
    }

    if(startDateTo.value){
        params.append('date_to', startDateTo.value)
    }
    
    params.append('_sort', sortColumn.value);
    params.append('_order', sortDirection.value);

    const urlWithParams = `/audit_trails?${params.toString()}`;

    try {
        const response = await apiRequest(urlWithParams);

        reportData.value = response.data;

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

const executeDelete = async () => {
    const id = itemToDeleteId.value;

    cancelDelete();

    if (!id) return;

    try {
        await apiRequest(`/clean_sterilize/${id}`, {
            method: 'DELETE',
        });
        await fetchAuditTrails();

    } catch (error) {
        console.error('Failed to delete receipt filter:', error);
        alert('Failed to delete data. See console for details.');
        return;
    }
};

const cancelDelete = () => {
    showConfirmModal.value = false;
    itemToDeleteId.value = null;
};

const search = debounce(() => {
    currentPage.value = 1;
    fetchAuditTrails();
}, 400);

const clearSearch = () => {
        searchQuery.value = '';
        currentPage.value = 1;
        fetchAuditTrails();
};

const fetchDropdownOptions = async () => {
  try {
    const [funcs, products, machine, filter, item] = await Promise.all([
    //   apiRequest('/report/filter_history_unique_code'),
      apiRequest('/master/mst_function'),
      apiRequest('/report/filter_history_product_code'),
      apiRequest('/master/mst_machine'),
      apiRequest('/mst_filters'),
      apiRequest('/mst_items')
    ]);
    functionOptions.value = funcs.data;
    productOptions.value = products.data;
    machineOptions.value = machine.data;
    filterOptions.value = filter.data;
    itemOptions.value = item.data;
  } catch (error) {
    console.error('Failed to load dropdown options:', error);
  }
};

const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages.value) {
        currentPage.value = pageNumber;
        fetchAuditTrails();
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
    fetchAuditTrails();
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
    fetchAuditTrails();
};

// DETAIL VIEW
const showDetailModal = ref(false);
const selectedDetail = ref(null);

const openDetailView = (item) => {
    selectedDetail.value = item;
    showDetailModal.value = true;
};

const formatAuditValue = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return null;

    // Convert { product_code: "abc" } to [{ label: "Product Code", value: "abc" }]
    return Object.entries(data).map(([key, value]) => {
        if (key==="filter_code_no"){
            key = "filter_unique_code"
        }
      return {
        // Replace underscores with spaces and capitalize words
        label: key.split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' '),
        value: value || '-' // Show dash if value is null/empty
      };
    });
  } catch (e) {
    return null; // Return null if parsing fails
  }
};

onMounted(() => {
    fetchDropdownOptions();
    fetchAuditTrails();
});
</script>

<template>
    <main class="p-6 bg-base-200 flex-grow min-h-screen">
        <h2 class="text-3xl font-semibold mb-6">
            <span>Audit Trails</span>
        </h2>

        <div class="bg-base-100 p-6 shadow-xl rounded-box">
        
            <div class="flex justify-between items-center mb-6 gap-4">

                <div class="flex items-center gap-2 flex-grow max-w-2xl">
                    <div class="relative w-full max-w-xs">
                        <input type="text" placeholder="Search audit trails.." class="input input-bordered w-full pr-10"
                            v-model="searchQuery" @keyup.enter="search" @input="search" ref="searchInputRef" />
                        <button v-if="searchQuery" @click="clearSearch"
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

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

                                <th @click="handleSort('date')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Date
                                        <span v-if="sortColumn === 'date'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('menu')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Menu
                                        <span v-if="sortColumn === 'menu'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('action')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Action
                                        <span v-if="sortColumn === 'action'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('start_value')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Start Value
                                        <span v-if="sortColumn === 'start_value'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <!-- <th @click="handleSort('product_desc')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Product Description
                                        <span v-if="sortColumn === 'product_desc'">
                                        <span v-if="sortDirection === 'ASC'">▲</span>
                                        <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th> -->
                                <th @click="handleSort('final_value')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Final Value
                                        <span v-if="sortColumn === 'final_value'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('changes')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Changes
                                        <span v-if="sortColumn === 'changes'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>

                                <th @click="handleSort('user')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        User
                                        <span v-if="sortColumn === 'user'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>
                                
                                <th @click="handleSort('client_ip')" class="cursor-pointer hover:bg-base-200">
                                    <div class="flex items-center gap-1">
                                        Client IP
                                        <span v-if="sortColumn === 'client_ip'">
                                            <span v-if="sortDirection === 'ASC'">▲</span>
                                            <span v-else>▼</span>
                                        </span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(auditTrails, index) in reportData" :key="auditTrails.id"
                                class="hover:bg-base-200 cursor-pointer" @click="openDetailView(auditTrails)">
                                <td>{{ index + 1 }}</td>
                                <td class="text-[11px]">{{ format(auditTrails.date, 'dd-MM-yyyy HH:mm') }}</td>
                                <td class="text-[11px]">{{ auditTrails.menu }}</td>
                                <td>
                                    <p class="text-[11px]">{{ auditTrails.action }}</p>
                                </td>
                                <td class="align-top min-w-[180px] p-4">
                                    <div v-if="formatAuditValue(auditTrails.start_value)" class="grid gap-x-4 gap-y-1">
                                        <div v-for="item in formatAuditValue(auditTrails.start_value)" :key="item.label" class="text-[11px] leading-tight">
                                            <span class="font-bold text-gray-500 block uppercase tracking-tighter">{{ item.label }}</span>
                                            <span class="text-gray-800">{{ item.value }}</span>
                                        </div>
                                    </div>
                                    <span v-else class="text-gray-400">-</span>
                                </td>
                                <td class="align-top min-w-[180px] p-4">
                                    <div v-if="formatAuditValue(auditTrails.final_value)" class="grid gap-x-4 gap-y-1">
                                        <div v-for="item in formatAuditValue(auditTrails.final_value)" :key="item.label" class="text-[11px] leading-tight">
                                            <span class="font-bold text-gray-500 block uppercase tracking-tighter">{{ item.label }}</span>
                                            <span class="text-gray-800">{{ item.value }}</span>
                                        </div>
                                    </div>
                                    <span v-else class="text-gray-400">-</span>
                                </td>
                                <td class="align-top min-w-[180px] p-4">
                                    <div v-if="formatAuditValue(auditTrails.changes)" class="grid gap-x-4 gap-y-1">
                                        <div v-for="item in formatAuditValue(auditTrails.changes)" :key="item.label" class="text-[11px] leading-tight">
                                            <span class="font-bold text-gray-500 block uppercase tracking-tighter">{{ item.label }}</span>
                                            <span class="text-gray-800">{{ item.value }}</span>
                                        </div>
                                    </div>
                                    <span v-else class="text-gray-400">-</span>
                                </td>
                                <td class="text-[11px]">{{ auditTrails.user }}</td>
                                <td class="text-[11px]">{{ auditTrails.client_ip }}</td>
                                <!-- <td>{{ format(auditTrails.start_date, 'dd-MM-yyyy') }}</td>
                                <td>{{ !auditTrails.end_date ? 'N/A' : format(auditTrails.end_date, 'dd-MM-yyyy') }}</td>
                                <td>{{ auditTrails.machine ? auditTrails.machine?.name : '-' }}</td>
                                <td>{{ auditTrails.cycle_use }} out of {{ auditTrails.filter.cycle_usage }}</td>
                                <td>{{ auditTrails.status_issuance }}</td> -->
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

        <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showConfirmModal }">
            <div class="modal-box bg-base-100 text-base-content">
                <h3 class="font-bold text-lg text-error">Confirm Deletion</h3>

                <p class="py-4">
                    Are you sure you want to permanently delete this Receipt Filter? This action cannot be undone.
                </p>

                <div class="modal-action">
                    <button class="btn btn-ghost" @click="cancelDelete">Cancel</button>
                    <button class="btn btn-error" @click="executeDelete">Yes, Delete</button>
                </div>
            </div>
        </dialog>

        <dialog :class="['modal', showDetailModal ? 'modal-open' : '']">
            <div class="modal-box max-w-6xl border-t-4 border-primary">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h3 class="font-bold text-2xl text-primary mb-2">Audit Trail Detail</h3>
                    </div>
                    <button class="btn btn-sm btn-circle btn-ghost" @click="showDetailModal = false">✕</button>
                </div>

                <div v-if="selectedDetail" class="space-y-6">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-base-200 p-4 rounded-lg">
                            <span class="text-xs uppercase font-bold opacity-50">User</span>
                            <p class="text-lg font-mono font-bold mt-1">{{ selectedDetail.user }}</p>
                            <span class="text-xs uppercase font-bold opacity-50">Action</span>
                            <p class="text-lg font-bold mt-1">{{ selectedDetail.action }}</p>
                            <span class="text-xs uppercase font-bold opacity-50">Menu</span>
                            <p class="text-lg font-bold mt-1">{{ selectedDetail.menu }}</p>
                        </div>
                        <div class="bg-base-200 p-4 rounded-lg">
                            <span class="text-xs uppercase font-bold opacity-50">IP Address</span>
                            <p class="text-lg font-mono font-bold mt-1">{{ selectedDetail.client_ip }}</p>
                            <span class="text-xs uppercase font-bold opacity-50">Date</span>
                            <p class="text-lg font-bold mt-1">{{  selectedDetail.date ? format(new Date(selectedDetail.date), 'dd-MM-yyyy HH:mm:ss') : '-' }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-base-300 pt-6">
                        <div class="space-y-3">
                            <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Start Value</h4>
                            <div class="bg-base-200 p-4 rounded-lg min-h-[120px] max-h-[300px] overflow-y-auto">
                                <div v-if="formatAuditValue(selectedDetail.start_value)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div v-for="item in formatAuditValue(selectedDetail.start_value)" :key="item.label" class="border-b border-base-300 pb-2">
                                        <span class="font-bold text-gray-500 block text-xs uppercase tracking-tighter">{{ item.label }}</span>
                                        <span class="text-base-content text-sm break-words">{{ item.value || '-' }}</span>
                                    </div>
                                </div>
                                <span v-else class="text-sm opacity-50 italic">No data available.</span>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Final Value</h4>
                            <div class="bg-base-200 p-4 rounded-lg min-h-[120px] max-h-[300px] overflow-y-auto">
                                <div v-if="formatAuditValue(selectedDetail.final_value)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div v-for="item in formatAuditValue(selectedDetail.final_value)" :key="item.label" class="border-b border-base-300 pb-2">
                                        <span class="font-bold text-gray-500 block text-xs uppercase tracking-tighter">{{ item.label }}</span>
                                        <span class="text-base-content text-sm break-words">{{ item.value || '-' }}</span>
                                    </div>
                                </div>
                                <span v-else class="text-sm opacity-50 italic">No data available.</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="font-bold text-sm text-secondary uppercase tracking-wider">Changes</h4>
                        <div class="bg-base-200 p-4 rounded-lg min-h-[120px] max-h-[300px] overflow-y-auto">
                            <div v-if="formatAuditValue(selectedDetail.changes)" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div v-for="item in formatAuditValue(selectedDetail.changes)" :key="item.label" class="border-b border-base-300 pb-2">
                                    <span class="font-bold text-gray-500 block text-xs uppercase tracking-tighter">{{ item.label }}</span>
                                    <span class="text-base-content text-sm break-words font-semibold">{{ item.value || '-' }}</span>
                                </div>
                            </div>
                            <span v-else class="text-sm opacity-50 italic">No data available.</span>
                        </div>
                    </div>

                </div>

                <div class="modal-action">
                    <button class="btn" @click="showDetailModal = false">Close</button>
                </div>
            </div>
            
            <form method="dialog" class="modal-backdrop" @click="showDetailModal = false">
                <button>close</button>
            </form>
        </dialog>
    </main>
</template>