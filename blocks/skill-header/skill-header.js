import { loadSkills } from '../../scripts/portfolio.js';

/**
 * Header for the skill template: looks up the skill named by the URL (its slug)
 * in the skills sheet.
 * Built by buildAutoBlocks with one cell: the slug.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const slug = block.textContent.trim();
  block.textContent = '';

  // a skill Doc that has its own heading keeps it, and its text; nothing to add
  const headings = [...(block.closest('main')?.querySelectorAll('h1') || [])];
  if (headings.some((h1) => h1.textContent.trim() && h1.textContent.trim() !== 'Skill')) {
    block.remove();
    return;
  }

  // otherwise the page is a bare template: fill in the name and description from the sheet
  const skill = (await loadSkills()).find((row) => row.slug === slug);
  headings.forEach((placeholder) => placeholder.remove());
  const h1 = document.createElement('h1');
  h1.textContent = skill ? skill.skill : 'Skill not found';
  const p = document.createElement('p');
  p.textContent = skill ? skill.description : 'There is no skill at this address.';
  block.append(h1, p);
  if (skill) document.title = `${skill.skill} | Rohit Jain`;
}
