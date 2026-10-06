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

// Fallback templates in case of network restriction, adblock, or offline state
/** @type {MemeTemplate[]} */
export const FALLBACK_TEMPLATES = [
  { id: "181913649", name: "Drake Hotline Bling", url: "/default-meme.jpg", width: 1200, height: 1200, box_count: 2 },
  { id: "87743020", name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg", width: 600, height: 908, box_count: 3 },
  { id: "112126428", name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg", width: 1200, height: 800, box_count: 3 },
  { id: "124824040", name: "Left Exit 12 Off Ramp", url: "https://i.imgflip.com/22bdq6.jpg", width: 804, height: 767, box_count: 3 },
  { id: "217743513", name: "UNO Draw 25 Cards", url: "https://i.imgflip.com/3lmzyx.jpg", width: 500, height: 494, box_count: 2 },
  { id: "24759704", name: "Disaster Girl", url: "https://i.imgflip.com/23ls.jpg", width: 500, height: 375, box_count: 2 },
  { id: "188390779", name: "Woman Yelling At Cat", url: "https://i.imgflip.com/345v97.jpg", width: 680, height: 438, box_count: 2 },
  { id: "226297822", name: "Panik Kalm Panik", url: "https://i.imgflip.com/3qqcim.png", width: 640, height: 884, box_count: 3 },
  { id: "129242436", name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg", width: 482, height: 361, box_count: 2 },
  { id: "21735", name: "The Rock Driving", url: "https://i.imgflip.com/grr.jpg", width: 568, height: 700, box_count: 2 },
  { id: "102156234", name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg", width: 502, height: 353, box_count: 2 },
  { id: "252600956", name: "Anakin Padme 4 Panel", url: "https://i.imgflip.com/4acd7j.png", width: 768, height: 768, box_count: 3 },
  { id: "93895088", name: "Expanding Brain", url: "https://i.imgflip.com/1jwhww.jpg", width: 857, height: 1202, box_count: 4 },
  { id: "135256802", name: "Epic Handshake", url: "https://i.imgflip.com/28j0te.jpg", width: 900, height: 645, box_count: 3 },
  { id: "178591740", name: "Gru's Plan", url: "https://i.imgflip.com/2wifvo.jpg", width: 700, height: 449, box_count: 4 },
  { id: "27813981", name: "Hide the Pain Harold", url: "https://i.imgflip.com/gk5el.jpg", width: 480, height: 601, box_count: 2 },
  { id: "148909805", name: "Monkey Puppet", url: "https://i.imgflip.com/2gnnjh.jpg", width: 923, height: 500, box_count: 2 },
  { id: "247113703", name: "Buff Doge vs. Cheems", url: "https://i.imgflip.com/43a45p.png", width: 937, height: 712, box_count: 4 },
  { id: "101470", name: "Ancient Aliens", url: "https://i.imgflip.com/26am.jpg", width: 500, height: 437, box_count: 2 },
  { id: "438680", name: "Batman Slapping Robin", url: "https://i.imgflip.com/9ehk.jpg", width: 400, height: 387, box_count: 2 },
  { id: "61579", name: "Cease and Desist", url: "https://i.imgflip.com/1bhk.jpg", width: 500, height: 333, box_count: 2 },
  { id: "10077765", name: "Is This A Pigeon", url: "https://i.imgflip.com/60eq0.jpg", width: 1587, height: 1425, box_count: 3 },
  { id: "119185", name: "Steve Harvey Stare", url: "https://i.imgflip.com/2kbn.jpg", width: 500, height: 375, box_count: 2 },
  { id: "89370399", name: "Roll Safe Think About It", url: "https://i.imgflip.com/1h7in3.jpg", width: 702, height: 395, box_count: 2 }
];


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

