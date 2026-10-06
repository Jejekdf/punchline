<script>
  import {
    Plus,
    Minus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Pipette,
    Type,
    Bold,
    CircleSlash,
    MoveHorizontal,
    LayoutGrid
  } from 'lucide-svelte';
  import { isDefaultText } from '../state/memeState.svelte.js';

  /**
   * @typedef {import('../utils/canvasRenderer.js').TextLayer} TextLayer
   * @typedef {import('../api/imgflip.js').MemeTemplate} MemeTemplate
   */

  /**
   * @type {{
   *   layers?: TextLayer[],
   *   activeLayerId?: string | null,
   *   currentImageUrl?: string,
   *   currentTemplateName?: string,
   *   onSelectLayer?: (id: string | null) => void,
   *   onUpdateLayer?: (id: string, fields: Partial<TextLayer>) => void,
   *   onDeleteLayer?: (id: string) => void,
   *   onAddLayer?: () => void,
   *   onSelectTemplate?: (template: MemeTemplate) => void,
   *   onOpenTemplateModal?: () => void,
   *   onImageUpload?: (dataUrl: string, name?: string) => void
   * }}
   */
  let {
    layers = [],
    activeLayerId = null,
    currentTemplateName = 'Drake Hotline Bling',
    onSelectLayer,
    onUpdateLayer,
    onDeleteLayer,
    onAddLayer,
    onOpenTemplateModal
  } = $props();

  const fontOptions = [
    { label: 'Anton', value: 'Anton' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Bebas Neue', value: 'Bebas Neue' },
    { label: 'Oswald', value: 'Oswald' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Comic Neue', value: 'Comic Neue' },
    { label: 'Arial', value: 'Arial' }
  ];

  const quickColors = ['#ffffff', '#facc15', '#000000', '#ef4444', '#38bdf8'];
  const strokeColors = ['#000000', '#ffffff', 'transparent'];

  /** @type {Record<string, boolean>} */
  let collapsedMap = $state({});

  /**
   * @param {string} id
   * @param {keyof TextLayer} field
   * @param {any} value
   */
  function handleFieldChange(id, field, value) {
    if (onUpdateLayer) {
      onUpdateLayer(id, { [field]: value });
    }
  }

  /**
   * @param {string} font
   */
  function handleGlobalFontChange(font) {
    layers.forEach((layer) => {
      handleFieldChange(layer.id, 'fontFamily', font);
    });
  }

  /**
   * @param {string} id
   */
  function toggleCollapse(id) {
    collapsedMap[id] = !collapsedMap[id];
  }
</script>

<div class="flex flex-col gap-3 p-3 select-none">
  <!-- Template Header Row -->
  <div class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-xs font-semibold text-slate-500 shrink-0">Template:</span>
      <span class="text-xs font-bold text-slate-900 truncate" title={currentTemplateName}>
        {currentTemplateName}
      </span>
    </div>
    {#if onOpenTemplateModal}
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all cursor-pointer shrink-0"
        onclick={onOpenTemplateModal}
      >
        <LayoutGrid size={13} class="stroke-[2.2]" />
        <span>Change</span>
      </button>
    {/if}
  </div>

  <!-- Top Global Font & Presets Bar -->
  <div class="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col gap-2">
    <!-- Font Row -->
    <div class="flex items-center gap-2">
      <label for="global-font" class="text-xs font-semibold text-slate-600 shrink-0">
        Font
      </label>
      <select
        id="global-font"
        class="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer"
        onchange={(e) => handleGlobalFontChange(/** @type {HTMLSelectElement} */ (e.target).value)}
        value={layers[0]?.fontFamily ?? 'Anton'}
      >
        {#each fontOptions as opt}
          <option value={opt.value} style="font-family: '{opt.value}', sans-serif;">
            {opt.label}
          </option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Text Layers Section Header -->
  <div class="flex items-center justify-between px-0.5">
    <div class="flex items-center gap-1.5">
      <span class="text-xs font-semibold text-slate-800">Text Layers</span>
      <span class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 tabular-nums">
        {layers.length}
      </span>
    </div>
    <button
      type="button"
      class="inline-flex items-center gap-1 px-3 py-1.5 min-h-8 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-[0.96] transition-colors shadow-xs cursor-pointer"
      onclick={onAddLayer}
    >
      <Plus size={13} class="stroke-[2.5]" />
      <span>Add Layer</span>
    </button>
  </div>

  <!-- Layer Cards List -->
  <div class="flex flex-col gap-2.5">
    {#if layers.length === 0}
      <div class="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center gap-2">
        <p class="text-xs font-medium text-slate-500">No text layers on canvas</p>
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all cursor-pointer"
          onclick={onAddLayer}
        >
          Add First Layer
        </button>
      </div>
    {/if}

    {#each layers as layer, i (layer.id)}
      {@const isSelected = activeLayerId === layer.id}
      {@const isCollapsed = collapsedMap[layer.id] ?? false}

      <div
        class="bg-white border rounded-xl shadow-xs overflow-hidden transition-all {isSelected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'}"
      >
        <!-- Card Header -->
        <div
          class="flex items-center justify-between px-3 py-2 bg-slate-50/70 border-b border-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-inset"
          onclick={() => onSelectLayer?.(layer.id)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectLayer?.(layer.id)}
          role="button"
          tabindex="0"
        >
          <span class="text-xs font-bold text-slate-800">
            {i === 0 ? 'Top Text' : (i === 1 ? 'Bottom Text' : `Box #${i + 1}`)}
          </span>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 transition-all cursor-pointer"
              onclick={(e) => { e.stopPropagation(); toggleCollapse(layer.id); }}
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {#if isCollapsed}
                <ChevronDown size={15} class="stroke-[2.2]" />
              {:else}
                <ChevronUp size={15} class="stroke-[2.2]" />
              {/if}
            </button>

            {#if layers.length > 1}
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-95 transition-all cursor-pointer"
                onclick={(e) => { e.stopPropagation(); onDeleteLayer?.(layer.id); }}
                title="Delete text layer"
                aria-label="Delete text box"
              >
                <Trash2 size={13} class="stroke-[2.2]" />
              </button>
            {/if}
          </div>
        </div>

        <!-- Card Body -->
        {#if !isCollapsed}
          <div class="p-3 flex flex-col gap-2.5">
            <!-- Textarea Input -->
            <textarea
              rows="2"
              placeholder={i === 0 ? 'Top text…' : (i === 1 ? 'Bottom text…' : 'Enter caption…')}
              value={layer.text}
              oninput={(e) => handleFieldChange(layer.id, 'text', /** @type {HTMLTextAreaElement} */ (e.target).value)}
              onfocus={(e) => {
                onSelectLayer?.(layer.id);
                if (isDefaultText(layer.text)) {
                  /** @type {HTMLTextAreaElement} */ (e.target).select();
                }
              }}
              class="w-full p-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none min-h-13"
            ></textarea>

            <!-- Formatting Toolbar Row 1: Font Size Stepper, Slider & Fill Color Swatches -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <!-- Font Size Stepper with Direct Input -->
              <div class="inline-flex items-center border border-slate-300 rounded-md bg-white shadow-2xs overflow-hidden h-8">
                <button
                  type="button"
                  class="w-8 h-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 text-xs cursor-pointer border-r border-slate-200 flex items-center justify-center"
                  onclick={(e) => { e.stopPropagation(); handleFieldChange(layer.id, 'fontSize', Math.max(12, (layer.fontSize ?? 44) - 4)); }}
                  aria-label="Decrease font size"
                >
                  <Minus size={12} class="stroke-[2.5]" />
                </button>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={layer.fontSize ?? 44}
                  onclick={(e) => e.stopPropagation()}
                  oninput={(e) => {
                    const val = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10);
                    if (!isNaN(val)) handleFieldChange(layer.id, 'fontSize', Math.max(12, Math.min(120, val)));
                  }}
                  class="w-10 h-full text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 tabular-nums font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                  aria-label="Font size in pixels"
                />
                <button
                  type="button"
                  class="w-8 h-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95 text-xs cursor-pointer border-l border-slate-200 flex items-center justify-center"
                  onclick={(e) => { e.stopPropagation(); handleFieldChange(layer.id, 'fontSize', Math.min(120, (layer.fontSize ?? 44) + 4)); }}
                  aria-label="Increase font size"
                >
                  <Plus size={12} class="stroke-[2.5]" />
                </button>
              </div>

              <!-- Fill Color Swatches -->
              <div class="flex items-center gap-1.5">
                {#each quickColors as c}
                  {@const isActive = (layer.fill ?? '#ffffff').toLowerCase() === c.toLowerCase()}
                  <button
                    type="button"
                    class="w-6 h-6 rounded-full border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 {isActive ? 'ring-2 ring-slate-900 scale-110 shadow-xs' : 'border-slate-300 hover:scale-105'} {c.toLowerCase() === '#ffffff' ? 'ring-1 ring-inset ring-slate-200' : ''}"
                    style="background-color: {c};"
                    onclick={(e) => { e.stopPropagation(); handleFieldChange(layer.id, 'fill', c); }}
                    aria-label="Select color {c}"
                  ></button>
                {/each}

                <!-- Custom Color Picker -->
                <label
                  class="w-6 h-6 rounded-full border border-slate-300 hover:border-slate-500 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden relative transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-900"
                  title="Pick custom text color"
                >
                  <input
                    type="color"
                    value={layer.fill ?? '#ffffff'}
                    oninput={(e) => handleFieldChange(layer.id, 'fill', /** @type {HTMLInputElement} */ (e.target).value)}
                    class="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                    aria-label="Pick custom text color"
                  />
                  <Pipette size={12} class="text-slate-600" />
                </label>
              </div>
            </div>

            <!-- Font Size Range Slider -->
            <div class="flex items-center gap-2 px-0.5">
              <span title="Font size" class="flex items-center">
                <Type size={13} class="text-slate-500 shrink-0" />
              </span>
              <input
                type="range"
                min="12"
                max="120"
                step="2"
                value={layer.fontSize ?? 44}
                oninput={(e) => handleFieldChange(layer.id, 'fontSize', parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10))}
                class="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                aria-label="Font size slider"
              />
              <span class="text-[11px] font-mono font-medium text-slate-600 shrink-0 w-9 text-right tabular-nums">{layer.fontSize ?? 44}px</span>
            </div>

            <!-- Text Box Width (Panjang / Lebar Teks) Slider -->
            <div class="flex items-center gap-2 px-0.5">
              <span title="Text box width (wrapping limit)" class="flex items-center">
                <MoveHorizontal size={13} class="text-slate-500 shrink-0" />
              </span>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={Math.round((layer.maxWidthRatio ?? 0.9) * 100)}
                oninput={(e) => handleFieldChange(layer.id, 'maxWidthRatio', parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10) / 100)}
                class="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                aria-label="Text width slider"
              />
              <span class="text-[11px] font-mono font-medium text-slate-600 shrink-0 w-9 text-right tabular-nums">{Math.round((layer.maxWidthRatio ?? 0.9) * 100)}%</span>
            </div>

            <!-- Formatting Toolbar Row 2: Alignment, Stroke, Bold/Caps -->
            <div class="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap sm:flex-nowrap">
              <!-- Text Styling Group: Bold -->
              <div class="inline-flex items-center rounded-md border border-slate-300 p-0.5 bg-white shadow-2xs">
                <button
                  type="button"
                  class="w-7 h-7 flex items-center justify-center rounded transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 {(layer.fontWeight ?? 'bold') === 'bold' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
                  onclick={(e) => { e.stopPropagation(); handleFieldChange(layer.id, 'fontWeight', (layer.fontWeight ?? 'bold') === 'bold' ? 'normal' : 'bold'); }}
                  title="Toggle Bold / Regular"
                  aria-label="Toggle bold"
                >
                  <Bold size={13} class="stroke-[2.5]" />
                </button>
              </div>

              <!-- Stroke Outline Controls (All Devices) -->
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
                  Outline
                </span>
                <div class="inline-flex items-center gap-0.5 rounded-md border border-slate-300 p-0.5 bg-white shadow-2xs">
                  {#each strokeColors as sc}
                    {@const isStrokeActive = (layer.stroke ?? '#000000').toLowerCase() === sc.toLowerCase()}
                    {@const titleText = sc === 'transparent' ? 'No Outline (Transparent)' : (sc.toLowerCase() === '#000000' ? 'Black Outline' : 'White Outline')}
                    <button
                      type="button"
                      class="w-6 h-6 flex items-center justify-center rounded transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 {isStrokeActive ? 'bg-slate-100 ring-2 ring-slate-900 shadow-2xs' : 'hover:bg-slate-100'}"
                      onclick={(e) => { e.stopPropagation(); handleFieldChange(layer.id, 'stroke', sc); }}
                      title={titleText}
                      aria-label={titleText}
                    >
                      {#if sc === 'transparent'}
                        <CircleSlash size={14} class={isStrokeActive ? 'text-rose-600 stroke-[2.2]' : 'text-slate-400'} />
                      {:else}
                        <span
                          class="w-3.5 h-3.5 rounded-full border {sc.toLowerCase() === '#ffffff' ? 'border-slate-300' : 'border-black/20'} shadow-2xs"
                          style="background-color: {sc};"
                        ></span>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
