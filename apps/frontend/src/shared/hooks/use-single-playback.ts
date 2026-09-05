import { useBroadcastChannel, useEventListener } from '@reactuses/core';
import { useRef } from 'react';

type Id = string & { _type?: 'PlayerId' };

type SinglePlaybackEvent = CustomEvent<Id>;

const EVENT_NAME = 'single-playback';

export const useSinglePlayback = ({ onOtherPlayback }: { onOtherPlayback: () => void }) => {
  const id = useRef(crypto.randomUUID() as Id);

  const { channel, post } = useBroadcastChannel<Id, Id>({ name: 'single-playback' });

  const playback = () => {
    const event: SinglePlaybackEvent = new CustomEvent(EVENT_NAME, { detail: id.current });

    globalThis.dispatchEvent(event);
    post(id.current);
  };

  const onPlaybackEvent = (event: SinglePlaybackEvent) => {
    if (event.detail === id.current) {
      return;
    }

    onOtherPlayback();
  };

  useEventListener(EVENT_NAME, onPlaybackEvent);
  useEventListener<SinglePlaybackEvent>('message', onPlaybackEvent, channel);

  return {
    playback,
  };
};
