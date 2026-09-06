// Landing page servida por el propio servidor en GET / (misma URL y puerto
// que la API). Es pública a propósito: un navegador no puede mandar el
// Bearer token de la API, y una landing que exigiera auth no cumpliría su
// función de puerta de entrada. Los comandos de instalación se generan por
// pedido con el origin real del request (igual que los scripts de
// /install), así el copy-paste funciona contra cualquier IP/dominio por el
// que se llegue al servidor.
export interface LandingOptions {
  origin: string;
  token?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildLandingHtml({ origin, token }: LandingOptions): string {
  const escOrigin = escapeHtml(origin);
  // Con CLIENT_TOKEN activo, el one-liner debe llevar el header embebido
  // (el script que sirve /install ya lo trae adentro para la descarga del
  // binario; acá lo mostramos para que el primer curl también pase el auth).
  const auth = token ? `-H "Authorization: Bearer ${token}" ` : '';
  const authPs = token ? ` -Headers @{Authorization='Bearer ${token}'}` : '';
  const cmdLinux = `curl -fsSL ${auth}${origin}/install | sh`;
  const cmdWindows = `irm ${origin}/install.ps1${authPs} | iex`;
  const cmdUnlinux = `curl -fsSL ${auth}${origin}/uninstall | sh`;
  const cmdUnwindows = `irm ${origin}/uninstall.ps1${authPs} | iex`;
  const tokenNote = token
    ? `<div class="callout"><b>Nota:</b> este servidor exige autenticación, así que el comando ya lleva el token de acceso embebido. Quien lo copie puede usar la API: el límite de abuso es el rate limit diario del servidor.</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lexema CLI — IA en tu terminal, sin exponer tu API key</title>
<meta name="description" content="Lexema CLI: CLI de IA para la terminal (ask, chat) con servidor proxy autoalojado que guarda tu API key. Proveedor agnóstico: OpenRouter, OpenAI, Groq o un LLM local.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23060a07'/%3E%3Ctext x='16' y='22' font-size='16' text-anchor='middle' fill='%2346e08a' font-family='monospace'%3E›_%3C/text%3E%3C/svg%3E">
<style>
:root{
  --bg:#060a07;--bg2:#0a120c;--panel:#0d1710;--panel2:#101d14;
  --line:#1d3a26;--line2:#2a5236;
  --green:#46e08a;--green2:#22c55e;--cyan:#39d2ff;--amber:#ffc857;
  --red:#ff6b6b;
  --text:#cfe8d8;--dim:#7d9484;
  --mono:ui-monospace,'JetBrains Mono','Fira Code','Cascadia Code',Menlo,Consolas,'Liberation Mono',monospace;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  background:var(--bg);color:var(--text);
  font-family:var(--mono);font-size:15px;line-height:1.65;overflow-x:hidden;
}
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 60% 40% at 50% -10%,rgba(34,197,94,.09),transparent),
    linear-gradient(rgba(29,58,38,.14) 1px,transparent 1px),
    linear-gradient(90deg,rgba(29,58,38,.14) 1px,transparent 1px);
  background-size:auto,44px 44px,44px 44px;
}
::selection{background:rgba(70,224,138,.28)}
a{color:var(--cyan);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:1080px;margin:0 auto;padding:0 22px;position:relative;z-index:1}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(6,10,7,.85);backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);
}
.nav-in{max-width:1080px;margin:0 auto;padding:10px 22px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.nav-logo{font-weight:700;color:var(--green);letter-spacing:.5px}
.nav-logo .p{color:var(--dim)}
.nav-links{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}
.nav-links a{color:var(--dim);font-size:12.5px;padding:5px 10px;border-radius:6px;border:1px solid transparent}
.nav-links a:hover{color:var(--green);text-decoration:none;border-color:var(--line);background:var(--panel)}

section{padding:74px 0 26px}
.sec-tag{
  display:inline-block;font-size:11.5px;letter-spacing:.22em;color:var(--green);
  border:1px solid var(--line2);background:rgba(34,197,94,.06);
  padding:4px 12px;border-radius:999px;margin-bottom:14px;
}
h2{font-size:clamp(22px,3.4vw,32px);line-height:1.25;margin-bottom:12px;color:#eafff2}
h2 .hl{color:var(--green)}
h3{font-size:16.5px;color:var(--cyan);margin-bottom:8px}
.lead{color:var(--dim);max-width:760px;margin-bottom:26px}
.lead b{color:var(--text);font-weight:600}

#hero{min-height:96svh;display:flex;align-items:center;padding:110px 0 60px}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center}
.hero-kicker{color:var(--dim);font-size:13px;margin-bottom:14px}
.hero-kicker .path{color:var(--cyan)}
h1{font-size:clamp(32px,5.4vw,54px);line-height:1.08;letter-spacing:-.5px;color:#eafff2;margin-bottom:16px}
h1 .lex{color:var(--green);text-shadow:0 0 24px rgba(70,224,138,.45)}
.hero-sub{color:var(--dim);font-size:15px;max-width:520px;margin-bottom:24px}
.hero-sub b{color:var(--text)}
.hero-badges{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px}
.badge{font-size:11.5px;color:var(--green);border:1px solid var(--line2);background:rgba(34,197,94,.07);padding:5px 11px;border-radius:999px}
.badge.alt{color:var(--cyan);border-color:#1b3d4a;background:rgba(57,210,255,.06)}
.badge.alt2{color:var(--amber);border-color:#4a3d1b;background:rgba(255,200,87,.06)}
.cta{display:flex;gap:12px;flex-wrap:wrap}
.cta a{
  font-size:13.5px;padding:10px 18px;border-radius:8px;border:1px solid var(--line2);
  color:var(--text);transition:all .2s;
}
.cta a.primary{background:var(--green);color:#06120a;font-weight:700;border-color:var(--green)}
.cta a.primary:hover{background:var(--green2);text-decoration:none;box-shadow:0 0 24px rgba(34,197,94,.35)}
.cta a.ghost:hover{color:var(--green);border-color:var(--green2);text-decoration:none}

.term{
  background:var(--panel);border:1px solid var(--line);border-radius:12px;
  overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.45);
}
.term-bar{
  display:flex;align-items:center;gap:7px;padding:9px 14px;
  background:var(--panel2);border-bottom:1px solid var(--line);
}
.dot{width:11px;height:11px;border-radius:50%}
.dot.r{background:#ff5f57}.dot.y{background:#febc2e}.dot.g{background:#28c840}
.term-title{margin-left:8px;font-size:11.5px;color:var(--dim);letter-spacing:.06em}
.term-body{padding:16px 18px;font-size:13.5px;line-height:1.8;overflow-x:auto}
.term-body .ln{white-space:pre-wrap;word-break:break-word}
.p{color:var(--green);font-weight:700}
.c{color:var(--cyan)}
.d{color:var(--dim)}
.g2{color:var(--green2)}
.ok{color:var(--green)}
.cursor{display:inline-block;width:8px;height:15px;background:var(--green);vertical-align:-2px;animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}

.grid2{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:18px 20px}
.card h4{color:var(--text);font-size:14px;margin-bottom:6px}
.card p{color:var(--dim);font-size:13px}
.card .ico{font-size:22px;margin-bottom:8px;display:block}

.os-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
.tbtn{
  font-family:var(--mono);font-size:12.5px;color:var(--dim);cursor:pointer;
  background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:8px 14px;transition:all .2s;
}
.tbtn:hover{color:var(--text);border-color:var(--line2)}
.tbtn.on{color:var(--green);border-color:var(--green2);background:rgba(34,197,94,.09)}
.os-panel{display:none}
.os-panel.on{display:block;animation:fadeUp .45s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

.cmd{
  background:var(--panel);border:1px solid var(--line);border-radius:12px;
  overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.4);
}
.cmd-bar{
  display:flex;align-items:center;gap:8px;padding:8px 12px;
  background:var(--panel2);border-bottom:1px solid var(--line);
}
.cmd-bar .shell{font-size:11.5px;color:var(--dim);letter-spacing:.06em;flex:1}
.copy-btn{
  font-family:var(--mono);font-size:11.5px;cursor:pointer;
  color:var(--green);background:rgba(34,197,94,.08);border:1px solid var(--line2);
  border-radius:7px;padding:5px 12px;transition:all .2s;
}
.copy-btn:hover{background:rgba(34,197,94,.18);border-color:var(--green2)}
.copy-btn.done{color:#06120a;background:var(--green);border-color:var(--green)}
.cmd pre{padding:16px 18px;overflow-x:auto}
.cmd code{font-size:13.5px;line-height:1.7;color:var(--text);white-space:pre;word-break:break-all}
.cmd-notes{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.chip{font-size:11.5px;color:var(--dim);border:1px dashed var(--line2);padding:4px 11px;border-radius:8px;background:rgba(13,23,16,.7)}
.chip b{color:var(--green);font-weight:600}

.callout{
  border-left:3px solid var(--amber);background:rgba(255,200,87,.05);
  border-radius:0 10px 10px 0;padding:13px 17px;font-size:13px;color:var(--dim);
  margin:16px 0;
}
.callout b{color:var(--amber)}
.callout.g{border-left-color:var(--green);background:rgba(34,197,94,.05)}
.callout.g b{color:var(--green)}

details{margin-top:18px;border:1px dashed var(--line2);border-radius:10px;padding:12px 16px}
details summary{cursor:pointer;color:var(--dim);font-size:13px}
details summary:hover{color:var(--green)}
details .cmd{margin-top:12px;box-shadow:none}
details p{color:var(--dim);font-size:12.5px;margin:8px 0}

table.ep{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:8px}
table.ep th,table.ep td{border:1px solid var(--line);padding:7px 11px;text-align:left}
table.ep th{color:var(--cyan);font-weight:600;background:var(--panel2)}
table.ep td{color:var(--dim)}
table.ep td b{color:var(--text)}
.meth{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.1em;padding:2px 8px;border-radius:5px;margin-right:8px}
.meth.get{color:#0a1a10;background:var(--cyan)}
.meth.post{color:#06120a;background:var(--green)}

.author-box{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:20px}
.avatar{
  width:64px;height:64px;border-radius:50%;flex-shrink:0;
  background:var(--panel2);border:1px solid var(--line2);
  display:flex;align-items:center;justify-content:center;font-size:28px;
}
.author-box .who b{color:var(--text);font-size:16px}
.author-box .who p{color:var(--dim);font-size:13px}

footer{border-top:1px solid var(--line);margin-top:70px;padding:34px 0 44px;color:var(--dim);font-size:12.5px}
footer .f-grid{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}

.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
.reveal.visible{opacity:1;transform:none}
.reveal.d1{transition-delay:.1s}.reveal.d2{transition-delay:.2s}

@media (max-width:880px){
  .hero-grid{grid-template-columns:1fr}
  .grid2,.grid4{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001s !important;transition-duration:.001s !important}
  html{scroll-behavior:auto}
  .reveal{opacity:1;transform:none}
}
</style>
</head>
<body>

<nav>
  <div class="nav-in">
    <span class="nav-logo">lexema<span class="p">-cli</span></span>
    <div class="nav-links">
      <a href="#que-es">qué es</a>
      <a href="#instalar">instalar</a>
      <a href="#api">api</a>
      <a href="https://github.com/diegoabdo/lexema-cli" target="_blank" rel="noopener">github ↗</a>
    </div>
  </div>
</nav>

<header id="hero">
  <div class="wrap hero-grid">
    <div>
      <div class="hero-kicker"><span class="path">~</span> $ whoami</div>
      <h1>IA en tu terminal,<br><span class="lex">sin exponer tu API key</span></h1>
      <p class="hero-sub">
        <b>Lexema CLI</b> es un chat de IA que vive en la terminal (<b>ask</b>, <b>chat</b>).
        Este servidor guarda tu clave del proveedor y hace de proxy: la CLI solo
        conoce una URL y un token. Autoalojado, proveedor agnóstico, $0 de infraestructura.
      </p>
      <div class="hero-badges">
        <span class="badge">🖥️ 100% terminal</span>
        <span class="badge alt">proveedor agnóstico</span>
        <span class="badge alt2">autoalojado · $0</span>
      </div>
      <div class="cta">
        <a class="primary" href="#instalar">⬇ Instalar en 1 comando</a>
        <a class="ghost" href="https://github.com/diegoabdo/lexema-cli" target="_blank" rel="noopener">ver el código ↗</a>
      </div>
    </div>
    <div class="term">
      <div class="term-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="term-title">terminal — bash</span></div>
      <div class="term-body">
        <div class="ln"><span class="p">$</span> lexema ask "¿Qué es Lexema CLI?"</div>
        <div class="ln c">lexema › Una CLI de IA que corre en tu terminal. Yo no tengo</div>
        <div class="ln c">          tu API key: eso lo guarda el servidor. 🔒</div>
        <div class="ln">&nbsp;</div>
        <div class="ln"><span class="p">$</span> lexema chat</div>
        <div class="ln g2">you     › hola, preséntate</div>
        <div class="ln c">lexema  › ¡Hola! Soy Lexema, tu asistente en la terminal.</div>
        <div class="ln g2">you     › exit</div>
        <div class="ln">&nbsp;</div>
        <div class="ln d"># sirve también desde otra máquina de la LAN/VPN:</div>
        <div class="ln"><span class="p">$</span> lexema config set-url ${escOrigin}<span class="cursor"></span></div>
      </div>
    </div>
  </div>
</header>

<main>

<section id="que-es">
  <div class="wrap">
    <div class="sec-tag reveal">01 // QUÉ ES</div>
    <h2 class="reveal">Una CLI de IA <span class="hl">self-hosted</span></h2>
    <p class="lead reveal d1">
      La CLI <b>nunca habla directo con el proveedor de IA</b>: todo pasa por este
      servidor (el mismo que te está sirviendo esta página), que guarda la API key,
      filtra los modelos permitidos y aplica rate limiting. Levantalo en cualquier
      VM con Node.
    </p>
    <div class="grid4">
      <div class="card reveal"><span class="ico">🖥️</span><h4>100% terminal</h4><p>ask, chat, models y config. Hecha para tu flujo de trabajo, sin salir de la consola.</p></div>
      <div class="card reveal d1"><span class="ico">🔒</span><h4>Tu clave, en tu server</h4><p>La API key vive solo en el servidor. La CLI únicamente conoce URL + token.</p></div>
      <div class="card reveal d2"><span class="ico">🔀</span><h4>Proveedor agnóstico</h4><p>OpenRouter, OpenAI, Groq o un LLM local: cualquier endpoint compatible con OpenAI.</p></div>
      <div class="card reveal d2"><span class="ico">🏠</span><h4>Autoalojado</h4><p>Node puro en cualquier VM. Sin serverless, sin cuentas ajenas, $0 de infraestructura.</p></div>
    </div>
  </div>
</section>

<section id="instalar">
  <div class="wrap">
    <div class="sec-tag reveal">02 // INSTALAR</div>
    <h2 class="reveal">Un comando, <span class="hl">un copy-paste</span></h2>
    <p class="lead reveal d1">
      El instalador se sirve desde <b>este mismo servidor</b>: autodetecta tu
      arquitectura, verifica el checksum SHA-256 del binario antes de instalar y
      lo deja en tu PATH. Elegí tu sistema, copiá y pegá en la terminal.
    </p>

    <div class="os-tabs reveal">
      <button class="tbtn on" id="btnLinux" type="button">🐧 Linux</button>
      <button class="tbtn" id="btnWindows" type="button">🪟 Windows</button>
    </div>

    <div class="os-panel on reveal" id="panelLinux">
      <div class="cmd">
        <div class="cmd-bar"><span class="shell">terminal — bash</span><button class="copy-btn" type="button" data-target="codeLinux" aria-label="Copiar comando de instalación para Linux">📋 copiar</button></div>
        <pre><code id="codeLinux">${escapeHtml(cmdLinux)}</code></pre>
      </div>
      <div class="cmd-notes">
        <span class="chip">autodetecta <b>x64 / arm64</b></span>
        <span class="chip">verifica <b>SHA-256</b> antes de instalar</span>
        <span class="chip">instala en <b>/usr/local/bin</b></span>
        <span class="chip">usa <b>sudo</b> solo si hace falta</span>
      </div>
    </div>

    <div class="os-panel reveal" id="panelWindows">
      <div class="cmd">
        <div class="cmd-bar"><span class="shell">PowerShell</span><button class="copy-btn" type="button" data-target="codeWindows" aria-label="Copiar comando de instalación para Windows">📋 copiar</button></div>
        <pre><code id="codeWindows">${escapeHtml(cmdWindows)}</code></pre>
      </div>
      <div class="cmd-notes">
        <span class="chip">sin <b>admin</b>: instala en %LOCALAPPDATA%\\Programs\\lexema</span>
        <span class="chip">verifica <b>SHA-256</b> antes de instalar</span>
        <span class="chip">se agrega al <b>PATH</b> de usuario</span>
        <span class="chip">reabrí la terminal tras instalar</span>
      </div>
    </div>

    ${tokenNote}

    <div class="callout g reveal">
      <b>Ya instalado, probá:</b> <code>lexema models</code> para ver proveedor y
      modelos, o directo a chatear con <code>lexema chat</code>.
    </div>

    <details class="reveal">
      <summary>¿Y cómo la desinstalo?</summary>
      <div class="cmd">
        <div class="cmd-bar"><span class="shell">terminal — bash</span><button class="copy-btn" type="button" data-target="codeUnlinux" aria-label="Copiar comando de desinstalación para Linux">📋 copiar</button></div>
        <pre><code id="codeUnlinux">${escapeHtml(cmdUnlinux)}</code></pre>
      </div>
      <div class="cmd">
        <div class="cmd-bar"><span class="shell">PowerShell</span><button class="copy-btn" type="button" data-target="codeUnwindows" aria-label="Copiar comando de desinstalación para Windows">📋 copiar</button></div>
        <pre><code id="codeUnwindows">${escapeHtml(cmdUnwindows)}</code></pre>
      </div>
      <p>No toca <code>~/.lexema</code> (tu configuración): si querés borrarla también, es <code>rm -rf ~/.lexema</code>.</p>
    </details>

    <div class="callout reveal">
      <b>¿Ves un 404 al instalar?</b> Este servidor todavía no tiene binarios
      compilados: corré <code>make compile</code> en la VM (genera
      <code>cli/dist-bin/</code>) y volvé a intentar.
    </div>
  </div>
</section>

<section id="api">
  <div class="wrap">
    <div class="sec-tag reveal">03 // LA API</div>
    <h2 class="reveal">Lo que sirve <span class="hl">este servidor</span></h2>
    <p class="lead reveal d1">
      Misma URL, mismo puerto. La API que consume la CLI convive con esta página
      y con los instaladores.
    </p>
    <div class="grid2">
      <div class="card reveal">
        <table class="ep">
          <tr><th>Endpoint</th><th>Qué hace</th></tr>
          <tr><td><span class="meth post">POST</span><b>/</b></td><td>El chat: <code>{prompt, model}</code> → <code>{reply, model}</code></td></tr>
          <tr><td><span class="meth get">GET</span><b>/models</b></td><td>Proveedor, modelo default y lista blanca</td></tr>
          <tr><td><span class="meth get">GET</span><b>/health</b></td><td>Latido del servidor</td></tr>
          <tr><td><span class="meth get">GET</span><b>/install</b></td><td>Instalador sh (Linux) · <code>/install.ps1</code> (Windows)</td></tr>
          <tr><td><span class="meth get">GET</span><b>/download</b></td><td>Updater que mantiene la CLI fresca</td></tr>
        </table>
      </div>
      <div class="reveal d1">
        <h3>▶ Los comandos de la CLI</h3>
        <div class="term" style="box-shadow:none">
          <div class="term-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="term-title">lexema</span></div>
          <div class="term-body">
            <div class="ln"><span class="p">$</span> lexema ask "explicame X en una línea"</div>
            <div class="ln"><span class="p">$</span> lexema chat  <span class="d"># sesión interactiva, "exit" sale</span></div>
            <div class="ln"><span class="p">$</span> lexema models</div>
            <div class="ln"><span class="p">$</span> lexema config show</div>
            <div class="ln d"># set-url / set-token / set-model / uninstall</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="quienes">
  <div class="wrap">
    <div class="sec-tag reveal">04 // QUIÉNES Y POR QUÉ</div>
    <h2 class="reveal">Hecho para que la IA en la terminal <span class="hl">sea de todos</span></h2>
    <p class="lead reveal d1">
      <b>Lexema CLI</b> es un proyecto open-source (MIT) de <b>Lexema Labs</b>.
    </p>
    <div class="author-box reveal d1">
      <div class="avatar">🧑‍💻</div>
      <div class="who">
        <p><b>Diego Abdo</b> — Lexema Labs</p>
        <p><a href="https://github.com/diegoabdo/lexema-cli" target="_blank" rel="noopener">github.com/diegoabdo/lexema-cli ↗</a></p>
      </div>
    </div>
    <div class="grid4">
      <div class="card reveal"><span class="ico">🫂</span><h4>IA accesible</h4><p>Una CLI de IA que cualquiera puede levantar en su propia VM, sin servicios de pago ni infraestructura ajena.</p></div>
      <div class="card reveal d1"><span class="ico">🔒</span><h4>Privacidad primero</h4><p>Tu API key nunca sale de tu servidor. Los clientes solo ven una URL y un token revocable.</p></div>
      <div class="card reveal d2"><span class="ico">🔓</span><h4>Sin candados</h4><p>Proveedor agnóstico: OpenRouter, OpenAI, Groq o un LLM local. Cambiá cuando quieras.</p></div>
      <div class="card reveal d2"><span class="ico">📄</span><h4>Open source</h4><p>Código MIT disponible en GitHub: auditá, forkeá y adaptalo a tu necesita.</p></div>
    </div>
  </div>
</section>

</main>

<footer>
  <div class="wrap f-grid">
    <div>
      <div class="nav-logo" style="margin-bottom:6px">lexema<span class="p">-cli</span></div>
      <div>CLI de IA para la terminal · servidor proxy autoalojado · esta página la sirve el propio servidor en :8787</div>
    </div>
    <div style="text-align:right">
      <div>infra: <span class="ok">$0</span> · licencia: <span class="c">MIT</span></div>
      <div><a href="https://github.com/diegoabdo/lexema-cli" target="_blank" rel="noopener">github.com/diegoabdo/lexema-cli ↗</a></div>
    </div>
  </div>
</footer>

<script>
(function(){
'use strict';

// Tabs Linux/Windows
var btnL = document.getElementById('btnLinux');
var btnW = document.getElementById('btnWindows');
var panL = document.getElementById('panelLinux');
var panW = document.getElementById('panelWindows');
function show(which){
  var isL = which === 'linux';
  btnL.classList.toggle('on', isL); btnW.classList.toggle('on', !isL);
  panL.classList.toggle('on', isL); panW.classList.toggle('on', !isL);
}
btnL.addEventListener('click', function(){ show('linux'); });
btnW.addEventListener('click', function(){ show('windows'); });
// Preselección según el SO de quien visita
if (/windows/i.test(navigator.userAgent)) show('windows');

// Copiar con fallback: navigator.clipboard exige contexto seguro (HTTPS o
// localhost), y esta landing suele servirse por HTTP plano desde una VM,
// así que caemos a execCommand('copy') cuando no está disponible.
function legacyCopy(text){
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}
Array.prototype.forEach.call(document.querySelectorAll('.copy-btn'), function(btn){
  btn.addEventListener('click', function(){
    var code = document.getElementById(btn.getAttribute('data-target'));
    if (!code) return;
    var text = code.textContent || '';
    function done(){
      var prev = btn.textContent;
      btn.textContent = '✓ copiado';
      btn.classList.add('done');
      setTimeout(function(){ btn.textContent = prev; btn.classList.remove('done'); }, 1600);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function(){ if (legacyCopy(text)) done(); });
    } else if (legacyCopy(text)) {
      done();
    }
  });
});

// Reveal on scroll
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
if ('IntersectionObserver' in window && !REDUCED) {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(function(n){ io.observe(n); });
} else {
  reveals.forEach(function(n){ n.classList.add('visible'); });
}
})();
</script>
</body>
</html>`;
}
