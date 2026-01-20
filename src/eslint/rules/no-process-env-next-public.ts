/* eslint-disable import/no-unresolved */
import type { TSESLint } from '@typescript-eslint/utils';
import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/utils';
/* eslint-enable import/no-unresolved */

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/expatfile/next-runtime-env/blob/main/docs/eslint/${name}.md`,
);

type MessageIds =
  | 'useEnvFunction'
  | 'useEnvFunctionComputed'
  | 'useEnvFunctionDestructuring'
  | 'useEnvFunctionDynamic';

export const noProcessEnvNextPublic = createRule<[], MessageIds>({
  name: 'no-process-env-next-public',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow direct access to process.env.NEXT_PUBLIC_* variables',
    },
    fixable: 'code',
    hasSuggestions: false,
    messages: {
      useEnvFunction:
        'Use env("{{varName}}") from next-runtime-env instead of process.env.{{varName}}',
      useEnvFunctionComputed:
        'Use env("{{varName}}") from next-runtime-env instead of process.env["{{varName}}"]',
      useEnvFunctionDestructuring:
        'Destructuring NEXT_PUBLIC_* from process.env is not recommended. Use env("{{varName}}") instead.',
      useEnvFunctionDynamic:
        'Dynamic access to process.env with NEXT_PUBLIC_* variables should use env() from next-runtime-env',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const { sourceCode } = context;

    function isProcessEnv(node: TSESTree.MemberExpression): boolean {
      return (
        node.object.type === AST_NODE_TYPES.MemberExpression &&
        node.object.object.type === AST_NODE_TYPES.Identifier &&
        node.object.object.name === 'process' &&
        node.object.property.type === AST_NODE_TYPES.Identifier &&
        node.object.property.name === 'env'
      );
    }

    function isNextPublicVar(name: string): boolean {
      return name.startsWith('NEXT_PUBLIC_');
    }

    function hasEnvImport(): TSESTree.ImportDeclaration | null {
      const program = sourceCode.ast;
      const importNode = program.body.find(
        (n): n is TSESTree.ImportDeclaration =>
          n.type === AST_NODE_TYPES.ImportDeclaration &&
          n.source.value === 'next-runtime-env',
      );
      return importNode ?? null;
    }

    function hasEnvSpecifier(
      importDecl: TSESTree.ImportDeclaration,
    ): TSESTree.ImportSpecifier | null {
      const envSpecifier = importDecl.specifiers.find(
        (specifier): specifier is TSESTree.ImportSpecifier =>
          specifier.type === AST_NODE_TYPES.ImportSpecifier &&
          specifier.imported.type === AST_NODE_TYPES.Identifier &&
          specifier.imported.name === 'env',
      );
      return envSpecifier ?? null;
    }

    function createFix(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.MemberExpression,
      varName: string,
    ): TSESLint.RuleFix[] {
      const fixes: TSESLint.RuleFix[] = [];
      const existingImport = hasEnvImport();

      if (!existingImport) {
        fixes.push(
          fixer.insertTextBefore(
            sourceCode.ast.body[0],
            "import { env } from 'next-runtime-env';\n",
          ),
        );
      } else if (!hasEnvSpecifier(existingImport)) {
        const lastSpecifier =
          existingImport.specifiers[existingImport.specifiers.length - 1];
        if (lastSpecifier) {
          fixes.push(fixer.insertTextAfter(lastSpecifier, ', env'));
        }
      }

      fixes.push(fixer.replaceText(node, `env("${varName}")`));

      return fixes;
    }

    return {
      MemberExpression(node) {
        if (!isProcessEnv(node)) {
          return;
        }

        if (
          !node.computed &&
          node.property.type === AST_NODE_TYPES.Identifier
        ) {
          const varName = node.property.name;
          if (isNextPublicVar(varName)) {
            context.report({
              node,
              messageId: 'useEnvFunction',
              data: { varName },
              fix(fixer) {
                return createFix(fixer, node, varName);
              },
            });
          }
        } else if (
          node.computed &&
          node.property.type === AST_NODE_TYPES.Literal &&
          typeof node.property.value === 'string'
        ) {
          const varName = node.property.value;
          if (isNextPublicVar(varName)) {
            context.report({
              node,
              messageId: 'useEnvFunctionComputed',
              data: { varName },
              fix(fixer) {
                return createFix(fixer, node, varName);
              },
            });
          }
        } else if (node.computed) {
          const text = sourceCode.getText(node.property);
          if (text.includes('NEXT_PUBLIC_')) {
            context.report({
              node,
              messageId: 'useEnvFunctionDynamic',
            });
          }
        }
      },

      VariableDeclarator(node) {
        if (
          node.init?.type === AST_NODE_TYPES.MemberExpression &&
          node.init.object.type === AST_NODE_TYPES.Identifier &&
          node.init.object.name === 'process' &&
          node.init.property.type === AST_NODE_TYPES.Identifier &&
          node.init.property.name === 'env' &&
          node.id.type === AST_NODE_TYPES.ObjectPattern
        ) {
          node.id.properties
            .filter(
              (prop): prop is TSESTree.Property =>
                prop.type === AST_NODE_TYPES.Property &&
                prop.key.type === AST_NODE_TYPES.Identifier &&
                isNextPublicVar(prop.key.name),
            )
            .forEach((prop) => {
              context.report({
                node: prop,
                messageId: 'useEnvFunctionDestructuring',
                data: {
                  varName: (prop.key as TSESTree.Identifier).name,
                },
              });
            });
        }
      },
    };
  },
});

export default noProcessEnvNextPublic;
