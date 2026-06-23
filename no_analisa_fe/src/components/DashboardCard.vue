<template>
  <div class="card w-full bg-base-100 shadow-xl transition duration-300 hover:shadow-2xl">
    <div class="card-body p-6">
      
      <div class="flex items-center justify-between">
        <h2 class="card-title text-base-content text-opacity-80 text-sm font-medium">{{ title }}</h2>
        
        <div class="text-primary">
          <slot name="icon">
            <span class="text-3xl">{{ icon }}</span>
          </slot>
        </div>
      </div>
      
      <p class="text-3xl font-bold mt-2 mb-4">{{ value }}</p>
      
      <div class="text-sm text-success flex items-center cursor-pointer">
         <slot name="footer"><a @click="goToPage(linkUrl)">Details</a></slot>
      </div>
    </div>
  </div>
</template>


 
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: '✨' },
  linkUrl: { type: String, required: true, default:'#' }
});

const goToPage = () => {
  if (props.linkUrl !== '#') {
    router.push(props.linkUrl);
  }
}

</script>