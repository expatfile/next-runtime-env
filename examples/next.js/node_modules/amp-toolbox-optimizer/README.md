# AMP Optimizer

[![npm version](https://badge.fury.io/js/amp-toolbox-optimizer.svg)](https://badge.fury.io/js/amp-toolbox-optimizer)

AMP Optimizer - the performance optimizations of the AMP Cache on your own site.

![AMP Optimizer in Action](https://user-images.githubusercontent.com/380472/36001450-96cfbce2-0d26-11e8-8b65-4ffc3182d57c.gif)

First Render - 3.0 seconds vs 4.8 seconds (37% faster) <br>
Visually Complete - 3.7 seconds vs 6.4 seconds (42% faster) <br>

www.ampproject.org

## Introduction

AMP Optimizer optimizes AMPHTML files by: 

* Server-side rendering AMP layouts.
* Removing the AMP boilerplate.
* Pre-loading the AMP `v0.js` runtime to benefit from H2 push.
* Versioning AMP runtime and extension imports.
* Inlining critical CSS.

You can find the currently supported transformations [here](lib/transformers).

**Warning: optimized AMPs will no longer be valid AMPHTML. Don't use this to optimize AMPs meant for being used by platforms such as Google Search.**

## Table of Contents

- [Introduction](#introduction)
- [Background](#background)
- [Usage](#usage)
  - [Options](#options)
  - [Versioned AMP Runtime](##versioned-amp-runtime)
- [Example](#example)
- [Best Practices](#best-practices)
  - [Transform AMP pages at build time if possible](#transform-amp-pages-at-build-time-if-possible)
  - [Cache transformed AMPs](#cache-transformed-amps)
- [Why is it faster?](#why-is-it-faster)
- [Caveats](#caveats)
- [Version History](#version-history)

## Background

The [Google AMP Cache](https://developers.google.com/amp/cache/overview#cache-optimizations-and-modifications) performs additional optimizations to make AMP pages load even faster. You can find out more about these optimizations [here](https://github.com/ampproject/amphtml/issues/7022) and [here](https://github.com/ampproject/amphtml/issues/8566). This project provides a Node.js based implementation of the same set of transformations performed by the Google AMP Cache. This serves two goals:

* Enable faster loading times for canonical AMP sites.
* Provide a reference implementation for other AMP caches.

## Usage

Install via:

```
npm install amp-toolbox-optimizer
```

Minimal usage:

```js
const ampOptimizer = require('amp-toolbox-optimizer');

// Transformer expects a string (streams are not supported)
const originalHtml = `
<!doctype html>
<html ⚡>
...
`

// Additional options can be passed as the second argument
ampOptimizer.transformHtml(originalHtml, {
  ampUrl: 'canonical.amp.html'
}).then(optimizedHtml => {
  console.log(optimizedHtml);
});

```

You can find a sample implementation [here](demo/simple/). If you're using the express middleware in your backend, it's best to use the [AMP Optimizer Middleware](../optimizer-express).

### Options

Currently the following options are supported:

* **ampUrl**: an URL string pointing to the valid AMP version. Required by the AddAmpLink transformer.
* **blurredPlaceholders**: enables blurry image placeholder generation. Default is `false`. This transforms requires install `jimp` and `lru-cache`: `npm install jimp lru-cache` **Important:** blurry image placeholder computation is expensive. Make sure to only use it for static or cached pages.
* **imageBasePath**: a base URL or path required for resolving an image file from a given image `src` attribute. Used by for blurry image placeholder generation.
* **maxBlurredPlaceholders**: specifies the max number of blurred images. Defaults to 5.
* **ampRuntimeVersion** specifies a [specific version](https://github.com/ampproject/amp-toolbox/tree/master/runtime-version") of the AMP runtime. For example: `ampRuntimeVersion: "001515617716922"` will result in AMP runtime URLs being re-written from:

  ```
  https://cdn.ampproject.org/v0.js
  ```

  to:

  ```
  https://cdn.ampproject.org/rtv/001515617716922/v0.js
  ```
* **ampUrlPrefix (experimental)**: specifies an URL prefix for AMP runtime
  URLs. For example: ```ampUrlPrefix: "/amp"` will result in AMP runtime
  URLs being re-written from:

  ```
  https://cdn.ampproject.org/v0.js
  ```

  to:

  ```
  /amp/v0.js
  ```

### Versioned AMP Runtime

The `ampRuntimeVersion` parameter will rewrite all AMP runtime and extension imports to the specified version. For example: 

```
https://cdn.ampproject.org/v0.js
```

will be replaced with:

```
https://cdn.ampproject.org/rtv/001515617716922/v0.js
```

Versioning the AMP runtime URLs has two benefits:

1. Better usage of the brower cache: versioned AMP runtime URLs are served with a longer max-age than the unversioned ones.
2. Critical CSS can be inlined. The AMP runtime defines it's [own CSS styles](https://cdn.ampproject.org/v0.css) for AMP layouts and other things. Versioning the AMP runtime makes it possible to inline these styles, which greatly improving time to FCP as it ensures that inlined styles and imported runtime are compatible.

**Important:** when using versioned AMP runtime URLs make sure to invalidate all caches whenever a new AMP runtime is released. This is to ensure that your AMP pages always use the latest version of the AMP runtime.  

You can use [amp-toolbox-runtime-version](../amp-toolbox-runtime-version) to retrieve the latest version of the AMP runtime. Here is a sample to apply the optimizations including versioning the URLs:

```
const ampOptimiser = require('amp-toolbox-optimizer');

// retrieve the latest runtime version
const runtimeVersion = require('amp-toolbox-runtime-version');

// retrieve the latest version
const ampRuntimeVersion = await runtimeVersion.currentVersion();

// The input string
const originalHtml = `
<!doctype html>
<html ⚡>
...
`

// Additional options can be passed as the second argument
const optimizedHtml = await ampOptimizer.transformHtml(originalHtml, {
  ampUrl: 'canonical.amp.html',
  ampRuntimeVersion: ampRuntimeVersion
});

console.log(optimizedHtml);
```

## Example

The following valid AMPHTML:

```html
<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <link rel="canonical" href="canonical.html" />
  <meta name="viewport" content="width=device-width,minimum-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-experiment" src="https://cdn.ampproject.org/v0/amp-experiment-0.1.js"></script>
  <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
  <style amp-custom>
    h1 {
      margin: 16px;
    }
  </style>
</head>
<body>
  <h1>Hello, AMP world!</h1>
  <amp-img width=360 heigh=200 layout=responsive src=image.png></amp-img>
</body>
</html>
```

Will be transformed to:

```html
<!DOCTYPE html>
<html i-amphtml-layout="" i-amphtml-no-boilerplate="">
<head>
  <style amp-runtime=""></style>
  <link rel="stylesheet" href="https://cdn.ampproject.org/v0.css">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1">
  <script async="" src="https://cdn.ampproject.org/v0.js"></script>
  <script async="" custom-element="amp-experiment" src="https://cdn.ampproject.org/v0/amp-experiment-0.1.js"></script>
  <script async="" custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
  <style amp-custom="">
    h1 {
      margin: 16px;
    }
  </style>
  <link rel="canonical" href="canonical.html">
  <link rel="amphtml" href="canonical.amp.html">
</head>
<body>
  <h1>Hello, AMP world!</h1>
  <amp-img width="360" heigh="200" layout="responsive" src="image.png" class="i-amphtml-layout-responsive i-amphtml-layout-size-defined" i-amphtml-layout="responsive"></amp-img>
</body>
</html>
```

A few notable changes are:

* The AMP attribute in the `html` tag gets removed as it's no longer valid AMP.
* The AMP boilerplate gets removed. Instead the `v0.css` is added.
* AMP layout classes are added to the `amp-img` extension.
* `<link rel="amphtml" href="canonical.amp.html">` gets added linking to the valid AMP version.

## Best Practices

### Debugging

Enable `verbose` mode to find out why the AMP boilerplate is not being removed.

```
// globally
ampOptimizer.setConfig({
  verbose: true
});
ampOptimizer.transformHtml(originalHtml, {
  ampUrl: 'canonical.amp.html'
})

// per transformation
ampOptimizer.transformHtml(originalHtml, {
  ampUrl: 'canonical.amp.html',
  verbose: true
})
```

### Transform AMP pages at build time if possible

Applying the transformations to an AMP file consumes additional server
resources. Also, since the entire file is needed to apply the transformations,
it also becomes impossible to stream the response while applying it.

In order to avoid server overhead, if the set of AMP files to be transformed is
known in advance, transformations should be run at build time.

### Cache transformed AMPs

Most websites have a more dynamic nature though and are not able to apply the
transformations statically. For such cases it is possible to run the
transformations after AMP pages are rendered, e.g. in an Express middleware.

To achieve best performance, those transformations shouldn't be applied for
every request. Instead, transformations should only be applied the *first time*
a page is requested, and the results then cached. Caching can happen on the CDN
level, on the site's internal infrastructure (eg: Memcached), or even on the
server itself, if the set of pages is small enough to fit in memory.

## Why is it faster?

In order to avoid Flash of Unstyled Content (FOUC) and reflows resulting from to the
usage of web-components, AMP requires websites to add the amp-boilerplate in the header.

The amp-boilerplate renders the page invisible by changing it's opacity, while
the fonts and the AMP Runtime load. Once the AMP runtime is loaded, it is able
to correctly set the sizes of the custom elements and once that happens, the
runtimes makes the page visible again.

As a consequence, the first render of the page doesn't happen until the AMP
Runtime is loaded.

To improve this, AMP server-side rendering applies the same rules as the
AMP Runtime on the server. This ensures that the reflow will not happen  and
the AMP boilerplate is no longer needed. The first render no longer depends on the
AMP Runtime being loaded, which improves load times.

## Caveats

It's important to note that, even though the text content and layout will show
faster, content that depends on the custom AMP elements (eg: any element in
the page that starts with 'amp-') will only be visible after the AMP Runtime
is loaded.

