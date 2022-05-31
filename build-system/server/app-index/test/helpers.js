const posthtml = require('posthtml');

function getElementChildren(content) {
  return content?.filter?.((node) => typeof node !== 'string') || [];
}

async function posthtmlGetTextContent(document, matcher) {
  let textContent;

  await posthtml([
    (tree) => {
      tree.match(matcher, (node) => {
        if (node.content) {
          textContent = node.content.join('');
        }
        return node;
      });
      return tree;
    },
  ]).process(document);

  return textContent;
}

module.exports = {
  getElementChildren,
  posthtmlGetTextContent,
};
