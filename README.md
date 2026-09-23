# Cat Bingo

A mobile-first cat-spotting bingo game themed around the free-roaming cats of the Azores.

The app is a frontend-only Vite and TypeScript project. It generates a randomized 5x5 bingo board with a checked free space in the center, persists progress in the browser, and shows cat images and details when a square is opened.

## Features

- Randomized 5x5 board with 24 options and one free space
- Bingo detection for rows, columns, and corner-to-corner diagonals
- Animated `Bingo!` overlay when a new bingo is achieved
- Cell detail modal with image, title, and mark/unmark action
- Confirmation before starting a new game when bingo has not been achieved
- Direct new-game reset after bingo has been achieved
- Browser persistence through `localStorage`
- Mobile-first responsive layout

## Requirements

- Node.js 18 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173/`.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Adding Bingo Options

Bingo options are defined in [`src/consts/sampleItems.ts`](src/consts/sampleItems.ts). Each option has:

- `id`: stable identifier used by the app
- `title`: text shown on the board and in the detail modal
- `imageSrc`: path to the option's image

Example:

```ts
{
	id: 'near-hydrangeas',
	title: 'Near Hydrangeas',
	imageSrc: '/assets/cats/cat%20near%20hydrangeas.jpg',
}
```

The board uses 24 randomly selected options, so the catalog should contain more than 24 entries for variety.

## Adding Images

Place static images in [`public/assets/cats`](public/assets/cats). Files in `public/` are served from the site root, so this file:

```text
public/assets/cats/example.jpg
```

is referenced in code as:

```text
/assets/cats/example.jpg
```

URL-encode spaces in filenames, for example `cat%20near%20hydrangeas.jpg`. For consistency in the modal, use square images when possible and keep the subject clearly visible against its background.

## Project Structure

```text
index.html                  App shell and modal markup
src/main.ts                 Application bootstrap and DOM wiring
src/consts/                 Bingo option catalog
src/models/                 Bingo board, cell, and option models
src/managers/               Board lifecycle and interaction orchestration
src/storage/                localStorage persistence
src/ui/                     Detail and confirmation modal behavior
src/style.css               Responsive layout, states, and transitions
public/assets/cats/         Static cat images
```

## Persistence

The current board is stored in `localStorage` under the key `generic-bingo-state-v1`. There is no backend or shared game state: different browsers and devices have independent boards.

## Deployment

Run the production build before deploying:

```bash
npm run build
```

The generated `dist/` directory is the static site artifact. It can be deployed to GitHub Pages or another static host. For a GitHub Pages project site served from a subpath, configure Vite's `base` option to match the repository name before building.