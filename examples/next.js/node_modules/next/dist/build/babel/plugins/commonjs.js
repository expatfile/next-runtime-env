"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_transform_modules_commonjs_1 = __importDefault(require("@babel/plugin-transform-modules-commonjs"));
// Rewrite imports using next/<something> to next-server/<something>
function NextToNextServer(...args) {
    const commonjs = plugin_transform_modules_commonjs_1.default(...args);
    return {
        visitor: {
            Program: {
                exit(path, state) {
                    let foundModuleExports = false;
                    path.traverse({
                        MemberExpression(path) {
                            if (path.node.object.name !== 'module')
                                return;
                            if (path.node.property.name !== 'exports')
                                return;
                            foundModuleExports = true;
                        }
                    });
                    if (!foundModuleExports) {
                        return;
                    }
                    commonjs.visitor.Program.exit.call(this, path, state);
                }
            }
        }
    };
}
exports.default = NextToNextServer;
