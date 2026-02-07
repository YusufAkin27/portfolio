const { loadRepos, loadReadme } = require('../lib/github');

const config = {
  github: process.env.GITHUB_URL || '  ',
  linkedin: process.env.LINKEDIN_URL || '  ',
  instagram: process.env.INSTAGRAM_URL || '  ',
  email: process.env.EMAIL || '  ,
};

function json(res, status, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(data);
}

function getPathSegments(req) {
  const pathParam = req.query.path;
  if (Array.isArray(pathParam)) return pathParam.filter(Boolean);
  if (pathParam) return String(pathParam).split('/').filter(Boolean);
  const pathname = req.url ? new URL(req.url, 'http://x').pathname : '';
  const afterApi = pathname.replace(/^\/api\/?/, '');
  return afterApi ? afterApi.split('/').filter(Boolean) : [];
}

module.exports = async (req, res) => {
  const path = getPathSegments(req);
  if (path.length === 0) {
    return json(res, 404, { error: 'Not found' });
  }

  if (path[0] === 'config') {
    return json(res, 200, config);
  }

  if (path[0] === 'repos') {
    if (path.length === 1 || (path.length === 2 && path[1] === '')) {
      try {
        const repos = await loadRepos();
        return json(res, 200, { repos });
      } catch (e) {
        console.error('GitHub API hatası:', e.message);
        const status = e.message.includes('401') ? 401 : e.message.includes('403') ? 403 : 500;
        const message = e.message.includes('401')
          ? 'GitHub token geçersiz veya süresi dolmuş.'
          : e.message.includes('403')
          ? 'GitHub rate limit veya erişim engeli.'
          : 'Projeler yüklenemedi.';
        return json(res, status, { error: message });
      }
    }
    if (path.length === 4 && path[3] === 'readme') {
      const owner = path[1];
      const repo = path[2];
      try {
        const data = await loadReadme(`${owner}/${repo}`);
        if (!data) return json(res, 404, { error: 'README not found' });
        return json(res, 200, data);
      } catch (e) {
        return json(res, 500, { error: 'Failed to fetch readme' });
      }
    }
  }

  return json(res, 404, { error: 'Not found', path: path.join('/') });
};
