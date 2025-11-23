<template>
  <BasePage h1="404" class="flex justify-center items-center flex-1 flex-col">
    <p>{{ t('pageNotFound') }}</p>
    <I18nT keypath="tryNavigate" tag="p">
      <RouterLink :to="localizeRoute({ name: ROUTE_NAMES.INDEX })" class="underline">
        {{ t('toTheMainPage') }}
      </RouterLink>
    </I18nT>
  </BasePage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { ROUTE_NAMES } from '@/router';
import BasePage from '@/components/ui/BasePage.vue';
import { useSeoMeta } from '@unhead/vue';
import { useSSRContext } from '@/composables/useSsrContext';
import { isServer } from '@/constants/target';
import { useL10n } from '@/composables/useL10n';

const { localizeRoute } = useL10n();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      pageNotFound: 'Page not found. It may have been removed or the URL is incorrect.',
      tryNavigate: 'Try navigate {0}.',
      toTheMainPage: 'to the main page',
    },
    ru: {
      pageNotFound: 'Страница не найдена. Возможно, она была удалена или вы ошиблись в адресе.',
      tryNavigate: 'Попробуйте перейти {0}.',
      toTheMainPage: 'на главную страницу',
    },
  },
});

useSeoMeta({
  description: () => t('pageNotFound'),
});

if (isServer) {
  const ssrContext = useSSRContext();

  ssrContext?.express.response.status(404);
}
</script>
