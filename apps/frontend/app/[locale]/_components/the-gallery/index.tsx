'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGalleryContext } from './gallery-context';
import { ComponentProps } from 'react';

export const TheGallery = () => {
  const { media, setMedia, onClose } = useGalleryContext();

  const onOpenChange: ComponentProps<typeof Dialog>['onOpenChange'] = (isOpen) => {
    if (isOpen) {
      return;
    }

    setMedia(null);
    onClose.current();
  };

  return (
    <Dialog open={Boolean(media)} onOpenChange={onOpenChange}>
      <DialogContent>
        <pre>{JSON.stringify(media, null, 2)}</pre>
      </DialogContent>
    </Dialog>
  );
};
