# ICT Arcade

A student-built Cambridge IGCSE ICT revision website.

## Current website

- **Home:** Choose Theory or Practical.
- **Theory:** Eleven available chapters with searchable notes, original examples, key definitions, questions and flashcards.
- **Practical:** Coming soon. The ten practical chapters are preserved in the content source for a later release but are not shown as finished revision material.
- **Games:** All eleven original arcade games remain available, with their original gameplay and local scores.
- **Progress:** Save bookmarks, studied lessons, flashcard knowledge and written answer drafts in your browser.
- **Appearance:** Responsive light and dark styles switched using the single top-right icon.

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
