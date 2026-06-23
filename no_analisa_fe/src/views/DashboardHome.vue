<script setup>
import { ref, onMounted } from 'vue';
import DashboardCard from '../components/DashboardCard.vue';
import { apiRequest } from '../services/apiService';

const activeCounts = ref({
  onGoing: 0,
  receive: 0,
  reject: 0,
  readyToClean: 0,
  readyToSterilize: 0,
  readyToIntegrity: 0,
  readyToProductUse: 0,
  endOfCycle: 0,
  clog: 0,
  didntPassIntegrity: 0,
  accidentReject: 0
});

const fetchDashboardData = async () => {
  try {
    const readyToClean = await apiRequest('/dashboard/issuance?issuance_type=On Clean');
    const readyToSterilize = await apiRequest('/dashboard/issuance?issuance_type=On Sterilize');
    const readyToIntegrity = await apiRequest('/dashboard/issuance?issuance_type=On Integrity');
    const readyToProductUse = await apiRequest('/dashboard/issuance?issuance_type=On Batch');
    const issuance = await apiRequest('/dashboard/issuance');
    const receiving = await apiRequest('/dashboard/receiving');
    const reject = await apiRequest('/dashboard/reject');
    const endOfCycleReject = await apiRequest('/dashboard/reject?reject_type=End Cycle');
    const clogReject = await apiRequest('/dashboard/reject?reject_type=Clog');
    const didntPassIntegrityReject = await apiRequest('/dashboard/reject?reject_type=Did Not Pass Integrity');
    const accidentReject = await apiRequest('/dashboard/reject?reject_type=Accident')

    activeCounts.value.readyToClean = readyToClean.data;
    activeCounts.value.readyToSterilize = readyToSterilize.data;
    activeCounts.value.readyToIntegrity = readyToIntegrity.data;
    activeCounts.value.readyToProductUse = readyToProductUse.data;
    activeCounts.value.onGoing = issuance.data;
    activeCounts.value.receive = receiving.data;
    activeCounts.value.reject = reject.data;
    activeCounts.value.endOfCycle = endOfCycleReject.data;
    activeCounts.value.clog = clogReject.data;
    activeCounts.value.didntPassIntegrity = didntPassIntegrityReject.data;
    activeCounts.value.accidentReject = accidentReject.data;

    console.log('Dashboard Data:', { readyToClean, readyToSterilize, readyToIntegrity, readyToProductUse, receiving, reject, issuance });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
  <main class="p-6 bg-base-200 flex-grow min-h-screen">
      <h2 class="text-3xl font-semibold mb-6">No Analisis Overview</h2>
      
      <h3 class="text-xs font-bold mb-4 opacity-50 uppercase tracking-widest">Filter on Production</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Total Active - On Going" :value="activeCounts.onGoing" class="border-t-4 border-info" linkUrl="production">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            </template>
          </DashboardCard>

          <DashboardCard title="Total Summary - Receive" :value="activeCounts.receive" class="border-t-4 border-info" linkUrl="receipt_filter">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
            </template>
          </DashboardCard>

          <DashboardCard title="Total Summary - Reject" :value="activeCounts.reject" class="border-t-4 border-info" linkUrl="reject_filter">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </template>
          </DashboardCard>
          
          <div class="card bg-base-100 shadow-xl border-t-4 border-info">
            <div class="card-body p-6">
              <h2 class="card-title text-opacity-80 text-sm font-medium">Reject Type</h2>
              <div class="text-[11px] leading-relaxed">
                <p>End Cycle: <span class="font-bold">{{activeCounts.endOfCycle}}</span></p>
                <p>Clog: <span class="font-bold">{{activeCounts.clog}}</span></p>
                <p>Did Not Pass Integrity: <span class="font-bold">{{activeCounts.didntPassIntegrity}}</span></p>
                <p>Accident (Rejected by User) : <span class="font-bold">{{activeCounts.accidentReject}}</span></p>
              </div>
            </div>
          </div>
      </div>

      <h3 class="text-xs font-bold mb-4 opacity-50 uppercase tracking-widest">Filter States</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="ON CLEAN" :value="activeCounts.readyToClean" class="border-t-4 border-info" linkUrl="clean_sterilize">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v1.244c0 .892-.506 1.701-1.302 2.1l-4.14 2.07a3 3 0 00-1.658 2.684V19.5a2.25 2.25 0 002.25 2.25h14.25a2.25 2.25 0 002.25-2.25V11.102a3 3 0 00-1.658-2.684l-4.14-2.07a2.25 2.25 0 01-1.302-2.1V3.104m-5.25 0h5.25m-5.25 0C8.434 3.104 7.5 4.038 7.5 5.186a2.25 2.25 0 00.177.868L9.75 3.104zm5.25 0c.816 0 1.5.666 1.5 1.518a2.25 2.25 0 01-.177.868L15 3.104z" />
                </svg>
            </template>
          </DashboardCard>

          <DashboardCard title="ON STERILIZE" :value="activeCounts.readyToSterilize" class="border-t-4 border-info" linkUrl="clean_sterilize">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                </svg>
            </template>
          </DashboardCard>

          <DashboardCard title="ON INTEGRITY" :value="activeCounts.readyToIntegrity" class="border-t-4 border-info" linkUrl="integrity">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25L15 7.125M10.125 2.25v4.875c0 .621.504 1.125 1.125 1.125h4.875M9 11l2.25 2.25L15 10" />
                </svg>
            </template>
          </DashboardCard>

          <DashboardCard title="ON BATCH (PRODUCTION)" :value="activeCounts.readyToProductUse" class="border-t-4 border-info" linkUrl="production">
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
            </template>
          </DashboardCard>
      </div>
  </main>
</template>