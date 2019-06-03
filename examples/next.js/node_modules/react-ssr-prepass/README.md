# react-ssr-prepass

<p>
  <a href="https://travis-ci.org/kitten/react-ssr-prepass">
    <img alt="Build Status" src="https://travis-ci.org/kitten/react-ssr-prepass.svg?branch=master" />
  </a>
  <a href="https://coveralls.io/github/kitten/react-ssr-prepass?branch=master">
    <img alt="Test Coverage" src="https://coveralls.io/repos/github/kitten/react-ssr-prepass/badge.svg?branch=master" />
  </a>
  <a href="https://npmjs.com/package/react-ssr-prepass">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/react-ssr-prepass.svg" />
  </a>
</p>

<p>
  <code>react-dom/server</code> does not have support for suspense yet.<br />
  <code>react-ssr-prepass</code> offers suspense on the server-side today, until it does. ✨
</p>

`react-ssr-prepass` is a **partial server-side React renderer** that does a prepass
on a React element tree and suspends when it finds thrown promises. It also
accepts a visitor function that can be used to suspend on anything.

You can use it to fetch data before your SSR code calls `renderToString` or
`renderToNodeStream`.

> ⚠️ **Note:** Suspense is unstable and experimental. This library purely
> exists since `react-dom/server` does not support data fetching or suspense
> yet. This two-pass approach should just be used until server-side suspense
> support lands in React.

## The Why & How

It's quite common to have some data that needs to be fetched before
server-side rendering and often it's inconvenient to specifically call
out to random fetch calls to get some data. Instead **Suspense**
offers a practical way to automatically fetch some required data,
but is currently only supported in client-side React.

`react-ssr-prepass` offers a solution by being a "prepass" function
that walks a React element tree and executing suspense. It finds all
thrown promises (a custom visitor can also be provided) and waits for
those promises to resolve before continuing to walk that particular
suspended subtree. Hence, it attempts to offer a practical way to
use suspense and complex data fetching logic today.

A two-pass React render is already quite common for in other libraries
that do implement data fetching. This has however become quite impractical.
While it was trivial to previously implement a primitive React renderer,
these days a lot more moving parts are involved to make such a renderer
correct and stable. This is why some implementations now simply rely
on calling `renderToStaticMarkup` repeatedly.

`react-ssr-prepass` on the other hand is a custom implementation
of a React renderer. It attempts to stay true and correct to the
React implementation by:

- Mirroring some of the implementation of `ReactPartialRenderer`
- Leaning on React elements' symbols from `react-is`
- Providing only the simplest support for suspense

## Quick Start Guide

First install `react-ssr-prepass` alongside `react` and `react-dom`:

```sh
yarn add react-ssr-prepass
# or
npm install --save react-ssr-prepass
```

In your SSR code you may now add it in front of your usual `renderToString`
or `renderToNodeStream` code:

```js
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import ssrPrepass from 'react-ssr-prepass'

const renderApp = async App => {
  const element = createElement(App)
  await ssrPrepass(element)

  return renderToString(element)
}
```

Additionally you can also pass a "visitor function" as your second argument.
This function is called for every React class or function element that is
encountered.

```js
ssrPrepass(<App />, (element, instance) => {
  if (element.type === SomeData) {
    return fetchData()
  } else if (instance && instance.fetchData) {
    return instance.fetchData()
  }
})
```

The first argument of the visitor is the React element. The second is
the instance of a class component or undefined. When you return
a promise from this function `react-ssr-prepass` will suspend before
rendering this element.

You should be aware that `react-ssr-prepass` does not handle any
data rehydration. In most cases it's fine to collect data from your cache
or store after running `ssrPrepass`, turn it into JSON, and send it
down in your HTML result.

## Examples & Recipes

### Usage with `react-apollo`

Instead of using `react-apollo`'s own `getDataFromTree` function, `react-ssr-prepass`
can be used instead. For this to work, we will have to write a visitor function
that knows how to suspend on `react-apollo`'s `Query` component.

Luckily this is quite simple, since all we need to do is call the `fetchData`
method on the `Query` component's instance.

```js
ssrPrepass(<App />, (_element, instance) => {
  if (instance !== undefined && typeof instance.fetchData === 'function') {
    return instance.fetchData()
  }
})
```

Since we're now calling `fetchData` when it exists, which returns a `Promise`
already, `ssrPrepass` will suspend on `<Query>` components.

[More information can be found in Apollo's own docs](https://www.apollographql.com/docs/react/features/server-side-rendering.html#getDataFromTree)

## Prior Art

This library is (luckily) not a reimplementation from scratch of
React's server-side rendering. Instead it's mostly based on
React's own server-side rendering logic that resides in its
[`ReactPartialRenderer`](https://github.com/facebook/react/blob/13645d2/packages/react-dom/src/server/ReactPartialRenderer.js).

The approach of doing an initial "data fetching pass" is inspired by:

- [`react-apollo`'s `getDataFromTree`](https://github.com/apollographql/react-apollo/blob/master/src/getDataFromTree.ts)
- [`react-tree-walker`](https://github.com/ctrlplusb/react-tree-walker)
