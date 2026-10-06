<script>
  /**
   * Punchline Brand Logo.
   * Geometric pixel shades on dark obsidian squircle.
   *
   * @type {{
   *   size?: number,
   *   class?: string
   * }}
   */
  let {
    size = 32,
    class: className = ''
  } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 64 64"
  width={size}
  height={size}
  fill="none"
  class="shrink-0 select-none {className}"
  aria-hidden="true"
>
  <defs>
    <!-- Punchline Dark Background -->
    <linearGradient id="punchlineLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Punchline Border -->
    <linearGradient id="punchlineLogoBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#64748b" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.9" />
    </linearGradient>
  </defs>

  <!-- Squircle Base -->
  <rect width="64" height="64" rx="16" fill="url(#punchlineLogoBg)" />
  <rect x="1" y="1" width="62" height="62" rx="15" stroke="url(#punchlineLogoBorder)" stroke-width="1.75" fill="none" />

  <!-- Viewfinder Corner Marks -->
  <path d="M11 18V13H16" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M53 18V13H48" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M11 46V51H16" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M53 46V51H48" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Authentic Pixel Meme Shades (Pure geometric vector art, zero AI sparkle) -->
  <g id="punchline-pixel-shades-logo">
    <!-- Subtle drop shadow -->
    <path
      d="M11 25 H29 V40 H21 V37 H18 V34 H15 V31 H11 Z M29 26 H35 V29 H29 Z M35 25 H53 V31 H49 V34 H46 V37 H43 V40 H35 Z"
      fill="#000000"
      fill-opacity="0.45"
    />

    <!-- Solid White Contrast Frame -->
    <path
      d="M11 24 H29 V39 H21 V36 H18 V33 H15 V30 H11 Z M29 25 H35 V28 H29 Z M35 24 H53 V30 H49 V33 H46 V36 H43 V39 H35 Z"
      fill="#000000"
      stroke="#ffffff"
      stroke-width="2.5"
      stroke-linejoin="miter"
    />

    <!-- Pure Pitch-Black Lenses -->
    <path
      d="M11 24 H29 V39 H21 V36 H18 V33 H15 V30 H11 Z M29 25 H35 V28 H29 Z M35 24 H53 V30 H49 V33 H46 V36 H43 V39 H35 Z"
      fill="#000000"
    />

    <!-- Diagonal Glare Pixels (Left Lens) -->
    <rect x="15" y="26" width="3" height="3" fill="#ffffff" />
    <rect x="18" y="29" width="3" height="3" fill="#ffffff" />
    <rect x="21" y="32" width="3" height="3" fill="#ffffff" />

    <!-- Diagonal Glare Pixels (Right Lens) -->
    <rect x="37" y="26" width="3" height="3" fill="#ffffff" />
    <rect x="40" y="29" width="3" height="3" fill="#ffffff" />
    <rect x="43" y="32" width="3" height="3" fill="#ffffff" />
  </g>
</svg>
