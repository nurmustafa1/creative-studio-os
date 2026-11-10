const STORAGE_KEY = 'creative-studio-os-projects-v1';
const statuses = ['Inquiry', 'Confirmed', 'In progress', 'Delivered'];
const form = document.querySelector('#project-form');
const list = document.querySelector('#projects');
const filter = document.querySelector('#filter');
let projects = load();
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data.filter(p => p && typeof p.id === 'string' && typeof p.client === 'string' && typeof p.event === 'string' && typeof p.date === 'string' && statuses.includes(p.status)) : [];
  } catch { return []; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); }
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function render() {
  document.querySelector('#total').textContent = projects.length;
  for (const [id, status] of [['confirmed','Confirmed'],['progress','In progress'],['delivered','Delivered']]) {
    document.getElementById(id).textContent = projects.filter(p => p.status === status).length;
  }
  list.replaceChildren();
  const visible = projects.filter(p => filter.value === 'All' || p.status === filter.value).sort((a,b) => a.date.localeCompare(b.date));
  if (!visible.length) { list.append(element('p', 'No projects found. Add one above to get started.', 'empty')); return; }
  for (const project of visible) {
    const card = element('article', undefined, 'project');
    const info = element('div');
    info.append(element('h3', project.client), element('p', `${project.event} · ${project.date}`));
    const actions = element('div', undefined, 'actions');
    const select = element('select');
    select.setAttribute('aria-label', `Status for ${project.client}`);
    for (const status of statuses) {
      const option = element('option', status); option.value = status; option.selected = status === project.status; select.append(option);
    }
    select.addEventListener('change', () => { project.status = select.value; save(); render(); });
    const remove = element('button', 'Delete', 'delete');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Delete project for ${project.client}`);
    remove.addEventListener('click', () => { if (confirm(`Delete project for ${project.client}?`)) { projects = projects.filter(p => p.id !== project.id); save(); render(); } });
    actions.append(select, remove); card.append(info, actions); list.append(card);
  }
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  projects.push({id: crypto.randomUUID(), client: String(data.get('client')).trim(), event: String(data.get('event')).trim(), date: String(data.get('date')), status: String(data.get('status'))});
  save(); form.reset(); render();
});
filter.addEventListener('change', render);
document.querySelector('#clear').addEventListener('click', () => { if (confirm('Delete all locally saved projects?')) { projects = []; save(); render(); } });
render();
