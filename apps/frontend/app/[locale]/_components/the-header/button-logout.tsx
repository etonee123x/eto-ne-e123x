'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { client } from '@/lib/api/client';
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
