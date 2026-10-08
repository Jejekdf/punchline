<script>
  import { onDestroy } from 'svelte';
  import { renderMeme, exportCanvasToBlob, getNormalizedCanvasDimensions } from '../utils/canvasRenderer.js';
  import { ensureFontsLoaded } from '../utils/fontLoader.js';
  import { Download, Copy, Share2, Check, AlertCircle, Loader2 } from 'lucide-svelte';

  /**
   * @typedef {import('../utils/canvasRenderer.js').TextLayer} TextLayer
   */

  /**
   * @type {{
   *   textLayers: TextLayer[],
   *   imageUrl: string
   * }}
   */
  let {
    textLayers = [],
    imageUrl = ''
  } = $props();

  let isExporting = $state(false);
  let exportFormat = $state('image/png');
  let exportQuality = $state(0.92);
  let toastMessage = $state('');
  /** @type {'success' | 'error'} */
  let toastType = $state('success');
  /** @type {ReturnType<typeof setTimeout> | null} */
  let toastTimer = null;

  onDestroy(() => {
    if (toastTimer) clearTimeout(toastTimer);
  });

  /**
   * @param {string} msg
   * @param {'success' | 'error'} [type]
   */
  function showToast(msg, type = 'success') {
    toastMessage = msg;
    toastType = type;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage = '';
    }, 3000);
  }

  /**
   * @returns {Promise<HTMLCanvasElement>}
   */
  async function createExportCanvas() {
    await ensureFontsLoaded();
    const exportCanvas = document.createElement('canvas');

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      /** @param {HTMLImageElement} loadedImg */
      const renderSuccess = (loadedImg) => {
        const { width, height } = getNormalizedCanvasDimensions(loadedImg.naturalWidth, loadedImg.naturalHeight, 1200);
        exportCanvas.width = width;
        exportCanvas.height = height;
        renderMeme(exportCanvas, loadedImg, textLayers, { forExport: true });
        resolve(exportCanvas);
      };

      img.onload = () => renderSuccess(img);

      img.onerror = () => {
        // Fallback to proxy if direct CORS fails
        if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('weserv.nl')) {
          const proxyImg = new Image();
          proxyImg.crossOrigin = 'anonymous';
          proxyImg.onload = () => renderSuccess(proxyImg);
          proxyImg.onerror = () => {
            exportCanvas.width = 1200;
            exportCanvas.height = 1200;
            renderMeme(exportCanvas, null, textLayers, { forExport: true });
            resolve(exportCanvas);
          };
          proxyImg.src = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
          return;
        }

        exportCanvas.width = 1200;
        exportCanvas.height = 1200;
        renderMeme(exportCanvas, null, textLayers, { forExport: true });
        resolve(exportCanvas);
      };

      img.src = imageUrl;
    });
  }

  async function handleDownload() {
    if (isExporting) return;
    isExporting = true;

    try {
      const expCanvas = await createExportCanvas();
      const blob = await exportCanvasToBlob(expCanvas, exportFormat, exportQuality);
      const url = URL.createObjectURL(blob);

      const ext = exportFormat === 'image/jpeg' ? 'jpg' : (exportFormat === 'image/webp' ? 'webp' : 'png');
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.${ext}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Meme exported as ${ext.toUpperCase()}`);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Export failed', 'error');
    } finally {
      isExporting = false;
    }
  }

  async function handleCopy() {
    if (isExporting) return;
    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast('Clipboard not supported in this browser', 'error');
      return;
    }

    isExporting = true;

    try {
      const expCanvas = await createExportCanvas();
      const blob = await exportCanvasToBlob(expCanvas, 'image/png');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showToast('Image copied to clipboard');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast('Could not copy image', 'error');
    } finally {
      isExporting = false;
    }
  }

  async function handleShare() {
    if (!navigator.share) {
      handleCopy();
      return;
    }

    try {
      const expCanvas = await createExportCanvas();
      const blob = await exportCanvasToBlob(expCanvas, 'image/png');
      const file = new File([blob], `meme-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Meme',
          text: 'Created with Punchline'
        });
      } else {
        showToast('File sharing unsupported', 'error');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share error:', err);
        showToast('Sharing failed', 'error');
      }
    }
  }
</script>

<div class="relative w-full">
  {#if toastMessage}
    <div
      class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg border border-slate-700 whitespace-nowrap z-50"
      role="status"
      aria-live="polite"
    >
      {#if toastType === 'success'}
        <Check size={14} class="text-emerald-400 stroke-[2.5]" />
      {:else}
        <AlertCircle size={14} class="text-rose-400 stroke-[2.5]" />
      {/if}
      <span>{toastMessage}</span>
    </div>
  {/if}

  <!-- Format & Quality Controls -->
  <div class="flex items-center justify-between gap-2 mb-2">
    <!-- Format Selector (Segmented Control) -->
    <div class="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100/90 p-0.5 shadow-2xs">
      {#each [
        { label: 'PNG', value: 'image/png' },
        { label: 'JPG', value: 'image/jpeg' },
        { label: 'WebP', value: 'image/webp' }
      ] as fmt}
        {@const isActive = exportFormat === fmt.value}
        <button
          type="button"
          class="px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-[0.96] {isActive ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}"
          onclick={() => exportFormat = fmt.value}
        >
          {fmt.label}
        </button>
      {/each}
    </div>

    <!-- Quality Slider for JPG / WebP -->
    {#if exportFormat !== 'image/png'}
      <div class="flex items-center gap-1.5 animate-in fade-in">
        <span class="text-[11px] font-semibold text-slate-500">Quality</span>
        <input
          type="range"
          min="50"
          max="100"
          step="5"
          value={Math.round(exportQuality * 100)}
          oninput={(e) => exportQuality = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10) / 100}
          class="w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          aria-label="Export quality"
        />
        <span class="text-[10px] font-mono font-medium text-slate-600 w-7 text-right tabular-nums">{Math.round(exportQuality * 100)}%</span>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-2 w-full">
    <!-- Primary Download Button -->
    <button
      type="button"
      class="flex-2 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-sm tracking-wide shadow-sm hover:bg-slate-800 active:scale-[0.96] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      disabled={isExporting}
      onclick={handleDownload}
    >
      {#if isExporting}
        <Loader2 size={16} class="animate-spin" />
        <span>Exporting…</span>
      {:else}
        <Download size={16} class="stroke-[2.2]" />
        <span>Download {exportFormat === 'image/jpeg' ? 'JPG' : (exportFormat === 'image/webp' ? 'WebP' : 'PNG')}</span>
      {/if}
    </button>

    <!-- Secondary Clipboard Copy -->
    <button
      type="button"
      class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white text-slate-800 font-semibold text-sm border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      disabled={isExporting}
      onclick={handleCopy}
      title="Copy to clipboard"
    >
      <Copy size={15} class="stroke-2" />
      <span>Copy</span>
    </button>

    <!-- Share -->
    <button
      type="button"
      class="inline-flex items-center justify-center p-2.5 rounded-lg bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      disabled={isExporting}
      onclick={handleShare}
      title="Share image"
      aria-label="Share"
    >
      <Share2 size={15} class="stroke-2" />
    </button>
  </div>
</div>
