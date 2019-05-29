import { statSync } from 'fs';
import { dirname, resolve, sep } from 'path';
import defaultResolver from './default-resolver';
import { EXTERNAL_PREFIX, PROXY_PREFIX } from './helpers';
import { first } from './utils';

function getCandidatesForExtension(resolved, extension) {
	return [resolved + extension, resolved + `${sep}index${extension}`];
}

function getCandidates(resolved, extensions) {
	return extensions.reduce(
		(paths, extension) => paths.concat(getCandidatesForExtension(resolved, extension)),
		[resolved]
	);
}

export function getResolveId(extensions) {
	let resolveUsingOtherResolvers;

	function resolveId(importee, importer) {
		const isProxyModule = importee.startsWith(PROXY_PREFIX);
		if (isProxyModule) {
			importee = importee.slice(PROXY_PREFIX.length);
		} else if (importee.startsWith('\0')) {
			return importee;
		}

		if (importer && importer.startsWith(PROXY_PREFIX)) {
			importer = importer.slice(PROXY_PREFIX.length);
		}

		return resolveUsingOtherResolvers.call(this, importee, importer).then(resolved => {
			if (resolved) return isProxyModule ? PROXY_PREFIX + resolved : resolved;

			resolved = defaultResolver(importee, importer);

			if (isProxyModule) {
				if (resolved) return PROXY_PREFIX + resolved;
				return EXTERNAL_PREFIX + importee; // external
			}

			return resolved;
		});
	}

	resolveId.setRollupOptions = function(options) {
		const resolvers = (options.plugins || [])
			.map(plugin => {
				if (plugin.resolveId === resolveId) {
					// substitute CommonJS resolution logic
					return (importee, importer) => {
						if (importee[0] !== '.' || !importer) return; // not our problem

						const resolved = resolve(dirname(importer), importee);
						const candidates = getCandidates(resolved, extensions);

						for (let i = 0; i < candidates.length; i += 1) {
							try {
								const stats = statSync(candidates[i]);
								if (stats.isFile()) return candidates[i];
							} catch (err) {
								/* noop */
							}
						}
					};
				}

				return plugin.resolveId;
			})
			.filter(Boolean);

		const isExternal = id =>
			options.external
				? Array.isArray(options.external)
					? options.external.includes(id)
					: options.external(id)
				: false;

		resolvers.unshift(id => (isExternal(id) ? false : null));

		resolveUsingOtherResolvers = first(resolvers);
	};

	return resolveId;
}
