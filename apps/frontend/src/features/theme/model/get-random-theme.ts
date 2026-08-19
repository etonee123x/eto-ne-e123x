import amber from './themes/amber.json';
import blue from './themes/blue.json';
import cyan from './themes/cyan.json';
import emerald from './themes/emerald.json';
import fuchsia from './themes/fuchsia.json';
import green from './themes/green.json';
import indigo from './themes/indigo.json';
import lime from './themes/lime.json';
import neutral from './themes/neutral.json';
import orange from './themes/orange.json';
import pink from './themes/pink.json';
import purple from './themes/purple.json';
import red from './themes/red.json';
import rose from './themes/rose.json';
import sky from './themes/sky.json';
import teal from './themes/teal.json';
import violet from './themes/violet.json';
import yellow from './themes/yellow.json';
import { throwError } from '@/shared/utils/throw-error';

export interface Theme {
  name: string;
  light: string;
  dark: string;
}

const themes: Array<Theme> = [
  amber,
  blue,
  cyan,
  emerald,
  fuchsia,
  green,
  indigo,
  lime,
  neutral,
  orange,
  pink,
  purple,
  red,
  rose,
  sky,
  teal,
  violet,
  yellow,
];

export const getRandomTheme = (): Theme => {
  // Non-cryptographic pick of a color theme, not security-sensitive.
  // eslint-disable-next-line sonarjs/pseudo-random
  return themes[Math.floor(Math.random() * themes.length)] ?? throwError();
};
