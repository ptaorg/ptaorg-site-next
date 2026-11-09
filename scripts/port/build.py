#!/usr/bin/env python3
"""Port captured legacy ptaorg.github.io pages into this site with the new header/footer.

Usage:
  python3 scripts/port/build.py <legacy-checkout> <capture-dir> [--node-path DIR]

* Page bodies are kept as they are (no text shortening); only legacy chrome is replaced.
* Legacy CSS is scoped under `.legacy` (scripts/port/prefix-css.mjs) so it cannot touch the new chrome.
* Root-absolute and https://ptaorg.com/ links are rewritten to relative links inside this site.
* Only files referenced by ported pages are copied.
"""
import hashlib, json, os, re, shutil, subprocess, sys, html as htmllib
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit, unquote, quote
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
LEGACY = Path(sys.argv[1]).resolve()
CAPTURE = Path(sys.argv[2]).resolve()
NODE_PATH = sys.argv[sys.argv.index('--node-path') + 1] if '--node-path' in sys.argv else os.environ.get('NODE_PATH', '')
SITE_HOSTS = ('https://ptaorg.com', 'http://ptaorg.com', 'https://www.ptaorg.com', 'https://ptaorg.github.io', 'http://ptaorg.github.io')
CHROME_CSS = {'/css/global-nav.css', '/css/global-footer.css', '/css/scroll-top.css', '/css/shared/current-location-nav.css'}
CHROME_JS = re.compile(r'(site\.js|scroll-top\.js|site-search-index\.js|googletagmanager|analytics\.js|site-core-v90|current-location-nav|seo-analytics|home-enhance|archive-notice)')
NEW_PAGES = {'index.html', 'explore.html', 'municipality.html', 'school.html'}
GTAG = 'G-0D18ZSSLMH'

copied = set()        # legacy-relative paths copied verbatim
css_done = {}         # legacy css path -> output path
inline_css = {}       # hash -> (text, count)

def rel_prefix(page_rel):
    depth = len(PurePosixPath(page_rel).parts) - 1
    return '../' * depth

def legacy_exists(p):
    return (LEGACY / p).is_file() or (LEGACY / p / 'index.html').is_file()

def resolve(url, page_rel):
    """Return legacy-root-relative path for a same-site URL, or None if external/anchor."""
    if not url or url.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:', 'blob:')):
        return None
    u = url
    for h in SITE_HOSTS:
        if u.startswith(h + '/') or u == h:
            u = u[len(h):] or '/'
            break
    else:
        if re.match(r'^[a-z][a-z0-9+.-]*:', u, re.I) or u.startswith('//'):
            return None
    parts = urlsplit(u)
    path = unquote(parts.path)
    if path.startswith('/'):
        target = path.lstrip('/')
    else:
        target = str(PurePosixPath(page_rel).parent / path) if path else page_rel
        target = os.path.normpath(target).replace('\\', '/')
        if target == '.':
            target = ''
        if target.startswith('..'):
            return None
    return target, parts.query, parts.fragment, path.endswith('/') or path == ''

def rewrite_url(url, page_rel, refs):
    r = resolve(url, page_rel)
    if r is None:
        return url
    target, query, frag, is_dir = r
    if target in ('', 'index.html'):
        out = 'index.html'
    else:
        out = target
        if not legacy_exists(target.rstrip('/')) and not (ROOT / target).exists():
            # unknown on both sides: keep pointing at the canonical site
            return 'https://ptaorg.com/' + quote(target, safe='/#?=&') + (('?' + query) if query else '') + (('#' + frag) if frag else '')
        if (LEGACY / target).is_file():
            refs.add(target)
        elif (LEGACY / target.rstrip('/') / 'index.html').is_file():
            refs.add(target.rstrip('/') + '/index.html')
    rel = os.path.relpath(out, str(PurePosixPath(page_rel).parent) or '.').replace('\\', '/')
    if is_dir and out not in ('index.html',) and not rel.endswith('/'):
        rel += '/'
    if out == 'index.html' and target == '' and rel == 'index.html':
        rel = 'index.html'
    rel = quote(rel, safe='/._-~%')
    return rel + (('?' + query) if query else '') + (('#' + frag) if frag else '')

URL_ATTRS = ('href', 'src', 'poster', 'action', 'data-src', 'data-href', 'data-pdf', 'data-url')

