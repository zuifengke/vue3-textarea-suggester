<template>
  <div ref="divRef">

  </div>
</template>
<script setup>
import {ref, watch, onMounted, onBeforeUnmount, getCurrentInstance, nextTick} from 'vue';

const divRef = ref(null);
const suggester = ref(null);
onMounted(() => {
  nextTick(() => {
    console.log('divRef', divRef.value);
  });
})
</script>
<style scoped>

</style>
