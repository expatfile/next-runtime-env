/* eslint-disable no-console */

import chalk from 'chalk';

const libraryName = '[next-runtime-env]';
const librarySeperator = '-';
const libraryPrefix = `${libraryName} ${librarySeperator}`;

const prefixes = {
  warn: `${chalk.yellow(`warn`)}  - ${libraryPrefix}`,
  info: `${chalk.cyan(`info`)}  - ${libraryPrefix}`, // Double space before the dash aligns messages in the terminal and improves readability.
};

export function warn(message: string) {
  console.warn(`${prefixes.warn} ${message}`);
}

export function info(message: string) {
  console.info(`${prefixes.info} ${message}`);
}