def rewrite_html(fragment, page_rel, refs):
    soup = BeautifulSoup(fragment, 'html.parser')
    for el in soup.find_all(True):
        for a in URL_ATTRS:
            if el.has_attr(a) and isinstance(el[a], str):
                el[a] = rewrite_url(el[a].strip(), page_rel, refs)
        if el.has_attr('srcset'):
            el['srcset'] = ', '.join(
                ' '.join([rewrite_url(p.strip().split(' ')[0], page_rel, refs)] + p.strip().split(' ')[1:])
                for p in el['srcset'].split(',') if p.strip())
        if el.has_attr('style'):
            el['style'] = re.sub(r'url\((["\']?)([^)"\']+)\1\)', lambda m: f'url({m.group(1)}{rewrite_url(m.group(2), page_rel, refs)}{m.group(1)})', el['style'])
        if el.name == 'a' and el.get('target') == '_blank' and el.has_attr('href') and not re.match(r'^(https?:)?//', el['href']) and not re.search(r'\.(pdf|xlsx?|docx?|pptx?|zip|csv)($|[?#])', el['href'], re.I):
            del el['target']
    return soup

def rewrite_css_urls(text, css_rel, refs):
    def fix(m):
        q, u = m.group(1), m.group(2).strip()
        if u.startswith(('data:', '#')):
            return m.group(0)
        return f'url({q}{rewrite_url(u, css_rel, refs)}{q})'
    return re.sub(r'url\(\s*(["\']?)([^)"\']+)\1\s*\)', fix, text)

def prefix_css(text):
    p = subprocess.run(['node', '-e', "import(process.argv[1]).then(m=>{let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(m.prefixCss(s)))})", str(ROOT / 'scripts/port/prefix-css.mjs')],
                       input=text.encode(), capture_output=True, env={**os.environ, 'NODE_PATH': NODE_PATH}, check=True)
    return p.stdout.decode()

def port_css(href, page_rel, refs):
    """Return relative href to a scoped copy of a legacy stylesheet, or the href itself if external."""
    if href.startswith('http'):
        return href
    r = resolve(href, page_rel)
    if r is None:
        return None
    target = r[0]
    if '/' + target in CHROME_CSS or not (LEGACY / target).is_file():
        return None
    if target not in css_done:
        refs_css = set()
        text = (LEGACY / target).read_text(encoding='utf-8', errors='ignore')
        text = rewrite_css_urls(text, target, refs_css)
        (ROOT / target).parent.mkdir(parents=True, exist_ok=True)
        (ROOT / target).write_text(prefix_css(text), encoding='utf-8')
        css_done[target] = refs_css
    refs.update(css_done[target])
    return os.path.relpath(target, str(PurePosixPath(page_rel).parent) or '.').replace('\\', '/')

JS_ROOT_RE = re.compile(r'(["\'`])(?:https?://(?:www\.)?ptaorg\.(?:com|github\.io))?/(?=(?:data|assets|js|css|journal|archive|research|board-responses|docs|kit|forms|downloads|source-pdfs|audit|starter-kit|[\w.-]+\.html)\b)')

def port_js(target, refs):
    if target in copied:
        return
    text = (LEGACY / target).read_text(encoding='utf-8', errors='ignore')
    for m in re.finditer(r'["\'`](?:https?://ptaorg\.com)?/((?:data|assets)/[^"\'`?#\s]+)', text):
        if (LEGACY / m.group(1)).is_file():
            refs.add(m.group(1))
    text = JS_ROOT_RE.sub(lambda m: '(window.__ROOT||"")+' + m.group(1), text)
    out = ROOT / target
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding='utf-8')
    copied.add(target)

SECTIONS = [
    ('regions', '地域・学校から探す', 'explore.html', r'^(archive/|research/|national-archive|research-map|research-index|research\.html|national-materials)'),
    ('database', 'データベース', 'board-responses.html', r'^(board-responses|administrative-materials|key-materials|kurume-)'),
    ('journal', '論考', 'journal.html', r'^(journal|pta-history|pta-future|report|timeline|cases|case-reading|reality|compliance|claim-evidence)'),
    ('roles', '立場から探す', None, r'^(guide-|kit/|board-brief|submit-to-board|submission-kit|board-pta-chain|pta-officer-chain)'),
    ('resources', '資料・書式', 'documents.html', r'^(documents|document\.html|forms/|downloads/|starter-kit/|pta-membership-template|pta-addon|audit/|docs/|evidence-checklist|pta-application-chain)'),
    ('about', '団体情報', 'about.html', r'^(about|contact|support|privacy-policy|popc|404)'),
    ('topics', '論点から探す', 'framework.html', r'.'),
]

