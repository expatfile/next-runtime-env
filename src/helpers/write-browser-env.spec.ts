import chalk from 'chalk';
import fs from 'fs';

import { writeBrowserEnv } from './write-browser-env';

const infoSpy = jest.spyOn(console, 'info');

const base = fs.realpathSync(process.cwd());
const path = `${base}/public`;
const file = `${path}/__ENV.js`;
const message = `- ${chalk.green(
  `ready`,
)} [next-runtime-env] wrote browser runtime environment variables to '${file}'.`;

beforeAll(() => {
  infoSpy.mockImplementation();

  fs.mkdirSync(path);
});

afterAll(() => {
  infoSpy.mockRestore();

  fs.rmSync(path, { recursive: true, force: true });
});

describe('writeBrowserEnv()', () => {
  it('should write an empty env', () => {
    writeBrowserEnv({});

    expect(infoSpy).toHaveBeenCalledWith(message);

    const content = fs.readFileSync(file).toString();

    expect(content).toEqual('window.__ENV = {};');

    fs.rmSync(file);
  });

  it('should write and env with a value', () => {
    writeBrowserEnv({
      NEXT_PUBLIC_FOO: 'foo',
    });

    expect(infoSpy).toHaveBeenCalledWith(message);

    const content = fs.readFileSync(file).toString();

    expect(content).toEqual('window.__ENV = {"NEXT_PUBLIC_FOO":"foo"};');

    fs.rmSync(file);
  });

  it('should write and env with multiple values', () => {
    writeBrowserEnv({
      NEXT_PUBLIC_FOO: 'foo',
      NEXT_PUBLIC_BAR: 'bar',
      NEXT_PUBLIC_BAZ: 'baz',
    });

    expect(infoSpy).toHaveBeenCalledWith(message);

    const content = fs.readFileSync(file).toString();

    expect(content).toEqual(
      'window.__ENV = {"NEXT_PUBLIC_FOO":"foo","NEXT_PUBLIC_BAR":"bar","NEXT_PUBLIC_BAZ":"baz"};',
    );

    fs.rmSync(file);
  });

  it('should write to a subdirectory', () => {
    const fileInSubdirectory = `${path}/subdirectory/__ENV.js`;
    const messageWithSubdirectory = `- ${chalk.green(
      `ready`,
    )} [next-runtime-env] wrote browser runtime environment variables to '${fileInSubdirectory}'.`;

    writeBrowserEnv({}, 'subdirectory/');

    expect(infoSpy).toHaveBeenCalledWith(messageWithSubdirectory);

    const content = fs.readFileSync(fileInSubdirectory).toString();

    expect(content).toEqual('window.__ENV = {};');

    fs.rmSync(fileInSubdirectory);
  });
});
