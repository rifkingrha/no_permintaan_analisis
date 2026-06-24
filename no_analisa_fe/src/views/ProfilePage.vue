<template>
  <main class="p-6 bg-base-200 min-h-screen flex justify-center items-start">
    <div class="card w-full max-w-5xl bg-base-100 shadow-xl border border-base-300">
      
      <div class="card-body border-b border-base-300 flex-row justify-between items-center">
        <div>
          <h2 class="card-title text-2xl font-bold">User Profile</h2>
          <p class="text-sm opacity-60">View account details personal information</p>
        </div>
        <!-- <button 
          @click="isEditing ? handleSave() : (isEditing = true)" 
          :class="['btn btn-sm shadow-md', isEditing ? 'btn-success text-white' : 'btn-primary']"
        >
          {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
        </button> -->
      </div>

      <div class="card-body space-y-8">
        <div class="flex flex-col md:flex-row items-start gap-8 p-6 bg-base-200/40 rounded-2xl border border-base-300">
            <!-- <div class="avatar group relative">
                <div class="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-inner cursor-pointer" @click="triggerFileInput">
                    <img :src="userProfile.imgUrl || '/images/default-avatar.png'" />
                    <div v-if="isEditing" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-white text-xs font-bold">Change Photo</span>
                    </div>
                </div>
                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
            </div> -->
            
            <div class="flex-1 w-full space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label"><span class="label-text font-bold opacity-60">Username</span></label>
                        <p class="text-lg font-mono p-3 bg-base-300/50 rounded-lg border border-base-300/50">{{ userProfile.username }}</p>
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-bold opacity-60">Email Address</span></label>
                        <p class="text-lg p-3 bg-base-300/50 rounded-lg border border-base-300/50">{{ userProfile.email }}</p>
                    </div>
                </div>

                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label"><span class="label-text font-bold opacity-60">Access Level</span></label>
                        <p class="text-lg font-mono p-3 bg-base-300/50 rounded-lg border border-base-300/50">{{ userProfile.role }}</p>
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-bold opacity-60">Department</span></label>
                        <p class="text-lg p-3 bg-base-300/50 rounded-lg border border-base-300/50">{{ userProfile.department }}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2 px-1 py-2 text-xs opacity-70 italic">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-info">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.835a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span>To change your username or email address, please contact the <strong>IT Administrator</strong>.</span>
                </div>
            </div>
        </div>

        <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">First Name</span></label>
            <input v-if="isEditing" v-model="userProfile.firstName" type="text" class="input input-bordered bg-base-200" />
            <p v-else class="text-lg p-2 border-b border-base-300">{{ userProfile.firstName || '-' }}</p>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Last Name</span></label>
            <input v-if="isEditing" v-model="userProfile.lastName" type="text" class="input input-bordered bg-base-200" />
            <p v-else class="text-lg p-2 border-b border-base-300">{{ userProfile.lastName || '-' }}</p>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Employee ID (NIK)</span></label>
            <input v-if="isEditing" v-model="userProfile.employeeId" type="text" class="input input-bordered bg-base-200" />
            <p v-else class="text-lg p-2 border-b border-base-300 font-mono">{{ userProfile.employeeId || '-' }}</p>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Phone Number</span></label>
            <input v-if="isEditing" v-model="userProfile.phoneNum" type="text" class="input input-bordered bg-base-200" />
            <p v-else class="text-lg p-2 border-b border-base-300">{{ userProfile.phoneNum || '-' }}</p>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Date of Birth</span></label>
            <input v-if="isEditing" v-model="userProfile.dateOfBirth" type="date" class="input input-bordered bg-base-200" />
            <p v-else class="text-lg p-2 border-b border-base-300">{{ userProfile.dateOfBirth || '-' }}</p>
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Sex</span></label>
            <select v-if="isEditing" v-model="userProfile.sex" class="select select-bordered bg-base-200">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <p v-else class="text-lg p-2 border-b border-base-300">{{ userProfile.sex || '-' }}</p>
          </div>
        </div> -->

        <!-- <div class="form-control w-full">
          <label class="label"><span class="label-text font-bold">Address</span></label>
          <textarea 
            v-if="isEditing" 
            v-model="userProfile.address" 
            class="textarea textarea-bordered bg-base-200 h-24 w-full"
          ></textarea>
          <p v-else class="text-lg p-2 border-b border-base-300 min-h-[3rem]">{{ userProfile.address || '-' }}</p>
        </div> -->

        <!-- <div v-if="isEditing" class="card-actions justify-end pt-4">
          <button @click="isEditing = false" class="btn btn-ghost btn-sm">Discard Changes</button>
        </div> -->
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiRequest } from '../services/apiService';

const isEditing = ref(false);
const userProfile = ref({
  username: '',
  email: '',
  role:'',
  department:''
});
const fileInput = ref(null);
const selectedFile = ref(null);

const triggerFileInput = () => {
  if (isEditing.value) fileInput.value.click();
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    userProfile.value.imgUrl = URL.createObjectURL(file);
  }
};

const fetchUserProfile = async () => {
  try {
    const userAccount = JSON.parse(localStorage.getItem('userAccount'));
    if (!userAccount || !userAccount.id) return;
    const response = await apiRequest(`/user-accounts/by_user_account/${userAccount.id}`, { method: 'GET' });
    if (response.success) {
        userProfile.value.username = response.data.username,
        userProfile.value.email = response.data.email,
        userProfile.value.role = response.data.access.role,
        userProfile.value.department = response.data.department.name
      console.log(userProfile.value);
    }
  } catch (err) {
    console.error("Failed to fetch user profile", err);
  }
};

onMounted(() => {
  fetchUserProfile();
});

const handleSave = async () => {
  try {
    let userAccount = JSON.parse(localStorage.getItem('userAccount'));
    if (!userAccount || !userAccount.id) return;
    const response = await apiRequest(`/user/by_user_account/${userAccount.id}`, {
      method: 'PUT',
      body: JSON.stringify(userProfile.value)
    });
    userAccount.profile = userProfile.value;
    if (response.success) {
      localStorage.setItem('userAccount', JSON.stringify(userAccount));
      isEditing.value = false;
    }
  } catch (err) {
    console.error("Update failed", err);
  }
};
</script>