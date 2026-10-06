/**
 * Centralized Reactive State for Meme Generator using Svelte 5 Runes.
 * @typedef {import('../utils/canvasRenderer.js').TextLayer} TextLayer
 */

const DEFAULT_IMAGE = '/default-meme.jpg';
const DEFAULT_NAME = 'Drake Hotline Bling';

/**
 * Known layout presets for popular meme templates.
 * Positions text boxes into their respective visual areas rather than generic top/bottom.
 * @type {Record<string, Array<{text?: string, x: number, y: number, maxWidthRatio?: number, fontSize?: number, align?: 'left'|'center'|'right', fill?: string, stroke?: string, strokeWidth?: number, fontWeight?: 'bold'|'normal'}>>}
 */
const TEMPLATE_LAYOUT_PRESETS = {
  // Drake Hotline Bling: 2 panels on the right side (white background panels)
  drake: [
    { text: 'TOP TEXT', x: 0.75, y: 0.25, maxWidthRatio: 0.44, fontSize: 44, fill: '#000000', stroke: 'transparent', strokeWidth: 0, fontWeight: 'bold' },
    { text: 'BOTTOM TEXT', x: 0.75, y: 0.75, maxWidthRatio: 0.44, fontSize: 44, fill: '#000000', stroke: 'transparent', strokeWidth: 0, fontWeight: 'bold' }
  ],
  // Two Buttons: 2 blue buttons on top
  buttons: [
    { text: 'OPTION 1', x: 0.33, y: 0.16, maxWidthRatio: 0.30, fontSize: 34 },
    { text: 'OPTION 2', x: 0.65, y: 0.13, maxWidthRatio: 0.30, fontSize: 34 }
  ],
  // Distracted Boyfriend: 3 entities
  distracted: [
    { text: 'NEW THING', x: 0.22, y: 0.70, maxWidthRatio: 0.30, fontSize: 40 },
    { text: 'ME', x: 0.52, y: 0.42, maxWidthRatio: 0.25, fontSize: 40 },
    { text: 'OLD THING', x: 0.82, y: 0.60, maxWidthRatio: 0.30, fontSize: 40 }
  ],
  // Left Exit 12: Highway signs
  exit: [
    { text: 'NORMAL ROUTE', x: 0.36, y: 0.28, maxWidthRatio: 0.32, fontSize: 36 },
    { text: 'MY CHOICE', x: 0.74, y: 0.35, maxWidthRatio: 0.35, fontSize: 36 }
  ],
  // UNO Draw 25 Cards: Left card + Bottom
  uno: [
    { text: 'DO SOMETHING SIMPLE', x: 0.24, y: 0.38, maxWidthRatio: 0.34, fontSize: 36 },
    { text: 'OR DRAW 25', x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 46 }
  ],
  // Bernie: Bottom quote
  bernie: [
    { text: 'I AM ONCE AGAIN ASKING FOR YOUR SUPPORT', x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38 }
  ],
  // Woman Yelling at Cat: 2 split panels
  yelling: [
    { text: 'ME EXPLAINING', x: 0.25, y: 0.18, maxWidthRatio: 0.44, fontSize: 42 },
    { text: 'THE CAT CONFUSED', x: 0.75, y: 0.18, maxWidthRatio: 0.44, fontSize: 42 }
  ],
  // Always Has Been: 2 astronauts
  always: [
    { text: "WAIT, IT'S ALL X?", x: 0.30, y: 0.32, maxWidthRatio: 0.38, fontSize: 38 },
    { text: 'ALWAYS HAS BEEN', x: 0.78, y: 0.20, maxWidthRatio: 0.35, fontSize: 38 }
  ],
  // Change My Mind: Table banner
  mind: [
    { text: 'CHANGE MY MIND', x: 0.66, y: 0.68, maxWidthRatio: 0.44, fontSize: 32, fill: '#000000', stroke: 'transparent', strokeWidth: 0 }
  ],
  // Panik Kalm Panik: 3 vertically stacked rows
  panik: [
    { text: 'PANIK', x: 0.32, y: 0.16, maxWidthRatio: 0.48, fontSize: 36, fill: '#000000', stroke: 'transparent', strokeWidth: 0 },
    { text: 'KALM', x: 0.32, y: 0.50, maxWidthRatio: 0.48, fontSize: 36, fill: '#000000', stroke: 'transparent', strokeWidth: 0 },
    { text: 'PANIK', x: 0.32, y: 0.84, maxWidthRatio: 0.48, fontSize: 36, fill: '#000000', stroke: 'transparent', strokeWidth: 0 }
  ],
  // Anakin Padme 4 Panel
  anakin: [
    { text: 'I AM GOING TO CHANGE THE WORLD', x: 0.25, y: 0.22, maxWidthRatio: 0.42, fontSize: 32 },
    { text: 'FOR THE BETTER, RIGHT?', x: 0.75, y: 0.22, maxWidthRatio: 0.42, fontSize: 32 },
    { text: '...', x: 0.25, y: 0.72, maxWidthRatio: 0.42, fontSize: 32 },
    { text: 'FOR THE BETTER, RIGHT?!', x: 0.75, y: 0.72, maxWidthRatio: 0.42, fontSize: 32 }
  ],
  // Expanding Brain: 4 vertical levels
  brain: [
    { text: 'SMALL IDEA', x: 0.25, y: 0.13, maxWidthRatio: 0.44, fontSize: 32 },
    { text: 'GOOD IDEA', x: 0.25, y: 0.38, maxWidthRatio: 0.44, fontSize: 32 },
    { text: 'BIG BRAIN IDEA', x: 0.25, y: 0.63, maxWidthRatio: 0.44, fontSize: 32 },
    { text: 'GALAXY BRAIN', x: 0.25, y: 0.88, maxWidthRatio: 0.44, fontSize: 32 }
  ],
  // Gru's Plan: 4 panels
  gru: [
    { text: 'STEP 1', x: 0.32, y: 0.25, maxWidthRatio: 0.35, fontSize: 32 },
    { text: 'STEP 2', x: 0.82, y: 0.25, maxWidthRatio: 0.35, fontSize: 32 },
    { text: 'THE UNEXPECTED PROBLEM', x: 0.32, y: 0.75, maxWidthRatio: 0.35, fontSize: 30 },
    { text: 'THE UNEXPECTED PROBLEM...', x: 0.82, y: 0.75, maxWidthRatio: 0.35, fontSize: 30 }
  ],
  // Batman Slapping Robin
  batman: [
    { text: 'BUT I THOUGHT...', x: 0.28, y: 0.36, maxWidthRatio: 0.38, fontSize: 32 },
    { text: 'SILENCE!', x: 0.72, y: 0.18, maxWidthRatio: 0.38, fontSize: 36 }
  ],
  // Epic Handshake: Left, Right, Center Agreement
  handshake: [
    { text: 'FRONTEND DEVS', x: 0.24, y: 0.38, maxWidthRatio: 0.35, fontSize: 32 },
    { text: 'BACKEND DEVS', x: 0.76, y: 0.38, maxWidthRatio: 0.35, fontSize: 32 },
    { text: 'BLAMING THE CACHE', x: 0.50, y: 0.72, maxWidthRatio: 0.70, fontSize: 38 }
  ],
  // Buff Doge vs. Cheems
  doge: [
    { text: 'ME IN 2012', x: 0.25, y: 0.78, maxWidthRatio: 0.40, fontSize: 36 },
    { text: 'ME TODAY', x: 0.75, y: 0.78, maxWidthRatio: 0.40, fontSize: 36 }
  ],
  // Is This A Pigeon
  pigeon: [
    { text: 'ME', x: 0.32, y: 0.22, maxWidthRatio: 0.35, fontSize: 36 },
    { text: 'A TINY BUG', x: 0.70, y: 0.30, maxWidthRatio: 0.35, fontSize: 34 },
    { text: 'IS THIS A COMPLETE REWRITE?', x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38 }
  ],
  // Disaster Girl
  disaster: [
    { text: 'MY CODE IN PRODUCTION', x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 44 },
    { text: 'ME ON VACATION', x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 44 }
  ],
  // Roll Safe Think About It
  roll: [
    { text: "CAN'T HAVE BUGS", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 42 },
    { text: "IF YOU DON'T WRITE CODE", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 42 }
  ],
  // Hide the Pain Harold
  harold: [
    { text: 'EVERYTHING IS UNDER CONTROL', x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 42 }
  ],
  // Mocking Spongebob
  spongebob: [
    { text: 'IT WORKS ON MY MACHINE', x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40 },
    { text: 'iT wOrKs On My MaChInE', x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40 }
  ],
  // Monkey Puppet
  monkey: [
    { text: 'LOOKING AWAY', x: 0.28, y: 0.14, maxWidthRatio: 0.45, fontSize: 34 },
    { text: 'LOOKING GUILTY', x: 0.72, y: 0.14, maxWidthRatio: 0.45, fontSize: 34 }
  ],
  // The Rock Driving
  rock: [
    { text: 'WHAT DID YOU DO?', x: 0.50, y: 0.14, maxWidthRatio: 0.80, fontSize: 38 },
    { text: 'I PUSHED STRAIGHT TO MAIN', x: 0.50, y: 0.86, maxWidthRatio: 0.80, fontSize: 38 }
  ],
  // Ancient Aliens
  aliens: [
    { text: 'ALIENS', x: 0.50, y: 0.88, maxWidthRatio: 0.80, fontSize: 48 }
  ]
};

