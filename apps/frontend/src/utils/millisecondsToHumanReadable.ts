import { Temporal } from 'temporal-polyfill';

export const millisecondsToHumanReadable = (milliseconds: number): string => {
  const { minutes, seconds } = Temporal.Duration.from({
    milliseconds: Math.ceil(milliseconds),
  }).round({
    largestUnit: 'minute',
    smallestUnit: 'second',
  });

  return [
    //
    minutes,
    String(seconds).padStart(2, '0'),
  ].join(':');
};
