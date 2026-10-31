#!/usr/bin/env node
/** Copy only the three *already public* structured datasets from the existing checked-out site.
 * No private Gmail, unpublished PDFs, school attachments or user data are read or uploaded.
 * Usage: node scripts/sync-public-data.mjs /path/to/ptaorg.github.io
 */
import fs from 'node:fs';import path from 'node:path';import process from 'node:process';
const src=process.argv[2];if(!src){console.error('Usage: node scripts/sync-public-data.mjs <local-existing-site-repository>');process.exit(2)}
const dest=path.resolve(import.meta.dirname,'../data');const root=path.resolve(src,'data');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const m=read('research-map-index.json'),r=read('board-responses.json'),u=read('board-response-updates.json');
if(!Array.isArray(u.records)||u.records.some(x=>typeof x.countAsResponse!=='boolean'||typeof x.adminSummary!=='string'))throw Error('Published supplement schema mismatch');
if(!Array.isArray(m.municipalities)||m.municipalities.length<1||!Array.isArray(r.responses))throw Error('Published dataset schema mismatch');
const total=m.municipalities.reduce((n,x)=>n+(x.schools||[]).length,0);
for(const region of m.municipalities){if(!region.id||!region.name||!region.prefecture)throw Error('Invalid municipality');for(const school of region.schools||[]){if(!/^\/archive\/[\w\/-]+\/$/.test(school.url))throw Error('Unexpected school URL: '+school.url)}}
for(const response of r.responses){if(response.url&&!response.url.startsWith('https://ptaorg.com/board-responses/'))throw Error('Unexpected board-response URL: '+response.url)}
for(const name of ['research-map-index.json','board-responses.json','board-response-updates.json']){fs.copyFileSync(path.join(root,name),path.join(dest,name));}
console.log(`Synced publicly hosted data only: ${m.municipalities.length} municipalities, ${total} indexed schools, ${r.responses.length} public response records, ${u.records.length} supplement records.`);
console.log('Manual review required before any eventual production release; unreviewed document files were not imported.');