def section_for(rel):
    for key, label, hub, pat in SECTIONS:
        if re.search(pat, rel):
            return key, label, hub
    return 'topics', '論点から探す', 'framework.html'

def clean_title(t):
    t = re.sub(r'\s*[｜|]\s*PTA適正化推進委員会\s*$', '', (t or '').strip())
    t = re.sub(r'\s*[|｜-]\s*PTA適正化推進委員会.*$', '', t)
    return t.strip() or 'PTA適正化推進委員会'

def redirect_target(rel, source):
    m = re.search(r'http-equiv=["\']refresh["\'][^>]*content=["\'][^"\']*url=([^"\']+)', source, re.I)
    if m:
        return m.group(1).strip()
    if len(source) < 6000:
        m = re.search(r'location\.replace\(\s*["\']([^"\']+)["\']', source)
        if m:
            return m.group(1)
        m = re.search(r"var target = '([^']+)'", source)
        if m:
            return m.group(1)
    return None

def rootify(fragment, prefix):
    if not prefix:
        return fragment
    return re.sub(r'(\s(?:href|src)=")(?!https?:|mailto:|tel:|#|/|data:)([^"]+)"', lambda m: f'{m.group(1)}{prefix}{m.group(2)}"', fragment)

HEADER = (ROOT / 'partials/header.html').read_text(encoding='utf-8').strip()
FOOTER = (ROOT / 'partials/footer.html').read_text(encoding='utf-8').strip()
INDEX_DATE = json.loads((ROOT / 'data/research-map-index.json').read_text(encoding='utf-8')).get('updated', '')

def page_shell(*, rel, title, desc, canonical, og_image, jsonld, css_links, inline_styles, body_cls, body_attrs, content, scripts, crumbs, section):
    p = rel_prefix(rel)
    e = htmllib.escape
    head = [
        '<!doctype html>', '<html lang="ja">', '<head>',
        '  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
        f'  <title>{e(title)}｜PTA適正化推進委員会</title>',
        f'  <meta name="description" content="{e(desc)}">' if desc else '',
        f'  <link rel="canonical" href="{e(canonical)}">' if canonical else '',
        f'  <meta property="og:title" content="{e(title)}"><meta property="og:type" content="article"><meta property="og:site_name" content="PTA適正化推進委員会">',
        f'  <meta property="og:description" content="{e(desc)}">' if desc else '',
        f'  <meta property="og:image" content="{e(og_image)}">' if og_image else '',
        *[f'  <script type="application/ld+json">{j}</script>' for j in jsonld],
        f'  <script async src="https://www.googletagmanager.com/gtag/js?id={GTAG}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag("js",new Date());gtag("config","{GTAG}");</script>',
        f'  <script>window.__ROOT={json.dumps(p)};</script>',
        '  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@600;700&display=swap">',
        f'  <link rel="stylesheet" href="{p}assets/style.css">',
        *[f'  <link rel="stylesheet" href="{e(h)}">' for h in css_links],
        *[f'  <style>{s}</style>' for s in inline_styles],
        f'  <link rel="stylesheet" href="{p}assets/legacy-theme.css">',
        f'  <script defer src="{p}assets/app.js"></script><script defer src="{p}assets/legacy.js"></script>',
        '</head>']
    crumb_html = '<li><a href="{}index.html">トップ</a></li>'.format(p)
    for label, href in crumbs[:-1]:
        crumb_html += f'<li><a href="{p}{href}">{e(label)}</a></li>' if href else f'<li>{e(label)}</li>'
    crumb_html += f'<li aria-current="page">{e(crumbs[-1][0])}</li>'
    attrs = ''.join(f' {k}="{e(v)}"' for k, v in body_attrs)
    has_main = re.search(r'<main\b', content) is not None
    if has_main:
        if not re.search(r'<main\b[^>]*\sid=', content):
            content = re.sub(r'<main\b', '<main id="main"', content, count=1)
        main_id = re.search(r'<main\b[^>]*\sid="([^"]+)"', content).group(1)
        body_main = f'<div class="legacy {e(body_cls)}"{attrs}><div class="legacy-body {e(body_cls)}">\n{content}\n</div></div>'
    else:
        main_id = 'main'
        body_main = f'<main id="main" class="legacy {e(body_cls)}"{attrs}><div class="legacy-body {e(body_cls)}">\n{content}\n</div></main>'
    header = rootify(HEADER, p).replace('<span data-index-date>公開済み索引</span>', f'<span data-index-date>{INDEX_DATE}時点の公開済み索引</span>' if INDEX_DATE else '<span data-index-date>公開済み索引</span>')
    body = [
        f'<body data-page="legacy" data-section="{section}" data-root="{p}">',
        f'  <a class="skip-link" href="#{main_id}">本文へ移動</a>',
        header,
        f'<div class="legacy-crumbs"><div class="container"><nav class="breadcrumb" aria-label="パンくず"><ol>{crumb_html}</ol></nav></div></div>',
        body_main,
        rootify(FOOTER, p),
        *scripts,
        '</body>', '</html>']
    return '\n'.join(x for x in head if x) + '\n' + '\n'.join(body) + '\n'

