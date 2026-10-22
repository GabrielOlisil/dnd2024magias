const PAPER = Object.freeze({
  width: 194,
  height: 280, // A4 with 8 mm margins, plus 1 mm for rounding between print engines.
  columnWidth: 95,
  gap: 4
});

let previousPrintCleanup;

/**
 * Best-fit packing in millimetres. Wide cards go above the two independent
 * columns; over-height cards scale as a whole, keeping all their content.
 */
export function packPrintCards(cards) {
  const pages = [];
  const entries = cards.map((card, index) => {
    if (!Number.isFinite(card.height) || card.height <= 0) {
      throw new Error('Não foi possível medir uma das magias para impressão.');
    }

    const scale = Math.min(1, PAPER.height / card.height);
    return {
      ...card,
      index,
      scale,
      height: card.height * scale,
      width: (card.wide ? PAPER.width : PAPER.columnWidth) * scale
    };
  });

  function createPage() {
    const page = { items: [], columns: [0, 0], wideHeight: 0 };
    pages.push(page);
    return page;
  }

  const wideCards = entries.filter(card => card.wide).sort((a, b) => b.height - a.height);
  const narrowCards = entries.filter(card => !card.wide).sort((a, b) => b.height - a.height);

  for (const card of wideCards) {
    let bestPage;
    let bestY = 0;
    let leastRemaining = Infinity;

    for (const page of pages) {
      const y = page.wideHeight + (page.items.length ? PAPER.gap : 0);
      const remaining = PAPER.height - y - card.height;
      if (remaining >= 0 && remaining < leastRemaining) {
        bestPage = page;
        bestY = y;
        leastRemaining = remaining;
      }
    }

    const page = bestPage || createPage();
    page.items.push({ ...card, x: (PAPER.width - card.width) / 2, y: bestY });
    page.wideHeight = bestY + card.height;
    page.columns = [page.wideHeight, page.wideHeight];
  }

  for (const card of narrowCards) {
    let bestPage;
    let bestColumn = 0;
    let bestY = 0;
    let leastRemaining = Infinity;

    for (const page of pages) {
      for (let column = 0; column < 2; column += 1) {
        const y = page.columns[column] + (page.columns[column] ? PAPER.gap : 0);
        const remaining = PAPER.height - y - card.height;
        if (remaining >= 0 && remaining < leastRemaining) {
          bestPage = page;
          bestColumn = column;
          bestY = y;
          leastRemaining = remaining;
        }
      }
    }

    const page = bestPage || createPage();
    page.items.push({
      ...card,
      x: bestColumn * (PAPER.columnWidth + PAPER.gap),
      y: bestY
    });
    page.columns[bestColumn] = bestY + card.height;
  }

  return pages;
}

// These rules apply during measurement AND printing. In particular, screen-only
// controls and screen typography must never participate in height measurement.
const PRINT_STYLES = `
  @page { size: A4 portrait; margin: 8mm; }
  html, body.spell-print-document {
    width: 194mm !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    color: #000 !important;
  }
  .spell-print-document *, .spell-print-document *::before, .spell-print-document *::after {
    box-sizing: border-box !important;
    animation: none !important;
    transition: none !important;
  }
  .spell-print-document .screen-only,
  .spell-print-document button,
  .spell-print-document input,
  .spell-print-document select,
  .spell-print-document textarea { display: none !important; }
  .spell-print-document .spell-card {
    display: block !important;
    position: static !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 3.5mm !important;
    border: 0.5pt solid #000 !important;
    border-radius: 0 !important;
    background: #fff !important;
    color: #000 !important;
    font: 9pt/1.4 Arial, Helvetica, sans-serif !important;
    box-shadow: none !important;
    transform: none !important;
    overflow: visible !important;
    content-visibility: visible !important;
    contain: none !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    overflow-wrap: anywhere !important;
  }
  .spell-print-document .spell-card * {
    color: #000 !important;
    background-color: transparent !important;
    border-color: #777 !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  .spell-print-document .spell-card__header { margin-bottom: 2.5mm !important; }
  .spell-print-document .spell-card__eyebrow { margin-bottom: 1.5mm !important; }
  .spell-print-document .spell-card__title { font-size: 1.55em !important; }
  .spell-print-document .spell-card__details {
    gap: 2mm !important;
    margin-bottom: 2.5mm !important;
    padding: 2mm 0 !important;
  }
  .spell-print-document .spell-card__details dt { margin-bottom: 1mm !important; }
  .spell-print-document .spell-card__footer {
    gap: 2mm !important;
    margin-top: 2.5mm !important;
    padding-top: 2mm !important;
  }
  .spell-print-document .spell-card__description { columns: auto !important; }
  .spell-print-document table {
    width: 100% !important;
    max-width: 100% !important;
    table-layout: auto !important;
  }
  .spell-print-document th, .spell-print-document td { overflow-wrap: anywhere !important; }
  .spell-print-document th { overflow-wrap: normal !important; }
  .spell-print-document img, .spell-print-document svg { max-width: 100% !important; }
  .spell-print-document img { height: auto !important; }
  .spell-print-document pre, .spell-print-document code { white-space: pre-wrap !important; }
  .spell-print-pages, .spell-print-page {
    display: block !important;
    width: 194mm !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .spell-print-page {
    position: relative !important;
    height: 280mm !important;
    overflow: visible !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-after: page !important;
    page-break-after: always !important;
  }
  .spell-print-page:last-child { break-after: auto !important; page-break-after: auto !important; }
  .spell-print-item { position: absolute !important; break-inside: avoid !important; }
  .spell-print-card-content { transform-origin: top left !important; }
`;

