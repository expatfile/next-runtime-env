import fs from 'fs';

import { writeBrowserEnv } from './write-browser-env';

const infoSpy = jest.spyOn(console, 'info');

const base = fs.realpathSync(process.cwd());
const path = `${base}/public`;
const file = `${path}/__ENV.js`;

beforeAll(() => {
  infoSpy.mockImplementation();

  fs.mkdirSync(path);
});

afterAll(() => {
  infoSpy.mockRestore();

  fs.rmdirSync(path);
});

describe('writeBrowserEnv', () => {
  afterEach(() => {
    fs.rmSync(file);
  });

  it('should write an empty env', () => {
    writeBrowserEnv({});

    expect(infoSpy).toHaveBeenCalledWith(
      'next-runtime-env: Writing browser runtime env',
      file
    );

    const content = fs.readFileSync(file).toString();

    expect(content).toEqual('window.__ENV = {};');
  });

  it('should write and env with a value', () => {
    writeBrowserEnv({
      NEXT_PUBLIC_FOO: 'foo',
    });

    expect(infoSpy).toHaveBeenCalledWith(
      'next-runtime-env: Writing browser runtime env',
      file
    );

    const content = fs.readFileSync(file).toString();

    expect(content).toEqual('window.__ENV = {"NEXT_PUBLIC_FOO":"foo"};');
  });

  it('should write and env with multiple values', () => {
    writeBrowserEnv({
      NEXT_PUBLIC_FOO: 'foo',
      NEXT_PUBLIC_BAR: 'bar',
      NEXT_PUBLIC_BAZ: 'baz',
    });

    expect(infoSpy).toHaveBeenCalledWith(
      'next-runtime-env: Writing browser runtime env',
      file
    );

    const content = fs.readFileSync(file).toString();

    expect(content).toEqual(
      'window.__ENV = {"NEXT_PUBLIC_FOO":"foo","NEXT_PUBLIC_BAR":"bar","NEXT_PUBLIC_BAZ":"baz"};'
    );
  });
});
