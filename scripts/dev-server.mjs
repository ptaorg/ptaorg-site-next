import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2), port=Number(args[args.indexOf('--port')+1])||4173;
const root=process.cwd(), types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
http.createServer((req,res)=>{
  if(new URL(req.url,'http://local').pathname==='/__qa/frame'){const u=new URL(req.url,'http://local'),w=Math.max(320,Math.min(1440,Number(u.searchParams.get('width'))||390));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(`<!doctype html><html lang="ja"><title>Responsive QA</title><body style="margin:0;background:#e4e9e7"><iframe title="${w}px レスポンシブ確認" name="app" src="${u.searchParams.get('route')?.startsWith('/')&&!u.searchParams.get('route').startsWith('//')?u.searchParams.get('route').replaceAll('&','&amp;').replaceAll('\"','&quot;'):'/index.html'}" style="display:block;width:${w}px;height:860px;margin:16px auto;border:1px solid #a8b8b1;background:white"></iframe></body></html>`);return;}
  let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));}catch{res.writeHead(400).end();return;}
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log(`Preview ready on port ${port}`));
