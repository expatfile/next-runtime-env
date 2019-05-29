import externalToFn from './external-to-fn';

describe('#externalToFn', () => {
  describe('when passed a function', () => {
    it('returns the same function', () => {
      const fn = () => true;
      expect(externalToFn(fn)).toBe(fn);
    });
  });

  describe('when passed an array of module names', () => {
    it('returns a predicate returning true if passed one of the module names', () => {
      const modules = ['lodash', 'lodash-es'];
      const fn = externalToFn(modules);

      expect(fn('lodash')).toBe(true);
      expect(fn('lodash-')).toBe(false);
      expect(fn('lodash-es')).toBe(true);
      expect(fn('lodash/map')).toBe(false);
    });
  });

  describe('when passed anything but a function or array', () => {
    it('throws an error', () => {
      expect(() => externalToFn('string')).toThrow();
    });
  });
});
