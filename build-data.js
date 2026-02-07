const fs = require('fs');
const path = require('path');
const { loadRepos } = require('./lib/github');

const config = {
  github: process.env.GITHUB_URL || '  ',
  linkedin: process.env.LINKEDIN_URL || '  ',
  instagram: process.env.INSTAGRAM_URL || '  ',
  email: process.env.EMAIL || '  ,
};

async function run() {
  const dist = path.join(__dirname, 'dist');
  if (!fs.existsSync(dist)) {
    throw new Error('Önce build çalıştır (dist klasörü yok).');
  }
  const repos = await loadRepos();
  fs.writeFileSync(path.join(dist, 'repos.json'), JSON.stringify({ repos }), 'utf8');
  fs.writeFileSync(path.join(dist, 'config.json'), JSON.stringify(config), 'utf8');
  console.log('dist/repos.json ve dist/config.json oluşturuldu (statik hosting için).');
}

module.exports = { run };
