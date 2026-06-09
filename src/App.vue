<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from './stores/user';
import { useThemeStore } from './stores/theme';
const userStore = useUserStore();
const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initTheme();
})

</script>
