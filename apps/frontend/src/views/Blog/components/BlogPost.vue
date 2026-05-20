<template>
  <article class="post" :class="route.params.postId === post._meta.id && 'post_selected'" :aria-label="t('post')">
    <LazyFormPost v-if="isInEditMode" class="p-4 flex flex-col" :post ref="formPost" @submit="onSubmit" />
    <div v-else class="p-4 flex flex-col gap-4">
      <BaseHtml v-if="content" lang="ru" :html="content" />
      <PostDataAttachment v-for="(attachment, index) in post.attachments" :attachment :index :key="index" />
      <RouterLink
        :to="{
          name: ROUTE_NAMES.BLOG_POST,
          params: {
            postId: props.post._meta.id,
          },
        }"
        class="self-end hover:underline text-sm flex items-center gap-0.5 text-neutral-600 dark:text-neutral-400"
      >
        <time
          :datetime="new Date(props.post._meta.createdAt).toISOString()"
          :title="createdAtUpdatedAt"
          class="contents"
        >
          {{ sinceCreatedHumanReadable }}
          <BaseIcon v-if="post._meta.updatedAt !== post._meta.createdAt" :path="mdiPencil" />
        </time>
      </RouterLink>
    </div>
    <div v-if="authContext.isAdmin" class="flex justify-end border-t border-t-primary-500 p-1 gap-2">
      <component :is="Button" v-for="Button in Buttons" :key="Button.key" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { mdiCheck, mdiClose, mdiDelete, mdiPencil } from '@mdi/js';
import { computed, nextTick, defineAsyncComponent, useTemplateRef, h, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseIcon from '@/components/ui/BaseIcon.vue';
import type { Props as PropsBaseIcon } from '@/components/ui/BaseIcon.vue';
import { ROUTE_NAMES } from '@/plugins/router';
import { useRoute } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useIntlRelativeTimeFormatHumanReadable } from '@/composables/useIntlRelativeTimeFormatHumanReadable';
import { useAuthContext } from '@/contexts/auth';
import { useBlogContext } from '../contexts/blog';
import { isNil } from '@etonee123x/shared/utils/isNil';
import type { components } from '@/types/openapi';
import { pick } from '@etonee123x/shared/utils/pick';
import { parseContent } from '@/utils/parseContent';
import BaseHtml from '@/components/ui/BaseHtml.vue';
import PostDataAttachment from './PostDataAttachment.vue';

const LazyFormPost = defineAsyncComponent(() => {
  return import('./FormPost.vue');
});

const props = defineProps<{
  post: components['schemas']['PostResponse'];
  onBeforeDelete: () => Promise<boolean>;
  isInEditMode: boolean;
}>();

const emit = defineEmits<{
  changeEditModeFor: [components['schemas']['PostResponse']['_meta']['id'] | null];
}>();

const content = computed(() => {
  return parseContent(props.post.text);
});

const formPost = useTemplateRef<InstanceType<typeof LazyFormPost>>('formPost');

const route = useRoute();

const blogContext = useBlogContext();

const authContext = reactive(useAuthContext());

const { t } = useI18n({
  useScope: 'local',
  messages: {
    ru: {
      createdAt: 'Создано в { at }',
      updatedAt: 'Изменено в { at }',
      confirmDelete: 'Удалить пост',
      deleteMessage: 'Вы уверены, что хотите удалить этот пост?',
      post: 'Пост',
    },
    en: {
      createdAt: 'Created at { at }',
      updatedAt: 'Edited at { at }',
      confirmDelete: 'Delete Post',
      deleteMessage: 'Are you sure you want to delete this post?',
      post: 'Post',
    },
  },
});

const onSubmit: InstanceType<typeof LazyFormPost>['onSubmit'] = async (post, files) => {
  blogContext.patchPostByIdMutation.mutateAsync({
    params: {
      path: {
        id: props.post._meta.id,
      },
    },
    body: {
      ...pick(post, ['attachments', 'text']),
      files: [],
    },
    bodySerializer: (body) => {
      const formData = new FormData();

      formData.append('text', body.text);
      formData.append(`attachments`, JSON.stringify(body.attachments));

      files.forEach((file) => {
        formData.append('files', file);
      });

      return formData;
    },
  });

  closeEditMode();
};

const sinceCreatedHumanReadable = useIntlRelativeTimeFormatHumanReadable(() => {
  return props.post._meta.createdAt - Date.now();
});

const createdAtUpdatedAt = computed(() => {
  return [
    t('createdAt', { at: new Date(props.post._meta.createdAt).toISOString() }),
    ...(isNil(props.post._meta.updatedAt)
      ? []
      : [t('updatedAt', { at: new Date(props.post._meta.updatedAt).toISOString() })]),
  ].join('\n');
});

const closeEditMode = () => {
  emit('changeEditModeFor', null);
};

const ButtonIcon = (path: PropsBaseIcon['path']) => {
  return h(BaseIcon, { path, class: 'text-2xl' });
};

const ButtonSave = computed(() => {
  return h(
    BaseButton,
    {
      key: 'save',
      disabled: !formPost.value?.isValid,
      isLoading: blogContext.patchPostByIdMutation.isPending,
      onClick: () => {
        return formPost.value?.form?.requestSubmit();
      },
    },
    () => {
      return ButtonIcon(mdiCheck);
    },
  );
});

const ButtonCancel = computed(() => {
  return h(
    BaseButton,
    {
      key: 'cancel',
      onClick: closeEditMode,
    },
    () => {
      return ButtonIcon(mdiClose);
    },
  );
});

const ButtonEdit = computed(() => {
  return h(
    BaseButton,
    {
      key: 'edit',
      isLoading: blogContext.patchPostByIdMutation.isPending,
      onClick: () => {
        emit('changeEditModeFor', props.post._meta.id);

        nextTick(() => {
          return formPost.value?.focusTextarea();
        });
      },
    },
    () => {
      return ButtonIcon(mdiPencil);
    },
  );
});

const ButtonDelete = computed(() => {
  return h(
    BaseButton,
    {
      key: 'delete',
      isLoading: blogContext.deletePostByIdMutation.isPending,
      onClick: async () => {
        if (!(await props.onBeforeDelete())) {
          return;
        }

        return blogContext.deletePostByIdMutation.mutateAsync({
          params: {
            path: {
              id: props.post._meta.id,
            },
          },
        });
      },
    },
    () => {
      return ButtonIcon(mdiDelete);
    },
  );
});

const Buttons = computed(() => {
  return props.isInEditMode
    ? [
        //
        ButtonSave.value,
        ButtonCancel.value,
      ]
    : [
        //
        ButtonEdit.value,
        ButtonDelete.value,
      ];
});
</script>
