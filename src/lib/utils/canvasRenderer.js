/**
 * Core Canvas Rendering Engine for Web Meme Generator
 */

/**
 * @typedef {Object} TextLayer
 * @property {string} id
 * @property {string} text
 * @property {number} x
 * @property {number} y
 * @property {number} [fontSize]
 * @property {string} [fontFamily]
 * @property {string} [fill]
 * @property {string} [stroke]
 * @property {number} [strokeWidth]
 * @property {boolean} [uppercase]
 * @property {'bold'|'normal'} [fontWeight]
 * @property {'left'|'center'|'right'} [align]
 * @property {boolean} [shadow]
 * @property {number} [maxWidthRatio]
 * @property {number} [opacity]
 */

/**
 * @typedef {Object} RenderOptions
 * @property {string|null} [activeLayerId]
 * @property {boolean} [forExport]
 */

/**
 * Split text into lines that fit within maxWidth, respecting manual line breaks.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} text 
 * @param {number} maxWidth 
 * @returns {string[]}
 */
export function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const lines = [];
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (trimmedPara === '') {
      lines.push('');
      continue;
    }
    const words = trimmedPara.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!word) continue;
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.trim() !== '') {
      lines.push(currentLine.trim());
    }
  }

  return lines;
}

/**
 * Calculates a balanced geometric scale across different canvas aspect ratios.
 * @param {number} width
 * @param {number} height
 * @returns {number}
 */
export function getCanvasScale(width, height) {
  return Math.sqrt((width * height) / (800 * 800));
}

/**
 * Normalizes image dimensions to a consistent standard scale matching Drake Hotline Bling
 * (1200px max dimension). Prevents small templates (e.g. 400x387) from appearing tiny on
 * screen, while preventing huge camera uploads from causing memory lag.
 *
 * @param {number} [naturalWidth]
 * @param {number} [naturalHeight]
 * @param {number} [targetBase=1200]
 * @returns {{width: number, height: number}}
 */
export function getNormalizedCanvasDimensions(naturalWidth, naturalHeight, targetBase = 1200) {
  const w = naturalWidth || 800;
  const h = naturalHeight || 800;
  const maxDim = Math.max(w, h);
  const scale = targetBase / maxDim;
  return {
    width: Math.round(w * scale),
    height: Math.round(h * scale)
  };
}

/**
 * Canvas pixels per on-screen CSS pixel. >1 when the canvas is displayed smaller than its
 * internal resolution (e.g. 1200px canvas on a ~340px phone => ~3.5). Returns 1 if not laid out.
 * @param {HTMLCanvasElement} canvas
 * @returns {number}
 */
export function getCssPxRatio(canvas) {
  const w = canvas.getBoundingClientRect?.().width;
  return w > 0 ? canvas.width / w : 1;
}

/**
 * Returns handle coordinates for corner resize interaction.
 * @param {{x: number, y: number, width: number, height: number}} bounds
 * @param {number} scale
 * @param {number} [pxRatio] canvas pixels per CSS pixel (see getCssPxRatio)
 */
export function getLayerHandles(bounds, scale, pxRatio = 1) {
  const padding = 4 * scale;
  const boxX = bounds.x - padding;
  const boxY = bounds.y - padding;
  const boxW = bounds.width + padding * 2;
  const boxH = bounds.height + padding * 2;
  const handleSize = Math.max(8, 8 * scale, 12 * pxRatio);

  return {
    boxX,
    boxY,
    boxW,
    boxH,
    handleSize,
    handles: [
      { id: 'nw', x: boxX, y: boxY },
      { id: 'ne', x: boxX + boxW, y: boxY },
      { id: 'se', x: boxX + boxW, y: boxY + boxH },
      { id: 'sw', x: boxX, y: boxY + boxH }
    ]
  };
}

/**
 * Calculates bounding box of a text layer in canvas pixels with pixel-perfect text hugging.
 * Vertically and horizontally center-anchored so multi-line text scales gracefully.
 * @param {CanvasRenderingContext2D} ctx
 * @param {TextLayer} layer
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @returns {{x: number, y: number, width: number, height: number, lines: string[], lineHeight: number, scaledFontSize: number, maxLineWidth: number, startY: number, drawX: number}}
 */
