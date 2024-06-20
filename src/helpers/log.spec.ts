import { error, event, info, prefixes, warn } from './log';

const logSpy = jest.spyOn(console, 'log');
const warnSpy = jest.spyOn(console, 'warn');
const errorSpy = jest.spyOn(console, 'error');

beforeAll(() => {
  logSpy.mockImplementation();
  warnSpy.mockImplementation();
  errorSpy.mockImplementation();
});

afterAll(() => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
  errorSpy.mockRestore();
});

describe('silent', () => {
  it('should not log an event message', () => {
    error('foo', { logLevel: 'silent' });

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should respect log level', () => {
    event('foo', { logLevel: 'warn' });

    expect(logSpy).not.toHaveBeenCalled();
  });
});

describe('error', () => {
  it('should log an error message', () => {
    error('foo');

    expect(errorSpy).toHaveBeenCalledWith(
      ` ${prefixes.error}`,
      'foo',
      '(next-runtime-env)',
    );
  });
});

describe('warn', () => {
  it('should log a warning message', () => {
    warn('foo');

    expect(warnSpy).toHaveBeenCalledWith(
      ` ${prefixes.warn}`,
      'foo',
      '(next-runtime-env)',
    );
  });
});

describe('info', () => {
  it('should log an info message', () => {
    info('foo');

    expect(logSpy).toHaveBeenCalledWith(
      ` ${prefixes.info}`,
      'foo',
      '(next-runtime-env)',
    );
  });
});

describe('event', () => {
  it('should log an event message', () => {
    event('foo');

    expect(logSpy).toHaveBeenCalledWith(
      ` ${prefixes.event}`,
      'foo',
      '(next-runtime-env)',
    );
  });
});
