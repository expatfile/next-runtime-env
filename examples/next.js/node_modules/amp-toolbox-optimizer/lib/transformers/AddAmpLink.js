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

/**
 * AddAmpLink - adds a reference to the valid AMP
 * version of this document.
 *
 * This transformer supports the following parameter(s):
 *
 * * `ampUrl`: specifying an URL pointing to the valid AMP version of this document.
 */
class AddAmpLink {
  transform(tree, params) {
    if (!params.ampUrl) return; // no AMP URL configured

    const html = tree.root.firstChildByTag('html');
    if (!html) return;
    const head = html.firstChildByTag('head');
    if (!head) return;

    const ampLink = tree.createElement('link', {
      rel: 'amphtml',
      href: params.ampUrl,
    });

    head.appendChild(ampLink);
  }
}

module.exports = AddAmpLink;
