import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useIntlRelativeTimeFormat } from './useIntlRelativeTimeFormat';
import type { Nil } from '@etonee123x/shared/types';
import { isNil } from '@etonee123x/shared/utils/isNil';

export const useIntlRelativeTimeFormatHumanReadable = <Since extends number | Nil>(_since: MaybeRefOrGetter<Since>) => {
  type Return = Since extends number ? string : null;

  const intlRelativeTimeFormat = useIntlRelativeTimeFormat(...([, { numeric: 'auto' }] as const));

  return computed(() => {
    const sinceValue = toValue(_since);

    if (isNil(sinceValue)) {
      return null as Return;
    }

    const since = Math.ceil(sinceValue);

    const sign = Math.sign(since);
    const sinceAbsolute = Math.abs(since);

    const hours = Math.floor(sinceAbsolute / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    return (
      days >= 1
        ? intlRelativeTimeFormat.value.format(days * sign, 'day')
        : intlRelativeTimeFormat.value.format(hours * sign, 'hour')
    ) as Return;
  });
};
