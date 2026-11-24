// Only publish paper files if you own them or have explicit permission to share them.
// PDFs placed under public/ are publicly accessible through the deployed website.
// Cambridge examination papers and official mark schemes must not be mirrored here.
// Each record has {title, url}, e.g.:
// {title:"Original practice paper · Paper 2", url:"/yearly-papers/2025/example.pdf"}
// The file must actually exist under public/yearly-papers/YYYY/.
// No external website URLs are used in this catalogue.
export const yearlyPastPapers = [2026,2025,2024,2023,2022,2021,2020].map(year=>({
  year,
  papers:[]
}));

// Author-created or authorised worked files only. A solved paper listing is
// {title:"Original worked practical paper",url:"/solved-papers/example.pdf"}.
// The Paper 1 page contains a joke rather than a file collection.
export const solvedPastPapers = {
  2: [],
  3: []
};