def redirect_page(rel, target_url):
    p = rel_prefix(rel)
    refs = set()
    t = rewrite_url(target_url, rel, refs)
    return refs, f'<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>移動しました｜PTA適正化推進委員会</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url={htmllib.escape(t)}"><link rel="canonical" href="{htmllib.escape(t)}"></head><body><p><a href="{htmllib.escape(t)}">移動先のページへ</a></p></body></html>\n'

def main():
    caps = sorted(CAPTURE.glob('*.json'))
    all_refs = set()
    pages_out = []
    report = {'ported': 0, 'redirects': 0, 'raw': 0}
    for f in caps:
        d = json.loads(f.read_text(encoding='utf-8'))
        rel = d['path']
        source = (LEGACY / rel).read_text(encoding='utf-8', errors='ignore')
        tgt = redirect_target(rel, source)
        out = ROOT / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        if tgt:
            refs, txt = redirect_page(rel, tgt)
            all_refs |= refs
            out.write_text(txt, encoding='utf-8')
            report['redirects'] += 1
            continue
        refs = set()
        soup = rewrite_html(d['html'], rel, refs)
        for el in soup.select('nav.loc-trail, nav.crumbs, nav.research-breadcrumb, nav.navlinks'):
            el.decompose()
        content = str(soup)
        # stylesheets
        css_links = []
        for h in d.get('css') or []:
            if not h or 'fonts.googleapis.com/css2?family=Noto' in h:
                continue
            ph = port_css(h.split('?')[0] if not h.startswith('http') else h, rel, refs)
            if ph and ph not in css_links:
                css_links.append(ph)
        inline_styles = []
        for st in d.get('styles') or []:
            txt = rewrite_css_urls(st['text'], rel, refs)
            hsh = hashlib.sha1(txt.encode()).hexdigest()[:12]
            inline_css.setdefault(hsh, [txt, 0])
            inline_css[hsh][1] += 1
            inline_styles.append(hsh)
        # scripts
        scripts = []
        src_soup = BeautifulSoup(source, 'lxml')
        if d.get('raw'):
            report['raw'] += 1
            for s in src_soup.find_all('script'):
                if s.get('type') == 'application/ld+json':
                    continue
                if s.get('src'):
                    src = s['src']
                    if CHROME_JS.search(src):
                        continue
                    if src.startswith('http'):
                        scripts.append(f'<script src="{htmllib.escape(src)}"></script>')
                        continue
                    r = resolve(src.split('?')[0], rel)
                    if r and (LEGACY / r[0]).is_file():
                        port_js(r[0], refs)
                        scripts.append(f'<script src="{os.path.relpath(r[0], str(PurePosixPath(rel).parent) or ".")}"></script>')
                else:
                    t = s.string or ''
                    if 'gtag(' in t or 'dataLayer' in t or not t.strip():
                        continue
                    scripts.append('<script>' + JS_ROOT_RE.sub(lambda m: '(window.__ROOT||"")+' + m.group(1), t) + '</script>')
        else:
            for s in src_soup.find_all('script'):
                if s.get('src') or s.get('type') == 'application/ld+json':
                    continue
                t = s.string or ''
                if 'gtag(' in t or 'dataLayer' in t or not t.strip():
                    continue
                scripts.append('<script>' + JS_ROOT_RE.sub(lambda m: '(window.__ROOT||"")+' + m.group(1), t) + '</script>')
        key, label, hub = section_for(rel)
        h1 = BeautifulSoup(d['html'], 'html.parser').find('h1')
        title = clean_title(d.get('title'))
        name = re.sub(r'\s+', ' ', h1.get_text(' ', strip=True)) if h1 else title
        if len(name) > 48:
            name = title if len(title) <= 48 else name[:46] + '…'
        crumbs = [(label, hub), (name, None)]
        if rel.startswith('archive/') and rel.count('/') >= 2:
            city = rel.split('/')[1]
            if (LEGACY / 'archive' / city / 'index.html').is_file() and rel != f'archive/{city}/index.html':
                cap = CAPTURE / f'archive__{city}__index.html.json'
                cname = city
                if cap.is_file():
                    cname = clean_title(json.loads(cap.read_text(encoding='utf-8')).get('title')).split('｜')[0][:20]
                crumbs = [(label, hub), (cname, f'archive/{city}/'), (name, None)]
        canonical = d.get('canonical') or ('https://ptaorg.com/' + rel.replace('index.html', ''))
        og = d.get('ogImage') or ''
        pages_out.append(dict(rel=rel, title=title, desc=d.get('description', ''), canonical=canonical if canonical.startswith('http') else 'https://ptaorg.com' + canonical,
                              og_image=og if og.startswith('http') else ('https://ptaorg.com' + og if og.startswith('/') else og),
                              jsonld=d.get('jsonld') or [], css_links=css_links, inline_styles=inline_styles,
                              body_cls=d.get('bodyClass', ''), body_attrs=d.get('bodyAttrs') or [], content=content,
                              scripts=scripts, crumbs=crumbs, section=key))
        all_refs |= refs
        report['ported'] += 1
    # shared inline styles become files
    (ROOT / 'css/legacy-inline').mkdir(parents=True, exist_ok=True)
    shared = {}
    for hsh, (txt, n) in inline_css.items():
        if n >= 2:
            (ROOT / f'css/legacy-inline/{hsh}.css').write_text(prefix_css(txt), encoding='utf-8')
            shared[hsh] = True
    prefixed_cache = {}
    for pg in pages_out:
        links = list(pg['css_links'])
        styles = []
        for hsh in pg['inline_styles']:
            if hsh in shared:
                links.append(os.path.relpath(f'css/legacy-inline/{hsh}.css', str(PurePosixPath(pg['rel']).parent) or '.'))
            else:
                if hsh not in prefixed_cache:
                    prefixed_cache[hsh] = prefix_css(inline_css[hsh][0])
                styles.append(prefixed_cache[hsh])
        html_out = page_shell(rel=pg['rel'], title=pg['title'], desc=pg['desc'], canonical=pg['canonical'], og_image=pg['og_image'],
                              jsonld=pg['jsonld'], css_links=links, inline_styles=styles, body_cls=pg['body_cls'], body_attrs=pg['body_attrs'],
                              content=pg['content'], scripts=pg['scripts'], crumbs=pg['crumbs'], section=pg['section'])
        (ROOT / pg['rel']).write_text(html_out, encoding='utf-8')
    # copy referenced non-html files (and html files that are not ported pages, e.g. templates)
    ported = {pg['rel'] for pg in pages_out}
    port_js('data/site-search-index.js', all_refs)
    queue = sorted(all_refs)
    seen = set()
    while queue:
        r = queue.pop()
        if r in seen or r in ported or r in NEW_PAGES:
            continue
        seen.add(r)
        srcp = LEGACY / r
        if not srcp.is_file():
            continue
        if r.endswith('.js'):
            more = set(); port_js(r, more); queue.extend(more - seen); continue
        if r.endswith('.css'):
            more = set(); port_css('/' + r, 'index.html', more); queue.extend(more - seen); continue
        dst = ROOT / r
        if dst.exists() and r.startswith('data/') and r.endswith('.json'):
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(srcp, dst)
        copied.add(r)
    report['copied_files'] = len(copied)
    report['css_files'] = len(css_done)
    report['shared_inline_css'] = len(shared)
    print(json.dumps(report, ensure_ascii=False))
    (ROOT / 'scripts/port/last-build.json').write_text(json.dumps({'report': report, 'pages': sorted(ported), 'copied': sorted(copied), 'css': sorted(css_done)}, ensure_ascii=False, indent=1), encoding='utf-8')

if __name__ == '__main__':
    main()
