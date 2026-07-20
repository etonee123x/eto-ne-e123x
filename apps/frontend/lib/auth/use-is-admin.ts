import { useContext } from 'react';
import { IsAdminContext } from './is-admin-context';

export const useIsAdmin = () => {
  return useContext(IsAdminContext);
};
