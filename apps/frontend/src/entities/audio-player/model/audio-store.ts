import { isClient } from '@/shared/utils/target';
import { DEFAULT_VOLUME, localStorageVolume } from './local-storage-volume';
import { noop } from '@/shared/utils/noop';

type Listener = () => void;

export class AudioStore {
  private audio: HTMLAudioElement | null = isClient ? new Audio() : null;

  private listeners = {
    currentTime: new Set<Listener>(),
    volume: new Set<Listener>(),
    isPlaying: new Set<Listener>(),
  };

  currentTime = 0;
  volume = DEFAULT_VOLUME;
  paused = true;

  private playback: () => void = noop;

  constructor({ volume, playback }: { volume: number; playback: () => void }) {
    if (!this.audio) {
      return;
    }

    this.playback = playback;

    this.audio.autoplay = true;
    this.audio.volume = volume;

    this.currentTime = this.audio.currentTime;
    this.volume = this.audio.volume;
    this.paused = this.audio.paused;

    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('volumechange', this.handleVolumeChange);

    this.audio.addEventListener('play', this.handlePlaybackChange);
    this.audio.addEventListener('pause', this.handlePlaybackChange);
    this.audio.addEventListener('ended', this.handlePlaybackChange);

    this.audio.addEventListener('play', this.playback);
  }

  private emit = (listeners: Set<Listener>) => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  private handleTimeUpdate = () => {
    if (!this.audio) {
      return;
    }

    this.currentTime = this.audio.currentTime;
    this.emit(this.listeners.currentTime);
  };

  private handleVolumeChange = () => {
    if (!this.audio) {
      return;
    }

    this.volume = this.audio.volume;
    this.emit(this.listeners.volume);
  };

  private handlePlaybackChange = () => {
    if (!this.audio) {
      return;
    }

    this.paused = this.audio.paused;
    this.emit(this.listeners.isPlaying);
  };

  subscribeCurrentTime = (listener: Listener) => {
    this.listeners.currentTime.add(listener);

    return () => {
      this.listeners.currentTime.delete(listener);
    };
  };

  subscribeVolume = (listener: Listener) => {
    this.listeners.volume.add(listener);

    return () => {
      this.listeners.volume.delete(listener);
    };
  };

  subscribeIsPlaying = (listener: Listener) => {
    this.listeners.isPlaying.add(listener);

    return () => {
      this.listeners.isPlaying.delete(listener);
    };
  };

  getSnapshotCurrentTime = () => {
    return this.currentTime;
  };
  getSnapshotVolume = () => {
    return this.volume;
  };
  getSnapshotIsPlaying = () => {
    return !this.paused;
  };

  getServerSnapshotCurrentTime = () => {
    return 0;
  };
  getServerSnapshotVolume = () => {
    return DEFAULT_VOLUME;
  };
  getServerSnapshotIsPlaying = () => {
    return false;
  };

  // ─────────────────────────────────────────────
  // Commands
  // ─────────────────────────────────────────────

  setCurrentTime = (currentTime: number) => {
    if (!this.audio) {
      return;
    }

    this.currentTime = currentTime;
    this.emit(this.listeners.currentTime);

    this.audio.currentTime = currentTime;
  };

  setVolume = (volume: number) => {
    if (!this.audio) {
      return;
    }

    this.volume = volume;
    localStorageVolume.set(volume);
    this.emit(this.listeners.volume);

    this.audio.volume = volume;
  };

  setSrc = (source: string) => {
    if (!this.audio) {
      return;
    }

    this.audio.src = source;
  };

  play = async () => {
    if (!this.audio) {
      return;
    }

    // Сразу меняем snapshot.
    this.paused = false;
    this.emit(this.listeners.isPlaying);

    try {
      await this.audio.play();
    } catch (error) {
      // autoplay / browser policy могла зарубить play()
      this.paused = true;
      this.emit(this.listeners.isPlaying);

      throw error;
    }
  };

  pause = () => {
    if (!this.audio) {
      return;
    }

    this.paused = true;
    this.emit(this.listeners.isPlaying);

    this.audio.pause();
  };

  unload = () => {
    if (!this.audio) {
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.removeAttribute('src');
    this.audio.load();

    this.currentTime = 0;
    this.paused = true;

    this.emit(this.listeners.currentTime);
    this.emit(this.listeners.isPlaying);
  };

  destroy = () => {
    if (!this.audio) {
      return;
    }

    this.audio.pause();

    this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.removeEventListener('volumechange', this.handleVolumeChange);

    this.audio.removeEventListener('play', this.handlePlaybackChange);
    this.audio.removeEventListener('pause', this.handlePlaybackChange);
    this.audio.removeEventListener('ended', this.handlePlaybackChange);

    this.audio.removeEventListener('play', this.playback);

    this.listeners.currentTime.clear();
    this.listeners.volume.clear();
    this.listeners.isPlaying.clear();

    this.audio.removeAttribute('src');
    this.audio.load();

    this.audio = null;
  };
}
