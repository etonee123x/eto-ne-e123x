<template>
  <nav class="z-explorer-navbar">
    <ul class="bg-background -mx-(--container-padding) px-(--container-padding) flex items-center overflow-x-auto py-1">
      <li
        v-for="navigationItem in explorer.getFolderData.state.value?.navigationItems ?? []"
        class="whitespace-nowrap last:text-details-500 before:text-[initial] before:px-2 before:content-['>'] first:before:content-[''] first:before:p-0"
        :key="navigationItem.link"
      >
        <RouterLink :to="navigationItem.link">
          {{ navigationItem.text }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useExplorer } from '@/plugins/explorer';

const explorer = useExplorer();
</script>
