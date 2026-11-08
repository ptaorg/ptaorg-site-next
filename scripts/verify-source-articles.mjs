import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const cwd=process.cwd();
const sourceRoot=path.resolve(process.argv[2]||'original-public-site');
const manifest=JSON.parse(fs.readFileSync(path.join(cwd,'data/migrated-articles.json'),'utf8'));
function read(p){return fs.readFileSync(p,'utf8')}
function extractBody(html){
 const standard=html.indexOf('<section class="journal-article-body"');
 const from=standard>=0?standard:html.indexOf('<main');
 const open=html.indexOf('<article',from);
 const start=html.indexOf('>',open)+1;
 const end=html.indexOf('</article>',start);
 if(from<0||open<from||start<1||end<=start)throw Error('Invalid body boundary');
 return html.slice(start,end);
}
function extractImported(html){
 const open=html.indexOf('<article class="article-text source-article"');
 const start=html.indexOf('>',open)+1;
 const end=html.indexOf('</article>',start);
 if(open<0||start<1||end<=start)throw Error('Invalid imported body');
 return html.slice(start,end);
}
function visibleText(content){return content.replace(/<[^>]*>/g,'')}
for(const a of manifest.articles){
 const sourcePath=path.join(sourceRoot,'journal',a.slug+'.html');
 const original=read(sourcePath);
 const sourceSha=createHash('sha1').update('blob '+Buffer.byteLength(original)+'\0').update(original).digest('hex');
 if(sourceSha!==a.sourceGitBlobSha)throw Error('Source changed after migration: '+a.slug+' '+sourceSha);
 const body=extractBody(original);
 if(body.length!==a.articleBodyOriginalChars)throw Error('Source body length drift: '+a.slug);
 const dst=read(path.join(cwd,a.destination));
 const imported=extractImported(dst);
 // The original text and HTML entities must survive character-for-character.
 // Only URL attributes and generated h2 anchors differ in migrated HTML.
 if(visibleText(body)!==visibleText(imported)){
  const origTxt=visibleText(body),newTxt=visibleText(imported);
  let pos=0;while(pos<origTxt.length&&origTxt[pos]===newTxt[pos])pos++;
  throw Error('Text mismatch '+a.slug+' character '+pos+' ('+origTxt.length+' vs '+newTxt.length+')');
 }
 if((body.match(/<h2\b/g)||[]).length!==a.sectionCount)throw Error('Heading mismatch '+a.slug);
 if((body.match(/<img\b/g)||[]).length!==a.images)throw Error('Image count mismatch '+a.slug);
}
console.log('Verified '+manifest.articles.length+' migrated articles against pinned public-source Git blob hashes and exact original body text.');
