import { useContext } from 'react';
import { IsAdminContext } from './is-admin-context';
import { throwError } from '@/shared/utils/throw-error';

export const useIsAdminContext = () => {
  return useContext(IsAdminContext) ?? throwError();
};
