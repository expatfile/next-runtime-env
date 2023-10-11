import { bold, green, red, white, yellow } from '../lib/picocolors';

export const prefixes = {
  error: red(bold('⨯')),
  warn: yellow(bold('⚠')),
  info: white(bold(' ')),
  event: green(bold('✓')),
} as const;

const suffix = '(next-runtime-env)';

const LOGGING_METHOD = {
  log: 'log',
  warn: 'warn',
  error: 'error',
} as const;

function prefixedLog(prefixType: keyof typeof prefixes, message: string) {
  const consoleMethod: keyof typeof LOGGING_METHOD =
    prefixType in LOGGING_METHOD
      ? LOGGING_METHOD[prefixType as keyof typeof LOGGING_METHOD]
      : 'log';

  const prefix = prefixes[prefixType];

  // eslint-disable-next-line no-console
  console[consoleMethod](` ${prefix}`, message, suffix);
}

export function error(message: string) {
  prefixedLog('error', message);
}

export function warn(message: string) {
  prefixedLog('warn', message);
}

export function info(message: string) {
  prefixedLog('info', message);
}

export function event(message: string) {
  prefixedLog('event', message);
}
