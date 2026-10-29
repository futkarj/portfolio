import { getMetadata } from '../../scripts/aem.js';
import { skillUrl, toList, toSlug } from '../../scripts/portfolio.js';

function badges(...labels) {
  const p = document.createElement('p');
  p.className = 'work-header-badges';
  [...new Set(labels.filter(Boolean))].forEach((label) => {
    const badge = document.createElement('span');
    badge.className = `badge badge-${toSlug(label)}`;
    badge.textContent = label;
    p.append(badge);
  });
  return p;
}

function row(label, items) {
  const dl = document.createElement('div');
  dl.className = 'work-header-row';
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.append(...items);
  dl.append(dt, dd);
  return dl;
}

function button(label, href, primary) {
  const a = document.createElement('a');
  a.className = `button ${primary ? 'primary' : 'secondary'}`;
  a.href = href;
  a.textContent = label;
  return a;
}

/**
 * Auto-block: built from the page's metadata (Type, Status, Skills, Tools, Live Demo, Repo).
 * Authors never place it; buildAutoBlocks adds it under the h1 of any page with a Type.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.textContent = '';
  block.append(badges(getMetadata('type'), getMetadata('status')));

  const details = document.createElement('dl');
  const skills = toList(getMetadata('skills')).map((skill) => {
    const a = document.createElement('a');
    a.href = skillUrl(toSlug(skill));
    a.textContent = skill;
    a.className = 'work-header-skill';
    return a;
  });
  if (skills.length) details.append(row('Skills', skills));

  const tools = toList(getMetadata('tools'));
  if (tools.length) details.append(row('Tools', [tools.join(' · ')]));
  if (details.children.length) block.append(details);

  const demo = getMetadata('live-demo');
  const repo = getMetadata('repo');
  if (demo || repo) {
    const actions = document.createElement('p');
    actions.className = 'work-header-actions';
    if (demo) actions.append(button('Live demo', demo, true));
    if (repo) actions.append(button('Code on GitHub', repo, !demo));
    block.append(actions);
  }
}
