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
  "drake": [
    { text: "DISLIKED OPTION", x: 0.75, y: 0.25, maxWidthRatio: 0.44, fontSize: 40, fill: "#000000", stroke: "transparent", strokeWidth: 0, fontWeight: "bold" },
    { text: "PREFERRED OPTION", x: 0.75, y: 0.75, maxWidthRatio: 0.44, fontSize: 40, fill: "#000000", stroke: "transparent", strokeWidth: 0, fontWeight: "bold" }
  ],
  // Two Buttons
  "button": [
    { text: "OPTION A", x: 0.33, y: 0.16, maxWidthRatio: 0.28, fontSize: 28, strokeWidth: 3 },
    { text: "OPTION B", x: 0.65, y: 0.13, maxWidthRatio: 0.28, fontSize: 28, strokeWidth: 3 }
  ],
  // Distracted Boyfriend: 3 entities
  "distracted": [
    { text: "NEW TEMPTATION", x: 0.22, y: 0.70, maxWidthRatio: 0.28, fontSize: 34, strokeWidth: 4 },
    { text: "ME", x: 0.52, y: 0.40, maxWidthRatio: 0.24, fontSize: 38, strokeWidth: 4 },
    { text: "MY RESPONSIBILITIES", x: 0.82, y: 0.60, maxWidthRatio: 0.28, fontSize: 34, strokeWidth: 4 }
  ],
  // Left Exit 12
  "exit": [
    { text: "SENSIBLE CHOICE", x: 0.35, y: 0.26, maxWidthRatio: 0.30, fontSize: 30, strokeWidth: 3 },
    { text: "MY BAD DECISION", x: 0.74, y: 0.35, maxWidthRatio: 0.34, fontSize: 30, strokeWidth: 3 }
  ],
  // UNO Draw 25
  "uno": [
    { text: "DO SOMETHING SIMPLE", x: 0.24, y: 0.38, maxWidthRatio: 0.32, fontSize: 28, fill: "#000000", stroke: "transparent", strokeWidth: 0 },
    { text: "OR DRAW 25 CARDS", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 }
  ],
  // Trade Offer
  "trade": [
    { text: "I RECEIVE: NOTHING", x: 0.28, y: 0.30, maxWidthRatio: 0.40, fontSize: 34, strokeWidth: 4 },
    { text: "YOU RECEIVE: ABSOLUTELY NOTHING", x: 0.72, y: 0.30, maxWidthRatio: 0.40, fontSize: 34, strokeWidth: 4 }
  ],
  // Woman Yelling at Cat
  "yelling": [
    { text: "ME YELLING AT 3 AM", x: 0.25, y: 0.16, maxWidthRatio: 0.44, fontSize: 36, strokeWidth: 4 },
    { text: "THE CONFUSED CAT", x: 0.75, y: 0.16, maxWidthRatio: 0.44, fontSize: 36, strokeWidth: 4 }
  ],
  // Always Has Been
  "always": [
    { text: "WAIT, IT'S ALL [X]?", x: 0.32, y: 0.30, maxWidthRatio: 0.38, fontSize: 32, strokeWidth: 4 },
    { text: "ALWAYS HAS BEEN.", x: 0.78, y: 0.18, maxWidthRatio: 0.36, fontSize: 32, strokeWidth: 4 }
  ],
  // Change My Mind
  "mind": [
    { text: "YOUR CONTROVERSIAL OPINION\nCHANGE MY MIND", x: 0.62, y: 0.68, maxWidthRatio: 0.44, fontSize: 28, fill: "#000000", stroke: "transparent", strokeWidth: 0 }
  ],
  // Panik Kalm Panik
  "panik": [
    { text: "UNEXPECTED SITUATION", x: 0.32, y: 0.16, maxWidthRatio: 0.48, fontSize: 30, fill: "#000000", stroke: "transparent", strokeWidth: 0 },
    { text: "FOUND A WORKAROUND", x: 0.32, y: 0.50, maxWidthRatio: 0.48, fontSize: 30, fill: "#000000", stroke: "transparent", strokeWidth: 0 },
    { text: "BROKE EVERYTHING ELSE", x: 0.32, y: 0.84, maxWidthRatio: 0.48, fontSize: 30, fill: "#000000", stroke: "transparent", strokeWidth: 0 }
  ],
  // Anakin Padme 4 Panel
  "anakin": [
    { text: "I'M GOING TO CHANGE THINGS", x: 0.25, y: 0.22, maxWidthRatio: 0.42, fontSize: 28, strokeWidth: 4 },
    { text: "FOR THE BETTER, RIGHT?", x: 0.75, y: 0.22, maxWidthRatio: 0.42, fontSize: 28, strokeWidth: 4 },
    { text: "...", x: 0.25, y: 0.72, maxWidthRatio: 0.42, fontSize: 30, strokeWidth: 4 },
    { text: "FOR THE BETTER, RIGHT?!", x: 0.75, y: 0.72, maxWidthRatio: 0.42, fontSize: 28, strokeWidth: 4 }
  ],
  // Expanding Brain
  "brain": [
    { text: "SMALL BRAIN IDEA", x: 0.25, y: 0.13, maxWidthRatio: 0.44, fontSize: 28, strokeWidth: 3 },
    { text: "AVERAGE BRAIN IDEA", x: 0.25, y: 0.38, maxWidthRatio: 0.44, fontSize: 28, strokeWidth: 3 },
    { text: "BIG BRAIN IDEA", x: 0.25, y: 0.63, maxWidthRatio: 0.44, fontSize: 28, strokeWidth: 3 },
    { text: "GALAXY BRAIN IDEA", x: 0.25, y: 0.88, maxWidthRatio: 0.44, fontSize: 28, strokeWidth: 3 }
  ],
  // Gru's Plan
  "gru": [
    { text: "STEP 1: COME UP WITH A PLAN", x: 0.32, y: 0.25, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 },
    { text: "STEP 2: EXECUTE THE PLAN", x: 0.82, y: 0.25, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 },
    { text: "UNINTENDED CONSEQUENCE", x: 0.32, y: 0.75, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 },
    { text: "UNINTENDED CONSEQUENCE...", x: 0.82, y: 0.75, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 }
  ],
  // Batman Slapping Robin
  "batman": [
    { text: "MY SILLY IDEA...", x: 0.28, y: 0.36, maxWidthRatio: 0.36, fontSize: 28, strokeWidth: 3 },
    { text: "SHUT UP AND LISTEN!", x: 0.72, y: 0.18, maxWidthRatio: 0.36, fontSize: 32, strokeWidth: 4 }
  ],
  // Epic Handshake
  "handshake": [
    { text: "SIDE A", x: 0.24, y: 0.38, maxWidthRatio: 0.35, fontSize: 30, strokeWidth: 4 },
    { text: "SIDE B", x: 0.76, y: 0.38, maxWidthRatio: 0.35, fontSize: 30, strokeWidth: 4 },
    { text: "SHARED AGREEMENT", x: 0.50, y: 0.72, maxWidthRatio: 0.70, fontSize: 36, strokeWidth: 5 }
  ],
  // Buff Doge vs. Cheems
  "doge": [
    { text: "DOGE IN THE PAST", x: 0.25, y: 0.80, maxWidthRatio: 0.40, fontSize: 32, strokeWidth: 4 },
    { text: "CHEEMS TODAY", x: 0.75, y: 0.80, maxWidthRatio: 0.40, fontSize: 32, strokeWidth: 4 }
  ],
  // Is This A Pigeon
  "pigeon": [
    { text: "ME", x: 0.30, y: 0.20, maxWidthRatio: 0.32, fontSize: 34, strokeWidth: 4 },
    { text: "OBVIOUS THING", x: 0.72, y: 0.28, maxWidthRatio: 0.32, fontSize: 32, strokeWidth: 4 },
    { text: "IS THIS A PIGEON?", x: 0.50, y: 0.90, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // Steve Harvey
  "harvey": [
    { text: "HEARING THE JOKE", x: 0.25, y: 0.15, maxWidthRatio: 0.44, fontSize: 30, strokeWidth: 4 },
    { text: "REALIZING IT'S ABOUT YOU", x: 0.75, y: 0.15, maxWidthRatio: 0.44, fontSize: 30, strokeWidth: 4 }
  ],
  // Disaster Girl
  "disaster": [
    { text: "MY LATEST MISTAKE", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 },
    { text: "ME WATCHING IT UNFOLD", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 }
  ],
  // Mother Ignoring Kid Drowning In A Pool
  "drowning": [
    { text: "ATTENTION", x: 0.52, y: 0.18, maxWidthRatio: 0.30, fontSize: 28, strokeWidth: 3 },
    { text: "FAVORITE THING", x: 0.78, y: 0.44, maxWidthRatio: 0.28, fontSize: 26, strokeWidth: 3 },
    { text: "FORGOTTEN RESPONSIBILITY", x: 0.28, y: 0.55, maxWidthRatio: 0.32, fontSize: 26, strokeWidth: 3 },
    { text: "ANCIENT ABANDONED PROJECT", x: 0.50, y: 0.88, maxWidthRatio: 0.50, fontSize: 26, strokeWidth: 3 }
  ],
  // They're The Same Picture
  "same picture": [
    { text: "CORPORATE ASKS TO FIND THE DIFFERENCE", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 30, strokeWidth: 4 },
    { text: "THEY'RE THE SAME PICTURE.", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // I Bet He's Thinking About Other Women
  "other women": [
    { text: "I BET HE'S THINKING ABOUT OTHER WOMEN", x: 0.30, y: 0.20, maxWidthRatio: 0.45, fontSize: 26, strokeWidth: 3 },
    { text: "WHY DO PENGUINS HAVE KNEES?", x: 0.70, y: 0.75, maxWidthRatio: 0.45, fontSize: 26, strokeWidth: 3 }
  ],
  // Pawn Stars Best I Can Do
  "pawn": [
    { text: "BEST I CAN DO IS FIVE DOLLARS", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // Waiting Skeleton
  "skeleton": [
    { text: "STILL WAITING FOR...", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 },
    { text: "...ANY SIGN OF LIFE", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 }
  ],
  // Bernie Support
  "bernie": [
    { text: "I AM ONCE AGAIN ASKING FOR YOUR FINANCIAL SUPPORT", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 34, strokeWidth: 4 }
  ],
  // This Is Fine
  "fine": [
    { text: "THIS IS FINE.", x: 0.50, y: 0.88, maxWidthRatio: 0.80, fontSize: 42, strokeWidth: 5 }
  ],
  // Futurama Fry
  "fry": [
    { text: "NOT SURE IF SERIOUS", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 },
    { text: "OR JUST TROLLING", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 }
  ],
  // One Does Not Simply
  "simply": [
    { text: "ONE DOES NOT SIMPLY", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 },
    { text: "WALK INTO MORDOR", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 }
  ],
  // Success Kid
  "success": [
    { text: "TRIED SOMETHING RISKY", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 },
    { text: "WORKED OUT PERFECTLY", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // Bad Luck Brian
  "brian": [
    { text: "FINALLY GETS A BREAK", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 },
    { text: "BREAKS BOTH LEGS", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // Matrix Morpheus
  "morpheus": [
    { text: "WHAT IF I TOLD YOU", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 },
    { text: "EVERYTHING YOU KNOW IS A LIE", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 }
  ],
  // Squidward Looking Out Window
  "squidward": [
    { text: "PEOPLE ENJOYING THEIR WEEKEND", x: 0.30, y: 0.75, maxWidthRatio: 0.40, fontSize: 28, strokeWidth: 3 },
    { text: "ME WORKING OVERTIME", x: 0.75, y: 0.25, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 }
  ],
  // All My Homies Hate
  "homies": [
    { text: "FORGET THAT THING", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 },
    { text: "ALL MY HOMIES HATE THAT THING", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 5 }
  ],
  // This Is Where I'd Put My Trophy
  "trophy": [
    { text: "THIS IS WHERE I'D PUT MY TROPHY", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 5 },
    { text: "...IF I HAD ONE!", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 42, strokeWidth: 5 }
  ],
  // Mocking Spongebob
  "sponge": [
    { text: "NORMAL STATEMENT", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 },
    { text: "nOrMaL sTaTeMeNt", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // Monkey Puppet
  "monkey": [
    { text: "FEELING GUILTY", x: 0.28, y: 0.14, maxWidthRatio: 0.42, fontSize: 30, strokeWidth: 4 },
    { text: "PRETENDING NOT TO NOTICE", x: 0.72, y: 0.14, maxWidthRatio: 0.42, fontSize: 30, strokeWidth: 4 }
  ],
  // The Rock Driving
  "rock": [
    { text: "WHERE ARE WE GOING?", x: 0.50, y: 0.14, maxWidthRatio: 0.80, fontSize: 34, strokeWidth: 4 },
    { text: "YOU DON'T WANT TO KNOW", x: 0.50, y: 0.86, maxWidthRatio: 0.80, fontSize: 34, strokeWidth: 4 }
  ],
  // Ancient Aliens
  "alien": [
    { text: "ALIENS.", x: 0.50, y: 0.88, maxWidthRatio: 0.80, fontSize: 46, strokeWidth: 6 }
  ],
  // Roll Safe Think About It
  "roll": [
    { text: "CAN'T MAKE MISTAKES", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 },
    { text: "IF YOU NEVER DO ANYTHING", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 }
  ],
  // Hide the Pain Harold
  "harold": [
    { text: "SMILING THROUGH THE PAIN", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // Leonardo DiCaprio Cheers
  "cheers": [
    { text: "HERE'S TO YOU", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 },
    { text: "CHEERS", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 40, strokeWidth: 5 }
  ],
  // Condescending Wonka
  "wonka": [
    { text: "PLEASE TELL ME MORE", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 },
    { text: "I'M VERY INTERESTED", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // First World Problems
  "first world": [
    { text: "MY MINOR INCONVENIENCE", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 5 },
    { text: "RUINED MY WHOLE DAY", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 5 }
  ],
  // Third World Skeptical Kid
  "skeptical": [
    { text: "SO YOU'RE TELLING ME", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 },
    { text: "PEOPLE THROW AWAY FOOD?", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
  ],
  // Most Interesting Man
  "interesting man": [
    { text: "I DON'T ALWAYS MAKE MEMES", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 5 },
    { text: "BUT WHEN I DO, THEY ARE ORIGINAL", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 5 }
  ],
  // Megamind
  "megamind": [
    { text: "NO BITCHES?", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 44, strokeWidth: 6 }
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
      text: 'DISLIKED OPTION',
      x: 0.75,
      y: 0.25,
      maxWidthRatio: 0.44,
      fontSize: 40,
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
      text: 'PREFERRED OPTION',
      x: 0.75,
      y: 0.75,
      maxWidthRatio: 0.44,
      fontSize: 40,
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
