import { cookies } from 'next/headers';
import { isNil } from '@/lib/utils/is-nil';

const parseJwtPayload = (jwt: string): unknown => {
  const [, payload] = jwt.split('.', 2);

  if (!payload) {
    return undefined;
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
};

export const getIsAdmin = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;

  if (isNil(jwt)) {
    return false;
  }

  try {
    const payload = parseJwtPayload(jwt);

    return typeof payload === 'object' && payload !== null && 'isAdmin' in payload && payload.isAdmin === true;
  } catch {
    return false;
  }
};
