const cwd = '/Users/alok/Desktop/smart-ai-doc-insights/frontend';
process.chdir(cwd);
process.env.TURBOPACK_ROOT = cwd;

const { createServer } = require('http');
const next = require(cwd + '/node_modules/next');

const app = next({ dev: true, dir: cwd, hostname: '0.0.0.0', port: 3000 });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = new URL(req.url, 'http://localhost:3000');
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log('Frontend ready on http://localhost:3000');
  });
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
