<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6 capitalize">
      {{ isEdit ? "Edit" : "Add" }} {{ masterName }}
    </h1>

    <div class="bg-white shadow p-6 rounded-lg max-w-lg">
      <form @submit.prevent="submitForm">

        <div class="mb-4">
          <label class="block text-sm mb-1">Code</label>
          <input v-model="form.code" required
            class="w-full border rounded p-2" />
        </div>

        <div class="mb-4">
          <label class="block text-sm mb-1">Name</label>
          <input v-model="form.name" required
            class="w-full border rounded p-2" />
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            type="button"
            @click="goBack"
            class="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import MasterService from "@/api/MasterService";

const route = useRoute();
const router = useRouter();

const masterName = route.params.master;
const id = route.params.id;
const isEdit = !!id;

const form = ref({
  code: "",
  name: "",
});

// Mapping GET / UPDATE / CREATE
const mapApi = {
  category: {
    get: MasterService.getCategoryById,
    add: MasterService.createCategory,
    update: MasterService.updateCategory,
  },
  type: {
    get: MasterService.getTypeById,
    add: MasterService.createType,
    update: MasterService.updateType,
  },
  brand: {
    get: MasterService.getBrandById,
    add: MasterService.createBrand,
    update: MasterService.updateBrand,
  },
};

const loadForm = async () => {
  if (isEdit) {
    const res = await mapApi[masterName].get(id);
    form.value = res.data.data;
  }
};

const submitForm = async () => {
  if (isEdit) {
    await mapApi[masterName].update(id, form.value);
  } else {
    await mapApi[masterName].add(form.value);
  }
  goBack();
};

const goBack = () => {
  router.push(`/master/${masterName}`);
};

onMounted(loadForm);
</script>
