import chalk from 'chalk';

const libraryName = '[next-runtime-env]';

const prefixes = {
  warn: `- ${chalk.yellow(`warn`)} ${libraryName}`,
  event: `- ${chalk.magenta(`event`)} ${libraryName}`,
  ready: `- ${chalk.green(`ready`)} ${libraryName}`,
};

export function warn(message: string) {
  // eslint-disable-next-line no-console
  console.warn(`${prefixes.warn} ${message}`);
}

export function event(message: string) {
  // eslint-disable-next-line no-console
  console.info(`${prefixes.event} ${message}`);
}

export function ready(message: string) {
  // eslint-disable-next-line no-console
  console.info(`${prefixes.ready} ${message}`);
}
