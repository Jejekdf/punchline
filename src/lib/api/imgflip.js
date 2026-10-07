/**
 * Imgflip Meme Templates & Supermeme-Style Situation Matching Engine
 */

/**
 * @typedef {Object} MemeTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} url
 * @property {number} width
 * @property {number} height
 * @property {number} box_count
 */

import curatedMemes from "../data/curatedMemes.json";

// Fallback templates in case of network restriction, adblock, or offline state (390+ verified memes)
/** @type {MemeTemplate[]} */
export const FALLBACK_TEMPLATES = /** @type {MemeTemplate[]} */ (curatedMemes);


/**
 * Fetch top meme templates from Imgflip API with strict deduplication against fallbacks.
 * @returns {Promise<MemeTemplate[]>}
 */

/**
 * @param {MemeTemplate} template
 * @param {number} [index]
 * @returns {string[]}
 */
export function getTemplateCategories(template, index = 999) {
  const n = template.name.toLowerCase();
  /** @type {string[]} */
  const cats = ['all'];

  if (index < 45) {
    cats.push('trending');
  }

  if (/drake|distracted|buttons|exit|uno|disaster|sponge|bernie|batman|brain|wojak|chad|mind|gru|aliens|skeleton|fry|pepe|harold|doge/i.test(n)) {
    cats.push('classic');
  }

  if (/yell|cry|laugh|scream|confus|surpris|stare|facepalm|shrug|wait|scare|shock|panik|kalm|disaster|awkward|harold|puppet/i.test(n)) {
    cats.push('reactions');
  }

  if (/button|choice|exit|drake|draw 25|uno|pill|swap|ramp|either|or|handshake|vs/i.test(n)) {
    cats.push('two_choices');
  }

  if (/cat|dog|doge|cheems|monkey|bird|duck|frog|bear|seal|pigeon|animal|lion|wolf/i.test(n)) {
    cats.push('animals');
  }

  return cats;
}

/**
 * Normalizes template name to a canonical key for strict deduplication.
 * @param {string} name
 * @returns {string}
 */
export function normalizeTemplateKey(name) {
  return (name || '')
    .toLowerCase()
    .replace(/(meme|template|guy|the|a|an|of|in|on|at|to|for|with|and|vs|versus)/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Normalizes an image URL for deduplication.
 * @param {string} url
 * @returns {string}
 */
export function normalizeImageUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.pathname.toLowerCase().replace(/^\/+/, '');
  } catch {
    return url.toLowerCase().trim();
  }
}

/** @type {MemeTemplate[] | null} */
let cachedTemplates = null;

export async function fetchTemplates() {
  if (cachedTemplates && cachedTemplates.length > 0) {
    return cachedTemplates;
  }

  // Seed list with curated FALLBACK_TEMPLATES first (guarantees local Drake /default-meme.jpg)
  /** @type {MemeTemplate[]} */
  const list = [...FALLBACK_TEMPLATES];
  const seenIds = new Set(FALLBACK_TEMPLATES.map((t) => String(t.id)));
  const seenKeys = new Set(FALLBACK_TEMPLATES.map((t) => normalizeTemplateKey(t.name)).filter(Boolean));
  const seenUrls = new Set(FALLBACK_TEMPLATES.map((t) => normalizeImageUrl(t.url)).filter(Boolean));

  try {
    const res = await fetch('https://api.imgflip.com/get_memes', {
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.success && Array.isArray(data.data?.memes)) {
        for (const m of data.data.memes) {
          const idStr = String(m.id);
          const key = normalizeTemplateKey(m.name);
          const urlKey = normalizeImageUrl(m.url);

          // Skip if already in list (by id, normalized name, or image URL)
          if (seenIds.has(idStr) || (key && seenKeys.has(key)) || (urlKey && seenUrls.has(urlKey))) {
            continue;
          }

          // Drake is already covered by /default-meme.jpg in FALLBACK_TEMPLATES
          if (m.name.toLowerCase().includes('drake') || idStr === '181913649') {
            continue;
          }

          seenIds.add(idStr);
          if (key) seenKeys.add(key);
          if (urlKey) seenUrls.add(urlKey);

          list.push({
            id: idStr,
            name: m.name,
            url: m.url,
            width: m.width,
            height: m.height,
            box_count: m.box_count || 2
          });
        }
      }
    }

    cachedTemplates = list;
    return list;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Imgflip API timeout/unreachable, using offline fallbacks:', message);
    cachedTemplates = FALLBACK_TEMPLATES;
    return FALLBACK_TEMPLATES;
  }
}

