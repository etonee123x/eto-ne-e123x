import { client } from '@/api/_client';

export const postAuth = (jwt?: string) =>
  client
    .raw<undefined>(`/auth`, { method: 'POST', query: { jwt } }) //
    .then((r) => r.headers.getSetCookie());

export const deleteAuth = () => client<undefined>(`/auth`, { method: 'DELETE' });
