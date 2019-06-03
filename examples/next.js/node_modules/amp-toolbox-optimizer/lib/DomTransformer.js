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

const path = require('path');
const treeParser = require('./TreeParser.js');
const log = require('./log.js');

/**
 * AMP Optimizer Configuration only applying AMP validity perserving transformations.
 */
const TRANSFORMATIONS_VALID_AMP = [
  // Optimizes script import order
  // needs to run after ServerSideRendering
  'ReorderHeadTransformer',
  // needs to run after ReorderHeadTransformer
  'RewriteAmpUrls',
  'GoogleFontsPreconnect',
  'PruneDuplicateResourceHints',
  'SeparateKeyframes',
];

/**
 * AMP Optimizer Configuration applying all available AMP optimizations including Server-Side_Rendering.
 */
const TRANSFORMATIONS_ALL = [
  // Adds a link to the valid AMP version
  'AddAmpLink',
  // Applies server-side-rendering optimizations
  'ServerSideRendering',
  // Removes ⚡ or 'amp' from the html tag
  'RemoveAmpAttribute',
  // Removes the boilerplate
  // needs to run after ServerSideRendering
  'AmpBoilerplateTransformer',
  // Optimizes script import order
  // needs to run after ServerSideRendering
  'ReorderHeadTransformer',
  // needs to run after ReorderHeadTransformer
  'RewriteAmpUrls',
  'GoogleFontsPreconnect',
  'PruneDuplicateResourceHints',
  'AddBlurryImagePlaceholders',
  'SeparateKeyframes',
];

const DEFAULT_CONFIG = {
  verbose: false,
  validAmp: false,
  transformers: TRANSFORMATIONS_ALL,
};


/**
 * Applies a set of transformations to a DOM tree.
 */
class DomTransformer {
  /**
   * Create a DomTransformer.
   * @param {Object} config - The config.
   * @param {Array.<Transformer>} config.transformers - a list of transformers to be applied.
   */
  constructor(config=DEFAULT_CONFIG) {
    this.setConfig(config);
    this.log_ = log;
  }

  /**
   * Transforms an html string.
   * @param {string} html - a string containing valid HTML.
   * @param {Object} params - a dictionary containing transformer specific parameters.
   */
  transformHtml(html, params) {
    const tree = treeParser.parse(html);
    return this.transformTree(tree, params)
        .then(() => treeParser.serialize(tree));
  }

  /**
   * Transforms a DOM tree.
   * @param {Tree} tree - a DOM tree.
   * @param {Object} params - a dictionary containing transformer specific parameters.
   */
  transformTree(tree, params) {
    params = params || {};
    log.verbose(params.verbose || false);
    const sequence = (promise, transformer) => {
      return promise.then(() => {
        // not all transformers return a promise
        return Promise.resolve(transformer.transform(tree, params, this.log_));
      });
    };
    return this.transformers_.reduce(sequence, Promise.resolve());
  }

  /**
   * Set the config.
   * @param {Object} config - The config.
   * @param {boolean} config.verbose - true if verbose mode should be enabled [default: false].
   * @param {boolean} config.validAmp - true if AMP pages should stay valid [default: false].
   * @param {Array.<Transformer>} config.transformers - a list of transformers to be applied [default: all available transformers].
   */
  setConfig(config) {
    log.verbose(config.verbose);
    this.initTransformers_(config);
  }

  initTransformers_(config) {
    this.transformers_ = this.getTransformersFromConfig_(config).map((Transformer) => {
      if (typeof Transformer === 'string') {
        Transformer = require(path.join(__dirname, 'transformers', Transformer + '.js'));
      }
      return new Transformer(config);
    });
  }

  getTransformersFromConfig_(config) {
    if (config.transformers) {
      return config.transformers;
    }
    if (config.validAmp) {
      return TRANSFORMATIONS_VALID_AMP;
    }
    return TRANSFORMATIONS_ALL;
  }
}

module.exports = DomTransformer;