/**
 * Complete set of recognized default meme placeholders and template punchlines.
 * @type {Set<string>}
 */
export const ALL_DEFAULT_PRESET_TEXTS = new Set([
  'TOP TEXT',
  'BOTTOM TEXT',
  'MIDDLE TEXT',
  'OPTION 1',
  'OPTION 2',
  'OPTION 3',
  'CAPTION HERE',
  'CAPTION',
  'NEW CAPTION',
  'YOUR TEXT',
  'SUBTITLE TEXT',
  'SUBTITLE CAPTION HERE',
  'HEADER',
  'PANEL 1',
  'PANEL 2',
  'PANEL 3',
  'PANEL 4',
  ...Object.values(TEMPLATE_LAYOUT_PRESETS).flatMap((layers) =>
    layers.flatMap((l) => (l.text ? [l.text.trim().toUpperCase()] : []))
  )
]);

/**
 * Determines whether the given text is a template default / placeholder.
 * @param {string | undefined | null} text
 * @returns {boolean}
 */
export function isDefaultText(text) {
  if (!text || !text.trim()) return true;
  const upper = text.trim().toUpperCase();
  if (ALL_DEFAULT_PRESET_TEXTS.has(upper)) return true;
  return /^(TOP|BOTTOM|MIDDLE|PANEL\s*\d+|OPTION\s*\d+|CAPTION|YOUR\s*TEXT|NEW\s*CAPTION|SUBTITLE)(\s*TEXT)?$/i.test(upper);
}

