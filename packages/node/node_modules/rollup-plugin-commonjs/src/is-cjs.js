const isCjsPromises = Object.create(null);

export function getIsCjsPromise(id) {
	let isCjsPromise = isCjsPromises[id];
	if (isCjsPromise) return isCjsPromise.promise;

	const promise = new Promise(resolve => {
		isCjsPromises[id] = isCjsPromise = {
			resolve,
			promise: undefined
		};
	});
	isCjsPromise.promise = promise;

	return promise;
}

export function setIsCjsPromise(id, promise) {
	const isCjsPromise = isCjsPromises[id];
	if (isCjsPromise) {
		if (isCjsPromise.resolve) {
			isCjsPromise.resolve(promise);
			isCjsPromise.resolve = undefined;
		}
	} else {
		isCjsPromises[id] = { promise, resolve: undefined };
	}
}