export function getTextLayerBounds(ctx, layer, canvasWidth, canvasHeight) {
  const scale = getCanvasScale(canvasWidth, canvasHeight);
  const scaledFontSize = Math.max(12, (layer.fontSize || 36) * scale);
  const lineHeight = scaledFontSize * 1.15;
  const fontFam = layer.fontFamily || 'Anton';
  const weight = layer.fontWeight === 'normal' ? '400' : '900';
  ctx.font = `${weight} ${scaledFontSize}px "${fontFam}", "Bebas Neue", Oswald, Anton, Impact, "Comic Neue", Montserrat, sans-serif`;

  const rawText = layer.text || '';
  const maxWidth = canvasWidth * (layer.maxWidthRatio || 0.9);
  const lines = wrapText(ctx, rawText, maxWidth);

  let maxLineWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  }

  const effectiveWidth = lines.length > 0 ? maxLineWidth : Math.max(60 * scale, 80);
  const totalHeight = lines.length > 0 ? lines.length * lineHeight : lineHeight;
  const anchorX = layer.x * canvasWidth;
  const anchorY = layer.y * canvasHeight;

  const leftX = anchorX - effectiveWidth / 2;
  const startY = anchorY - totalHeight / 2;
  const strokeHalf = ((layer.strokeWidth ?? 6) * scale) / 2;

  return {
    x: leftX - strokeHalf,
    y: startY - strokeHalf,
    width: effectiveWidth + strokeHalf * 2,
    height: totalHeight + strokeHalf * 2,
    lines,
    lineHeight,
    scaledFontSize,
    maxLineWidth: effectiveWidth,
    startY,
    drawX: anchorX
  };
}

/**
 * Render the complete meme onto the canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement|null} image
 * @param {TextLayer[]} textLayers
 * @param {RenderOptions} [options]
 */
export function renderMeme(canvas, image, textLayers, options = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { activeLayerId = null, forExport = false } = options;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw base image
  if (image && image.complete && image.naturalWidth > 0) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } else {
    // Fallback placeholder background
    ctx.fillStyle = '#1e2230';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Select or Upload an Image', canvas.width / 2, canvas.height / 2);
  }

  const scale = getCanvasScale(canvas.width, canvas.height);
  const pxRatio = forExport ? 1 : getCssPxRatio(canvas);

  // 2. Draw text layers
  textLayers.forEach((layer) => {
    const bounds = getTextLayerBounds(ctx, layer, canvas.width, canvas.height);
    const { boxX, boxY, boxW, boxH, handleSize, handles } = getLayerHandles(bounds, scale, pxRatio);

    if (bounds.lines.length === 0) {
      if (!forExport && activeLayerId === layer.id) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.setLineDash([4 * scale, 3 * scale]);
        ctx.lineWidth = Math.max(1, 1.25 * scale);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.restore();
      }
      return;
    }

    const scaledStrokeWidth = Math.max(1, (layer.strokeWidth ?? 6) * scale);
    const fontFam = layer.fontFamily || 'Anton';
    const weight = layer.fontWeight === 'normal' ? '400' : '900';
    ctx.font = `${weight} ${bounds.scaledFontSize}px "${fontFam}", "Bebas Neue", Oswald, Anton, Impact, "Comic Neue", Montserrat, sans-serif`;
    ctx.textAlign = layer.align || 'center';
    ctx.textBaseline = 'top';

    const anchorX = layer.x * canvas.width;
    const startY = bounds.startY;

    // Anchor text horizontally within bounding box so changing alignment doesn't displace the layer
    let drawX = anchorX;
    if (layer.align === 'left') {
      drawX = anchorX - bounds.maxLineWidth / 2;
    } else if (layer.align === 'right') {
      drawX = anchorX + bounds.maxLineWidth / 2;
    }

    ctx.save();
    if (typeof layer.opacity === 'number') {
      ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
    }

    if (layer.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 8 * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 3 * scale;
    }

    // Draw stroke (outline) first
    if ((layer.strokeWidth ?? 0) > 0 && layer.stroke !== 'transparent') {
      ctx.strokeStyle = layer.stroke || '#000000';
      ctx.lineWidth = scaledStrokeWidth;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;

      bounds.lines.forEach((line, index) => {
        ctx.strokeText(line, drawX, startY + index * bounds.lineHeight);
      });
    }

    // Draw fill text over the stroke
    ctx.fillStyle = layer.fill || '#ffffff';
    bounds.lines.forEach((line, index) => {
      ctx.fillText(line, drawX, startY + index * bounds.lineHeight);
    });
    ctx.restore();

    // 3. Draw active selection bounding box & handles if preview mode
    if (!forExport && activeLayerId === layer.id) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = Math.max(1, 1.25 * scale);
      ctx.setLineDash([]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Corner handles
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(1.5, 1.5 * scale);

      handles.forEach((h) => {
        ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      });
      ctx.restore();
    }
  });
}

/**
 * Convert canvas to Blob.
 * @param {HTMLCanvasElement} canvas 
 * @param {string} [type] 
 * @param {number} [quality] 
 * @returns {Promise<Blob>}
 */
export function exportCanvasToBlob(canvas, type = 'image/png', quality = 0.95) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image blob'));
    }, type, quality);
  });
}
