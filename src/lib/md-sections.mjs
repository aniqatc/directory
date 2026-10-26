// Sätteri hast plugin. Wraps each `## Heading` in a project file, plus everything up to the next one, in
//   <section class="sec" data-sec="heading-slug"><h2 class="label">Heading</h2><div>…</div></section>
// so detail pages get the label-left section layout straight from Markdown. Links to other sites in the notes
// (a CodePen, a repo, a day's notes on GitHub) open in a new tab, like the Live and Code links do.

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const isExternalLink = (node) =>
  node.tagName === 'a' &&
  /^https?:\/\//.test(String(node.properties.href ?? '')) &&
  !/^https?:\/\/(www\.)?aniqa\.dev(\/|$)/.test(String(node.properties.href));

// copy a node read from the tree into a plain object Sätteri can write back
const plain = (n) => {
  if (n.type === 'element') {
    const properties = { ...n.properties };
    if (isExternalLink(n)) {
      properties.target = '_blank';
      properties.rel = ['noopener'];
    }
    return {
      type: 'element',
      tagName: n.tagName,
      properties,
      children: n.children.map(plain),
    };
  }
  return { type: n.type, value: n.value };
};

/** @type {import('@astrojs/markdown-satteri').SatteriProcessorOptions['hastPlugins'][number]} */
export const sections = {
  name: 'sections',
  after(root, ctx) {
    const out = [];
    let body = null;
    for (const child of root.children) {
      const node = plain(child);
      if (node.type === 'element' && node.tagName === 'h2') {
        node.properties.className = ['label'];
        body = { type: 'element', tagName: 'div', properties: {}, children: [] };
        out.push({
          type: 'element',
          tagName: 'section',
          properties: { className: ['sec'], dataSec: slugify(ctx.textContent(child)) },
          children: [node, body],
        });
      } else if (body) {
        body.children.push(node);
      } else {
        out.push(node);
      }
    }
    ctx.replaceNode(root, { type: 'root', children: out });
  },
};
