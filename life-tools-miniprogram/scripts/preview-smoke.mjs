/**
 * 用系统 Chrome 对 preview 做冒烟：房贷 + 亲戚称呼
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import http from 'http'

const ROOT = path.resolve('preview')
const PORT = 8777
const OUT = '/tmp/haosuan-shots'
fs.mkdirSync(OUT, { recursive: true })

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = req.url.split('?')[0].split('#')[0]
      let file = url === '/' ? '/index.html' : url
      const full = path.join(ROOT, file)
      if (!full.startsWith(ROOT) || !fs.existsSync(full)) {
        res.writeHead(404)
        res.end('missing')
        return
      }
      const ext = path.extname(full)
      const type = ext === '.css' ? 'text/css' : ext === '.js' ? 'text/javascript' : 'text/html'
      res.writeHead(200, { 'Content-Type': type })
      res.end(fs.readFileSync(full))
    })
    server.listen(PORT, '127.0.0.1', () => resolve(server))
  })
}

function runChrome(args) {
  return new Promise((resolve, reject) => {
    const p = spawn('google-chrome', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let err = ''
    p.stderr.on('data', (d) => { err += d.toString() })
    p.on('exit', (code) => (code === 0 || code === null ? resolve(err) : reject(new Error(err || String(code)))))
  })
}

const server = await startServer()
const profile = `/tmp/chrome-smoke-${Date.now()}`
await runChrome([
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--user-data-dir=${profile}`,
  '--window-size=450,900',
  `--screenshot=${OUT}/smoke_tools.png`,
  `http://127.0.0.1:${PORT}/#tools`
])

// 用 CDP 不太方便，这里再截 mortgage 静态页
await runChrome([
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--user-data-dir=${profile}-2`,
  '--window-size=450,900',
  `--screenshot=${OUT}/smoke_mortgage.png`,
  `http://127.0.0.1:${PORT}/#mortgage`
])

server.close()
console.log('screenshots:', fs.readdirSync(OUT))
