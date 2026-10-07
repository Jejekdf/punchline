<script>
  import { fetchTemplates, getTemplateCategories, normalizeTemplateKey, normalizeImageUrl } from '../api/imgflip.js';
  import { Search, X, Link2, Loader2, AlertCircle, Image as ImageIcon, Flame, LayoutGrid, Trophy, Smile, GitCompare, Cat } from 'lucide-svelte';

  /**
   * @typedef {import('../api/imgflip.js').MemeTemplate} MemeTemplate
   */

  /**
   * @type {{
   *   isOpen?: boolean,
   *   onSelect?: (template: MemeTemplate) => void,
   *   onClose?: () => void
   * }}
   */
  let { isOpen = false, onSelect, onClose } = $props();

  let searchQuery = $state('');
  let activeTab = $state('trending');
  /** @type {MemeTemplate[]} */
  let templates = $state([]);
  let isLoading = $state(false);

  // Direct URL state
  let urlInput = $state('');
  let isTestingUrl = $state(false);
  let urlError = $state('');
  /** @type {Record<string, boolean>} */
  let brokenIds = $state({});

  const TABS = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'all', label: 'All', icon: LayoutGrid },
    { id: 'classic', label: 'Classic', icon: Trophy },
    { id: 'reactions', label: 'Reactions', icon: Smile },
    { id: 'two_choices', label: 'Two Choices', icon: GitCompare },
    { id: 'animals', label: 'Animals', icon: Cat },
    { id: 'paste_url', label: 'Paste URL', icon: Link2 }
  ];

  let categoryCounts = $derived.by(() => {
    /** @type {Record<string, number>} */
    const counts = { all: 0, trending: 0, classic: 0, reactions: 0, two_choices: 0, animals: 0 };
    for (let idx = 0; idx < templates.length; idx++) {
      const t = templates[idx];
      if (brokenIds[t.id]) continue;
      counts.all++;
      const cats = getTemplateCategories(t, idx);
      for (const c of cats) {
        if (c !== 'all' && counts[c] !== undefined) counts[c]++;
      }
    }
    return counts;
  });

  $effect(() => {
    if (isOpen && templates.length === 0) {
      loadMemes();
    }
  });

  async function loadMemes() {
    isLoading = true;
    try {
      templates = await fetchTemplates();
    } finally {
      isLoading = false;
    }
  }

  let filteredTemplates = $derived.by(() => {
    const seenIds = new Set();
    const seenKeys = new Set();
    const seenUrls = new Set();

    return templates.filter((t, idx) => {
      if (brokenIds[t.id]) return false;
      // 1. Filter by category
      if (activeTab !== 'all') {
        const cats = getTemplateCategories(t, idx);
        if (!cats.includes(activeTab)) return false;
      }
      // 2. Filter by search query
      if (searchQuery.trim()) {
        if (!t.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
          return false;
        }
      }
      // 3. Strict image & template deduplication guard
      const idStr = String(t.id);
      const key = normalizeTemplateKey(t.name);
      const urlKey = normalizeImageUrl(t.url);

      if (seenIds.has(idStr) || (key && seenKeys.has(key)) || (urlKey && seenUrls.has(urlKey))) {
        return false;
      }

      seenIds.add(idStr);
      if (key) seenKeys.add(key);
      if (urlKey) seenUrls.add(urlKey);
      return true;
    });
  });

  let visibleCount = $state(50);

  $effect(() => {
    // Reset batch size on tab change or search input
    activeTab;
    searchQuery;
    visibleCount = 50;
  });

  let displayedTemplates = $derived(filteredTemplates.slice(0, visibleCount));

  /**
   * @param {MouseEvent} [e]
   * @param {string} tabId
   */
  function selectTab(e, tabId) {
    activeTab = tabId;
    if (e?.currentTarget instanceof HTMLElement) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  /** @param {MemeTemplate} template */
  function handleSelect(template) {
    if (onSelect) onSelect(template);
    if (onClose) onClose();
  }

  function handleTestAndUseUrl() {
    let trimmed = urlInput.trim();
    if (!trimmed) {
      urlError = 'Please enter an image URL';
      return;
    }
    urlError = '';

    // Check if user pasted a Google Search result share link
    if (trimmed.includes('share.google') || (trimmed.includes('google.com/search') && !trimmed.includes('imgurl='))) {
      urlError = 'Link ini adalah tautan halaman web pencarian Google, bukan file gambar langsung. Silakan buka tautan tersebut, klik kanan gambar lalu pilih "Salin tautan gambar" (Copy image address), atau unduh gambarnya lalu gunakan tombol Upload.';
      return;
    }

    // Auto-extract direct imgurl if user copied a Google Images search URL
    try {
      const parsed = new URL(trimmed);
      if (parsed.searchParams.has('imgurl')) {
        trimmed = parsed.searchParams.get('imgurl') || trimmed;
      }
    } catch {}

    isTestingUrl = true;

    // Load with CORS support and fallback to CORS proxy
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      isTestingUrl = false;
      handleSelect({
        id: `custom_${Date.now()}`,
        name: 'Web Image',
        url: trimmed,
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 800,
        box_count: 2
      });
    };

    img.onerror = () => {
      // If direct image fails CORS, fallback to CORS image proxy
      if (trimmed.startsWith('http') && !trimmed.includes('weserv.nl')) {
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(trimmed)}`;
        const proxyImg = new Image();
        proxyImg.crossOrigin = 'anonymous';

        proxyImg.onload = () => {
          isTestingUrl = false;
          handleSelect({
            id: `custom_${Date.now()}`,
            name: 'Web Image',
            url: proxyUrl,
            width: proxyImg.naturalWidth || 800,
            height: proxyImg.naturalHeight || 800,
            box_count: 2
          });
        };

        proxyImg.onerror = () => {
          isTestingUrl = false;
          urlError = 'Gagal memuat gambar dari URL ini. Pastikan link mengarah langsung ke file gambar (.jpg, .png, .webp) atau unduh gambar lalu gunakan tombol Upload.';
        };

        proxyImg.src = proxyUrl;
        return;
      }

      isTestingUrl = false;
      urlError = 'Gagal memuat gambar dari URL ini. Pastikan link mengarah langsung ke file gambar (.jpg, .png, .webp) atau gunakan tombol Upload.';
    };

    img.src = trimmed;
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen && onClose) {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs select-none"
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose?.()}
    role="presentation"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[88dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
    >
      <!-- Modal Header -->
      <div class="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
        <div>
          <h2 id="modal-title" class="text-base font-bold text-slate-900 tracking-tight">
            Select Meme Template
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            {#if isLoading}
              Loading templates…
            {:else if searchQuery.trim()}
              {filteredTemplates.length} matching "{searchQuery}"
            {:else}
              Choose a template to customize
            {/if}
          </p>
        </div>

        <button
          type="button"
          class="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 active:scale-[0.96] transition-colors cursor-pointer"
          onclick={onClose}
          aria-label="Close template modal"
        >
          <X size={18} class="stroke-[2.2]" />
        </button>
      </div>

      <!-- Controls & Filter Toolbar (Sticky) -->
      <div class="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50/80 backdrop-blur-xs flex flex-col gap-2.5 shrink-0">
        <!-- Search Bar (hidden in paste_url tab) -->
        {#if activeTab !== 'paste_url'}
          <div class="relative w-full">
            <Search size={15} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]" />
            <input
              type="search"
              placeholder="Search 390+ meme templates by name…"
              bind:value={searchQuery}
              class="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-xs"
            />
            {#if searchQuery.trim()}
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
                onclick={() => (searchQuery = '')}
                aria-label="Clear search"
              >
                <X size={12} class="stroke-[2.5]" />
              </button>
            {/if}
          </div>
        {/if}

        <!-- Category Option Pills Navigation Bar -->
        <div
          role="tablist"
          aria-label="Template categories"
          class="flex items-center gap-1.5 overflow-x-auto py-0.5 -mx-1 px-1 scroll-smooth scrollbar-none overscroll-contain"
        >
          {#each TABS as tab}
            {@const Icon = tab.icon}
            {@const count = categoryCounts[tab.id]}
            {@const isActive = activeTab === tab.id}
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 {isActive ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-100/50'}"
              onclick={(e) => selectTab(e, tab.id)}
            >
              <Icon size={13} class={isActive ? 'text-amber-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {#if count !== undefined}
                <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums {isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}">
                  {count}
                </span>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-5 min-h-75">
        {#if activeTab === 'paste_url'}
          <!-- Paste Direct URL Panel -->
          <div class="max-w-lg mx-auto py-8 flex flex-col items-center text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-xs">
              <Link2 size={24} />
            </div>
            <h3 class="text-base font-bold text-slate-900">Load Image from Direct URL</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm">
              Paste a public image link (.jpg, .png, .webp). We will load it straight into the meme editor.
            </p>

            <div class="w-full mt-5 flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://example.com/meme-template.jpg"
                bind:value={urlInput}
                onkeydown={(e) => e.key === 'Enter' && handleTestAndUseUrl()}
                class="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white"
              />
              <button
                type="button"
                class="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-xs inline-flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                disabled={isTestingUrl || !urlInput.trim()}
                onclick={handleTestAndUseUrl}
              >
                {#if isTestingUrl}
                  <Loader2 size={16} class="animate-spin" />
                  <span>Loading…</span>
                {:else}
                  <span>Use Image</span>
                {/if}
              </button>
            </div>

            {#if urlError}
              <div class="mt-3 text-left w-full p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} class="shrink-0 mt-0.5" />
                <span>{urlError}</span>
              </div>
            {/if}
          </div>
        {:else}

          <!-- Loading State -->
          {#if isLoading}
            <div class="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 size={32} class="animate-spin text-slate-600" />
              <span class="text-xs font-semibold">Loading meme library…</span>
            </div>
          {:else if filteredTemplates.length === 0}
            <div class="py-16 flex flex-col items-center justify-center text-slate-400 gap-2.5 text-center px-4">
              <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ImageIcon size={24} class="stroke-[1.75]" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-700">No meme templates found</p>
                {#if searchQuery.trim()}
                  <p class="text-xs text-slate-500 mt-1 max-w-xs">
                    No matches for "{searchQuery}" {activeTab !== 'all' ? `in ${TABS.find((t) => t.id === activeTab)?.label || 'this category'}` : ''}.
                  </p>
                {:else}
                  <p class="text-xs text-slate-500 mt-1">This category currently has no templates.</p>
                {/if}
              </div>
              {#if searchQuery.trim() && activeTab !== 'all'}
                <button
                  type="button"
                  class="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs"
                  onclick={() => (activeTab = 'all')}
                >
                  <LayoutGrid size={13} />
                  <span>Search across all templates ({categoryCounts.all || 0})</span>
                </button>
              {:else if searchQuery.trim()}
                <button
                  type="button"
                  class="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                  onclick={() => (searchQuery = '')}
                >
                  <X size={13} />
                  <span>Clear search query</span>
                </button>
              {/if}
            </div>
          {:else}
            <!-- Templates Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {#each displayedTemplates as template (template.id)}
                <button
                  type="button"
                  class="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-900 hover:shadow-md transition-all text-left cursor-pointer active:scale-98"
                  onclick={() => handleSelect(template)}
                  title={template.name}
                >
                  <div class="w-full aspect-square bg-slate-100 overflow-hidden flex items-center justify-center relative">
                    <img
                      src={template.url}
                      alt={template.name}
                      loading="lazy"
                      onerror={() => (brokenIds[template.id] = true)}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div class="p-2 w-full">
                    <span class="text-xs font-semibold text-slate-800 truncate block leading-tight">
                      {template.name}
                    </span>
                  </div>
                </button>
              {/each}
            </div>

            {#if visibleCount < filteredTemplates.length}
              <div class="pt-6 pb-2 flex justify-center">
                <button
                  type="button"
                  class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                  onclick={() => (visibleCount += 50)}
                >
                  Load More Templates
                </button>
              </div>
            {/if}
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}