/**
 * Generates initial Top and Bottom text layers calibrated for Drake Hotline Bling.
 * @returns {TextLayer[]}
 */
function createDefaultLayers() {
  return [
    {
      id: 'layer-top',
      text: 'TOP TEXT',
      x: 0.75,
      y: 0.25,
      maxWidthRatio: 0.44,
      fontSize: 44,
      fontFamily: 'Anton',
      fill: '#000000',
      stroke: 'transparent',
      strokeWidth: 0,
      fontWeight: 'bold',
      uppercase: true,
      align: 'center',
      shadow: false,
      opacity: 1
    },
    {
      id: 'layer-bottom',
      text: 'BOTTOM TEXT',
      x: 0.75,
      y: 0.75,
      maxWidthRatio: 0.44,
      fontSize: 44,
      fontFamily: 'Anton',
      fill: '#000000',
      stroke: 'transparent',
      strokeWidth: 0,
      fontWeight: 'bold',
      uppercase: true,
      align: 'center',
      shadow: false,
      opacity: 1
    }
  ];
}

class MemeState {
  currentImageUrl = $state(DEFAULT_IMAGE);
  currentTemplateName = $state(DEFAULT_NAME);
  /** @type {TextLayer[]} */
  textLayers = $state(createDefaultLayers());
  /** @type {string|null} */
  activeLayerId = $state(null);
  isTemplateModalOpen = $state(false);

