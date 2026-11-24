# ICT Arcade

A student-built ICT learning website designed for beginners, with Cambridge IGCSE topics and practice for students preparing for exams.

## Current website

- **Home:** A minimal ICT Arcade symbol, a centered beginner-friendly title, an animated Input → Process → Output diagram, Theory and Practical previews, a Cambridge Past Papers link, and a single Games card.
- **Theory:** Start from Chapter 1 and learn across eleven theory chapters using clear explanations, original examples, key definitions, questions and flashcards.
- **Practical:** Coming soon. The practical chapters are kept in the content source for a later release and are not shown as finished lessons.
- **Games:** The homepage Games card opens a dedicated gallery with all eleven original games. Each has distinct artwork and a direct link to its original instructions. Mechanics and browser-local scores are preserved.
- **Progress:** Save bookmarks, studied lessons, flashcard knowledge and written answer drafts in your browser.
- **Appearance:** A clean white and navy design with a single soft-blue accent, responsive light/dark themes and no navbar or sidebar. The top-right theme toggle and inner-page home link remain.

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
- `src/App.jsx`: Beginner-first homepage, accessible ICT animation, Games gallery, Theory lessons and practice tools.
- `src/styles.css`: Shared design styles and responsive layout.
- `public/arcade-legacy.html`: Original arcade games with refreshed menu colours.
- `public/ict-arcade-mark.svg`: ICT Arcade logo asset used on the site and as the favicon.

This website is an independent study aid, not an official Cambridge product. It does not host the coursebook pages or official mark schemes.

## Motion and accessibility

The homepage uses a simple animated input-processing-output diagram made with CSS. It requires no third-party animation library, pauses for people who prefer reduced motion, and provides an accessible text description.
