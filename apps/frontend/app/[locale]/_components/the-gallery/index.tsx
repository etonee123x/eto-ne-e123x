'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGalleryContext } from './gallery-context';

export const TheGallery = () => {
  const { media } = useGalleryContext();
  console.log({ media });

  return (
    <Dialog open={true}>
      <div>outside</div>
      <DialogContent>inside?</DialogContent>
    </Dialog>
  );
};
