require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = ' ';
const GITHUB_USERNAME = 'YusufAkin27';

const config = {
  github: '  ',
  linkedin: '  ',
  instagram: '  ',
  email: '  ,
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

let reposCache = null;
let readmeCache = new Map();

async function fetchGitHub(url, options = {}) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
  return res;
}

async function loadRepos() {
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`;
  const res = await fetchGitHub(url);
  const data = await res.json();
  reposCache = data.filter((r) => !r.fork && !r.private).map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description,
    html_url: r.html_url,
    language: r.language,
    stargazers_count: r.stargazers_count,
    updated_at: r.updated_at,
  }));
  readmeCache.clear();
  return reposCache;
}

async function loadReadme(fullName) {
  if (readmeCache.has(fullName)) return readmeCache.get(fullName);
  try {
    const url = `https://api.github.com/repos/${fullName}/readme`;
    const res = await fetchGitHub(url, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
    });
    const raw = await res.text();
    const html = marked.parse(raw, { async: false });
    const result = { raw, html };
    readmeCache.set(fullName, result);
    return result;
  } catch (e) {
    return null;
  }
}

app.get('/api/config', (req, res) => res.json(config));

async function handleRepos(req, res) {
  try {
    const repos = reposCache || (await loadRepos());
    res.json({ repos });
  } catch (e) {
    console.error('GitHub API hatası:', e.message);
    const status = e.message.includes('401') ? 401 : e.message.includes('403') ? 403 : 500;
    const message = e.message.includes('401')
      ? 'GitHub token geçersiz veya süresi dolmuş. .env dosyasında GITHUB_TOKEN güncelle.'
      : e.message.includes('403')
      ? 'GitHub rate limit veya erişim engeli.'
      : 'Projeler yüklenemedi.';
    res.status(status).json({ error: message });
  }
}
app.get('/api/repos', handleRepos);
app.get('/api/repos/', handleRepos);

app.get('/api/repos/:owner/:repo/readme', async (req, res) => {
  const fullName = `${req.params.owner}/${req.params.repo}`;
  try {
    const data = await loadReadme(fullName);
    if (!data) return res.status(404).json({ error: 'README not found' });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch readme' });
  }
});

app.post('/api/refresh', async (req, res) => {
  try {
    await loadRepos();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

app.post('/api/webhook/github', (req, res) => {
  const event = req.headers['x-github-event'];
  if (event === 'push') {
    loadRepos().catch(console.error);
  }
  res.status(200).send('OK');
});

cron.schedule('0 0 * * *', () => loadRepos().catch(console.error), { timezone: 'Europe/Istanbul' });

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found', path: req.path });
  }
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) res.status(404).send('Sayfa bulunamadı');
  });
});

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Portfolio running at http://localhost:${port}`);
      resolve(server);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1).then(resolve).catch(reject);
      } else reject(err);
    });
  });
}

loadRepos()
  .then(() => startServer(PORT))
  .catch((e) => {
    console.error('Initial load failed:', e.message);
    startServer(PORT);
  });
