// Publish only original work or files with explicit permission for public redistribution.
// All references must point to actual same-origin files under public/.
// Cambridge papers, mark schemes and examiner reports are NOT included.
export const yearlyPastPapers = [
  {year:2026,papers:[]},
  {year:2025,papers:[]},
  {year:2024,papers:[]},
  {year:2023,papers:[]},
  {year:2022,papers:[]},
  {year:2021,papers:[]},
  {year:2020,papers:[]}
];

// Each yearly item groups a paper and related documents in one viewer.
// Example (only after placing authorised files under public/yearly-papers/2025/):
//
// {
//   id: "2025-mj-21",
//   title: "May/June 2025 · Paper 21",
//   questionPaper: "/yearly-papers/2025/example-question.pdf",
//   markScheme: "/yearly-papers/2025/example-marks.pdf",
//   examinerReport: "/yearly-papers/2025/example-report.pdf",
//   sourceFiles: [
//     {title: "Supporting files", url: "/yearly-papers/2025/example-files.zip"}
//   ]
// }
//
// PDFs have an in-page preview and Download button. Source files ONLY download.
// Omit any missing PDF fields. Never link to third-party paper archives.

// Solved paper entries are original or licensed worked answers, not official mark schemes.
// Example: {id:"worked-2025-21",title:"Worked Paper 21",
//           url:"/solved-papers/worked-2025-21.pdf",sourceFiles:[]}
// Paper 1 intentionally contains no solved papers.
export const solvedPastPapers = {
  2: [],
  3: []
};
