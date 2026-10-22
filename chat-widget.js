/* Floating chat widget for JM's portfolio. Add before </body>:
   <script src="chat-widget.js" data-endpoint="https://YOUR-WORKER.workers.dev" defer></script>
   Uses the site's own CSS variables (--a, --ink, --muted, --line, --serif, --sans). */
(function () {
  var script = document.currentScript;
  var ENDPOINT = (script && script.dataset.endpoint) || "https://portfolio-chatbot.YOUR-SUBDOMAIN.workers.dev";
  var SAMPLES = ["What did JM build at Daygency?", "Which automation projects has he done?", "Which tools does he use?"];

  var css = "\
.cw-btn{position:fixed;right:1.2rem;bottom:calc(1.2rem + env(safe-area-inset-bottom,0px));z-index:40;font:600 .95rem var(--sans,system-ui,sans-serif);padding:.8rem 1.3rem;border-radius:999px;border:1px solid var(--a,#FF7A2F);background:var(--a,#FF7A2F);color:#0B0C10;cursor:pointer;transition:transform .2s}\
.cw-btn:hover{transform:translateY(-3px)}\
.cw-btn:focus-visible,.cw-x:focus-visible,.cw-chip:focus-visible,.cw-send:focus-visible,.cw-in:focus-visible{outline:2px solid var(--a,#FF7A2F);outline-offset:3px}\
.cw-panel{position:fixed;right:1.2rem;bottom:calc(4.8rem + env(safe-area-inset-bottom,0px));z-index:40;width:min(24rem,calc(100vw - 2.4rem));height:min(34rem,calc(100svh - 7rem));display:flex;flex-direction:column;background:rgba(17,19,25,.94);border:1px solid var(--line,#252831);border-radius:8px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:var(--ink,#F2EEE6);font:400 .95rem/1.55 var(--sans,system-ui,sans-serif);opacity:0;transform:translateY(12px);visibility:hidden;transition:opacity .2s,transform .2s,visibility .2s}\
.cw-panel.open{opacity:1;transform:none;visibility:visible}\
.cw-head{display:flex;justify-content:space-between;gap:1rem;padding:1rem 1.1rem .8rem;border-bottom:1px solid var(--line,#252831)}\
.cw-head h2{font:500 1.5rem/1.1 var(--serif,Georgia,serif);margin:0}\
.cw-head p{margin:.2rem 0 0;color:var(--muted,#A19F98);font-size:.82rem}\
.cw-x{background:none;border:0;color:var(--muted,#A19F98);font-size:1.5rem;line-height:1;cursor:pointer;padding:0 .2rem;align-self:flex-start}\
.cw-x:hover{color:var(--ink,#F2EEE6)}\
.cw-log{flex:1;overflow-y:auto;padding:1rem 1.1rem;display:flex;flex-direction:column;gap:.8rem}\
.cw-m{max-width:88%;padding:.6rem .85rem;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere}\
.cw-me{align-self:flex-end;background:rgba(255,122,47,.12);border:1px solid rgba(255,122,47,.3)}\
.cw-bot{align-self:flex-start;background:rgba(11,12,16,.6);border:1px solid var(--line,#252831)}\
.cw-src{margin-top:.6rem;padding-top:.5rem;border-top:1px solid var(--line,#252831);font-size:.75rem;color:var(--muted,#A19F98);white-space:normal}\
.cw-src span{display:inline-block;margin:.15rem .3rem .15rem 0;padding:.15rem .55rem;color:var(--a,#FF7A2F);background:rgba(255,122,47,.08);border:1px solid rgba(255,122,47,.22);border-radius:999px}\
.cw-chips{display:flex;flex-wrap:wrap;gap:.45rem}\
.cw-chip{font:inherit;font-size:.82rem;padding:.35rem .7rem;border-radius:999px;border:1px solid var(--line,#252831);background:rgba(11,12,16,.6);color:var(--ink,#F2EEE6);cursor:pointer}\
.cw-chip:hover{border-color:var(--a,#FF7A2F)}\
.cw-form{display:flex;gap:.5rem;padding:.8rem 1.1rem 1rem;border-top:1px solid var(--line,#252831)}\
.cw-in{flex:1;min-width:0;font:inherit;padding:.65rem .8rem;border-radius:6px;border:1px solid var(--line,#252831);background:rgba(11,12,16,.7);color:var(--ink,#F2EEE6)}\
.cw-send{font:600 .9rem var(--sans,system-ui,sans-serif);padding:0 1rem;border:0;border-radius:6px;background:var(--a,#FF7A2F);color:#0B0C10;cursor:pointer}\
.cw-send:disabled{opacity:.5;cursor:wait}\
.cw-dots::after{content:'\\2026';animation:cwb 1s steps(3) infinite}@keyframes cwb{50%{opacity:.2}}\
@media (prefers-reduced-motion:reduce){.cw-btn,.cw-panel{transition:none}.cw-dots::after{animation:none}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  var btn = el("button", "cw-btn", "Ask about JM");
  btn.type = "button"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "cw-panel");
  var panel = el("section", "cw-panel"); panel.id = "cw-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Ask about JM");
  var head = el("div", "cw-head"), ht = el("div");
  ht.appendChild(el("h2", "", "Ask about JM"));
  ht.appendChild(el("p", "", "Answers come only from this portfolio. Each reply shows the sections it used."));
  var close = el("button", "cw-x", "\u00D7"); close.type = "button"; close.setAttribute("aria-label", "Close chat");
  head.appendChild(ht); head.appendChild(close);
  var log = el("div", "cw-log"); log.setAttribute("aria-live", "polite");
  var chips = el("div", "cw-chips");
  var form = el("form", "cw-form");
  var input = el("input", "cw-in"); input.maxLength = 400; input.placeholder = "Ask about experience, skills, projects"; input.setAttribute("aria-label", "Your question"); input.autocomplete = "off";
  var send = el("button", "cw-send", "Send");
  form.appendChild(input); form.appendChild(send);
  log.appendChild(chips);
  panel.appendChild(head); panel.appendChild(log); panel.appendChild(form);
  document.body.appendChild(panel); document.body.appendChild(btn);

  function setOpen(o) {
    panel.classList.toggle("open", o); btn.setAttribute("aria-expanded", String(o));
    if (o) input.focus(); else btn.focus();
  }
  btn.addEventListener("click", function () { setOpen(!panel.classList.contains("open")); });
  close.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) setOpen(false); });

  SAMPLES.forEach(function (q) {
    var c = el("button", "cw-chip", q); c.type = "button";
    c.addEventListener("click", function () { input.value = q; form.requestSubmit(); });
    chips.appendChild(c);
  });

  function add(text, cls) { var d = el("div", "cw-m " + cls, text); log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim(); if (!q) return;
    chips.remove(); add(q, "cw-me"); input.value = ""; send.disabled = true;
    var bot = add("", "cw-bot cw-dots");
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        bot.classList.remove("cw-dots");
        bot.textContent = d.answer || d.error || "Something went wrong. Try again.";
        if (d.sources && d.sources.length) {
          var s = el("div", "cw-src", "Used: ");
          d.sources.forEach(function (x) { s.appendChild(el("span", "", x.title + " (" + x.score + ")")); });
          bot.appendChild(s);
        }
      })
      .catch(function () { bot.classList.remove("cw-dots"); bot.textContent = "Couldn\u2019t reach the assistant. Check your connection and try again."; })
      .finally(function () { send.disabled = false; input.focus(); log.scrollTop = log.scrollHeight; });
  });
})();
