import { getMetadata, toClassName } from './aem.js';

const sheets = {};

/**
 * Fetches a published sheet or index as an array of rows. Each path is fetched once per page.
 * @param {string} path JSON path, e.g. /query-index.json
 * @returns {Promise<Object[]>} rows, or [] if the sheet can't be loaded
 */
export function fetchSheet(path) {
  if (!sheets[path]) {
    sheets[path] = fetch(path)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return sheets[path];
}

/** Where the query index lives. Local drafts point it at a test copy (`Query Index` metadata). */
export const queryIndexPath = () => getMetadata('query-index') || '/query-index.json';

/** Where the skills sheet lives. Local drafts point it at a test copy (`Skills Sheet` metadata). */
export const skillsSheetPath = () => getMetadata('skills-sheet') || '/skills.json';

/** Skill pages live next to the skills sheet: /skills.json → /skills/<slug>. */
export function skillUrl(slug) {
  return `${skillsSheetPath().replace(/\.json$/, '')}/${slug}`;
}

/** Splits a comma-separated metadata or index value into trimmed items. */
export function toList(value) {
  return (value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

/** The slug of a skill name, matching the `slug` column of the skills sheet. */
export const toSlug = (name) => toClassName(name.replace(/&/g, 'and'));

/**
 * Loads the skills sheet, sorted by its `order` column.
 * @returns {Promise<{skill: string, slug: string, description: string}[]>}
 */
export async function loadSkills() {
  const rows = await fetchSheet(skillsSheetPath());
  return rows
    .map((row) => ({ ...row, slug: row.slug || toSlug(row.skill) }))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}
