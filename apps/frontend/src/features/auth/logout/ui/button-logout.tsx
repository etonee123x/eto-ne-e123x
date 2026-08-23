'use client';

import { Button } from '@/shared/ui/ds/button';
import { useRouter } from '@/i18n/navigation';
import { client } from '@/shared/api/client';
import { LogOut } from 'lucide-react';

export const ButtonLogout = () => {
  const router = useRouter();

  const onClick = async () => {
    await client['/auth'].DELETE();
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        onClick();
      }}
    >
      <LogOut />
    </Button>
  );
};
