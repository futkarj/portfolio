import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import {
  fetchSheet, queryIndexPath, toList, toSlug,
} from '../../scripts/portfolio.js';

// order of the Type chips and of cards within the same date
const TYPE_ORDER = ['Demo', 'Write-up', 'Customer win', 'Planned'];
const typeRank = (type) => {
  const rank = TYPE_ORDER.indexOf(type);
  return rank === -1 ? TYPE_ORDER.length : rank;
};

function buildCard(item) {
  const li = document.createElement('li');
  li.className = 'work-card';
  li.dataset.type = item.type;

  const link = document.createElement('a');
  link.href = item.path;

  if (item.image && !item.image.includes('default-meta-image')) {
    link.append(createOptimizedPicture(item.image, item.title, false, [{ width: '600' }]));
  }

  const body = document.createElement('div');
  body.className = 'work-card-body';

  const badges = document.createElement('p');
  badges.className = 'work-card-badges';
  [...new Set([item.type, item.status].filter(Boolean))].forEach((label) => {
    const badge = document.createElement('span');
    badge.className = `badge badge-${toSlug(label)}`;
    badge.textContent = label;
    badges.append(badge);
  });

  const title = document.createElement('h2');
  title.textContent = item.title;

  body.append(badges, title);
  if (item.description) {
    const description = document.createElement('p');
    description.className = 'work-card-description';
    description.textContent = item.description;
    body.append(description);
  }

  const skills = toList(item.skills);
  if (skills.length) {
    const list = document.createElement('ul');
    list.className = 'work-card-skills';
    skills.forEach((skill) => {
      const chip = document.createElement('li');
      chip.textContent = skill;
      list.append(chip);
    });
    body.append(list);
  }

  link.append(body);
  li.append(link);
  return li;
}

function buildFilters(types, list) {
  const filters = document.createElement('div');
  filters.className = 'work-grid-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter by type');

  ['All', ...types].forEach((type) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = type;
    button.setAttribute('aria-pressed', type === 'All');
    button.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === button));
      list.querySelectorAll('.work-card').forEach((card) => {
        card.hidden = type !== 'All' && card.dataset.type !== type;
      });
    });
    filters.append(button);
  });
  return filters;
}

/**
 * Lists published work pages from the query index, with optional Type filter chips.
 * Config rows (all optional): Skill, Filters (on/off).
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  const skill = config.skill ? toSlug(config.skill) : '';
  const rows = await fetchSheet(queryIndexPath());
  const items = rows
    .filter((row) => row.type)
    .filter((row) => !skill || toList(row.skills).some((s) => toSlug(s) === skill))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || typeRank(a.type) - typeRank(b.type));

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'work-grid-empty';
    empty.textContent = 'Nothing published here yet.';
    block.append(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'work-grid-list';
  items.forEach((item) => list.append(buildCard(item)));

  const types = [...new Set(items.map((item) => item.type))]
    .sort((a, b) => typeRank(a) - typeRank(b));
  if (config.filters !== 'off' && types.length > 1) block.append(buildFilters(types, list));
  block.append(list);
}
