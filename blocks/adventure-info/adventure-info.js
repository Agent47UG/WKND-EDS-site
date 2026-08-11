/*
 * Adventure Info Block
 * Renders an adventure's trip facts as a compact grid of small info cards
 * (e.g. Activity, Adventure Type, Trip Length, Group Size, Difficulty, Price).
 *
 * Authored content model (document table): one row per fact,
 * cell 1 = label, cell 2 = value.
 *
 *   | Adventure Info |               |
 *   | Activity       | Rock Climbing |
 *   | Trip Length    | 2 Days        |
 *   | Price          | $900          |
 */

export default function decorate(block) {
  const dl = document.createElement('dl');
  dl.className = 'adventure-info-grid';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const label = cells[0].textContent.trim();
    const value = cells[1].textContent.trim();
    if (!label || !value) return;

    const card = document.createElement('div');
    card.className = 'adventure-info-card';

    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;

    card.append(dt, dd);
    dl.append(card);
  });

  block.replaceChildren(dl);
}
