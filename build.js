const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function build() {
  if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
  fs.mkdirSync(dist, { recursive: true });

  const copies = [
    ['index.html', 'index.html'],
    ['server.js', 'server.js'],
    ['package.json', 'package.json'],
    ['.env.example', '.env.example'],
  ];

  for (const [from, to] of copies) {
    const src = path.join(root, from);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dist, to));
  }

  for (const dir of ['css', 'js', 'public']) {
    const src = path.join(root, dir);
    if (fs.existsSync(src)) copyRecursive(src, path.join(dist, dir));
  }

  console.log('Build tamamlandı. Çıktı: dist/');
}

async function buildAll() {
  build();
  const { run } = require('./build-data.js');
  await run();
}

buildAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
