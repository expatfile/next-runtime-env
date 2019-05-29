import { extname, resolve } from 'path';
import { sync as nodeResolveSync } from 'resolve';
import { createFilter } from 'rollup-pluginutils';
import { EXTERNAL_PREFIX, HELPERS, HELPERS_ID, PROXY_PREFIX } from './helpers.js';
import { getIsCjsPromise, setIsCjsPromise } from './is-cjs';
import { getResolveId } from './resolve-id';
import { checkEsModule, hasCjsKeywords, transformCommonjs } from './transform.js';
import { getName } from './utils.js';

export default function commonjs(options = {}) {
	const extensions = options.extensions || ['.js'];
	const filter = createFilter(options.include, options.exclude);
	const ignoreGlobal = options.ignoreGlobal;

	const customNamedExports = {};
	if (options.namedExports) {
		Object.keys(options.namedExports).forEach(id => {
			let resolvedId;

			try {
				resolvedId = nodeResolveSync(id, { basedir: process.cwd() });
			} catch (err) {
				resolvedId = resolve(id);
			}

			customNamedExports[resolvedId] = options.namedExports[id];
		});
	}

	const esModulesWithoutDefaultExport = Object.create(null);
	const esModulesWithDefaultExport = Object.create(null);
	const allowDynamicRequire = !!options.ignore; // TODO maybe this should be configurable?

	const ignoreRequire =
		typeof options.ignore === 'function'
			? options.ignore
			: Array.isArray(options.ignore)
				? id => options.ignore.includes(id)
				: () => false;

	let entryModuleIdsPromise = null;

	const resolveId = getResolveId(extensions);

	const sourceMap = options.sourceMap !== false;

	return {
		name: 'commonjs',

		options(options) {
			resolveId.setRollupOptions(options);
			const input = options.input || options.entry;
			const entryModules = Array.isArray(input)
				? input
				: typeof input === 'object' && input !== null
					? Object.values(input)
					: [input];
			entryModuleIdsPromise = Promise.all(entryModules.map(entry => resolveId(entry)));
		},

		resolveId,

		load(id) {
			if (id === HELPERS_ID) return HELPERS;

			// generate proxy modules
			if (id.startsWith(EXTERNAL_PREFIX)) {
				const actualId = id.slice(EXTERNAL_PREFIX.length);
				const name = getName(actualId);

				return `import ${name} from ${JSON.stringify(actualId)}; export default ${name};`;
			}

			if (id.startsWith(PROXY_PREFIX)) {
				const actualId = id.slice(PROXY_PREFIX.length);
				const name = getName(actualId);

				return getIsCjsPromise(actualId).then(isCjs => {
					if (isCjs)
						return `import { __moduleExports } from ${JSON.stringify(
							actualId
						)}; export default __moduleExports;`;
					else if (esModulesWithoutDefaultExport[actualId])
						return `import * as ${name} from ${JSON.stringify(actualId)}; export default ${name};`;
					else if (esModulesWithDefaultExport[actualId]) {
						return `export {default} from ${JSON.stringify(actualId)};`;
					} else
						return `import * as ${name} from ${JSON.stringify(
							actualId
						)}; import {getCjsExportFromNamespace} from "${HELPERS_ID}"; export default getCjsExportFromNamespace(${name})`;
				});
			}
		},

		transform(code, id) {
			if (!filter(id) || extensions.indexOf(extname(id)) === -1) {
				setIsCjsPromise(id, Promise.resolve(null));
				return null;
			}

			const transformPromise = entryModuleIdsPromise
				.then(entryModuleIds => {
					const { isEsModule, hasDefaultExport, ast } = checkEsModule(this.parse, code, id);
					if (isEsModule) {
						(hasDefaultExport ? esModulesWithDefaultExport : esModulesWithoutDefaultExport)[
							id
						] = true;
						return null;
					}

					// it is not an ES module but it does not have CJS-specific elements.
					if (!hasCjsKeywords(code, ignoreGlobal)) {
						esModulesWithoutDefaultExport[id] = true;
						return null;
					}

					const transformed = transformCommonjs(
						this.parse,
						code,
						id,
						entryModuleIds.indexOf(id) !== -1,
						ignoreGlobal,
						ignoreRequire,
						customNamedExports[id],
						sourceMap,
						allowDynamicRequire,
						ast
					);
					if (!transformed) {
						esModulesWithoutDefaultExport[id] = true;
						return null;
					}

					return transformed;
				})
				.catch(err => {
					this.error(err, err.loc);
				});

			setIsCjsPromise(id, transformPromise.then(Boolean, () => false));
			return transformPromise;
		}
	};
}
