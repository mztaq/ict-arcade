# ICT Arcade

A student-built Cambridge IGCSE ICT revision website.

## Current website

- **Home:** Centered ICT Arcade logo, Theory and Practical preview cards, an official Cambridge Past Papers link, and selectable games at the bottom.
- **Theory:** Eleven available chapters with searchable notes, original examples, key definitions, questions and flashcards.
- **Practical:** Coming soon. The ten practical chapters are preserved in the content source for a later release but are not shown as finished revision material.
- **Games:** All eleven original games are selectable from the bottom of the homepage, with direct game instructions. Original gameplay and local scores are preserved.
- **Progress:** Save bookmarks, studied lessons, flashcard knowledge and written answer drafts in your browser.
- **Appearance:** Warm cream and yellow styling with no navbar or sidebar. A light/dark icon stays at the top right. Inner pages have a logo link back home.

The content files contain additional practical lesson summaries and questions for future development. They are not published in the current Practical section.

## Development

Node.js 20 or newer.

```bash
npm install
npm run dev
npm test
npm run build
```

## Project structure

- `src/content.js`: Original lesson summaries covering the coursebook structure.
- `src/questions.js`: Original multiple-choice and written-answer practice.
- `src/App.jsx`: React homepage, Theory pages, and learning tools.
- `src/styles.css`: Shared design styles and responsive layout.
- `public/arcade-legacy.html`: Original arcade games.

This website is an independent study aid, not an official Cambridge product. It does not host the coursebook pages or official mark schemes.
