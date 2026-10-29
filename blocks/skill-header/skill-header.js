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
  const skill = (await loadSkills()).find((row) => row.slug === slug);

  // the template page's own h1 is a placeholder; the skill's name replaces it
  block.closest('main')?.querySelectorAll('h1').forEach((placeholder) => placeholder.remove());
  const h1 = document.createElement('h1');
  h1.textContent = skill ? skill.skill : 'Skill not found';
  const p = document.createElement('p');
  p.textContent = skill ? skill.description : 'There is no skill at this address.';
  block.append(h1, p);
  if (skill) document.title = `${skill.skill} | Rohit Jain`;
}
