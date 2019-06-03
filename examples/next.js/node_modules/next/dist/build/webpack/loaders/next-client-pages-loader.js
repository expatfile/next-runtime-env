"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = __importDefault(require("loader-utils"));
const nextClientPagesLoader = function () {
    const { absolutePagePath, page } = loader_utils_1.default.getOptions(this);
    const stringifiedAbsolutePagePath = JSON.stringify(absolutePagePath);
    const stringifiedPage = JSON.stringify(page);
    return `
    (window.__NEXT_P=window.__NEXT_P||[]).push([${stringifiedPage}, function() {
      var page = require(${stringifiedAbsolutePagePath})
      if(module.hot) {
        module.hot.accept(${stringifiedAbsolutePagePath}, function() {
          if(!next.router.components[${stringifiedPage}]) return
          var updatedPage = require(${stringifiedAbsolutePagePath})
          next.router.update(${stringifiedPage}, updatedPage.default || updatedPage)
        })
      }
      return { page: page.default || page }
    }]);
  `;
};
exports.default = nextClientPagesLoader;
