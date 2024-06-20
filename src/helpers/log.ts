import { bold, green, red, white, yellow } from '../lib/picocolors';

export type Level = 'error' | 'warn' | 'info';
export type LevelWithSilent = 'silent' | Level;

export interface LogOptions {
  /**
   * Level of logging
   * @default 'event'
   */
  logLevel?: LevelWithSilent;
}

export const prefixes = {
  error: red(bold('⨯')),
  warn: yellow(bold('⚠')),
  info: white(bold(' ')),
  event: green(bold('✓')),
} as const satisfies Record<Level | string, string>;

export const prefixLevels = {
  silent: Infinity,
  error: 40,
  warn: 30,
  info: 20,
  event: 10,
} as const satisfies Record<keyof typeof prefixes | 'silent', number>;

const suffix = '(next-runtime-env)';

const LOGGING_METHOD = {
  log: 'log',
  warn: 'warn',
  error: 'error',
} as const;

function prefixedLog(
  prefixType: keyof typeof prefixes,
  message: string,
  options?: LogOptions,
) {
  const { logLevel = 'event' } = options || {};

  if (prefixLevels[prefixType] < prefixLevels[logLevel]) {
    return;
  }

  const consoleMethod: keyof typeof LOGGING_METHOD =
    prefixType in LOGGING_METHOD
      ? LOGGING_METHOD[prefixType as keyof typeof LOGGING_METHOD]
      : 'log';

  const prefix = prefixes[prefixType];

  // eslint-disable-next-line no-console
  console[consoleMethod](` ${prefix}`, message, suffix);
}

export function error(message: string, options?: LogOptions) {
  prefixedLog('error', message, options);
}

export function warn(message: string, options?: LogOptions) {
  prefixedLog('warn', message, options);
}

export function info(message: string, options?: LogOptions) {
  prefixedLog('info', message, options);
}

export function event(message: string, options?: LogOptions) {
  prefixedLog('event', message, options);
}
