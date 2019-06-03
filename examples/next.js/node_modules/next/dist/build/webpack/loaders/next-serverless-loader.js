"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const querystring_1 = require("querystring");
const constants_1 = require("next-server/constants");
const nextServerlessLoader = function () {
    const { distDir, absolutePagePath, page, assetPrefix, ampBindInitData, absoluteAppPath, absoluteDocumentPath, absoluteErrorPath, generateEtags, dynamicBuildId } = typeof this.query === 'string' ? querystring_1.parse(this.query.substr(1)) : this.query;
    const buildManifest = path_1.join(distDir, constants_1.BUILD_MANIFEST).replace(/\\/g, '/');
    const reactLoadableManifest = path_1.join(distDir, constants_1.REACT_LOADABLE_MANIFEST).replace(/\\/g, '/');
    return `
    import {parse} from 'url'
    import {renderToHTML} from 'next-server/dist/server/render';
    import {sendHTML} from 'next-server/dist/server/send-html';
    import buildManifest from '${buildManifest}';
    import reactLoadableManifest from '${reactLoadableManifest}';
    import Document from '${absoluteDocumentPath}';
    import Error from '${absoluteErrorPath}';
    import App from '${absoluteAppPath}';
    import Component from '${absolutePagePath}';
    async function renderReqToHTML(req, res) {
      const options = {
        App,
        Document,
        buildManifest,
        reactLoadableManifest,
        buildId: "__NEXT_REPLACE__BUILD_ID__",
        dynamicBuildId: ${dynamicBuildId === true || dynamicBuildId === 'true'},
        assetPrefix: "${assetPrefix}",
        ampBindInitData: ${ampBindInitData === true || ampBindInitData === 'true'}
      }
      const parsedUrl = parse(req.url, true)
      try {
        ${page === '/_error' ? `res.statusCode = 404` : ''}
        const result = await renderToHTML(req, res, "${page}", parsedUrl.query, Object.assign(
          {
            Component,
            dataOnly: req.headers && (req.headers.accept || '').indexOf('application/amp.bind+json') !== -1,
          }, 
          options, 
        ))
        return result
      } catch (err) {
        if (err.code === 'ENOENT') {
          res.statusCode = 404
          const result = await renderToHTML(req, res, "/_error", parsedUrl.query, Object.assign({}, options, {
            Component: Error
          }))
          return result
        } else {
          console.error(err)
          res.statusCode = 500
          const result = await renderToHTML(req, res, "/_error", parsedUrl.query, Object.assign({}, options, {
            Component: Error,
            err
          }))
          return result
        }
      }
    }
    export async function render (req, res) {
      try {
        const html = await renderReqToHTML(req, res)
        sendHTML(req, res, html, {generateEtags: ${generateEtags}})
      } catch(err) {
        console.error(err)
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    }
  `;
};
exports.default = nextServerlessLoader;
