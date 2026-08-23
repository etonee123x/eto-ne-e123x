import type { PropsWithChildren } from 'react';
import { IsAdminContext } from './is-admin-context';
import { getIsAdmin } from '../api/get-is-admin';

export const IsAdminProvider = async ({ children }: PropsWithChildren) => {
  const isAdmin = await getIsAdmin();

  return <IsAdminContext value={{ isAdmin }}>{children}</IsAdminContext>;
};
