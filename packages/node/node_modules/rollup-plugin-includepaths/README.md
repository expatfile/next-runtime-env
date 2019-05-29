# rollup-plugin-includepaths

Let you use relative paths in your import directives, like this:

```js
// from src/lib/one/foo.js
import { Foo } from 'one/foo';

// from src/other/two/bar.js
import { Bar } from 'two/bar';

```

## Setup

In your rollup configuration file:

```js

import includePaths from 'rollup-plugin-includepaths';

let includePathOptions = {
    include: {},
    paths: ['src/lib', 'src/other'],
    external: [],
    extensions: ['.js', '.json', '.html']
};

export default {
    entry: './app.js',
    format: 'cjs',
    dest: 'public/app.min.js',
    plugins: [ includePaths(includePathOptions) ],
};

```

## Options:

### paths = `['']`

An array of source paths in your project where the plugin should look for files

Example: `['src/lib', 'src/foo']`

By default, resolve files from working dir

### include

A map of module=>path/to/file.js with custom module paths. Used to override the search with a static path (like Browserify does with the "browser" config).

Use this option if you want to skip the file resolution and directly resolve a module name to a given path.

Example:

```js
include: {
    // Import example: import angular from 'angular';
    'angular': 'bower_components/angular/angular.js'
}
```

### external

An array of module names that should be excluded from the bundle (external modules).

By default, all the node built-in modules will be marked as external.

To include the built-ins, you can use the [builtins](https://github.com/calvinmetcalf/rollup-plugin-node-builtins) plugin and set this config to an empty array.

Example:

```js
// will not include the module 'angular' in the final bundle
external: ['angular']
```


### extensions

An array of file extensions to look for in the project.

Default: `['.js', '.json']`
