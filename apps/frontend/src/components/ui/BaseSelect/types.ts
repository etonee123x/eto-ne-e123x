import type { Nil } from '@etonee123x/shared/types';

export interface Props<Option, ModelValueSingle>
  extends Partial<{
    errorMessage: string;
    multiple: boolean;
    disabled: boolean;
    isLoading: boolean;
    readonly: boolean;
    placeholder: HTMLInputElement['placeholder'];
    label: string;
    optionToText: (option: Option) => string;
    optionToModelValue: (option: Option) => ModelValueSingle;
    selectedToText: (optionOrOptions: Option | Array<Option> | Nil) => string;
    isOptionSelected: (option: Option) => boolean;
    i18n: Record<'nothingFound', string | undefined>;
  }> {
  options: Array<Option>;
  compareFunction: (optionValue: ModelValueSingle, modelValueSingle: ModelValueSingle) => boolean;
}
