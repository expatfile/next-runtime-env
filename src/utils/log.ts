import chalk from 'chalk';

const libraryName = '[next-runtime-env]';
const librarySeparator = '-';
const libraryPrefix = `${libraryName} ${librarySeparator}`;

const prefixes = {
  // Double space before the dash aligns messages in the terminal and improves readability.
  warn: `${chalk.yellow(`warn`)}  - ${libraryPrefix}`,
  info: `${chalk.cyan(`info`)}  - ${libraryPrefix}`,
};

export function warn(message: string) {
  // eslint-disable-next-line no-console
  console.warn(`${prefixes.warn} ${message}`);
}

export function info(message: string) {
  // eslint-disable-next-line no-console
  console.info(`${prefixes.info} ${message}`);
}
