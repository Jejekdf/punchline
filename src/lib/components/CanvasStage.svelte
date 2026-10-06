<script>
  import { onMount } from 'svelte';
  import { renderMeme, getTextLayerBounds, getCanvasScale, getLayerHandles, getNormalizedCanvasDimensions } from '../utils/canvasRenderer.js';
  import { ensureFontsLoaded } from '../utils/fontLoader.js';
  import { Plus } from 'lucide-svelte';

  /**
   * @typedef {import('../utils/canvasRenderer.js').TextLayer} TextLayer
   */

  /**
   * @type {{
   *   imageUrl?: string,
   *   textLayers?: TextLayer[],
   *   selectedLayerId?: string | null,
   *   onSelectLayer?: (id: string | null) => void,
   *   onUpdateLayerPosition?: (id: string, x: number, y: number) => void,
   *   onUpdateLayer?: (id: string, fields: Partial<TextLayer>) => void,
   *   onAddTextAt?: (x: number, y: number) => void
   * }}
   */
  let {
    imageUrl = '',
    textLayers = [],
    selectedLayerId = null,
    onSelectLayer,
    onUpdateLayerPosition,
    onUpdateLayer,
    onAddTextAt
  } = $props();

  /** @type {HTMLCanvasElement | null} */
  let canvasEl = $state(null);
  /** @type {HTMLImageElement | null} */
  let loadedImage = $state(null);
  let isDragging = $state(false);
  let isResizing = $state(false);
  /** @type {'nw' | 'ne' | 'se' | 'sw' | null} */
  let activeResizeHandle = $state(null);
  let resizeStartPointer = { x: 0, y: 0 };
  let resizeStartFontSize = 44;
  let resizeStartWidthRatio = 0.9;
  let resizeCenter = { x: 0, y: 0 };
  let resizeStartDist = 1;
  let hoverCursor = $state('cursor-default');
  /** @type {string | null} */
  let draggedLayerId = $state(null);
  let dragStartPointer = { x: 0, y: 0 };
  let dragStartLayerPos = { x: 0.5, y: 0.5 };

  $effect(() => {
    if (imageUrl) {
      loadImage(imageUrl);
    }
  });

  $effect(() => {
    // Re-render when image, layers, or selection changes
    if (canvasEl && loadedImage) {
      redraw();
    }
  });

  onMount(async () => {
    await ensureFontsLoaded();
    if (canvasEl && loadedImage) {
      redraw();
    }
  });

  /**
   * Loads the background meme image.
   * @param {string} src
   */
  function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImage = img;
      if (canvasEl) {
        const { width, height } = getNormalizedCanvasDimensions(img.naturalWidth, img.naturalHeight, 1200);
        canvasEl.width = width;
        canvasEl.height = height;
        redraw();
      }
    };
    img.onerror = () => {
      // If direct image load fails CORS and it's not already proxied, try via CORS proxy
      if (src.startsWith('http') && !src.includes('weserv.nl')) {
        const proxySrc = `https://images.weserv.nl/?url=${encodeURIComponent(src)}`;
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => {
          loadedImage = fallbackImg;
          if (canvasEl) {
            const { width, height } = getNormalizedCanvasDimensions(fallbackImg.naturalWidth, fallbackImg.naturalHeight, 1200);
            canvasEl.width = width;
            canvasEl.height = height;
            redraw();
          }
        };
        fallbackImg.onerror = () => {
          console.error('Failed to load image even with proxy:', src);
          if (canvasEl) {
            canvasEl.width = 1200;
            canvasEl.height = 1200;
            redraw();
          }
        };
        fallbackImg.src = proxySrc;
        return;
      }
      console.error('Failed to load image:', src);
      if (canvasEl) {
        canvasEl.width = 1200;
        canvasEl.height = 1200;
        redraw();
      }
    };
    img.src = src;
  }

  function redraw() {
    if (!canvasEl) return;
    renderMeme(canvasEl, loadedImage, textLayers, {
      activeLayerId: selectedLayerId
    });
  }

  /**
   * Hit test helper: finds the topmost text layer under (canvasX, canvasY).
   * @param {number} canvasX
   * @param {number} canvasY
   * @returns {TextLayer | null}
   */
  function hitTest(canvasX, canvasY) {
    if (!canvasEl) return null;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return null;

    // Test in reverse order (topmost layer rendered last, hits first)
    for (let i = textLayers.length - 1; i >= 0; i--) {
      const layer = textLayers[i];
      const bounds = getTextLayerBounds(ctx, layer, canvasEl.width, canvasEl.height);
      const padding = 12; // Generous tap/click boundary tolerance

      if (
        canvasX >= bounds.x - padding &&
        canvasX <= bounds.x + bounds.width + padding &&
        canvasY >= bounds.y - padding &&
        canvasY <= bounds.y + bounds.height + padding
      ) {
        return layer;
      }
    }
    return null;
  }

  /**
   * Translates client pointer coordinates to canvas pixel coordinates.
   * @param {PointerEvent} e
   * @returns {{ x: number, y: number } | null}
   */
  function getCanvasCoords(e) {
    if (!canvasEl) return null;
    const rect = canvasEl.getBoundingClientRect();
    const scaleX = canvasEl.width / rect.width;
    const scaleY = canvasEl.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  /**
   * Checks if pointer is on any corner resize handle of the currently selected layer.
   * @param {number} canvasX
   * @param {number} canvasY
   * @returns {{ handle: 'nw' | 'ne' | 'se' | 'sw', layer: TextLayer, bounds: ReturnType<typeof getTextLayerBounds> } | null}
   */
  function hitTestResizeHandle(canvasX, canvasY) {
    if (!canvasEl || !selectedLayerId) return null;
    const activeLayer = textLayers.find((l) => l.id === selectedLayerId);
    if (!activeLayer) return null;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return null;

    const bounds = getTextLayerBounds(ctx, activeLayer, canvasEl.width, canvasEl.height);
    const scale = getCanvasScale(canvasEl.width, canvasEl.height);
    const { handles } = getLayerHandles(bounds, scale);
    const hitRadius = Math.max(16, 12 * scale);

    for (const h of handles) {
      const dx = canvasX - h.x;
      const dy = canvasY - h.y;
      if (Math.hypot(dx, dy) <= hitRadius) {
        return { handle: /** @type {'nw' | 'ne' | 'se' | 'sw'} */ (h.id), layer: activeLayer, bounds };
      }
    }
    return null;
  }

  /**
   * Handles pointerdown event: hit detection and drag/resize initialization.
   * @param {PointerEvent} e
   */
  function handlePointerDown(e) {
    if (!canvasEl) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    // 1. Check if user clicked a resize handle of the active layer
    const resizeHit = hitTestResizeHandle(coords.x, coords.y);
    if (resizeHit) {
      isResizing = true;
      activeResizeHandle = resizeHit.handle;
      draggedLayerId = resizeHit.layer.id;
      resizeStartPointer = { x: coords.x, y: coords.y };
      resizeStartFontSize = resizeHit.layer.fontSize || 44;
      resizeStartWidthRatio = resizeHit.layer.maxWidthRatio || 0.9;
      resizeCenter = {
        x: resizeHit.layer.x * canvasEl.width,
        y: resizeHit.layer.y * canvasEl.height
      };
      resizeStartDist = Math.hypot(coords.x - resizeCenter.x, coords.y - resizeCenter.y) || 1;

      try {
        canvasEl.setPointerCapture(e.pointerId);
      } catch (err) {}
      return;
    }

    // 2. Check if user clicked a text layer to drag/select
    const hit = hitTest(coords.x, coords.y);
    if (hit) {
      isDragging = true;
      draggedLayerId = hit.id;
      dragStartPointer = { x: coords.x, y: coords.y };
      dragStartLayerPos = { x: hit.x, y: hit.y };

      if (onSelectLayer) {
        onSelectLayer(hit.id);
      }

      // Capture pointer for smooth dragging outside canvas bounds
      try {
        canvasEl.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback for browsers with restricted pointer capture
      }
    } else {
      if (onSelectLayer) {
        onSelectLayer(null);
      }
    }
  }

  /**
   * Handles pointermove event: repositioning or resizing dragged text layer.
   * @param {PointerEvent} e
   */
  function handlePointerMove(e) {
    if (!canvasEl) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    // Case 1: Actively resizing via corner handle
    if (isResizing && draggedLayerId && onUpdateLayer) {
      const currentDist = Math.hypot(coords.x - resizeCenter.x, coords.y - resizeCenter.y);
      const scaleMultiplier = currentDist / Math.max(10, resizeStartDist);
      const newFontSize = Math.round(Math.max(12, Math.min(120, resizeStartFontSize * scaleMultiplier)));

      const currentHalfWidth = Math.abs(coords.x - resizeCenter.x);
      const newWidthRatio = Math.max(0.2, Math.min(1.0, Math.round(((currentHalfWidth * 2) / canvasEl.width) * 100) / 100));

      onUpdateLayer(draggedLayerId, {
        fontSize: newFontSize,
        maxWidthRatio: newWidthRatio
      });
      return;
    }

    // Case 2: Actively moving text position
    if (isDragging && draggedLayerId) {
      const deltaX = coords.x - dragStartPointer.x;
      const deltaY = coords.y - dragStartPointer.y;

      const deltaXRatio = deltaX / canvasEl.width;
      const deltaYRatio = deltaY / canvasEl.height;

      const newX = Math.max(0.05, Math.min(0.95, dragStartLayerPos.x + deltaXRatio));
      const newY = Math.max(0.05, Math.min(0.95, dragStartLayerPos.y + deltaYRatio));

      if (onUpdateLayerPosition) {
        onUpdateLayerPosition(draggedLayerId, newX, newY);
      }
      return;
    }

    // Case 3: Hover state cursor feedback
    const resizeHover = hitTestResizeHandle(coords.x, coords.y);
    if (resizeHover) {
      if (resizeHover.handle === 'nw' || resizeHover.handle === 'se') {
        hoverCursor = 'cursor-nwse-resize';
      } else {
        hoverCursor = 'cursor-nesw-resize';
      }
    } else if (hitTest(coords.x, coords.y)) {
      hoverCursor = 'cursor-grab';
    } else {
      hoverCursor = 'cursor-default';
    }
  }

  /**
   * Handles pointerup & pointercancel events: cleanup drag and resize state.
   * @param {PointerEvent} e
   */
  function handlePointerUp(e) {
    if (canvasEl) {
      try {
        canvasEl.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    isDragging = false;
    isResizing = false;
    activeResizeHandle = null;
    draggedLayerId = null;
  }

  /**
   * Handles canvas double click: add text at pointer position if no layer hit.
   * @param {MouseEvent} e
   */
  function handleDblClick(e) {
    if (!canvasEl || !onAddTextAt) return;
    const coords = getCanvasCoords(/** @type {any} */ (e));
    if (!coords) return;
    const hit = hitTest(coords.x, coords.y);
    if (!hit) {
      const normX = Math.max(0.08, Math.min(0.92, coords.x / canvasEl.width));
      const normY = Math.max(0.08, Math.min(0.92, coords.y / canvasEl.height));
      onAddTextAt(normX, normY);
    }
  }
</script>

<div class="w-full h-full flex flex-col items-center justify-center min-h-0 overflow-hidden box-border">
  <div class="relative inline-flex items-center justify-center rounded-lg overflow-hidden max-w-full max-h-full bg-slate-900 shadow-2xl ring-1 ring-white/10">
    <canvas
      bind:this={canvasEl}
      width="1200"
      height="1200"
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
      ondblclick={handleDblClick}
      class="block max-w-full max-h-full w-auto h-auto object-contain select-none touch-none {isDragging ? 'cursor-grabbing' : (isResizing ? (activeResizeHandle === 'nw' || activeResizeHandle === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize') : hoverCursor)}"
    ></canvas>

    {#if textLayers.length === 0}
      <button
        type="button"
        class="absolute inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white font-medium text-xs shadow-lg hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
        onclick={() => onAddTextAt?.(0.5, 0.5)}
      >
        <Plus size={15} class="stroke-[2.5]" />
        <span>Add text</span>
      </button>
    {/if}
  </div>
</div>
