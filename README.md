# ICT Arcade

A student-built Cambridge IGCSE ICT revision website with notes, examples, practice and arcade games.

## What's included

- Original revision lessons for all 21 Cambridge IGCSE ICT coursebook chapters, covering 11 theory and 10 practical chapters
- Searchable notes with terminology, explanations, examples and exam tips
- 74 multiple-choice practice questions, 12 written exam-style prompts and answer guidance
- Interactive flashcards, lesson progress and bookmarked lessons
- Eleven existing arcade games with the original game logic and local scores preserved
- Responsive light and dark themes using the colours of the original ICT Arcade

## Development

Node.js 20 or later:

```bash
npm install
npm run dev
```

Production build: `npm run build`. Content checks: `npm test`.

## Structure

- `src/content.js`: Independently written revision lessons
- `src/questions.js`: Original multiple-choice and written-answer practice
- `src/App.jsx`: React learning experience
- `src/styles.css`: Layout, original palette and responsive design
- `public/arcade-legacy.html`: Original arcade gameplay, unchanged

The website is an independent study resource, not an official Cambridge product. The supplied coursebook and teaching material informed the new study content. Copyrighted book pages and official mark schemes are not redistributed. Browser storage keeps study progress and original game scores locally.
