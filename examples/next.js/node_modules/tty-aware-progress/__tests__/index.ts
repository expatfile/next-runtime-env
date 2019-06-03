import createProgress from '../src';
const stream = require('test-console').stderr;

describe('Test progress output', () => {
  test('TTY false (CI env), 1000 tasks', async () => {
    const count = 1000;
    const inspect = stream.inspect({ isTTY: false });
    const progress = createProgress(count);

    for (var x = 0; x < count; x++) {
      await new Promise(yay => setTimeout(yay, 0));
      progress();
    }
    inspect.restore();
    expect(inspect.output.length).toBe(100);
    inspect.output.forEach((output: string, i: number) =>
      expect(output.indexOf(`${i + 1}%`) !== -1).toBe(true)
    );
  });
  test('TTY false (CI env), 100 tasks', async () => {
    const count = 10;
    const inspect = stream.inspect({ isTTY: false });
    const progress = createProgress(count);

    for (var x = 0; x < count; x++) {
      await new Promise(yay => setTimeout(yay, 0));
      progress();
    }
    inspect.restore();
    expect(inspect.output.length).toBe(10);
    inspect.output.forEach((output: string, i: number) =>
      expect(output.indexOf(`${(i + 1) * 10}%`) !== -1).toBe(true)
    );
  });
  test('TTY true (normal work)', async () => {
    const count = 10;
    const inspect = stream.inspect({ isTTY: true });
    const progress = createProgress(count);

    for (var x = 0; x < count; x++) {
      await new Promise(yay => setTimeout(yay, 0));
      progress();
    }
    inspect.restore();
    expect(inspect.output.indexOf('\u001b[1G') !== -1).toBe(true);
    expect(inspect.output.indexOf('\u001b[0K') !== -1).toBe(true);
  });
});
