/**
 * Centralized Reactive State for Meme Generator using Svelte 5 Runes.
 * @typedef {import('../utils/canvasRenderer.js').TextLayer} TextLayer
 */

const DEFAULT_IMAGE = '/default-meme.jpg';
const DEFAULT_NAME = 'Drake Hotline Bling';

/**
 * @typedef {{
 *   text?: string,
 *   x?: number,
 *   y?: number,
 *   maxWidthRatio?: number,
 *   fontSize?: number,
 *   align?: 'left'|'center'|'right',
 *   fill?: string,
 *   stroke?: string,
 *   strokeWidth?: number,
 *   fontWeight?: 'bold'|'normal'
 * }} PresetLayerConfig
 */

/**
 * Known layout presets and authentic catchphrases for iconic meme templates.
 * Positions text boxes into their respective visual areas rather than generic top/bottom.
 * @type {Array<{ id: string, match: RegExp, layers: PresetLayerConfig[] }>}
 */
const PRESET_DEFINITIONS = [
  // High-priority / specific memes matched first to prevent substring collisions
  {
    id: "megamind",
    match: /megamind/i,
    layers: [
      { text: "NO BITCHES?", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 50, strokeWidth: 6 }
    ]
  },
  {
    id: "mind",
    match: /change\s*my\s*mind/i,
    layers: [
      { text: "CONTROVERSIAL OPINION\nCHANGE MY MIND", x: 0.62, y: 0.68, maxWidthRatio: 0.44, fontSize: 28, fill: "#000000", stroke: "transparent", strokeWidth: 0 }
    ]
  },
  {
    id: "always",
    match: /always\s*has\s*been/i,
    layers: [
      { text: "WAIT, IT'S ALL [X]?", x: 0.32, y: 0.30, maxWidthRatio: 0.38, fontSize: 30, strokeWidth: 4 },
      { text: "ALWAYS HAS BEEN.", x: 0.78, y: 0.18, maxWidthRatio: 0.36, fontSize: 30, strokeWidth: 4 }
    ]
  },
  {
    id: "charlie_conspiracy",
    match: /charlie\s*conspiracy|pepe\s*silvia/i,
    layers: [
      { text: "MY COMPLICATED CONSPIRACY", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 },
      { text: "PEPE SILVIA DOES NOT EXIST!", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 }
    ]
  },
  {
    id: "sponge_mock",
    match: /mocking\s*spongebob/i,
    layers: [
      { text: "NORMAL STATEMENT", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "nOrMaL sTaTeMeNt", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 }
    ]
  },
  {
    id: "sponge_rainbow",
    match: /spongebob\s*rainbow/i,
    layers: [
      { text: "IMAGINATION", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 46, strokeWidth: 5 }
    ]
  },
  {
    id: "sponge_burn",
    match: /spongebob\s*burn/i,
    layers: [
      { text: "GOOD ADVICE", x: 0.35, y: 0.35, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 },
      { text: "ME IGNORING IT", x: 0.75, y: 0.70, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 }
    ]
  },
  {
    id: "brain_sleep",
    match: /brain\s*before\s*sleep/i,
    layers: [
      { text: "ARE YOU GOING TO SLEEP?", x: 0.35, y: 0.15, maxWidthRatio: 0.40, fontSize: 26, strokeWidth: 3 },
      { text: "YES, NOW SHUT UP.", x: 0.72, y: 0.15, maxWidthRatio: 0.38, fontSize: 26, strokeWidth: 3 },
      { text: "EMBARRASSING MEMORY FROM 2012", x: 0.45, y: 0.60, maxWidthRatio: 0.45, fontSize: 26, strokeWidth: 3 }
    ]
  },
  {
    id: "brain_expand",
    match: /expanding\s*brain|galaxy\s*brain/i,
    layers: [
      { text: "BASIC IDEA", x: 0.25, y: 0.13, maxWidthRatio: 0.44, fontSize: 26, strokeWidth: 3 },
      { text: "SMART IDEA", x: 0.25, y: 0.38, maxWidthRatio: 0.44, fontSize: 26, strokeWidth: 3 },
      { text: "BIG BRAIN IDEA", x: 0.25, y: 0.63, maxWidthRatio: 0.44, fontSize: 26, strokeWidth: 3 },
      { text: "GALAXY BRAIN IDEA", x: 0.25, y: 0.88, maxWidthRatio: 0.44, fontSize: 26, strokeWidth: 3 }
    ]
  },
  {
    id: "yelling_cat",
    match: /woman\s*yelling\s*at\s*cat/i,
    layers: [
      { text: "ANGRY ACCUSATIONS", x: 0.25, y: 0.16, maxWidthRatio: 0.44, fontSize: 34, strokeWidth: 4 },
      { text: "CONFUSED INNOCENT CAT", x: 0.75, y: 0.16, maxWidthRatio: 0.44, fontSize: 34, strokeWidth: 4 }
    ]
  },
  {
    id: "both_buttons",
    match: /both\s*buttons/i,
    layers: [
      { text: "OPTION A", x: 0.33, y: 0.14, maxWidthRatio: 0.28, fontSize: 26, strokeWidth: 3 },
      { text: "OPTION B", x: 0.65, y: 0.12, maxWidthRatio: 0.28, fontSize: 26, strokeWidth: 3 },
      { text: "PRESSING BOTH", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 36, strokeWidth: 4 }
    ]
  },
  {
    id: "two_buttons",
    match: /two\s*buttons/i,
    layers: [
      { text: "OPTION A", x: 0.33, y: 0.16, maxWidthRatio: 0.28, fontSize: 28, strokeWidth: 3 },
      { text: "OPTION B", x: 0.65, y: 0.13, maxWidthRatio: 0.28, fontSize: 28, strokeWidth: 3 }
    ]
  },
  {
    id: "exit_12",
    match: /left\s*exit\s*12|exit\s*12/i,
    layers: [
      { text: "SENSIBLE CHOICE", x: 0.35, y: 0.26, maxWidthRatio: 0.30, fontSize: 28, strokeWidth: 3 },
      { text: "MY BAD DECISION", x: 0.74, y: 0.35, maxWidthRatio: 0.34, fontSize: 28, strokeWidth: 3 }
    ]
  },
  {
    id: "uno_25",
    match: /uno\s*draw\s*25/i,
    layers: [
      { text: "DO SOMETHING SIMPLE", x: 0.24, y: 0.38, maxWidthRatio: 0.32, fontSize: 26, fill: "#000000", stroke: "transparent", strokeWidth: 0 },
      { text: "OR DRAW 25 CARDS", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 }
    ]
  },
  {
    id: "drake",
    match: /drake\s*(hotline|blank|no\/yes|meme)/i,
    layers: [
      { text: "DISLIKED OPTION", x: 0.75, y: 0.25, maxWidthRatio: 0.44, fontSize: 38, fill: "#000000", stroke: "transparent", strokeWidth: 0, fontWeight: "bold" },
      { text: "PREFERRED OPTION", x: 0.75, y: 0.75, maxWidthRatio: 0.44, fontSize: 38, fill: "#000000", stroke: "transparent", strokeWidth: 0, fontWeight: "bold" }
    ]
  },
  {
    id: "distracted",
    match: /distracted\s*boyfriend/i,
    layers: [
      { text: "NEW TEMPTATION", x: 0.22, y: 0.70, maxWidthRatio: 0.28, fontSize: 32, strokeWidth: 4 },
      { text: "ME", x: 0.52, y: 0.40, maxWidthRatio: 0.24, fontSize: 36, strokeWidth: 4 },
      { text: "MY RESPONSIBILITIES", x: 0.82, y: 0.60, maxWidthRatio: 0.28, fontSize: 32, strokeWidth: 4 }
    ]
  },
  {
    id: "disaster_girl",
    match: /disaster\s*girl/i,
    layers: [
      { text: "CHAOTIC ACCIDENT", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "ME WATCHING SATISFIED", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "panik",
    match: /panik\s*kalm\s*panik/i,
    layers: [
      { text: "PANIC SITUATION", x: 0.32, y: 0.16, maxWidthRatio: 0.48, fontSize: 28, fill: "#000000", stroke: "transparent", strokeWidth: 0 },
      { text: "TEMPORARY RELIEF", x: 0.32, y: 0.50, maxWidthRatio: 0.48, fontSize: 28, fill: "#000000", stroke: "transparent", strokeWidth: 0 },
      { text: "WORSE PROBLEM", x: 0.32, y: 0.84, maxWidthRatio: 0.48, fontSize: 28, fill: "#000000", stroke: "transparent", strokeWidth: 0 }
    ]
  },
  {
    id: "rock_driving",
    match: /rock\s*driving/i,
    layers: [
      { text: "INNOCENT QUESTION", x: 0.50, y: 0.14, maxWidthRatio: 0.85, fontSize: 34, strokeWidth: 4 },
      { text: "SHOCKING ANSWER", x: 0.50, y: 0.86, maxWidthRatio: 0.85, fontSize: 34, strokeWidth: 4 }
    ]
  },
  {
    id: "anakin_padme",
    match: /anakin\s*padme|for\s*the\s*better\s*right/i,
    layers: [
      { text: "I'M GOING TO CHANGE THINGS", x: 0.25, y: 0.22, maxWidthRatio: 0.42, fontSize: 28, strokeWidth: 4 },
      { text: "FOR THE BETTER, RIGHT?", x: 0.75, y: 0.22, maxWidthRatio: 0.42, fontSize: 28, strokeWidth: 4 },
      { text: "...", x: 0.25, y: 0.72, maxWidthRatio: 0.42, fontSize: 30, strokeWidth: 4 },
      { text: "FOR THE BETTER, RIGHT?!", x: 0.75, y: 0.72, maxWidthRatio: 0.42, fontSize: 28, strokeWidth: 4 }
    ]
  },
  {
    id: "handshake",
    match: /epic\s*handshake|the\s*office\s*handshake/i,
    layers: [
      { text: "FACTION A", x: 0.24, y: 0.38, maxWidthRatio: 0.34, fontSize: 30, strokeWidth: 4 },
      { text: "FACTION B", x: 0.76, y: 0.38, maxWidthRatio: 0.34, fontSize: 30, strokeWidth: 4 },
      { text: "MUTUAL AGREEMENT", x: 0.50, y: 0.72, maxWidthRatio: 0.48, fontSize: 32, strokeWidth: 4 }
    ]
  },
  {
    id: "gru",
    match: /gru'?s\s*plan/i,
    layers: [
      { text: "STEP 1: COME UP WITH PLAN", x: 0.32, y: 0.25, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 },
      { text: "STEP 2: EXECUTE PLAN", x: 0.82, y: 0.25, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 },
      { text: "DISASTROUS REALIZATION", x: 0.32, y: 0.75, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 },
      { text: "DISASTROUS REALIZATION...", x: 0.82, y: 0.75, maxWidthRatio: 0.35, fontSize: 26, strokeWidth: 3 }
    ]
  },
  {
    id: "harold",
    match: /hide\s*the\s*pain\s*harold/i,
    layers: [
      { text: "INTERNAL PAIN", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "SMILING THROUGH IT", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "monkey_puppet",
    match: /monkey\s*puppet|confused\s*monkey/i,
    layers: [
      { text: "AWKWARD SITUATION", x: 0.28, y: 0.14, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 },
      { text: "PRETENDING NOT TO HEAR", x: 0.72, y: 0.14, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 }
    ]
  },
  {
    id: "doge_cheems",
    match: /buff\s*doge|doge\s*vs\.?\s*cheems/i,
    layers: [
      { text: "THINGS BACK THEN", x: 0.25, y: 0.80, maxWidthRatio: 0.42, fontSize: 32, strokeWidth: 4 },
      { text: "THINGS TODAY", x: 0.75, y: 0.80, maxWidthRatio: 0.42, fontSize: 32, strokeWidth: 4 }
    ]
  },
  {
    id: "aliens",
    match: /ancient\s*aliens/i,
    layers: [
      { text: "I'M NOT SAYING IT WAS ALIENS", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 },
      { text: "BUT IT WAS ALIENS.", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "batman_slap",
    match: /batman\s*slapping/i,
    layers: [
      { text: "MY BAD OPINION...", x: 0.28, y: 0.36, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 },
      { text: "SHUT UP!", x: 0.72, y: 0.18, maxWidthRatio: 0.38, fontSize: 34, strokeWidth: 4 }
    ]
  },
  {
    id: "pigeon",
    match: /is\s*this\s*a?\s*pigeon|is\s*this\s*butterfly/i,
    layers: [
      { text: "ME", x: 0.30, y: 0.20, maxWidthRatio: 0.28, fontSize: 34, strokeWidth: 4 },
      { text: "OBVIOUS OBJECT", x: 0.72, y: 0.28, maxWidthRatio: 0.36, fontSize: 30, strokeWidth: 4 },
      { text: "IS THIS A PIGEON?", x: 0.50, y: 0.90, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 4 }
    ]
  },
  {
    id: "harvey",
    match: /steve\s*harvey/i,
    layers: [
      { text: "LAUGHING AT THE JOKE", x: 0.25, y: 0.15, maxWidthRatio: 0.42, fontSize: 30, strokeWidth: 4 },
      { text: "REALIZING IT'S ABOUT ME", x: 0.75, y: 0.15, maxWidthRatio: 0.42, fontSize: 30, strokeWidth: 4 }
    ]
  },
  {
    id: "roll_safe",
    match: /roll\s*safe/i,
    layers: [
      { text: "CAN'T HAVE A PROBLEM", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 },
      { text: "IF YOU NEVER START", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 }
    ]
  },
  {
    id: "trade_offer",
    match: /trade\s*offer/i,
    layers: [
      { text: "i receive:\n[WHAT I WANT]", x: 0.28, y: 0.30, maxWidthRatio: 0.40, fontSize: 30, strokeWidth: 4 },
      { text: "you receive:\n[WHAT YOU GET]", x: 0.72, y: 0.30, maxWidthRatio: 0.40, fontSize: 30, strokeWidth: 4 }
    ]
  },
  {
    id: "drowning_kid",
    match: /drowning\s*in\s*a\s*pool|mother\s*ignoring\s*kid/i,
    layers: [
      { text: "FAVORITE PROJECT", x: 0.78, y: 0.44, maxWidthRatio: 0.30, fontSize: 26, strokeWidth: 3 },
      { text: "STRUGGLING CHORE", x: 0.28, y: 0.55, maxWidthRatio: 0.30, fontSize: 26, strokeWidth: 3 },
      { text: "ABANDONED RESPONSIBILITY", x: 0.50, y: 0.88, maxWidthRatio: 0.45, fontSize: 26, strokeWidth: 3 }
    ]
  },
  {
    id: "squidward_window",
    match: /squidward\s*window/i,
    layers: [
      { text: "PEOPLE ENJOYING LIFE", x: 0.30, y: 0.75, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 },
      { text: "ME WORKING OVERTIME", x: 0.75, y: 0.25, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 }
    ]
  },
  {
    id: "pawn_stars",
    match: /pawn\s*stars|best\s*i\s*can\s*do/i,
    layers: [
      { text: "HIGH EXPECTATIONS", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "BEST I CAN DO IS FIVE DOLLARS", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 36, strokeWidth: 5 }
    ]
  },
  {
    id: "homies_hate",
    match: /all\s*my\s*homies/i,
    layers: [
      { text: "FUCK THAT THING", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "ALL MY HOMIES HATE THAT THING", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 36, strokeWidth: 5 }
    ]
  },
  {
    id: "same_picture",
    match: /same\s*picture/i,
    layers: [
      { text: "CORPORATE ASKS TO FIND DIFFERENCE", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 34, strokeWidth: 4 },
      { text: "THEY'RE THE SAME PICTURE.", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 38, strokeWidth: 5 }
    ]
  },
  {
    id: "other_women",
    match: /other\s*women/i,
    layers: [
      { text: "I BET HE'S THINKING ABOUT OTHER WOMEN", x: 0.30, y: 0.20, maxWidthRatio: 0.45, fontSize: 26, strokeWidth: 3 },
      { text: "RANDOM PROFOUND THOUGHT", x: 0.70, y: 0.75, maxWidthRatio: 0.45, fontSize: 26, strokeWidth: 3 }
    ]
  },
  {
    id: "skeleton",
    match: /waiting\s*skeleton/i,
    layers: [
      { text: "STILL WAITING FOR", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "SOMETHING THAT NEVER HAPPENS", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 }
    ]
  },
  {
    id: "bernie",
    match: /bernie\s*sanders/i,
    layers: [
      { text: "I AM ONCE AGAIN ASKING FOR YOUR FINANCIAL SUPPORT", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 34, strokeWidth: 4 }
    ]
  },
  {
    id: "this_is_fine",
    match: /this\s*is\s*fine/i,
    layers: [
      { text: "THIS IS FINE.", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 48, strokeWidth: 6 }
    ]
  },
  {
    id: "fry",
    match: /futurama\s*fry|not\s*sure\s*if/i,
    layers: [
      { text: "NOT SURE IF SERIOUS", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "OR JUST TROLLING", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "simply",
    match: /one\s*does\s*not\s*simply/i,
    layers: [
      { text: "ONE DOES NOT SIMPLY", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "WALK INTO MORDOR", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "success_kid",
    match: /success\s*kid/i,
    layers: [
      { text: "TRIED SOMETHING UNCERTAIN", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "WORKED OUT PERFECTLY", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 }
    ]
  },
  {
    id: "bad_luck_brian",
    match: /bad\s*luck\s*brian/i,
    layers: [
      { text: "OPTIMISTIC SETUP", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "DISASTROUS OUTCOME", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 }
    ]
  },
  {
    id: "morpheus",
    match: /matrix\s*morpheus|what\s*if\s*i\s*told\s*you/i,
    layers: [
      { text: "WHAT IF I TOLD YOU", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "EVERYTHING YOU KNOW IS A LIE", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 }
    ]
  },
  {
    id: "trophy",
    match: /where\s*i'?d\s*put\s*my\s*trophy/i,
    layers: [
      { text: "THIS IS WHERE I'D PUT MY TROPHY", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 },
      { text: "...IF I HAD ONE!", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "cheers_dicaprio",
    match: /leonardo\s*dicaprio\s*cheers|cheers/i,
    layers: [
      { text: "HERE'S TO YOU", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "CHEERS.", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 48, strokeWidth: 6 }
    ]
  },
  {
    id: "wonka",
    match: /condescending\s*wonka/i,
    layers: [
      { text: "PLEASE TELL ME MORE", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 },
      { text: "I'M VERY INTERESTED", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "first_world",
    match: /first\s*world\s*problems/i,
    layers: [
      { text: "MINOR INCONVENIENCE", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "RUINED MY WHOLE DAY", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 }
    ]
  },
  {
    id: "skeptical_kid",
    match: /skeptical\s*third\s*world|skeptical\s*kid/i,
    layers: [
      { text: "SO YOU'RE TELLING ME", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "ABSURD FIRST WORLD PRIVILEGE?", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 }
    ]
  },
  {
    id: "interesting_man",
    match: /most\s*interesting\s*man|i\s*don'?t\s*always/i,
    layers: [
      { text: "I DON'T ALWAYS MAKE MEMES", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 },
      { text: "BUT WHEN I DO, THEY ARE ORIGINAL", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 }
    ]
  },
  {
    id: "spiderman_point",
    match: /spiderman\s*pointing|spider\s*man\s*triple/i,
    layers: [
      { text: "PERSON A", x: 0.28, y: 0.48, maxWidthRatio: 0.35, fontSize: 32, strokeWidth: 4 },
      { text: "PERSON B ACCUSING A", x: 0.72, y: 0.48, maxWidthRatio: 0.35, fontSize: 32, strokeWidth: 4 }
    ]
  },
  {
    id: "bus_guys",
    match: /two\s*guys\s*on\s*a\s*bus/i,
    layers: [
      { text: "PESSIMIST PERSPECTIVE", x: 0.25, y: 0.75, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 },
      { text: "OPTIMIST PERSPECTIVE", x: 0.75, y: 0.75, maxWidthRatio: 0.38, fontSize: 28, strokeWidth: 3 }
    ]
  },
  {
    id: "cmon_do_something",
    match: /c'?mon\s*do\s*something/i,
    layers: [
      { text: "C'MON, DO SOMETHING...", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 }
    ]
  },
  {
    id: "say_the_line_bart",
    match: /say\s*the\s*line\s*bart/i,
    layers: [
      { text: "SAY THE LINE, BART!", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "I DIDN'T DO IT...", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 }
    ]
  },
  {
    id: "undertaker",
    match: /aj\s*styles|undertaker/i,
    layers: [
      { text: "OVERCONFIDENT ME", x: 0.35, y: 0.75, maxWidthRatio: 0.45, fontSize: 32, strokeWidth: 4 },
      { text: "INEVITABLE DOOM", x: 0.65, y: 0.30, maxWidthRatio: 0.45, fontSize: 32, strokeWidth: 4 }
    ]
  },
  {
    id: "obama_medal",
    match: /obama\s*medal/i,
    layers: [
      { text: "ME", x: 0.28, y: 0.60, maxWidthRatio: 0.35, fontSize: 36, strokeWidth: 4 },
      { text: "ME CONGRATULATING MYSELF", x: 0.72, y: 0.35, maxWidthRatio: 0.40, fontSize: 30, strokeWidth: 4 }
    ]
  },
  {
    id: "fellow_kids",
    match: /fellow\s*kids/i,
    layers: [
      { text: "HOW DO YOU DO, FELLOW KIDS?", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 }
    ]
  },
  {
    id: "skinner",
    match: /skinner\s*out\s*of\s*touch/i,
    layers: [
      { text: "AM I OUT OF TOUCH?", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 },
      { text: "NO, IT'S THE CHILDREN WHO ARE WRONG.", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 34, strokeWidth: 4 }
    ]
  },
  {
    id: "buzz_woody",
    match: /woody\s*and\s*buzz/i,
    layers: [
      { text: "EVERYWHERE", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 44, strokeWidth: 5 }
    ]
  },
  {
    id: "dinkleberg",
    match: /dinkleberg/i,
    layers: [
      { text: "DINKLEBERG...", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 48, strokeWidth: 6 }
    ]
  },
  {
    id: "bilbo_keep",
    match: /why\s*shouldn'?t\s*i\s*keep\s*it/i,
    layers: [
      { text: "AFTER ALL... WHY NOT?", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 },
      { text: "WHY SHOULDN'T I KEEP IT?", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 }
    ]
  },
  {
    id: "friendship_ended",
    match: /friendship\s*ended/i,
    layers: [
      { text: "FRIENDSHIP ENDED WITH [X]", x: 0.50, y: 0.12, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 4 },
      { text: "NOW [Y] IS MY BEST FRIEND", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 4 }
    ]
  },
  {
    id: "scientist_myself",
    match: /something\s*of\s*a\s*scientist/i,
    layers: [
      { text: "YOU KNOW, I'M SOMETHING OF A SCIENTIST MYSELF", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 32, strokeWidth: 4 }
    ]
  },
  {
    id: "gentlemen_pleasure",
    match: /gentlemen,\s*it\s*is\s*with\s*great\s*pleasure/i,
    layers: [
      { text: "GENTLEMEN, IT IS WITH GREAT PLEASURE TO INFORM YOU THAT", x: 0.50, y: 0.14, maxWidthRatio: 0.88, fontSize: 30, strokeWidth: 4 },
      { text: "TODAY IS FRIDAY", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 42, strokeWidth: 5 }
    ]
  },
  {
    id: "dont_want_to_play",
    match: /i\s*don'?t\s*want\s*to\s*play\s*with\s*you\s*anymore/i,
    layers: [
      { text: "I DON'T WANT TO PLAY WITH YOU ANYMORE", x: 0.50, y: 0.88, maxWidthRatio: 0.88, fontSize: 36, strokeWidth: 5 }
    ]
  },
  {
    id: "tap_the_sign",
    match: /don'?t\s*make\s*me\s*tap\s*the\s*sign/i,
    layers: [
      { text: "DON'T MAKE ME TAP THE SIGN", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 },
      { text: "OBVIOUS RULE ON SIGN", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 }
    ]
  },
  {
    id: "millionaire",
    match: /who\s*wants\s*to\s*be\s*a\s*millionaire/i,
    layers: [
      { text: "DIFFICULT QUESTION", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 },
      { text: "IS THAT YOUR FINAL ANSWER?", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 }
    ]
  },
  {
    id: "anime_girl_terminator",
    match: /anime\s*girl\s*hiding/i,
    layers: [
      { text: "IMPENDING DOOM", x: 0.70, y: 0.25, maxWidthRatio: 0.45, fontSize: 32, strokeWidth: 4 },
      { text: "ME HIDING UNDER DESK", x: 0.35, y: 0.75, maxWidthRatio: 0.45, fontSize: 30, strokeWidth: 4 }
    ]
  },
  {
    id: "scooby_mask",
    match: /scooby\s*doo\s*mask\s*reveal/i,
    layers: [
      { text: "LET'S SEE WHO YOU REALLY ARE...", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 36, strokeWidth: 4 },
      { text: "THE REAL CULPRIT", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 40, strokeWidth: 5 }
    ]
  },
  {
    id: "office_congrats",
    match: /the\s*office\s*congratulations/i,
    layers: [
      { text: "UNINTENDED ACCIDENT", x: 0.28, y: 0.35, maxWidthRatio: 0.38, fontSize: 30, strokeWidth: 4 },
      { text: "ME TAKING FULL CREDIT", x: 0.72, y: 0.60, maxWidthRatio: 0.38, fontSize: 30, strokeWidth: 4 }
    ]
  },
  {
    id: "feelings_power",
    match: /feelings\s*of\s*power/i,
    layers: [
      { text: "MONEY, STATUS", x: 0.50, y: 0.12, maxWidthRatio: 0.85, fontSize: 36, strokeWidth: 4 },
      { text: "THIS SPECIFIC SATISFACTION", x: 0.50, y: 0.88, maxWidthRatio: 0.85, fontSize: 38, strokeWidth: 5 }
    ]
  }
];

/**
 * Map of layout presets indexed by ID.
 * @type {Record<string, PresetLayerConfig[]>}
 */
const TEMPLATE_LAYOUT_PRESETS = Object.fromEntries(
  PRESET_DEFINITIONS.map((p) => [p.id, p.layers])
);

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
  '[KETIKA ADA SITUASI INI...]',
  '[REAKSI ATAU AKIBATNYA]',
  '[PUNCAK REAKSI / KELAKUAN]',
  '[KONDISI AWAL]',
  '[FAKTOR TAK TERDUGA]',
  '[HASIL AKHIR]',
  '[FASE 1]',
  '[FASE 2]',
  '[FASE 3]',
  '[FASE 4]',
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
  if (/^\[.*\]$/.test(upper)) return true;
  return /^(TOP|BOTTOM|MIDDLE|PANEL\s*\d+|OPTION\s*\d+|CAPTION|YOUR\s*TEXT|NEW\s*CAPTION|SUBTITLE)(\s*TEXT)?$/i.test(upper);
}

/**
 * Creates a normalized TextLayer with standard meme styling.
 * @param {string} id
 * @param {Partial<TextLayer>} props
 * @param {string} [baseFont='Anton']
 * @returns {TextLayer}
 */
export function createLayer(id, props, baseFont = 'Anton') {
  return {
    id,
    text: props.text || '',
    x: props.x ?? 0.5,
    y: props.y ?? 0.5,
    fontSize: props.fontSize ?? 44,
    fontFamily: props.fontFamily || baseFont,
    fill: props.fill || '#ffffff',
    stroke: props.stroke ?? '#000000',
    strokeWidth: props.strokeWidth ?? 6,
    fontWeight: props.fontWeight || 'bold',
    uppercase: props.uppercase ?? true,
    align: 'center',
    shadow: props.shadow ?? false,
    opacity: props.opacity ?? 1,
    maxWidthRatio: props.maxWidthRatio ?? 0.86
  };
}

/**
 * Computes adaptive safe coordinates, font size, and max width based on image aspect ratio.
 * @param {{ width?: number, height?: number, box_count?: number }} template
 * @returns {Array<{ text: string, x: number, y: number, fontSize: number, maxWidthRatio: number }>}
 */
export function getAdaptiveLayout(template) {
  const width = template.width || 1000;
  const height = template.height || 1000;
  const ratio = width / height;
  const boxCount = template.box_count || 2;

  // 1 Box (single punchline / bottom caption)
  if (boxCount === 1) {
    const y = ratio > 1.3 ? 0.90 : ratio < 0.8 ? 0.93 : 0.88;
    return [{ text: '[PUNCAK REAKSI / KELAKUAN]', x: 0.5, y, fontSize: 44, maxWidthRatio: 0.86 }];
  }

  // 3 Boxes (multi-panel setup -> middle -> punchline)
  if (boxCount === 3) {
    const topY = ratio > 1.3 ? 0.10 : ratio < 0.8 ? 0.07 : 0.12;
    const botY = ratio > 1.3 ? 0.90 : ratio < 0.8 ? 0.93 : 0.88;
    return [
      { text: '[KONDISI AWAL]', x: 0.5, y: topY, fontSize: 38, maxWidthRatio: 0.86 },
      { text: '[FAKTOR TAK TERDUGA]', x: 0.5, y: 0.50, fontSize: 38, maxWidthRatio: 0.86 },
      { text: '[HASIL AKHIR]', x: 0.5, y: botY, fontSize: 38, maxWidthRatio: 0.86 }
    ];
  }

  // 4 Boxes (quad panel / 4-koma style)
  if (boxCount === 4) {
    return [
      { text: '[FASE 1]', x: 0.25, y: 0.25, fontSize: 32, maxWidthRatio: 0.44 },
      { text: '[FASE 2]', x: 0.75, y: 0.25, fontSize: 32, maxWidthRatio: 0.44 },
      { text: '[FASE 3]', x: 0.25, y: 0.75, fontSize: 32, maxWidthRatio: 0.44 },
      { text: '[FASE 4]', x: 0.75, y: 0.75, fontSize: 32, maxWidthRatio: 0.44 }
    ];
  }

  // Standard 2 Boxes (Classic Setup & Punchline)
  let topY = 0.10;
  let botY = 0.90;
  let fontSize = 44;
  let maxWidthRatio = 0.86;

  if (ratio > 1.3) {
    topY = 0.08;
    botY = 0.92;
    fontSize = 40;
    maxWidthRatio = 0.84;
  } else if (ratio < 0.8) {
    topY = 0.06;
    botY = 0.94;
    fontSize = 38;
    maxWidthRatio = 0.88;
  }

  return [
    { text: '[KETIKA ADA SITUASI INI...]', x: 0.5, y: topY, fontSize, maxWidthRatio },
    { text: '[REAKSI ATAU AKIBATNYA]', x: 0.5, y: botY, fontSize, maxWidthRatio }
  ];
}

/**
 * Generates initial Top and Bottom text layers calibrated for Drake Hotline Bling.
 * @returns {TextLayer[]}
 */
function createDefaultLayers() {
  return [
    createLayer('layer-top', {
      text: 'DISLIKED OPTION',
      x: 0.75,
      y: 0.25,
      maxWidthRatio: 0.44,
      fontSize: 40,
      fill: '#000000',
      stroke: 'transparent',
      strokeWidth: 0
    }),
    createLayer('layer-bottom', {
      text: 'PREFERRED OPTION',
      x: 0.75,
      y: 0.75,
      maxWidthRatio: 0.44,
      fontSize: 40,
      fill: '#000000',
      stroke: 'transparent',
      strokeWidth: 0
    })
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

  /** @type {Array<{textLayers: TextLayer[], currentImageUrl: string, currentTemplateName: string}>} */
  history = $state([]);
  historyIndex = $state(-1);
  isApplyingHistory = false;
  /** @type {ReturnType<typeof setTimeout> | null} */
  #snapshotTimer = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  #draftTimer = null;

  constructor() {
    this.loadDraft();
    this.recordSnapshotImmediate();
  }

  get canUndo() {
    return this.historyIndex > 0;
  }

  get canRedo() {
    return this.historyIndex >= 0 && this.historyIndex < this.history.length - 1;
  }

  /**
   * Records a snapshot immediately.
   */
  recordSnapshotImmediate() {
    if (this.isApplyingHistory) return;
    if (this.#snapshotTimer) {
      clearTimeout(this.#snapshotTimer);
      this.#snapshotTimer = null;
    }

    const snap = {
      textLayers: JSON.parse(JSON.stringify(this.textLayers)),
      currentImageUrl: this.currentImageUrl,
      currentTemplateName: this.currentTemplateName
    };

    if (this.historyIndex >= 0 && this.history[this.historyIndex]) {
      const current = this.history[this.historyIndex];
      if (
        current.currentImageUrl === snap.currentImageUrl &&
        current.currentTemplateName === snap.currentTemplateName &&
        JSON.stringify(current.textLayers) === JSON.stringify(snap.textLayers)
      ) {
        return;
      }
    }

    const nextHistory = this.history.slice(0, this.historyIndex + 1);
    nextHistory.push(snap);
    if (nextHistory.length > 50) {
      nextHistory.shift();
    }
    this.history = nextHistory;
    this.historyIndex = nextHistory.length - 1;
    this.saveDraftDebounced();
  }

  /**
   * Debounced snapshot for rapid actions like typing or dragging.
   * @param {number} [delay]
   */
  recordSnapshotDebounced(delay = 350) {
    if (this.isApplyingHistory) return;
    if (this.#snapshotTimer) clearTimeout(this.#snapshotTimer);
    this.#snapshotTimer = setTimeout(() => {
      this.recordSnapshotImmediate();
    }, delay);
  }

  undo() {
    if (!this.canUndo) return;
    this.isApplyingHistory = true;
    if (this.#snapshotTimer) clearTimeout(this.#snapshotTimer);
    this.historyIndex--;
    const snap = this.history[this.historyIndex];
    if (snap) {
      this.textLayers = JSON.parse(JSON.stringify(snap.textLayers));
      this.currentImageUrl = snap.currentImageUrl;
      this.currentTemplateName = snap.currentTemplateName;
      this.activeLayerId = null;
    }
    this.isApplyingHistory = false;
    this.saveDraftDebounced();
  }

  redo() {
    if (!this.canRedo) return;
    this.isApplyingHistory = true;
    if (this.#snapshotTimer) clearTimeout(this.#snapshotTimer);
    this.historyIndex++;
    const snap = this.history[this.historyIndex];
    if (snap) {
      this.textLayers = JSON.parse(JSON.stringify(snap.textLayers));
      this.currentImageUrl = snap.currentImageUrl;
      this.currentTemplateName = snap.currentTemplateName;
      this.activeLayerId = null;
    }
    this.isApplyingHistory = false;
    this.saveDraftDebounced();
  }

  saveDraftDebounced() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (this.#draftTimer) clearTimeout(this.#draftTimer);
    this.#draftTimer = setTimeout(() => {
      try {
        const payload = JSON.stringify({
          textLayers: this.textLayers,
          currentImageUrl: this.currentImageUrl,
          currentTemplateName: this.currentTemplateName
        });
        localStorage.setItem('punchline_draft', payload);
      } catch (err) {
        console.warn('Failed to save draft:', err);
      }
    }, 400);
  }

  loadDraft() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = localStorage.getItem('punchline_draft');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Array.isArray(data.textLayers) && data.textLayers.length > 0 && data.currentImageUrl) {
        this.textLayers = data.textLayers;
        this.currentImageUrl = data.currentImageUrl;
        this.currentTemplateName = data.currentTemplateName || DEFAULT_NAME;
      }
    } catch (err) {
      console.warn('Failed to load draft:', err);
    }
  }

  clearDraft() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.removeItem('punchline_draft');
    } catch {}
  }

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
      this.recordSnapshotDebounced(300);
    }
  }

  /** @param {Partial<TextLayer>} fields */
  updateActiveLayer(fields) {
    const layer = this.textLayers.find((l) => l.id === this.activeLayerId);
    if (layer) {
      Object.assign(layer, fields);
      this.recordSnapshotDebounced(300);
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
      this.recordSnapshotDebounced(300);
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
      const adaptive = getAdaptiveLayout({ width: 1000, height: 1000, box_count: 2 });
      this.textLayers = adaptive.map((cfg, idx) =>
        createLayer(`layer-${Date.now()}-${idx}`, cfg, baseFont)
      );
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
    this.recordSnapshotImmediate();
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
    this.recordSnapshotImmediate();
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
    this.recordSnapshotImmediate();
  }


  /** @param {{url: string, name: string, box_count?: number, width?: number, height?: number}} template */
  selectTemplate(template) {
    this.currentImageUrl = template.url;
    this.currentTemplateName = template.name;

    // Check if template matches a known preset layout
    const nameLower = (template.name || '').toLowerCase();
    const matchedEntry = PRESET_DEFINITIONS.find((entry) => entry.match.test(nameLower));
    const baseFont = this.textLayers[0]?.fontFamily || 'Anton';

    // Preserve custom text already typed by the user
    const userCustomTexts = this.textLayers
      .map((l) => l.text)
      .filter((t) => t && !isDefaultText(t));

    const configs = matchedEntry ? matchedEntry.layers : getAdaptiveLayout(template);

    this.textLayers = configs.map((cfg, idx) =>
      createLayer(
        `layer-${Date.now()}-${idx}`,
        {
          ...cfg,
          text: userCustomTexts[idx] || cfg.text
        },
        baseFont
      )
    );
    this.activeLayerId = null;
    this.recordSnapshotImmediate();
  }

  /**
   * @param {string} dataUrl
   * @param {string} [name]
   */
  uploadImage(dataUrl, name) {
    this.currentImageUrl = dataUrl;
    this.currentTemplateName = name || 'Custom Upload';
    this.recordSnapshotImmediate();
  }

  reset() {
    this.clearDraft();
    this.currentImageUrl = DEFAULT_IMAGE;
    this.currentTemplateName = DEFAULT_NAME;
    this.textLayers = createDefaultLayers();
    this.activeLayerId = null;
    this.history = [];
    this.historyIndex = -1;
    this.recordSnapshotImmediate();
  }
}

export const memeState = new MemeState();
