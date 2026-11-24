# ICT Arcade

A student-built ICT learning website designed for beginners, with Cambridge IGCSE topics and practice for students preparing for exams.

## Current website

- **Home:** A minimal four-tile ICT Arcade logo, subtle animated circuit traces, Theory, Practical and Games cards, and a Past Papers hub.
- **Theory:** Eleven chapters and 35 lessons with prominent counts, matching topic icons for every chapter and lesson, searchable notes, definitions, examples and exam advice. Questions and Flashcards remain accessible.
- **Practical:** Coming soon. The practical chapters are kept in the content source for a later release and are not shown as finished lessons.
- **Games:** The homepage Games card opens a dedicated gallery with all eleven original games. Each has distinct artwork and a direct link to its original instructions. Mechanics and browser-local scores are preserved.
- **Past Papers:** Yearly paper pages group Question Papers, Mark Schemes, Examiner Reports and Source Files. PDFs open in an embedded viewer with Download and Open PDF actions. Source Files download directly. Solved Paper 2/3 PDFs use the same preview, and Paper 1 keeps its joke. No documents are listed until authorised files are uploaded.
- **Progress:** Save bookmarks, studied lessons, flashcard knowledge and written answer drafts in your browser.
- **Appearance:** Clean white/navy styles with a modern system sans-serif font, 17px reading text, comfortable heading tracking, a lighter homepage headline, and larger lesson navigation and answer controls. Mobile styles retain readable sizes without overflow. Light/dark themes, the top-right toggle and inner-page home link remain.

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
- `src/examinerAdvice.js`: Original theory exam advice, with background references retained in source data but no external links displayed. Practical advice remains reserved for the author.
- `src/pastPapers.js`: Local-only grouped paper and solved-file manifests with no external archive URLs.
- `src/PaperViewer.jsx`: Same-origin PDF preview and downloads, with download-only source attachments.
- `src/App.jsx`: Beginner-first homepage, accessible ICT animation, Games gallery, Theory lessons and practice tools.
- `src/styles.css`: Shared design styles and responsive layout.
- `public/arcade-legacy.html`: Original arcade games with refreshed menu colours.
- `public/ict-arcade-mark.svg`: ICT Arcade logo asset used on the site and as the favicon.

This website is an independent study aid, not an official Cambridge product. It does not host Cambridge examination papers, coursebook pages or official mark schemes.

## Motion and accessibility

The homepage displays subtle circuit-board traces behind the main content. Their small moving highlights use CSS animation, require no animation library, and stop for reduced-motion preferences. The visual is decorative and hidden from screen readers.

## Exam advice

All 35 Theory lessons have short, original exam-technique guidance informed by relevant Cambridge IGCSE ICT study material. The advice appears directly in each lesson without an external link. The wording is not copied and is not presented as an official examiner report. Existing lesson exam tips are separate. Practical advice will only be added when the author provides it.

## Layout

The Theory list uses consistent outlined topic icons. Each lesson has an icon for its subject, with a small check badge once completed. The selected lesson uses a subtle blue icon highlight. All icon styles remain consistent in light and dark themes.


Course and chapter lesson totals are displayed prominently. Consistent spacing tokens, flexible filters, wrapping toolbars and responsive lesson grids reduce clipping and crowded layouts on narrower screens.

## Hosting permitted paper files

The site's Past Papers hub never links to third-party archives. No Cambridge past-paper PDFs have been copied or added.

Cambridge does not permit publication of its examination papers on public websites. Only place independently authored papers or files for which the rights holder has explicitly granted website publication rights in `public/yearly-papers/YYYY/` or `public/solved-papers/`. Private repository visibility does not make deployed `public/` files private.

After adding files with publication permission, group the related documents under the relevant year in `src/pastPapers.js`:

```js
{
  id: "2025-mj-21",
  title: "Original practice paper · May/June 2025",
  questionPaper: "/yearly-papers/2025/practice-question.pdf",
  markScheme: "/yearly-papers/2025/practice-answers.pdf",
  examinerReport: "/yearly-papers/2025/practice-feedback.pdf",
  sourceFiles: [
    {title: "Practice source files", url: "/yearly-papers/2025/practice-files.zip"}
  ]
}
```

The fields `questionPaper`, `markScheme`, and `examinerReport` each open a local PDF preview with Open PDF and Download. Omit any PDF fields you haven't uploaded. `sourceFiles` show download links only, with no preview.

For an original worked Paper 2 or 3 solution, use the appropriate `solvedPastPapers` list:

```js
{id: "worked-2025-21", title: "Worked practical example",
 url: "/solved-papers/worked-2025-21.pdf", sourceFiles: []}
```

The automated test suite verifies that every listed file exists and rejects external file URLs, missing PDFs, invalid extensions and duplicate IDs. All files must be hosted on ICT Arcade's domain. Cloudflare still processes requests and IP addresses as the hosting provider. This does not guarantee anonymity.

### Clean URLs

ICT Arcade uses browser history for paths such as `/notes` and `/past-papers`. Cloudflare Pages uses its default SPA fallback (keep the root free of a static `404.html`) so direct links and refreshes load the React router. Unknown application paths render the themed ICT 404 screen. Legacy `/#/` bookmarks are migrated automatically.
