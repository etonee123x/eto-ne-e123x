import amber from './variants/amber.json';
import blue from './variants/blue.json';
import cyan from './variants/cyan.json';
import emerald from './variants/emerald.json';
import fuchsia from './variants/fuchsia.json';
import green from './variants/green.json';
import indigo from './variants/indigo.json';
import lime from './variants/lime.json';
import neutral from './variants/neutral.json';
import orange from './variants/orange.json';
import pink from './variants/pink.json';
import purple from './variants/purple.json';
import red from './variants/red.json';
import rose from './variants/rose.json';
import sky from './variants/sky.json';
import teal from './variants/teal.json';
import violet from './variants/violet.json';
import yellow from './variants/yellow.json';
import { throwError } from '@/shared/utils/throw-error';

const themes = [
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

export const getRandomColorTheme = () => {
  return themes[Math.floor(Date.now() % themes.length)] ?? throwError();
};
