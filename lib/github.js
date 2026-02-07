const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ' ';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'YusufAkin27';

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
  return data
    .filter((r) => !r.fork && !r.private)
    .map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      language: r.language,
      stargazers_count: r.stargazers_count,
      updated_at: r.updated_at,
    }));
}

async function loadReadme(fullName) {
  try {
    const url = `https://api.github.com/repos/${fullName}/readme`;
    const res = await fetchGitHub(url, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
    });
    const raw = await res.text();
    const { marked } = await import('marked');
    const html = marked.parse(raw, { async: false });
    return { raw, html };
  } catch (e) {
    return null;
  }
}

module.exports = { GITHUB_USERNAME, fetchGitHub, loadRepos, loadReadme };
