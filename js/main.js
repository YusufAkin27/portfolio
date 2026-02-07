(function () {
  const API_BASE = window.location.origin;

  const projectsGrid = document.getElementById('projectsGrid');
  const projectsLoading = document.getElementById('projectsLoading');
  const projectsError = document.getElementById('projectsError');
  const retryBtn = document.getElementById('retryProjects');
  const btnRefresh = document.getElementById('btnRefresh');
  const projectModal = document.getElementById('projectModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalMeta = document.getElementById('modalMeta');
  const modalLinks = document.getElementById('modalLinks');
  const modalReadme = document.getElementById('modalReadme');

  // Current year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  async function applyConfig() {
    let cfg = null;
    try {
      const res = await fetch(`${API_BASE}/api/config`);
      if (res.ok) cfg = await res.json();
    } catch (e) {}
    if (!cfg) {
      try {
        const res = await fetch(`${API_BASE}/config.json`);
        if (res.ok) cfg = await res.json();
      } catch (e) {}
    }
    if (cfg) {
      document.querySelectorAll('[data-link]').forEach((el) => {
        const key = el.getAttribute('data-link');
        if (cfg[key]) el.href = key === 'email' && !cfg[key].startsWith('mailto:') ? `mailto:${cfg[key]}` : cfg[key];
      });
    }
  }
  applyConfig();

  function setLoading(loading) {
    projectsLoading.classList.toggle('hidden', !loading);
    projectsError.classList.add('hidden');
    if (loading) {
      const cards = projectsGrid.querySelectorAll('.project-card');
      cards.forEach(c => c.remove());
    }
  }

  function setError(message) {
    projectsLoading.classList.add('hidden');
    projectsError.classList.remove('hidden');
    const textEl = document.getElementById('projectsErrorText');
    if (textEl) textEl.textContent = message || 'Projeler yüklenemedi.';
  }

  const SKILLS_BASE = ['Java', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'Redis', 'Git', 'GitHub', 'Android', 'REST API', 'Dart', 'HTML', 'CSS', 'JavaScript'];

  function updateSkillsFromRepos(repos) {
    const skillsTags = document.getElementById('skillsTags');
    if (!skillsTags) return;
    const fromRepos = new Set();
    (repos || []).forEach((r) => { if (r.language) fromRepos.add(r.language); });
    const combined = [...new Set([...SKILLS_BASE, ...fromRepos])].sort((a, b) => a.localeCompare(b));
    skillsTags.innerHTML = combined.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');
  }

  function renderProjects(repos) {
    projectsLoading.classList.add('hidden');
    projectsError.classList.add('hidden');
    updateSkillsFromRepos(repos);
    const fragment = document.createDocumentFragment();
    (repos || []).forEach((repo, i) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="project-card-inner">
          <h3>${escapeHtml(repo.name)}</h3>
          <p class="project-card-desc">${escapeHtml(repo.description || 'Açıklama yok.')}</p>
          <div class="project-card-meta">
            ${(repo.language ? `<span class="project-card-lang">${escapeHtml(repo.language)}</span>` : '')}
            ${repo.stargazers_count > 0 ? `<span class="project-card-lang">★ ${repo.stargazers_count}</span>` : ''}
          </div>
        </div>
      `;
      card.dataset.repo = repo.full_name;
      card.addEventListener('click', () => openProjectDetail(repo));
      fragment.appendChild(card);
    });
    projectsGrid.appendChild(fragment);
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function fetchProjects() {
    setLoading(true);
    try {
      let data = null;
      const apiRes = await fetch(`${API_BASE}/api/repos`);
      if (apiRes.ok) {
        data = await apiRes.json().catch(() => ({}));
      }
      if (!data && apiRes.status === 404) {
        const staticRes = await fetch(`${API_BASE}/repos.json`);
        if (staticRes.ok) data = await staticRes.json();
      }
      if (data && (data.repos || Array.isArray(data))) {
        renderProjects(data.repos || data);
        return;
      }
      const errData = await apiRes.json().catch(() => ({}));
      setError(errData.error || (apiRes.status === 404 ? 'Projeler yüklenemedi. dist içinde repos.json var mı?' : `Hata: ${apiRes.status}`));
    } catch (e) {
      setError('Projeler yüklenemedi.');
      console.error(e);
    }
  }

  async function openProjectDetail(repo) {
    modalTitle.textContent = repo.name;
    modalMeta.textContent = repo.description || '';
    modalLinks.innerHTML = '';
    if (repo.html_url) {
      const a = document.createElement('a');
      a.href = repo.html_url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'GitHub\'da aç';
      modalLinks.appendChild(a);
    }
    modalReadme.innerHTML = '<div class="loader"></div><p>README yükleniyor…</p>';
    projectModal.hidden = false;
    document.body.style.overflow = 'hidden';

    const [owner, repoName] = repo.full_name.split('/');
    try {
      const res = await fetch(`${API_BASE}/api/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/readme`);
      if (res.ok) {
        const data = await res.json();
        modalReadme.innerHTML = data.html || `<pre>${escapeHtml(data.raw || '')}</pre>`;
        return;
      }
    } catch (e) {}
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/readme`, {
        headers: { Accept: 'application/vnd.github.v3.html' },
      });
      if (ghRes.ok) {
        const html = await ghRes.text();
        modalReadme.innerHTML = html || '<p class="text-muted">README bulunamadı.</p>';
      } else {
        modalReadme.innerHTML = '<p class="text-muted">README bulunamadı.</p>';
      }
    } catch (e) {
      modalReadme.innerHTML = '<p class="text-muted">README yüklenemedi.</p>';
    }
  }

  function closeModal() {
    projectModal.hidden = true;
    document.body.style.overflow = '';
  }

  async function refreshPortfolio() {
    if (btnRefresh.classList.contains('loading')) return;
    btnRefresh.classList.add('loading');
    btnRefresh.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/api/refresh`, { method: 'POST' });
      if (res.ok) {
        const cards = projectsGrid.querySelectorAll('.project-card');
        cards.forEach(c => c.remove());
      }
      await fetchProjects();
    } catch (e) {
      await fetchProjects();
    } finally {
      btnRefresh.classList.remove('loading');
      btnRefresh.disabled = false;
    }
  }

  const burger = document.getElementById('burger');
  const navMobile = document.getElementById('navMobile');
  const btnRefreshMobile = document.getElementById('btnRefreshMobile');

  function toggleMenu() {
    const open = navMobile?.classList.toggle('is-open');
    burger?.classList.toggle('is-open', open);
    burger?.setAttribute('aria-expanded', open ? 'true' : 'false');
    navMobile?.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function closeMenu() {
    navMobile?.classList.remove('is-open');
    burger?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    navMobile?.setAttribute('aria-hidden', 'true');
  }

  burger?.addEventListener('click', toggleMenu);
  navMobile?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });
  btnRefreshMobile?.addEventListener('click', () => {
    refreshPortfolio();
    closeMenu();
  });

  retryBtn?.addEventListener('click', fetchProjects);
  btnRefresh?.addEventListener('click', refreshPortfolio);
  modalBackdrop?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  projectModal?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  fetchProjects();
})();
