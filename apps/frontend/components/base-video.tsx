import { cn } from '@/lib/utils/cn';
import { PlayCircle } from 'lucide-react';

export const BaseVideo = ({ className, ...props }: React.ComponentProps<'video'>) => {
  return (
    <div className={cn('flex justify-center items-center max-w-full relative', className)}>
      <video className="max-w-full" {...props} />
      <PlayCircle className="absolute text-primary-500 size-1/3 pointer-events-none" />
    </div>
  );
};
