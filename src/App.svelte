<script>
  import Header from './lib/components/Header.svelte';
  import CanvasStage from './lib/components/CanvasStage.svelte';
  import TextEditor from './lib/components/TextEditor.svelte';
  import ExportBar from './lib/components/ExportBar.svelte';
  import TemplateModal from './lib/components/TemplateModal.svelte';
  import { memeState } from './lib/state/memeState.svelte.js';
  import { Upload } from 'lucide-svelte';


  let isTemplateModalOpen = $state(false);
  let isDraggingOver = $state(false);

  /** @param {ClipboardEvent} e */
  function handleGlobalPaste(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = /** @type {string} */ (event.target?.result);
              if (dataUrl) {
                memeState.setImage(dataUrl, file.name || 'Pasted Image');
              }
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }
    }
  }

  /** @param {DragEvent} e */
  function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer?.types.includes('Files')) {
      isDraggingOver = true;
    }
  }

  /** @param {DragEvent} e */
  function handleDrop(e) {
    e.preventDefault();
    isDraggingOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = /** @type {string} */ (event.target?.result);
        if (dataUrl) {
          memeState.setImage(dataUrl, file.name || 'Dropped Image');
        }
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<svelte:window
  onkeydown={(e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const isEditingText =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);

    // Global Undo / Redo shortcuts (Ctrl+Z, Cmd+Z, Ctrl+Y, Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      memeState.undo();
      return;
    }
    if (
      ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
    ) {
      e.preventDefault();
      memeState.redo();
      return;
    }

    if (e.key === 'Escape') {
      memeState.selectLayer(null);
    } else if (!isEditingText && (e.key === 'Backspace' || e.key === 'Delete')) {
      // Prevent browser default history back navigation
      e.preventDefault();

      if (memeState.activeLayerId) {
        if (memeState.textLayers.length > 1) {
          memeState.deleteLayer(memeState.activeLayerId);
        } else {
          memeState.updateActiveLayer({ text: '' });
        }
      }
    } else if (
      !isEditingText &&
      memeState.activeLayerId &&
      (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')
    ) {
      e.preventDefault();
      const layer = memeState.activeLayer;
      if (layer) {
        const step = e.shiftKey ? 0.02 : 0.005;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        else if (e.key === 'ArrowRight') dx = step;
        else if (e.key === 'ArrowUp') dy = -step;
        else if (e.key === 'ArrowDown') dy = step;

        const nextX = Math.max(0.02, Math.min(0.98, layer.x + dx));
        const nextY = Math.max(0.02, Math.min(0.98, layer.y + dy));
        memeState.updateLayerPos(layer.id, nextX, nextY);
      }
    }
  }}
  onpaste={handleGlobalPaste}
  ondragover={handleDragOver}
  ondragleave={(e) => { if (!e.relatedTarget) isDraggingOver = false; }}
  ondrop={handleDrop}
/>

<div class="h-dvh max-h-dvh w-full flex flex-col overflow-hidden bg-slate-100 font-sans select-none">
  {#if isDraggingOver}
    <div class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in" role="presentation">
      <div class="bg-white rounded-2xl border-2 border-dashed border-slate-900 p-8 flex flex-col items-center gap-3 shadow-2xl">
        <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
          <Upload size={28} class="stroke-[2.5]" />
        </div>
        <span class="text-sm font-bold text-slate-900">Drop image to use as meme template</span>
      </div>
    </div>
  {/if}

  <!-- Top Utility Header -->
  <Header
    onOpenTemplates={() => isTemplateModalOpen = true}
    onUploadImage={(url, name) => memeState.setImage(url, name || 'Custom Upload')}
    onReset={() => memeState.reset()}
    onUndo={() => memeState.undo()}
    onRedo={() => memeState.redo()}
    canUndo={memeState.canUndo}
    canRedo={memeState.canRedo}
  />

  <main class="flex flex-col md:grid md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] h-[calc(100dvh-49px)] max-h-[calc(100dvh-49px)] p-2 gap-2 overflow-hidden" aria-label="Meme Generator Workspace">
    <h2 class="sr-only">Free, Private & Watermark-Free Online Meme Generator</h2>
    <!-- Left Stage Column: Direct Canvas Viewport -->
    <section class="flex flex-col shrink-0 md:shrink md:flex-1 h-[clamp(210px,38dvh,320px)] md:h-full md:max-h-full min-h-0 min-w-0 overflow-hidden" aria-label="Canvas Workspace">
      <!-- Unobstructed Canvas Stage -->
      <figure class="flex-1 min-h-0 h-full flex flex-col items-center justify-center relative rounded-xl border border-slate-800 bg-slate-950 p-2 sm:p-3 overflow-hidden shadow-sm">
        <figcaption class="sr-only">Meme canvas editor viewport</figcaption>
        <CanvasStage
          imageUrl={memeState.currentImageUrl}
          textLayers={memeState.textLayers}
          selectedLayerId={memeState.activeLayerId}
          onSelectLayer={(id) => memeState.selectLayer(id)}
          onUpdateLayerPosition={(id, x, y) => memeState.updateLayerPos(id, x, y)}
          onUpdateLayer={(id, fields) => memeState.updateLayer(id, fields)}
          onAddTextAt={(x, y) => memeState.addLayerAt(x, y)}
        />
      </figure>
    </section>

    <!-- Right Sidebar Column: Text Inputs, Styling, and Export Bar -->
    <aside class="flex-1 md:flex-initial flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" aria-label="Controls and Export">
      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-200">
        <TextEditor
          layers={memeState.textLayers}
          activeLayerId={memeState.activeLayerId}
          currentTemplateName={memeState.currentTemplateName}
          onSelectLayer={(id) => memeState.selectLayer(id)}
          onUpdateLayer={(id, updates) => memeState.updateLayer(id, updates)}
          onAddLayer={() => memeState.addLayer()}
          onDeleteLayer={(id) => memeState.deleteLayer(id)}
          onOpenTemplateModal={() => isTemplateModalOpen = true}
          onImageUpload={(url) => memeState.setImage(url, 'Custom Upload')}
        />
      </div>

      <footer class="p-2 sm:p-2.5 bg-white border-t border-slate-200 shrink-0">
        <ExportBar
          textLayers={memeState.textLayers}
          imageUrl={memeState.currentImageUrl}
        />
      </footer>
    </aside>
  </main>

  <!-- Full Template Search Modal -->
  <TemplateModal
    isOpen={isTemplateModalOpen}
    onSelect={(tpl) => {
      memeState.selectTemplate(tpl);
      isTemplateModalOpen = false;
    }}
    onClose={() => isTemplateModalOpen = false}
  />
</div>
