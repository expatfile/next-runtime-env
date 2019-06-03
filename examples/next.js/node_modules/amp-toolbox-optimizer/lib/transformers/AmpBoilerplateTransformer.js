/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const {OneBehindFetch} = require('amp-toolbox-core');
const {AMP_CACHE_HOST, appendRuntimeVersion} = require('../AmpConstants.js');

const V0_CSS = 'v0.css';
const V0_CSS_URL = AMP_CACHE_HOST + '/' + V0_CSS;

/**
 * AmpBoilerplateTransformer - This DOM transformer adds
 * https://cdn.ampproject.org/v0.css if server-side-rendering is applied
 * (known by the presence of <style amp-runtime> tag). If a specific AMP
 * runtime version is specified, v0.css will be inlined.
 */
class AmpBoilerplateTransformer {
  constructor(config, fetch = OneBehindFetch.create()) {
    this.fetch_ = fetch;
  }

  transform(tree, params) {
    const html = tree.root.firstChildByTag('html');
    const head = html.firstChildByTag('head');
    if (!head) {
      return; // invalid doc
    }
    // amp-runtime is added by server-side-rendering
    const ampRuntimeStyle = this._findAmpRuntimeStyle(head);
    if (!ampRuntimeStyle) {
      return; // keep existing boilerplate
    }
    return this._addStaticCss(tree, ampRuntimeStyle, params);
  }

  _findAmpRuntimeStyle(head) {
    let node = head.firstChild;
    while (node) {
      if (node.hasAttribute('amp-runtime')) {
        return node;
      }
      node = node.nextSibling;
    }
    return null;
  }

  _addStaticCss(tree, node, params) {
    if (params.ampRuntimeVersion && !params.linkCss) {
      return this._inlineCss(node, params.ampRuntimeVersion)
          .catch(() => this._linkCss(tree, node));
    }
    this._linkCss(tree, node);
  }

  _linkCss(tree, node) {
    const cssStyleNode = tree.createElement('link');
    cssStyleNode.attribs = {
      rel: 'stylesheet',
      href: V0_CSS_URL,
    };
    node.parent.insertBefore(cssStyleNode, node);
  }

  _inlineCss(node, version) {
    const versionedV0CssUrl = appendRuntimeVersion(AMP_CACHE_HOST, version) + '/' + V0_CSS;
    node.attribs['i-amphtml-version'] = version;
    return this.fetch_.get(versionedV0CssUrl)
        .then((body) => node.insertText(body));
  }
}

new AmpBoilerplateTransformer();
module.exports = AmpBoilerplateTransformer;
