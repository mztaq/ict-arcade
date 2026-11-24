# ICT Arcade

A student-built Cambridge IGCSE ICT revision website.

## Current website

- **Home:** A custom ICT Arcade monogram and minimal centered header, real lesson and spreadsheet previews, the official Cambridge Past Papers link, and an illustrated gallery for all 11 games.
- **Theory:** Eleven available chapters with searchable notes, original examples, key definitions, questions and flashcards.
- **Practical:** Coming soon. The ten practical chapters are preserved in the content source for a later release but are not shown as finished revision material.
- **Games:** All eleven original games have distinct illustrated scene thumbnails and direct links to their original game instructions. Original mechanics and browser-local scores are preserved.
- **Progress:** Save bookmarks, studied lessons, flashcard knowledge and written answer drafts in your browser.
- **Appearance:** A crisp cool-white and charcoal design with coral and teal accents, responsive light/dark themes and no navbar or sidebar. The top-right theme toggle and inner-page home link remain.

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
- `public/arcade-legacy.html`: Original arcade games with refreshed menu colours.
- `public/ict-arcade-mark.svg`: ICT Arcade logo asset used on the site and as the favicon.

This website is an independent study aid, not an official Cambridge product. It does not host the coursebook pages or official mark schemes.
