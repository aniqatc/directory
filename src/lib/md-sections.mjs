// Sätteri hast plugin: Wraps each `## Heading` in a project file, plus everything up to the next one, in a `<section>` element with appropriate classes and data attributes.

/**
 * Slugifies a string for use in section data attributes.
 * @param s The string to slugify.
 * @returns The slugified string.
 */
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Checks if a node is an external link.
 * @param node The node to check.
 * @returns True if the node is an external link, false otherwise.
 */
const isExternalLink = (node) =>
  node.tagName === 'a' &&
  /^https?:\/\//.test(String(node.properties.href ?? '')) &&
  !/^https?:\/\/(www\.)?aniqa\.dev(\/|$)/.test(String(node.properties.href));

// Creates a plain copy of a node, with external links modified to open in a new tab.
const plain = (n) => {
  if (n.type === 'element') {
    const properties = { ...n.properties };
    if (isExternalLink(n)) {
      properties.target = '_blank';
      properties.rel = ['noopener'];
    }

    // Return a plain copy of the node, with external links modified as needed.
    return {
      type: 'element',
      tagName: n.tagName,
      properties,
      children: n.children.map(plain),
    };
  }

  // Return a plain copy of a non-element node (e.g., text node).
  return { type: n.type, value: n.value };
};

/** @type {import('@astrojs/markdown-satteri').SatteriProcessorOptions['hastPlugins'][number]} */
// This plugin processes the Markdown AST to wrap each `## Heading` and its following content in a `<section>` element.
export const sections = {
  name: 'sections',
  // This hook is called after the Markdown AST has been processed
  after(root, ctx) {
    const out = [];
    let body = null;
    // Iterate over each child node of the root
    for (const child of root.children) {
      // Create a plain copy of the current child node.
      const node = plain(child);

      // If the node is an `h2` heading, start a new section.
      if (node.type === 'element' && node.tagName === 'h2') {
        // Add the 'label' class to the heading node.
        node.properties.className = ['label'];
        // Create a new body container for the section content.
        body = { type: 'element', tagName: 'div', properties: {}, children: [] };
        // Push the new section to the output array.
        out.push({
          type: 'element',
          tagName: 'section',
          properties: { className: ['sec'], dataSec: slugify(ctx.textContent(child)) },
          children: [node, body],
        });
      } else if (body) {
        // Append the current node to the body of the active section.
        body.children.push(node);
      } else {
        // If there is no active section, push the node directly to the output array.
        out.push(node);
      }
    }
    // Replace the root node with the new structure containing sections.
    ctx.replaceNode(root, { type: 'root', children: out });
  },
};
