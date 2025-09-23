<template>
  <BasePage :h1="t('home')" class="flex-1">
    <I18nT keypath="iMadeThisPageBecause" tag="p">
      <template #blog>
        <RouterLink :to="localizeRoute({ name: ROUTE_NAMES.BLOG })" class="underline">
          {{ `/${ROUTE_NAME_TO_PATH[ROUTE_NAMES.BLOG]}` }}
        </RouterLink>
      </template>
      <template #explorer>
        <RouterLink :to="localizeRoute({ name: ROUTE_NAMES.EXPLORER })" class="underline">
          {{ `/${ROUTE_NAME_TO_PATH[ROUTE_NAMES.EXPLORER]}` }}
        </RouterLink>
      </template>
    </I18nT>
    <p>{{ t('maybeLaterThereWillBeSomethingSmart') }}</p>
  </BasePage>
</template>

<script setup lang="ts">
import BasePage from '@/components/ui/BasePage.vue';
import { useL10n } from '@/composables/useL10n';
import { ROUTE_NAME_TO_PATH, ROUTE_NAMES } from '@/router';
import { useI18n } from 'vue-i18n';

const { localizeRoute } = useL10n();

const { t } = useI18n({
  messages: {
    ru: {
      home: 'Начальная страница',
      iMadeThisPageBecause:
        'Я сделал эту страницу, потому что мне надоело писать в коде обработчики для редиректов отсюда на обозреватель контента ({explorer}) или блог ({blog}).',
      maybeLaterThereWillBeSomethingSmart:
        'Может быть, потом здесь будет что-нибудь умное и (или) полезное, но не сегодня.',
    },
    en: {
      home: 'Home page',
      iMadeThisPageBecause:
        'I made this page because I got tired of writing redirect handlers in the code from here to the content explorer ({explorer}) or blog ({blog}).',
      maybeLaterThereWillBeSomethingSmart: 'Maybe later there will be something smart and (or) useful, but not today.',
    },
  },
});
</script>
