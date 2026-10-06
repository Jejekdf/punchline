# Punchline

> Fast, private, and watermark-free client-side meme generator built with Svelte 5 and HTML5 Canvas.

**Live**: [punchline.rnm.biz.id](https://punchline.rnm.biz.id)

---

## Features

- **100% Client-Side Privacy**: Photos, text, and meme exports never leave your browser. Zero tracking, zero uploads to external servers.
- **Interactive Canvas Editor**: Freehand draggable text layers, corner resize handles, custom alignment, and outline controls.
- **100+ Popular Templates**: Instant search and filtering across classic and trending meme templates (powered by Imgflip API with local offline fallbacks).
- **Custom Image Upload**: Drag-and-drop, paste from clipboard (`Ctrl+V`), or upload any local image file.
- **HD Export & Web Share**: One-click high-resolution PNG download, clipboard image copy, and native mobile sharing.
- **Zero Watermarks**: Clean, unbranded meme exports every single time.

---

## Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev) (Runes architecture: `$state`, `$derived`, `$props`)
- **Build Tool**: [Vite 6](https://vitejs.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Rendering**: HTML5 Canvas 2D API with sub-16ms redraw pipeline
- **Icons**: [Lucide Svelte](https://lucide.dev)
- **Runtime & Package Manager**: [Bun](https://bun.sh) (compatible with npm / pnpm)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or [Node.js](https://nodejs.org) (v18+)

### Installation

```bash
git clone https://github.com/Jejekdf/punchline.git
cd punchline
bun install
```

### Development

```bash
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
bun run build
bun run preview
```

---

## License

MIT
