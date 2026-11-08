import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const url='http://127.0.0.1:8765/';
const output='qa-screenshots';
mkdirSync(output,{recursive:true});
try{
 let ready=false;
 for(let i=0;i<40;i++){try{const r=await fetch(url);if(r.ok){ready=true;break}}catch{}await sleep(250)}
 assert.ok(ready,'local preview server should start');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [1366,390]){
    const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url+'index.html',{waitUntil:'networkidle'});
    await page.locator('#count-regions').getByText('30').waitFor({timeout:15000});
    await page.waitForFunction(()=>document.querySelectorAll('#map-frame svg [data-code]').length===47,{timeout:15000});
    assert.equal(await page.locator('#count-regions').innerText(),'30');
    assert.equal(await page.locator('#count-schools').innerText(),'569');
    assert.equal(await page.locator('#count-responses').innerText(),'72');
    assert.equal(await page.locator('#map-frame svg [data-code]').count(),47);
    assert.equal(await page.locator('#map-frame svg .prefecture').count(),47);
    assert.equal(await page.locator('#map-frame svg.geolonia-svg-map').count(),1);
    await page.evaluate(()=>document.fonts.ready);
    const heroFont = await page.locator('.hero h1').evaluate(el=>getComputedStyle(el).fontFamily);
    assert.ok(heroFont.includes('Noto Serif JP'),'hero must prioritize Japanese Mincho');
    const style=await page.locator('#map-frame svg .prefecture').first().evaluate(el=>getComputedStyle(el).fill);
    assert.match(style,/rgb\(/);
    const hero=await page.locator('.hero').boundingBox();
    const search=await page.locator('.archive-search').boundingBox();
    assert.ok(search.y>=hero.y+hero.height-1,'search must start below full hero');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow on homepage');
    assert.equal(errors.length,0,'home JS errors: '+errors.join(' | '));
    await page.screenshot({path:output+'/home-'+width+'.png',fullPage:true});
    if(width===1366){
      await page.locator('#map-frame svg [data-code="14"]').click();
      await page.waitForURL(/explore\.html\?region=/);
      assert.match(page.url(),/region=%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C/);
    }
    await page.goto(url+'explore.html?q=%E6%A8%AA%E6%B5%9C%E5%B8%82',{waitUntil:'networkidle'});
    await page.locator('#result-count').waitFor({state:'visible'});
    const count=await page.locator('#result-count').innerText();
    assert.ok(/^\d+件$/.test(count),'real search count: '+count);
    assert.ok(await page.locator('.result-entry').count()>0,'Yokohama returns records');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow on search');
    await page.goto(url+'explore.html?q=%E4%B8%80%E5%AE%AE%E5%B8%82',{waitUntil:'networkidle'});
    assert.ok(await page.locator('.result-entry').count()>0,'public Ichinomiya study must be searchable');
    await page.goto(url+'municipality.html?id=ichinomiya',{waitUntil:'networkidle'});
    assert.equal(await page.locator('#muni-name').innerText(),'一宮市');
    assert.match(await page.locator('#municipal-schools').innerText(),/索引は未収録/);
    await page.goto(url+'municipality.html?id=yokohama',{waitUntil:'networkidle'});
    assert.equal(await page.locator('#muni-name').innerText(),'横浜市');
    assert.ok(await page.locator('#municipal-metrics .metric').count()===3);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow on municipality');
    await page.screenshot({path:output+'/municipality-'+width+'.png',fullPage:true});
    await page.goto(url+'article.html',{waitUntil:'networkidle'});
    assert.ok(await page.locator('.article-text section').count()>=6);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow on article');
    await page.screenshot({path:output+'/article-'+width+'.png',fullPage:true});
    assert.equal(errors.length,0,'browser JS errors: '+errors.join(' | '));
    await page.close();
  }
 } finally {await browser.close()}
 console.log('Browser QA passed: 47 prefectures, search, municipality, article, desktop/mobile.');
} finally {server.kill('SIGTERM')}
