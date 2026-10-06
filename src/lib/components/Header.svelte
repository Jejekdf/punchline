<script>
  import { LayoutGrid, Upload, HelpCircle, RotateCcw, X } from 'lucide-svelte';
  import MemeLogo from './MemeLogo.svelte';

  /**
   * @type {{
   *   onOpenTemplates?: () => void,
   *   onUploadImage?: (dataUrl: string, name?: string) => void,
   *   onReset?: () => void
   * }}
   */
  let {
    onOpenTemplates,
    onUploadImage,
    onReset
  } = $props();

  let isShortcutsModalOpen = $state(false);
  let isResetConfirmOpen = $state(false);
  /** @type {HTMLInputElement | null} */
  let fileInputEl = $state(null);

  const mouseTips = [
    { action: 'Click text', desc: 'Select and edit layer' },
    { action: 'Drag text', desc: 'Reposition anywhere on image' },
    { action: 'Drag corner handle', desc: 'Resize font size & box width' },
    { action: 'Double-click canvas', desc: 'Add text box at pointer' }
  ];

  const keyShortcuts = [
    { key: 'Esc', desc: 'Deselect active layer' },
    { key: 'Tab', desc: 'Cycle focus through inputs' }
  ];

  /**
   * Handles local image file upload.
   * @param {Event} e
   */
  function handleFileInputChange(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = /** @type {string} */ (uploadEvent.target?.result);
      if (dataUrl && onUploadImage) {
        onUploadImage(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
    target.value = '';
  }
</script>

<svelte:window onkeydown={(e) => {
  if (e.key === 'Escape') {
    if (isShortcutsModalOpen) isShortcutsModalOpen = false;
    if (isResetConfirmOpen) isResetConfirmOpen = false;
  }
}} />

<!-- Hidden File Input for Custom Upload -->
<input
  type="file"
  accept="image/*"
  bind:this={fileInputEl}
  onchange={handleFileInputChange}
  class="hidden"
  aria-label="Upload custom image file"
/>

<header class="w-full bg-white border-b border-slate-200 px-3 sm:px-4 py-2 shrink-0 select-none z-30">
  <div class="w-full flex items-center justify-between gap-3">
    <!-- Punchline Brand Mark -->
    <div class="flex items-center gap-2.5 shrink-0">
      <MemeLogo size={32} class="w-8 h-8 rounded-lg shadow-2xs hover:scale-105 transition-transform" />
      <h1 class="font-black text-base sm:text-lg text-slate-900 tracking-tight m-0 leading-none">
        Punchline
      </h1>
    </div>

    <!-- Right Utility Actions -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <!-- Templates Button -->
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 min-h-9 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all shadow-xs cursor-pointer"
        onclick={onOpenTemplates}
        title="Browse meme templates"
        aria-label="Browse templates"
      >
        <LayoutGrid size={15} class="stroke-[2.2]" />
        <span class="hidden sm:inline">Templates</span>
      </button>

      <!-- Upload Button -->
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 min-h-9 rounded-lg bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all shadow-xs cursor-pointer"
        onclick={() => fileInputEl?.click()}
        title="Upload your own image"
        aria-label="Upload image"
      >
        <Upload size={15} class="stroke-[2.2]" />
        <span class="hidden sm:inline">Upload Image</span>
      </button>

      <!-- Shortcuts / Help -->
      <button
        type="button"
        class="inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all shadow-xs cursor-pointer"
        onclick={() => isShortcutsModalOpen = true}
        title="Keyboard shortcuts"
        aria-label="Keyboard shortcuts"
      >
        <HelpCircle size={16} class="stroke-2" />
      </button>

      <!-- Reset Canvas -->
      <button
        type="button"
        class="inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-95 transition-all shadow-xs cursor-pointer"
        onclick={() => isResetConfirmOpen = true}
        title="Reset canvas"
        aria-label="Reset canvas"
      >
        <RotateCcw size={16} class="stroke-2" />
      </button>
    </div>
  </div>
</header>

<!-- Reset Canvas Confirmation Modal -->
{#if isResetConfirmOpen}
  <div
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
    onclick={() => isResetConfirmOpen = false}
    role="presentation"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 overflow-hidden animate-in fade-in zoom-in-95"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
      aria-describedby="reset-dialog-desc"
      tabindex="-1"
    >
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div class="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <RotateCcw size={18} class="stroke-[2.5]" />
        </div>
        <div>
          <h2 id="reset-dialog-title" class="font-bold text-slate-900 text-base">
            Reset Canvas?
          </h2>
          <p class="text-xs text-slate-500">
            This action cannot be undone.
          </p>
        </div>
      </div>

      <p id="reset-dialog-desc" class="mt-4 text-xs text-slate-600 leading-relaxed">
        Resetting will clear all your custom text, layer formatting, and image changes back to the default meme template.
      </p>

      <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          class="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all cursor-pointer"
          onclick={() => isResetConfirmOpen = false}
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-95 transition-all shadow-xs cursor-pointer"
          onclick={() => {
            isResetConfirmOpen = false;
            onReset?.();
          }}
        >
          Reset Canvas
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Shortcuts Modal Dialog -->
{#if isShortcutsModalOpen}
  <div
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    onclick={() => isShortcutsModalOpen = false}
    role="presentation"
  >
    <div
      class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 overflow-hidden animate-in fade-in zoom-in-95"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
      tabindex="-1"
    >
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 id="shortcuts-dialog-title" class="font-bold text-slate-900 text-base">
          Shortcuts & Help
        </h2>
        <button
          type="button"
          class="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors cursor-pointer"
          onclick={() => isShortcutsModalOpen = false}
          aria-label="Close shortcuts"
        >
          <X size={18} />
        </button>
      </div>

      <div class="mt-4 flex flex-col gap-4 text-xs">
        <div>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">Canvas Gestures</span>
          <div class="flex flex-col gap-2">
            {#each mouseTips as tip}
              <div class="flex items-center justify-between py-0.5">
                <span class="text-slate-600">{tip.desc}</span>
                <span class="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-medium text-[11px]">
                  {tip.action}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">Keyboard Shortcuts</span>
          <div class="flex flex-col gap-2">
            {#each keyShortcuts as sc}
              <div class="flex items-center justify-between py-0.5">
                <span class="text-slate-600">{sc.desc}</span>
                <kbd class="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-medium text-slate-800 shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="mt-5 pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          class="px-3.5 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all cursor-pointer"
          onclick={() => isShortcutsModalOpen = false}
        >
          Got it
        </button>
      </div>
    </div>
  </div>
{/if}
