<template>
  <nav class="z-explorer-navbar">
    <ul class="bg-background -mx-(--container-padding) px-(--container-padding) flex items-center overflow-x-auto py-1">
      <li
        v-for="navigationItem in explorerContext.navigationLinks.value"
        class="whitespace-nowrap last:text-primary-500 after:px-2 after:content-['>'] last:after:content-['']"
        :key="navigationItem.to"
      >
        <RouterLink :to="navigationItem.to">
          {{ navigationItem.text }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useExplorerContext } from '../contexts/explorer';

const explorerContext = useExplorerContext();
</script>
