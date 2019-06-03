# hastscript

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**hast**][hast] utility to create [*trees*][tree] in HTML or SVG.

Similar to [hyperscript][] (and [`virtual-hyperscript`][virtual-hyperscript])
but for [**hast**][hast].

## Install

[npm][]:

```sh
npm install hastscript
```

## Usage

```js
var h = require('hastscript')
var s = require('hastscript/svg')

// Children as an array:
console.log(
  h('.foo#some-id', [
    h('span', 'some text'),
    h('input', {type: 'text', value: 'foo'}),
    h('a.alpha', {class: 'bravo charlie', download: 'download'}, [
      'delta',
      'echo'
    ])
  ])
)

// Children as arguments:
console.log(
  h(
    'form',
    {method: 'POST'},
    h('input', {type: 'text', name: 'foo'}),
    h('input', {type: 'text', name: 'bar'}),
    h('input', {type: 'submit', value: 'send'})
  )
)

// SVG:
console.log(
  s('svg', {xmlns: 'http://www.w3.org/2000/svg', viewbox: '0 0 500 500'}, [
    s('title', 'SVG `<circle>` element'),
    s('circle', {cx: 120, cy: 120, r: 100})
  ])
)
```

Yields:

```js
{
  type: 'element',
  tagName: 'div',
  properties: {className: ['foo'], id: 'some-id'},
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: {},
      children: [{type: 'text', value: 'some text'}]
    },
    {
      type: 'element',
      tagName: 'input',
      properties: {type: 'text', value: 'foo'},
      children: []
    },
    {
      type: 'element',
      tagName: 'a',
      properties: {className: ['alpha', 'bravo', 'charlie'], download: true},
      children: [{type: 'text', value: 'delta'}, {type: 'text', value: 'echo'}]
    }
  ]
}
{
  type: 'element',
  tagName: 'form',
  properties: {method: 'POST'},
  children: [
    {
      type: 'element',
      tagName: 'input',
      properties: {type: 'text', name: 'foo'},
      children: []
    },
    {
      type: 'element',
      tagName: 'input',
      properties: {type: 'text', name: 'bar'},
      children: []
    },
    {
      type: 'element',
      tagName: 'input',
      properties: {type: 'submit', value: 'send'},
      children: []
    }
  ]
}
{
  type: 'element',
  tagName: 'svg',
  properties: {xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 500 500'},
  children: [
    {
      type: 'element',
      tagName: 'title',
      properties: {},
      children: [{type: 'text', value: 'SVG `<circle>` element'}]
    },
    {
      type: 'element',
      tagName: 'circle',
      properties: {cx: 120, cy: 120, r: 100},
      children: []
    }
  ]
}
```

## API

### `h(selector?[, properties][, ...children])`

### `s(selector?[, properties][, ...children])`

DSL to create virtual [**hast**][hast] [*trees*][tree] for HTML or SVG.

##### Parameters

###### `selector`

Simple CSS selector (`string`, optional).
Can contain a tag name (`foo`), IDs (`#bar`), and classes (`.baz`).
If there is no tag name in the selector, `h` defaults to a `div` element,
and `s` to a `g` element.

###### `properties`

Map of properties (`Object.<*>`, optional).

###### `children`

(Lists of) child nodes (`string`, `Node`, `Array.<string|Node>`, optional).
When strings are encountered, they are mapped to [`text`][text] nodes.

##### Returns

[`Element`][element].

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/syntax-tree/hastscript.svg

[build]: https://travis-ci.org/syntax-tree/hastscript

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/hastscript.svg

[coverage]: https://codecov.io/github/syntax-tree/hastscript

[downloads-badge]: https://img.shields.io/npm/dm/hastscript.svg

[downloads]: https://www.npmjs.com/package/hastscript

[size-badge]: https://img.shields.io/bundlephobia/minzip/hastscript.svg

[size]: https://bundlephobia.com/result?p=hastscript

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/syntax-tree

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/master/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/master/support.md

[coc]: https://github.com/syntax-tree/.github/blob/master/code-of-conduct.md

[virtual-hyperscript]: https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript

[hyperscript]: https://github.com/dominictarr/hyperscript

[tree]: https://github.com/syntax-tree/unist#tree

[hast]: https://github.com/syntax-tree/hast

[element]: https://github.com/syntax-tree/hast#element

[text]: https://github.com/syntax-tree/hast#text
