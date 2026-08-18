import decorateColumns from '../columns/columns.js';

/*
 * Backward-compatibility shim.
 *
 * The featured teaser is now the "Columns (featured)" variant of the columns
 * block (see blocks/columns). New content should author it as "Columns
 * (featured)". This shim keeps already-published pages that reference the old
 * `columns-featured` block name working: it maps the element onto the columns
 * variant classes and delegates to the shared decorator.
 */
export default function decorate(block) {
  block.classList.add('columns', 'featured');
  decorateColumns(block);
}