  get activeLayer() {
    return this.textLayers.find((l) => l.id === this.activeLayerId) || null;
  }

  /** @param {string|null} id */
  selectLayer(id) {
    this.activeLayerId = id;
  }

  /**
   * @param {string} id
   * @param {number} x
   * @param {number} y
   */
  updateLayerPos(id, x, y) {
    const layer = this.textLayers.find((l) => l.id === id);
    if (layer) {
      layer.x = x;
      layer.y = y;
    }
  }

  /** @param {Partial<TextLayer>} fields */
  updateActiveLayer(fields) {
    const layer = this.textLayers.find((l) => l.id === this.activeLayerId);
    if (layer) {
      Object.assign(layer, fields);
    }
  }

  /**
   * @param {string} id
   * @param {Partial<TextLayer>} fields
   */
  updateLayer(id, fields) {
    const layer = this.textLayers.find((l) => l.id === id);
    if (layer) {
      Object.assign(layer, fields);
    }
  }

  /**
   * Set template by URL, name, and box count
   * @param {string} url
   * @param {string} [name]
   * @param {number} [boxCount]
   */
  setTemplate(url, name = 'Default Template', boxCount = 2) {
    this.currentImageUrl = url;
    this.currentTemplateName = name;
    this.selectTemplate({ url, name, box_count: boxCount });
  }

  /**
   * Set custom image
   * @param {string} url
   * @param {string} [name]
   */
  setImage(url, name = 'Custom Upload') {
    this.currentImageUrl = url;
    this.currentTemplateName = name;

    // If layers only contain default placeholder text, reset to standard classic top/bottom layout
    const allDefault = this.textLayers.length === 0 || this.textLayers.every((l) => isDefaultText(l.text));
    if (allDefault) {
      const baseFont = this.textLayers[0]?.fontFamily || 'Anton';
      this.textLayers = [
        {
          id: `layer-${Date.now()}-1`,
          text: 'TOP TEXT',
          x: 0.5,
          y: 0.12,
          fontSize: 48,
          fontFamily: baseFont,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 6,
          fontWeight: 'bold',
          uppercase: true,
          align: 'center',
          shadow: false,
          opacity: 1,
          maxWidthRatio: 0.9
        },
        {
          id: `layer-${Date.now()}-2`,
          text: 'BOTTOM TEXT',
          x: 0.5,
          y: 0.88,
          fontSize: 48,
          fontFamily: baseFont,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 6,
          fontWeight: 'bold',
          uppercase: true,
          align: 'center',
          shadow: false,
          opacity: 1,
          maxWidthRatio: 0.9
        }
      ];
    } else {
      // If user typed custom text, but stroke was 0 or transparent (e.g. from Drake template),
      // ensure stroke is visible so user text doesn't blend into uploaded image
      this.textLayers = this.textLayers.map((layer) => {
        if (!layer.strokeWidth || layer.stroke === 'transparent' || !layer.stroke) {
          return {
            ...layer,
            fill: layer.fill === '#000000' ? '#ffffff' : layer.fill,
            stroke: '#000000',
            strokeWidth: 6
          };
        }
        return layer;
      });
    }
    this.activeLayerId = null;
  }

