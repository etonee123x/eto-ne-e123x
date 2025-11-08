<template>
  <header class="border-b border-b-primary-500 bg-background-secondary relative">
    <ClientOnly v-if="loadingSources.size > 0">
      <div
        class="after:opacity-30 after:absolute after:bottom-0 after:translate-y-1/2 after:h-1 after:rounded-full after:z-[calc(var(--z-index-explorer-navbar)+1)] after:w-1/6 after:bg-dark after:animate-runner"
      />
    </ClientOnly>
    <div class="layout-container flex items-center py-2 gap-4">
      <nav class="flex items-end gap-4">
        <RouterLink
          exactActiveClass="text-primary-500"
          :to="localizeRoute({ name: ROUTE_NAMES.INDEX })"
          class="text-xl"
        >
          {{ SITE_TITLE }}
        </RouterLink>
        <ul class="flex gap-2">
          <li v-for="link in links" :key="link.key">
            <RouterLink :to="link.to" activeClass="text-primary-500">
              {{ link.text }}
            </RouterLink>
          </li>
        </ul>
      </nav>
      <div class="ms-auto flex gap-2">
        <BaseButton
          v-for="button in buttons"
          :aria-label="button.ariaLabel"
          :class="BUTTON._SECONDARY"
          :key="button.key"
          @click="button.onClick"
        >
          <component :is="button.Component" />
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { mdiLogout } from '@mdi/js';
import { computed, defineComponent, h } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseIcon from '@/components/ui/BaseIcon';
import { ROUTE_NAMES } from '@/router';
import BaseButton from '@/components/ui/BaseButton';
import ClientOnly from '@/components/ClientOnly.vue';
import { SITE_TITLE } from '@/constants/siteTitle';
import { useLocaleInfo } from '@/composables/useLocaleInfo';
import { i18n } from '@/i18n';
import { useL10n } from '@/composables/useL10n';
import { useCookies } from '@vueuse/integrations/useCookies';
import { useRouter } from 'vue-router';
import { pick } from '@etonee123x/shared/utils/pick';
import { useLoadingSources } from '@/plugins/loadingSources';
import { useAuthContext } from '@/contexts/auth';
import { BUTTON } from '@/helpers/ui';

const { localizeRoute } = useL10n();

const IconLogout = defineComponent({
  // Не хочу, мне и так нравится
  // eslint-disable-next-line unicorn/consistent-function-scoping
  setup: () => () => h(BaseIcon, { path: mdiLogout }),
});

const Language = defineComponent({
  // Не хочу, мне и так нравится
  // eslint-disable-next-line unicorn/consistent-function-scoping
  setup: () => () => h('div', localeInfo.value.locale),
});

const router = useRouter();

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      content: 'Контент',
      blog: 'Блог',
      changeLanguage: 'Сменить язык',
      logout: 'Логаут',
    },
    en: {
      content: 'Content',
      blog: 'Blog',
      changeLanguage: 'Change language',
      logout: 'Logout',
    },
  },
});

const loadingSources = useLoadingSources();

const authContext = useAuthContext();

const links = computed(() => [
  {
    text: t('content'),
    to: localizeRoute({
      name: ROUTE_NAMES.EXPLORER,
    }),
    key: 'content',
  },
  {
    text: t('blog'),
    to: localizeRoute({
      name: ROUTE_NAMES.BLOG,
    }),
    key: 'blog',
  },
]);

const cookies = useCookies(['language']);

const localeInfo = useLocaleInfo();

const buttons = computed(() => [
  ...(authContext.isAdmin.value
    ? [
        {
          key: 'logout',
          Component: IconLogout,
          ariaLabel: t('logout'),
          onClick: authContext.deleteAuth.execute,
        },
      ]
    : []),
  {
    key: 'changeLanguage',
    Component: Language,
    ariaLabel: t('changeLanguage'),
    onClick: () => {
      const newLanguage = localeInfo.value.locale === 'ru' ? 'en' : 'ru';

      i18n.global.locale.value = newLanguage;
      cookies.set('language', newLanguage, { path: '/', maxAge: 365 * 24 * 60 * 60 * 1000 });

      router.replace(
        localizeRoute({
          ...pick(router.currentRoute.value, ['name', 'query', 'hash']),
          params: {
            ...router.currentRoute.value.params,
            language: newLanguage,
          },
        }),
      );
    },
  },
]);
</script>
