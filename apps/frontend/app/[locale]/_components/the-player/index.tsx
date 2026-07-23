'use client';

import { useContext } from 'react';
import { PlayerContext } from './player-context';
import { throwError } from '@/lib/utils/throw-error';

export const ThePlayer = () => {
  const playerContext = useContext(PlayerContext) ?? throwError();

  if (!playerContext.track) {
    return null;
  }

  return (
    <section>
      <pre>{JSON.stringify(playerContext, null, 2)}</pre>
    </section>
  );
};
