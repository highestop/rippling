import babel from '@babel/core';
import type { PluginObj } from '@babel/core';
import template from '@babel/template';
import { isAtom } from './utils';
import type { PluginOptions } from './utils';

const buildGlobalAtomCache = template(`
  globalThis.ripplingAtomCache = globalThis.ripplingAtomCache || {
    cache: new Map(),
    get(name, inst) { 
      if (this.cache.has(name)) {
        return this.cache.get(name)
      }
      this.cache.set(name, inst)
      return inst
    },
  }
`);
const buildExport = template(`export default globalThis.ripplingAtomCache.get(%%atomKey%%, %%atom%%)`);
const buildAtomDeclaration = template(
  `const %%atomIdentifier%% = globalThis.ripplingAtomCache.get(%%atomKey%%, %%atom%%)`,
);

export default function reactRefreshPlugin({ types: t }: typeof babel, options?: PluginOptions): PluginObj {
  return {
    pre({ opts }) {
      if (!opts.filename) {
        throw new Error('Filename must be available');
      }
    },
    visitor: {
      Program: {
        exit(path: babel.NodePath<babel.types.Program>) {
          const ripplingAtomCache = buildGlobalAtomCache();
          path.unshiftContainer('body', ripplingAtomCache);
        },
      },
      ExportDefaultDeclaration(
        nodePath: babel.NodePath<babel.types.ExportDefaultDeclaration>,
        state: babel.PluginPass,
      ) {
        const { node } = nodePath;
        if (t.isCallExpression(node.declaration) && isAtom(t, node.declaration.callee, options?.customAtomNames)) {
          const filename = state.filename ?? 'unknown';
          const atomKey = `${filename}/defaultExport`;

          const ast = buildExport({
            atomKey: t.stringLiteral(atomKey),
            atom: node.declaration,
          });
          nodePath.replaceWith(ast as babel.Node);
        }
      },
      VariableDeclarator(nodePath: babel.NodePath<babel.types.VariableDeclarator>, state: babel.PluginPass) {
        if (
          t.isIdentifier(nodePath.node.id) &&
          t.isCallExpression(nodePath.node.init) &&
          isAtom(t, nodePath.node.init.callee, options?.customAtomNames) &&
          // Make sure atom declaration is in module scope
          (nodePath.parentPath.parentPath?.isProgram() || nodePath.parentPath.parentPath?.isExportNamedDeclaration())
        ) {
          const filename = state.filename ?? 'unknown';
          const atomKey = `${filename}/${nodePath.node.id.name}`;

          const ast = buildAtomDeclaration({
            atomIdentifier: t.identifier(nodePath.node.id.name),
            atomKey: t.stringLiteral(atomKey),
            atom: nodePath.node.init,
          });
          nodePath.parentPath.replaceWith(ast as babel.Node);
        }
      },
    },
  };
}
