"use strict";

module.exports = function({ types: t }) {
  return {
    visitor: {
      Program(path, state) {
        const id = path.scope.generateUidIdentifier('uid')
        const constNumDecl = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(id.name),
            t.numericLiteral(42)
          )
        ]);
        const exported = t.identifier(id.name);
        const local = exported;
        path.pushContainer('body', [
          t.exportNamedDeclaration(constNumDecl, [
            t.exportSpecifier(local, exported)])
        ])
      }
    }
  };
};
