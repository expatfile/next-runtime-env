"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_estree_1 = require("@typescript-eslint/typescript-estree");
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'explicit-function-return-type',
    meta: {
        type: 'problem',
        docs: {
            description: 'Require explicit return types on functions and class methods',
            category: 'Stylistic Issues',
            recommended: 'warn',
        },
        messages: {
            missingReturnType: 'Missing return type on function.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowExpressions: {
                        type: 'boolean',
                    },
                    allowTypedFunctionExpressions: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [
        {
            allowExpressions: false,
            allowTypedFunctionExpressions: false,
        },
    ],
    create(context, [options]) {
        /**
         * Checks if a node is a constructor.
         * @param node The node to check
         */
        function isConstructor(node) {
            return (node.type === typescript_estree_1.AST_NODE_TYPES.MethodDefinition &&
                node.kind === 'constructor');
        }
        /**
         * Checks if a node is a setter.
         * @param parent The node to check
         */
        function isSetter(node) {
            return (node.type === typescript_estree_1.AST_NODE_TYPES.MethodDefinition && node.kind === 'set');
        }
        /**
         * Checks if a node is a variable declarator with a type annotation.
         * @param node The node to check
         */
        function isVariableDeclaratorWithTypeAnnotation(node) {
            return (node.type === typescript_estree_1.AST_NODE_TYPES.VariableDeclarator &&
                !!node.id.typeAnnotation);
        }
        /**
         * Checks if a function declaration/expression has a return type.
         * @param node The node representing a function.
         */
        function checkFunctionReturnType(node) {
            if (options.allowExpressions &&
                node.type !== typescript_estree_1.AST_NODE_TYPES.FunctionDeclaration &&
                node.parent &&
                node.parent.type !== typescript_estree_1.AST_NODE_TYPES.VariableDeclarator &&
                node.parent.type !== typescript_estree_1.AST_NODE_TYPES.MethodDefinition) {
                return;
            }
            if (!node.returnType &&
                node.parent &&
                !isConstructor(node.parent) &&
                !isSetter(node.parent) &&
                util.isTypeScriptFile(context.getFilename())) {
                context.report({
                    node,
                    messageId: 'missingReturnType',
                });
            }
        }
        /**
         * Checks if a function declaration/expression has a return type.
         * @param {ASTNode} node The node representing a function.
         */
        function checkFunctionExpressionReturnType(node) {
            if (options.allowTypedFunctionExpressions &&
                node.parent &&
                isVariableDeclaratorWithTypeAnnotation(node.parent)) {
                return;
            }
            checkFunctionReturnType(node);
        }
        return {
            ArrowFunctionExpression: checkFunctionExpressionReturnType,
            FunctionDeclaration: checkFunctionReturnType,
            FunctionExpression: checkFunctionExpressionReturnType,
        };
    },
});
//# sourceMappingURL=explicit-function-return-type.js.map