  /**
   * @param {number} [x]
   * @param {number} [y]
   * @param {string} [text]
   * @returns {string}
   */
  addLayerAt(x = 0.5, y = 0.5, text = 'YOUR TEXT') {
    const newId = `layer-${Date.now()}`;
    const baseFont = this.textLayers[0]?.fontFamily || 'Anton';
    /** @type {TextLayer} */
    const newLayer = {
      id: newId,
      text,
      x: Math.max(0.08, Math.min(0.92, x)),
      y: Math.max(0.08, Math.min(0.92, y)),
      fontSize: 44,
      fontFamily: baseFont,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 6,
      fontWeight: 'bold',
      uppercase: true,
      align: 'center',
      shadow: false,
      opacity: 1,
      maxWidthRatio: 0.9
    };
    this.textLayers = [...this.textLayers, newLayer];
    this.activeLayerId = newId;
    return newId;
  }

  addLayer() {
    return this.addLayerAt(0.5, 0.5, 'NEW CAPTION');
  }

  /** @param {string} id */
  deleteLayer(id) {
    if (this.textLayers.length <= 1) return;
    this.textLayers = this.textLayers.filter((l) => l.id !== id);
    if (this.activeLayerId === id) {
      this.activeLayerId = null;
    }
  }


  /** @param {{url: string, name: string, box_count?: number}} template */
  selectTemplate(template) {
    this.currentImageUrl = template.url;
    this.currentTemplateName = template.name;

    // Check if template matches a known preset layout
    const nameLower = (template.name || '').toLowerCase();
    const matchedKey = Object.keys(TEMPLATE_LAYOUT_PRESETS).find((key) => nameLower.includes(key));
    const baseFont = this.textLayers[0]?.fontFamily || 'Anton';

    // Preserve custom text already typed by the user
    const userCustomTexts = this.textLayers
      .map((l) => l.text)
      .filter((t) => t && !isDefaultText(t));

    if (matchedKey) {
      const presetConfigs = TEMPLATE_LAYOUT_PRESETS[matchedKey];
      this.textLayers = presetConfigs.map((cfg, idx) => ({
        id: `layer-${Date.now()}-${idx}`,
        text: userCustomTexts[idx] || cfg.text || (idx === 0 ? 'TOP TEXT' : 'BOTTOM TEXT'),
        x: cfg.x ?? 0.5,
        y: cfg.y ?? 0.5,
        fontSize: cfg.fontSize ?? 44,
        fontFamily: baseFont,
        fill: cfg.fill || '#ffffff',
        stroke: cfg.stroke ?? '#000000',
        strokeWidth: cfg.strokeWidth ?? 6,
        fontWeight: cfg.fontWeight || 'bold',
        uppercase: true,
        align: cfg.align || 'center',
        shadow: false,
        opacity: 1,
        maxWidthRatio: cfg.maxWidthRatio ?? 0.9
      }));
      this.activeLayerId = null;
    } else {
      // Dynamic layout based on box_count from API
      const boxCount = template.box_count || 2;
      if (boxCount === 1) {
        this.textLayers = [
          {
            id: `layer-${Date.now()}-1`,
            text: userCustomTexts[0] || 'CAPTION HERE',
            x: 0.5,
            y: 0.88,
            fontSize: 48,
            fontFamily: baseFont,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 6,
            fontWeight: 'bold',
            uppercase: true,
            align: 'center',
            shadow: false,
            opacity: 1,
            maxWidthRatio: 0.9
          }
        ];
      } else if (boxCount === 3) {
        this.textLayers = [
          {
            id: `layer-${Date.now()}-1`,
            text: userCustomTexts[0] || 'TOP TEXT',
            x: 0.5,
            y: 0.12,
            fontSize: 42,
            fontFamily: baseFont,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 6,
            fontWeight: 'bold',
            uppercase: true,
            align: 'center',
            shadow: false,
            opacity: 1,
            maxWidthRatio: 0.9
          },
          {
            id: `layer-${Date.now()}-2`,
            text: userCustomTexts[1] || 'MIDDLE TEXT',
            x: 0.5,
            y: 0.50,
            fontSize: 42,
            fontFamily: baseFont,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 6,
            fontWeight: 'bold',
            uppercase: true,
            align: 'center',
            shadow: false,
            opacity: 1,
            maxWidthRatio: 0.9
          },
          {
            id: `layer-${Date.now()}-3`,
            text: userCustomTexts[2] || 'BOTTOM TEXT',
            x: 0.5,
            y: 0.88,
            fontSize: 42,
            fontFamily: baseFont,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 6,
            fontWeight: 'bold',
            uppercase: true,
            align: 'center',
            shadow: false,
            opacity: 1,
            maxWidthRatio: 0.9
          }
        ];
      } else if (boxCount === 4) {
        this.textLayers = [
          { id: `layer-${Date.now()}-1`, text: userCustomTexts[0] || 'PANEL 1', x: 0.25, y: 0.25, fontSize: 36, fontFamily: baseFont, fill: '#ffffff', stroke: '#000000', strokeWidth: 6, fontWeight: 'bold', uppercase: true, align: 'center', shadow: false, opacity: 1, maxWidthRatio: 0.44 },
          { id: `layer-${Date.now()}-2`, text: userCustomTexts[1] || 'PANEL 2', x: 0.75, y: 0.25, fontSize: 36, fontFamily: baseFont, fill: '#ffffff', stroke: '#000000', strokeWidth: 6, fontWeight: 'bold', uppercase: true, align: 'center', shadow: false, opacity: 1, maxWidthRatio: 0.44 },
          { id: `layer-${Date.now()}-3`, text: userCustomTexts[2] || 'PANEL 3', x: 0.25, y: 0.75, fontSize: 36, fontFamily: baseFont, fill: '#ffffff', stroke: '#000000', strokeWidth: 6, fontWeight: 'bold', uppercase: true, align: 'center', shadow: false, opacity: 1, maxWidthRatio: 0.44 },
          { id: `layer-${Date.now()}-4`, text: userCustomTexts[3] || 'PANEL 4', x: 0.75, y: 0.75, fontSize: 36, fontFamily: baseFont, fill: '#ffffff', stroke: '#000000', strokeWidth: 6, fontWeight: 'bold', uppercase: true, align: 'center', shadow: false, opacity: 1, maxWidthRatio: 0.44 }
        ];
      } else {
        // Standard classic 2-layer layout
        this.textLayers = [
          {
            id: `layer-${Date.now()}-1`,
            text: userCustomTexts[0] || 'TOP TEXT',
            x: 0.5,
            y: 0.12,
            fontSize: 48,
            fontFamily: baseFont,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 6,
            fontWeight: 'bold',
            uppercase: true,
            align: 'center',
            shadow: false,
            opacity: 1,
            maxWidthRatio: 0.9
          },
          {
            id: `layer-${Date.now()}-2`,
            text: userCustomTexts[1] || 'BOTTOM TEXT',
            x: 0.5,
            y: 0.88,
            fontSize: 48,
            fontFamily: baseFont,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 6,
            fontWeight: 'bold',
            uppercase: true,
            align: 'center',
            shadow: false,
            opacity: 1,
            maxWidthRatio: 0.9
          }
        ];
      }
      this.activeLayerId = null;
    }
  }

  /**
   * @param {string} dataUrl
   * @param {string} [name]
   */
  uploadImage(dataUrl, name) {
    this.currentImageUrl = dataUrl;
    this.currentTemplateName = name || 'Custom Upload';
  }

  reset() {
    this.currentImageUrl = DEFAULT_IMAGE;
    this.currentTemplateName = DEFAULT_NAME;
    this.textLayers = createDefaultLayers();
    this.activeLayerId = null;
  }
}

export const memeState = new MemeState();
