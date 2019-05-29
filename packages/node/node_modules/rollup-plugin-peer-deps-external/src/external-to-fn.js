import { isFunction } from 'lodash-es';

/**
 * Utility function mapping a Rollup config's `external` option into a function.

 * In Rollup, the `external` config option can be provided as an array or a function.
 * https://rollupjs.org/#peer-dependencies
 *
 * An `external` configuration in array format can be represented in the function
 * format, but not vice-versa. This utility accepts either format and returns the
 * function representation.
 *
 * @param {Array|Function} external The `external` property from Rollup's config.
 * @returns {Function} Function equivalent of the passed in `external`.
 */
export default function externalToFn(external) {
  if (isFunction(external)) {
    return external;
  } else if (Array.isArray(external)) {
    return id => external.some(module => module === id);
  } else {
    throw new Error(
      `rollup-plugin-peer-deps-external: 'external' option must be a function or an array.`
    );
  }
}
