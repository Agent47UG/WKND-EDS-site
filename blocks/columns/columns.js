export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Featured variant: decorate a lone-link paragraph (the CTA) as the WKND
  // yellow button. EDS button auto-decoration skips block internals, so do it
  // explicitly here — this also gives the CTA a proper 44px tap target on mobile.
  if (block.classList.contains('featured')) {
    block.querySelectorAll('p > a:only-child').forEach((a) => {
      const p = a.parentElement;
      if (p.textContent.trim() === a.textContent.trim()) {
        a.classList.add('button');
        p.classList.add('button-container');
      }
    });
  }
}