function withTimeout(promise, message) {
  let timeout;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error(message)), 15000);
    })
  ]).finally(() => clearTimeout(timeout));
}

async function copyStyles(sourceDocument, targetDocument) {
  const loadedStyles = [];
  for (const original of sourceDocument.querySelectorAll('style, link[rel="stylesheet"]')) {
    if (original.disabled) {
      continue;
    }
    const clone = original.cloneNode(true);
    if (clone.tagName === 'LINK') {
      clone.href = original.href;
      loadedStyles.push(new Promise((resolve, reject) => {
        clone.addEventListener('load', resolve, { once: true });
        clone.addEventListener('error', () => reject(new Error('Não foi possível carregar os estilos de impressão.')), { once: true });
      }));
    }
    targetDocument.head.append(clone);
  }
  const printStyle = targetDocument.createElement('style');
  printStyle.textContent = PRINT_STYLES;
  targetDocument.head.append(printStyle);
  await withTimeout(Promise.all(loadedStyles), 'O carregamento dos estilos de impressão demorou demais. Tente novamente.');
}

async function waitForContent(targetDocument) {
  const imageLoads = [...targetDocument.images].map(image => {
    if (image.complete) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  });
  if (targetDocument.fonts) {
    imageLoads.push(targetDocument.fonts.ready);
  }
  await withTimeout(Promise.all(imageLoads), 'O conteúdo para impressão demorou demais para carregar. Tente novamente.');
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/** Print only the supplied card elements, without changing the live Vue tree. */
export async function printSpells(elements) {
  const cards = Array.from(elements);
  if (!cards.length) {
    return 0;
  }

  previousPrintCleanup?.();
  const frame = document.createElement('iframe');
  frame.title = 'Impressão das magias selecionadas';
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  // A display:none frame cannot be measured or printed reliably in browsers.
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:1200px;border:0;pointer-events:none;';
  document.body.append(frame);

  const printWindow = frame.contentWindow;
  const printDocument = frame.contentDocument;
  const printMedia = printWindow.matchMedia('print');
  let cleanedUp = false;

  function cleanup() {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    printWindow.removeEventListener('afterprint', cleanup);
    window.removeEventListener('afterprint', cleanup);
    window.removeEventListener('pagehide', cleanup);
    printMedia.removeEventListener('change', onPrintMediaChange);
    frame.remove();
    if (previousPrintCleanup === cleanup) {
      previousPrintCleanup = undefined;
    }
  }

  function onPrintMediaChange(event) {
    if (!event.matches) {
      cleanup();
    }
  }

  previousPrintCleanup = cleanup;

  try {
    printDocument.documentElement.lang = 'pt-BR';
    printDocument.title = 'Magias D&D 2024';
    printDocument.body.className = 'spell-print-document';
    const base = printDocument.createElement('base');
    base.href = document.baseURI;
    printDocument.head.append(base);
    await copyStyles(document, printDocument);

    const measure = printDocument.createElement('div');
    measure.style.width = `${PAPER.columnWidth}mm`;
    const clones = cards.map((card) => {
      const clone = card.cloneNode(true);
      for (const image of clone.querySelectorAll('img')) {
        image.loading = 'eager';
      }
      return clone;
    });
    measure.append(...clones);
    printDocument.body.append(measure);
    await waitForContent(printDocument);

    const pixelsPerMillimetre = measure.getBoundingClientRect().width / PAPER.columnWidth;
    const heights = clones.map(card => card.getBoundingClientRect().height / pixelsPerMillimetre);
    const wideIndexes = heights.flatMap((height, index) => height > PAPER.height * 0.85 ? [index] : []);

    // Reflow long cards at full width before considering any font-size reduction.
    for (const index of wideIndexes) {
      clones[index].style.setProperty('width', `${PAPER.width}mm`, 'important');
    }
    for (const index of wideIndexes) {
      heights[index] = clones[index].getBoundingClientRect().height / pixelsPerMillimetre;
    }
    const wideSet = new Set(wideIndexes);
    const pages = packPrintCards(heights.map((height, index) => ({
      height: Math.ceil(height * 10) / 10,
      wide: wideSet.has(index)
    })));

    const output = printDocument.createElement('main');
    output.className = 'spell-print-pages';
    for (const page of pages) {
      const sheet = printDocument.createElement('section');
      sheet.className = 'spell-print-page';
      for (const item of page.items) {
        const slot = printDocument.createElement('div');
        slot.className = 'spell-print-item';
        slot.style.cssText = `left:${item.x}mm;top:${item.y}mm;width:${item.width}mm;height:${item.height}mm;`;
        const content = printDocument.createElement('div');
        content.className = 'spell-print-card-content';
        content.style.width = `${item.wide ? PAPER.width : PAPER.columnWidth}mm`;
        content.style.transform = `scale(${item.scale})`;
        clones[item.index].style.removeProperty('width');
        content.append(clones[item.index]);
        slot.append(content);
        sheet.append(slot);
      }
      output.append(sheet);
    }
    measure.remove();
    printDocument.body.append(output);
    await waitForContent(printDocument);

    printWindow.addEventListener('afterprint', cleanup, { once: true });
    window.addEventListener('afterprint', cleanup, { once: true });
    window.addEventListener('pagehide', cleanup, { once: true });
    printMedia.addEventListener('change', onPrintMediaChange);
    printWindow.focus();
    printWindow.print();
    // Do not remove the iframe after print(): some browsers open a nonblocking
    // dialog. afterprint/media-change owns cleanup; the next print is a fallback.
    return pages.length;
  } catch (error) {
    cleanup();
    throw error;
  }
}
