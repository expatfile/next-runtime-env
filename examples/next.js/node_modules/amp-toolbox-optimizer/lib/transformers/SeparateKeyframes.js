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

const css = require('css');
const log = require('../log').tag('SeparateKeyframes');
const stringifyOptions = {indent: 0, compress: true};
const allowedKeyframeProps = new Set([
  'animation-timing-function',
  'offset-distance',
  'opacity',
  'visibility',
  'transform',
  '-webkit-transform',
  '-moz-transform',
  '-o-transform',
  '-ms-transform',
]);

const logInvalid = (name, property) => {
  log.warn(`Found invalid keyframe property '${
    property}' in '${name}' not moving to style[amp-keyframes]`);
};
/**
 * SeparateKeyframes - moves keyframes, media, and support from amp-custom
 * to amp-keyframes.
 */
class SeparateKeyframes {
  transform(tree) {
    const html = tree.root.firstChildByTag('html');
    if (!html) return;
    const head = html.firstChildByTag('head');
    if (!head) return;
    const body = html.firstChildByTag('body') || head;
    let stylesCustomTag;
    let stylesKeyframesTag;

    // Get style[amp-custom] and remove style[amp-keyframes]
    head.children = head.children.filter((tag) => {
      if (tag.tagName !== 'style') return true;

      if (!stylesKeyframesTag && tag.hasAttribute('amp-keyframes')) {
        stylesKeyframesTag = tag;
        return false;
      }
      if (!stylesCustomTag && tag.hasAttribute('amp-custom')) {
        stylesCustomTag = tag;
      }
      return true;
    });

    // If no custom styles, there's nothing to do
    if (!stylesCustomTag) return;
    let stylesText = stylesCustomTag.children[0];

    if (!stylesText || !stylesText.data) return;
    stylesText = stylesText.data;

    const cssTree = css.parse(stylesText);
    const keyframesTree = {
      type: 'stylesheet',
      stylesheet: {
        rules: [],
      },
    };

    const isInvalidKeyframe = (keyframe) => {
      let invalidProperty;
      for (const frame of keyframe.keyframes) {
        for (const declaration of frame.declarations) {
          if (!allowedKeyframeProps.has(declaration.property)) {
            invalidProperty = declaration.property;
            break;
          }
        }
        if (invalidProperty) break;
      }
      return invalidProperty;
    };

    cssTree.stylesheet.rules = cssTree.stylesheet.rules.filter((rule) => {
      if (rule.type === 'keyframes') {
        // We can't move a keyframe with an invalid property
        // or else the style[amp-keyframes] is invalid
        const invalidProperty = isInvalidKeyframe(rule);
        if (invalidProperty) {
          logInvalid(rule.name, invalidProperty);
          return true;
        }
        keyframesTree.stylesheet.rules.push(rule);
        return false;
      }
      // if rule has any keyframes duplicate rule and move just
      // the keyframes
      if (rule.type === 'media' || rule.type === 'supports') {
        const copiedRule = Object.assign({}, rule, {rules: []});
        rule.rules = rule.rules.filter((rule) => {
          if (rule.type !== 'keyframes') return true;
          const invalidProperty = isInvalidKeyframe(rule);
          if (invalidProperty) {
            logInvalid(rule.name, invalidProperty);
            return true;
          }
          copiedRule.rules.push(rule);
        });
        if (copiedRule.rules.length) {
          keyframesTree.stylesheet.rules.push(copiedRule);
        }
        // if no remaining rules remove it
        return rule.rules.length;
      }
      return true;
    });

    // if no rules moved nothing to do
    if (!keyframesTree.stylesheet.rules.length) return;

    if (!stylesKeyframesTag) {
      // Check body for keyframes tag, removing it if found
      body.children = body.children.filter((tag) => {
        if (tag.tagName === 'style' && tag.hasAttribute('amp-keyframes')) {
          stylesKeyframesTag = tag;
          return false;
        }
        return true;
      });

      if (!stylesKeyframesTag) {
        stylesKeyframesTag = tree.createElement('style', {'amp-keyframes': ''});
      }
    }
    // Insert keyframes styles to Node
    const keyframesTextNode = stylesKeyframesTag.children[0];
    const currentKeyframesTree = css.parse(
        keyframesTextNode && keyframesTextNode.data || ''
    );
    currentKeyframesTree.stylesheet.rules = (
      keyframesTree.stylesheet.rules.concat(
          currentKeyframesTree.stylesheet.rules
      )
    );
    const keyframesText = css.stringify(currentKeyframesTree, stringifyOptions);

    if (!keyframesTextNode) {
      stylesKeyframesTag.insertText(keyframesText);
    } else {
      keyframesTextNode.data = keyframesText;
    }

    // Add keyframes tag to end of body
    body.children.push(stylesKeyframesTag);
    // Update stylesCustomTag with filtered styles
    stylesCustomTag.children[0].data = css.stringify(cssTree, stringifyOptions);
  }
}

module.exports = SeparateKeyframes;
