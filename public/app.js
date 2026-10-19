// ============================================================
// app.js — ShowTime, the simple front end
//
// engine.js is the old mockData + prompt compiler + api bridge,
// unchanged. Every call below goes through those same functions
// with the same compiled payloads, so wiring the backend is the
// same job it always was. Only the screens are new.
//
// Rules this file follows:
//   1. The project page is home. Everything is reachable from it.
//   2. You edit the thing itself. Tap a line, a face, a scene.
//   3. One task at a time. Each part opens in its own sheet.
//   4. Plain choices. Payloads, routing and files live in Studio view.
//   5. The Co-Producer always says what to do next.
//   6. Nothing is lost. Every text edit keeps earlier versions.
// ============================================================

var LOGO = "logo.png";
var STORE_KEY = "showtime.v3";

var S = {
  ips: [],
  cur: null,
  view: "home",
  step: "story",
  editing: false,
  studio: false,
  busy: {},
  skipped: {},
  copro: null,
  sheet: null,
  menu: null,
  tab: "story"
};

// ---------- small helpers ----------
var $ = function (sel, root) { return (root || document).querySelector(sel); };
var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function P() { return S.ips.find(function (x) { return x.id === S.cur; }) || null; }
function uid(p) { return (p || "x") + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
function hash(str) { var h = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function ago(ts) {
  var m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "just now"; if (m < 60) return m + " min ago";
  var h = Math.round(m / 60); if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
  var d = Math.round(h / 24); return d + (d === 1 ? " day ago" : " days ago");
}
function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

function save() {
  var p = P(); if (p) p.updatedAt = Date.now();
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ ips: S.ips, studio: S.studio })); } catch (e) {}
}
function load() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (raw) { var d = JSON.parse(raw); S.ips = d.ips || []; S.studio = !!d.studio; }
  } catch (e) {}
}

var toastTimer;
function toast(msg, undo) {
  var old = $(".toast"); if (old) old.remove();
  var t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status");
  t.innerHTML = "<span>" + esc(msg) + "</span>" + (undo ? '<button type="button">Undo</button>' : "");
  document.body.appendChild(t);
  if (undo) t.querySelector("button").onclick = function () { undo(); t.remove(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.remove(); }, undo ? 6000 : 3200);
}

async function busy(key, fn) {
  if (S.busy[key]) return;
  S.busy[key] = true; redraw();
  try { return await fn(); }
  finally { delete S.busy[key]; save(); redraw(); }
}

// Earlier versions. Every text field that the creator or the
// Co-Producer changes keeps what it said before.
function keep(p, key, old) {
  if (old == null || String(old).trim() === "") return;
  p.versions = p.versions || {};
  var list = p.versions[key] = p.versions[key] || [];
  if (list[0] && list[0].v === old) return;
  list.unshift({ v: old, at: Date.now() });
  if (list.length > 12) list.length = 12;
}
function versionsOf(p, key) { return (p.versions && p.versions[key]) || []; }

// ============================================================
// Pictures
// The mock bridge returns placeholder URLs from another host,
// which a locked-down page cannot load. Until the image model is
// connected we draw a stand-in from the project's palette, and a
// real URL from the backend always wins.
// ============================================================
function palOf(p) { var pal = paletteById(p && p.visual.palette) || paletteById("cold"); return pal.swatches; }
function isStandIn(url) { return !url || /placehold\.co|w3schools\.com/.test(url); }
function svgUri(svg) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }
function rnd(seed) { var s = hash(seed) || 1; return function () { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); return ((s >>>= 0) % 10000) / 10000; }; }

function art(kind, seed, sw) {
  var r = rnd(kind + ":" + seed);
  var a = sw[0], b = sw[1], c = sw[2], d = sw[3], e = sw[4];
  if (kind === "face") {
    var hx = 150 + (r() - .5) * 40, hy = 150 + r() * 26, hr = 54 + r() * 10;
    return svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs>' +
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + b + '"/><stop offset="1" stop-color="' + a + '"/></linearGradient>' +
      '<radialGradient id="l" cx="' + (r() > .5 ? .2 : .8) + '" cy=".2" r=".8"><stop offset="0" stop-color="' + c + '" stop-opacity=".75"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="300" height="400" fill="url(#g)"/><rect width="300" height="400" fill="url(#l)"/>' +
      '<path d="M' + (hx - 120) + ' 400 C' + (hx - 110) + ' ' + (hy + 110) + ' ' + (hx - 60) + ' ' + (hy + 82) + ' ' + hx + ' ' + (hy + 80) + ' S' + (hx + 110) + ' ' + (hy + 110) + ' ' + (hx + 120) + ' 400Z" fill="' + a + '" stroke="' + d + '" stroke-opacity=".35" stroke-width="2"/>' +
      '<rect x="' + (hx - 22) + '" y="' + (hy + 40) + '" width="44" height="50" fill="' + a + '"/>' +
      '<ellipse cx="' + hx + '" cy="' + hy + '" rx="' + hr * .82 + '" ry="' + hr + '" fill="' + a + '" stroke="' + d + '" stroke-opacity=".45" stroke-width="2"/>' +
      '<rect width="300" height="400" fill="' + e + '" opacity=".04"/></svg>');
  }
  if (kind === "blank") {
    return svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#8a8292" opacity=".12"/>' +
      '<g fill="none" stroke="#8a8292" stroke-opacity=".55" stroke-width="3" stroke-dasharray="8 8"><ellipse cx="150" cy="160" rx="46" ry="56"/><path d="M40 400 C50 270 100 245 150 245 S250 270 260 400"/></g></svg>');
  }
  if (kind === "blankwide") {
    return svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270"><rect width="480" height="270" fill="#8a8292" opacity=".12"/>' +
      '<path d="M0 200 L90 150 L170 185 L260 120 L350 170 L480 130" fill="none" stroke="#8a8292" stroke-opacity=".55" stroke-width="3" stroke-dasharray="8 8"/></svg>');
  }
  // place, scene, cover: layered horizon
  var w = 480, h = 270, out = "";
  var sky = '<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + b + '"/><stop offset="1" stop-color="' + a + '"/></linearGradient>';
  var glow = '<radialGradient id="o" cx="' + (.2 + r() * .6) + '" cy="' + (.3 + r() * .2) + '" r=".5"><stop offset="0" stop-color="' + c + '" stop-opacity=".8"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>';
  var layers = [[d, .18, .45], [c, .35, .6], [b, .7, .75], [a, 1, .88]];
  layers.forEach(function (L, li) {
    var pts = "0," + h, x = 0, base = h * L[2];
    while (x <= w) {
      var top = base - r() * 70 * (1 - li * .18);
      var step = 18 + r() * 44;
      pts += " " + x.toFixed(0) + "," + top.toFixed(0) + " " + (x + step).toFixed(0) + "," + top.toFixed(0);
      x += step;
    }
    pts += " " + w + "," + h;
    out += '<polygon points="' + pts + '" fill="' + L[0] + '" opacity="' + L[1] + '"/>';
  });
  var lights = "";
  for (var i = 0; i < 18; i++) lights += '<rect x="' + (r() * w).toFixed(0) + '" y="' + (h * .55 + r() * h * .3).toFixed(0) + '" width="3" height="4" fill="' + d + '" opacity="' + (.4 + r() * .5).toFixed(2) + '"/>';
  var figure = "";
  if (kind === "scene") {
    var fx = 120 + r() * 240, fy = h * .9;
    figure = '<g fill="' + a + '"><ellipse cx="' + fx + '" cy="' + (fy - 74) + '" rx="11" ry="13"/><path d="M' + (fx - 22) + ' ' + fy + ' C' + (fx - 20) + ' ' + (fy - 50) + ' ' + (fx - 8) + ' ' + (fy - 58) + ' ' + fx + ' ' + (fy - 58) + ' S' + (fx + 20) + ' ' + (fy - 50) + ' ' + (fx + 22) + ' ' + fy + 'Z"/></g>' +
      '<rect width="' + w + '" height="18" fill="#000"/><rect y="' + (h - 18) + '" width="' + w + '" height="18" fill="#000"/>';
  }
  return svgUri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice"><defs>' + sky + glow + '</defs>' +
    '<rect width="' + w + '" height="' + h + '" fill="url(#s)"/><rect width="' + w + '" height="' + h + '" fill="url(#o)"/>' + out + lights + figure + '</svg>');
}

function faceSrc(p, ch) {
  if (!ch.face) return art("blank", ch.id, palOf(p));
  if (!isStandIn(ch.avatar)) return ch.avatar;
  return art("face", ch.faceSeed || ch.id, palOf(p));
}
function placeSrc(p, w) {
  if (!w.shot) return art("blankwide", w.id, palOf(p));
  if (!isStandIn(w.thumbnail)) return w.thumbnail;
  return art("place", w.plateSeed || w.id, palOf(p));
}
function sceneSrc(p, s) { return s.poster || art("scene", (s.still || s.id), palOf(p)); }
function coverSrc(p) { return p.coverUrl || artPool(p, ["artwork", "places", "scenes", "promo"])[0] || art("place", "cover:" + p.id + ":" + (p.coverSeed || 0), palOf(p)); }
// Pictures the show already has, best first, for backgrounds.
function artPool(p, order) {
  var by = {
    artwork: (p.artwork || []).map(function (a) { return a.url; }),
    places: p.worlds.filter(function (w) { return w.shot; }).map(function (w) { return placeSrc(p, w); }),
    scenes: p.scenes.filter(function (s) { return s.status === "rendered"; }).map(function (s) { return sceneSrc(p, s); }),
    promo: (p.promo || []).map(function (im) { return im.url && !isStandIn(im.url) ? im.url : art("place", "promo:" + im.id, palOf(p)); })
  };
  var out = [];
  order.forEach(function (k) { (by[k] || []).forEach(function (u) { if (out.indexOf(u) === -1) out.push(u); }); });
  return out;
}
// Each ShowPage section gets its own backdrop: the one you picked, or the
// best match from the show's artwork that isn't already used above it.
var BG_PREFS = { trailer: ["scenes", "artwork", "places"], story: ["artwork", "places", "scenes"], cast: ["artwork", "scenes", "places"], places: ["places", "artwork"],
  look: ["artwork", "places", "scenes"], sound: ["artwork", "scenes", "places"], scenes: ["scenes", "places", "artwork"], art: ["artwork", "promo", "places", "scenes"] };
function sectionBgs(p) {
  var used = [coverSrc(p)], out = {};
  PAGE_SECTIONS.forEach(function (sec) {
    var id = sec[0];
    if (p.bgs && p.bgs[id]) { out[id] = p.bgs[id]; used.push(p.bgs[id]); return; }
    var pool = artPool(p, BG_PREFS[id] || ["artwork", "places"]);
    var pick = pool.find(function (u) { return used.indexOf(u) === -1; }) || pool[used.length % (pool.length || 1)] || null;
    out[id] = pick; if (pick) used.push(pick);
  });
  return out;
}

// ============================================================
// The demo show, and turning a riff into a project
// ============================================================
function demoShow() {
  var p = seedIP();
  p.characters.forEach(function (c) { c.face = true; c.faceSeed = c.id; c.looks = [{ id: uid("lk"), url: c.avatar, seed: c.id, at: p.createdAt }]; });
  p.worlds.forEach(function (w) { w.shot = true; w.plateSeed = w.id; w.plates = [{ id: uid("pl"), url: w.thumbnail, seed: w.id, at: p.createdAt }]; });
  p.scenes.forEach(function (s) { s.heading = s.order === 1 ? "INT. ELENA'S APARTMENT — NIGHT" : "EXT. NEON ALLEY — NIGHT"; s.act = 1; s.still = s.id; });
  [1, 2, 3].forEach(function (n) {
    p.story.acts[arcKey(p, n)] = { prose: beatsInAct(p, n, 1).map(function (b) { return b.text; }).join(" "), manual: true };
  });
  p.team = [{ email: "lamont@belton.ai", role: "Owner" }];
  return p;
}

function recompose(p) {
  var w = p.story.riffWorld;
  var short = p.format.type === "short";
  if (w && !w.live) {
    var fresh = riffActsFrom(short ? p.story.short : p.story.spine, w, short);
    [1, 2, 3].forEach(function (n) {
      var rec = p.story.acts[arcKey(p, n)];
      if (rec && rec.manual) return;
      p.story.acts[arcKey(p, n)] = { prose: fresh[n], manual: false };
    });
  }
  var now = Date.now();
  var titles = short ? ["The hook", "The story", "The twist"] : ["The beginning", "The middle", "The end"];
  if (isSerial(p) && (p.episodes || []).length) {
    p.story.beats = [];
    p.episodes.forEach(function (e) {
      [1, 2, 3].forEach(function (n, i) {
        p.story.beats.push({ id: "b" + e.number + "_" + n + "_" + now, ep: e.number, act: n, role: ["Inciting incident", "Midpoint", "Climax"][i], title: e.title + ": " + titles[i].replace("The ", ""), text: epAct(p, e.number, n) || e.premise });
      });
    });
    return;
  }
  p.story.beats = [1, 2, 3].map(function (n, i) {
    return { id: "b" + (now + i), ep: 1, act: n, role: ["Opening image", "Midpoint", "Climax"][i], title: titles[i], text: actText(p, n) };
  });
}

function applyRiff(p, res, format, episodes) {
  p.title = res.title;
  p.story.logline = res.logline;
  p.format.type = format;
  var fd = formatById(format);
  p.format.runtime = fd.defaultRuntime;
  if (fd.serial) { p.format.episodes = episodes || 6; p.format.serialized = true; }
  SPINE_STEPS.forEach(function (st) { p.story.spine[st.key] = res.spine[st.key]; });
  p.story.short = res.shortForm;
  [1, 2, 3].forEach(function (n) { p.story.acts[arcKey(p, n)] = { prose: res.acts[n], manual: false }; });
  p.characters = res.characters.map(function (c) { c.face = false; c.looks = []; return c; });
  p.worlds = (res.worlds || []).map(function (w) { w.shot = false; w.plates = []; return w; });
  p.story.riffWorld = res.world;
  if (res.genres && res.genres.length) p.story.genres = res.genres;
  if (res.tones && res.tones.length) p.story.tones = res.tones;
  p.story.step = "shape";
  recompose(p);
}

// A series keeps two levels of story: the season's arc (the eight lines
// and its three parts) and, for every episode, a three-act story of its own.
function isSerial(p) { return !!(formatById(p.format.type) || {}).serial; }
function arcKey(p, n) { return isSerial(p) ? "season:" + n : actKey(1, n); }
function epAct(p, ep, n) { var r = p.story.acts[actKey(ep, n)]; return (r && r.prose) || ""; }
function setEpAct(p, ep, n, v, manual) { p.story.acts[actKey(ep, n)] = { prose: v, manual: !!manual }; }

function isLive(p) { return !!(p.story.riffWorld && p.story.riffWorld.live); }
// A live story's three parts are real prose, so when the outline changes
// they are rewritten by the writer rather than stitched together.
async function syncActs(p) {
  if (!isLive(p) || LIVE.mode === "sample") return;
  var short = p.format.type === "short";
  var mine = [1, 2, 3].filter(function (n) { var r = p.story.acts[arcKey(p, n)]; return r && r.manual; });
  if (mine.length === 3) return;
  toast("Rewriting the three parts to match\u2026");
  await busy("acts", async function () {
    var o = await rewriteActsLive(compilePayload(p, "structure", {}), short, mine);
    [1, 2, 3].forEach(function (n) {
      if (mine.indexOf(n) !== -1 || !o || !o[n]) return;
      keep(p, "act:" + n, actText(p, n));
      p.story.acts[arcKey(p, n)] = { prose: o[n], manual: false };
    });
    recompose(p);
  });
  toast("The three parts now match the outline.");
}

function actText(p, n) {
  var rec = p.story.acts[arcKey(p, n)];
  if (rec && rec.prose) return rec.prose;
  return beatsInAct(p, n, 1).map(function (b) { return b.text; }).join(" ");
}

// ============================================================
// The path: eight parts, one page each, in this order
// ============================================================
var STEPS = [
  { id: "story", name: "Story", lead: "This is your story so far. Tap any part to change it." },
  { id: "cast", name: "Cast", lead: "The people in your story. Tap anyone to change their name, look or face." },
  { id: "places", name: "Places", lead: "Where your story happens. Tap a place to change it or make its picture." },
  { id: "look", name: "Look", lead: "Pick how your show should look. Every face, place and scene is made in this look." },
  { id: "sound", name: "Sound", lead: "Choose the music and give everyone a voice." },
  { id: "scenes", name: "Scenes", lead: "Your story, broken into scenes. Make them one at a time, or all at once." },
  { id: "trailer", name: "Trailer", lead: "I cut a trailer from your scenes, your own clips and your music. Watch it, tell me what to change, and I\u2019ll recut it." },
  { id: "share", name: "Share", lead: "Invite people, make a pitch pack, and download your files." }
];
function stepIndex(id) { return STEPS.findIndex(function (s) { return s.id === id; }); }

// What each part still needs, in plain words. Used by the path, the
// ShowPage placeholders and the "Make my ShowPage" confirmation.
function gaps(p) {
  var g = [];
  var serial = (formatById(p.format.type) || {}).serial;
  if (!p.characters.length) g.push({ step: "cast", what: "a cast" });
  else if (p.characters.some(function (c) { return !c.face; })) g.push({ step: "cast", what: "faces for your cast", fill: "faces" });
  if (p.worlds.length && p.worlds.some(function (w) { return !w.shot; })) g.push({ step: "places", what: "pictures of your places", fill: "places" });
  if (!(p.visual.style && p.visual.palette)) g.push({ step: "look", what: "a look", fill: "look" });
  if (!(p.music.genres.length && p.music.moods.length)) g.push({ step: "sound", what: "the music", fill: "music" });
  if (p.characters.length && p.characters.some(function (c) { return !p.voices.assignments[c.id]; })) g.push({ step: "sound", what: "voices", fill: "voices" });
  if (serial && !(p.episodes || []).length) g.push({ step: "story", what: "the season's episodes", fill: "episodes" });
  if (!p.scenes.length) g.push({ step: "scenes", what: "a scene list", fill: "scenes" });
  if (!p.tagline) g.push({ step: "story", what: "a tagline and character quotes", fill: "copy" });
  return g;
}
function stepDone(p, id) {
  if (id === "story") return !!(p.story.logline && actText(p, 1));
  if (id === "cast") return p.characters.length > 0 && p.characters.every(function (c) { return c.face; });
  if (id === "places") return p.worlds.length > 0 && p.worlds.every(function (w) { return w.shot; });
  if (id === "look") return !!(p.visual.style && p.visual.palette);
  if (id === "sound") return !!p.music.genres.length && p.characters.every(function (c) { return p.voices.assignments[c.id]; });
  if (id === "scenes") return p.scenes.length > 0 && p.scenes.every(function (s) { return s.status === "rendered"; });
  if (id === "trailer") return p.trailer.status === "ready";
  if (id === "share") return (p.team || []).length > 1 || Object.keys(p.bible.docs || {}).length > 0;
  return false;
}
function resumeStep(p) { var s = STEPS.find(function (x) { return !stepDone(p, x.id); }); return s ? s.id : "share"; }

// kept for the sheets that used to scroll the old project page
function jump() {}

// ============================================================
// Edits that carry through
// ============================================================
function bump(p, part) { p.rev = p.rev || {}; p.rev[part] = (p.rev[part] || 0) + 1; }
function rev(p, part) { return (p.rev && p.rev[part]) || 0; }
function stale(p, what) { return (p.madeAt && p.madeAt[what] != null) && p.madeAt[what] < rev(p, "story"); }
function stamp(p, what) { p.madeAt = p.madeAt || {}; p.madeAt[what] = rev(p, "story"); }

// A new name replaces the old one in every piece of writing.
function renameEverywhere(p, oldName, newName) {
  if (!oldName || !newName || oldName === newName) return 0;
  var pairs = [[oldName, newName]];
  var of = oldName.split(" ")[0], nf = newName.split(" ")[0];
  if (of !== oldName && of.length > 2 && of !== nf) pairs.push([of, nf]);
  var count = 0;
  function fix(str) {
    if (typeof str !== "string" || !str) return str;
    pairs.forEach(function (pr) {
      var re = new RegExp("\\b" + pr[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
      str = str.replace(re, function () { count++; return pr[1]; });
      var up = new RegExp("\\b" + pr[0].toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
      str = str.replace(up, function () { count++; return pr[1].toUpperCase(); });
    });
    return str;
  }
  p.story.logline = fix(p.story.logline);
  p.tagline = fix(p.tagline);
  Object.keys(p.story.spine).forEach(function (k) { p.story.spine[k] = fix(p.story.spine[k]); });
  if (p.story.short) Object.keys(p.story.short).forEach(function (k) { p.story.short[k] = fix(p.story.short[k]); });
  Object.keys(p.story.acts).forEach(function (k) { p.story.acts[k].prose = fix(p.story.acts[k].prose); });
  p.story.beats.forEach(function (b) { b.text = fix(b.text); });
  (p.episodes || []).forEach(function (e) { e.title = fix(e.title); e.premise = fix(e.premise); e.carriesOver = fix(e.carriesOver); });
  p.scenes.forEach(function (s) { s.prompt = fix(s.prompt); s.line = fix(s.line); s.heading = fix(s.heading); s.script = fix(s.script); });
  (p.script.sceneList || []).forEach(function (s) { s.summary = fix(s.summary); s.heading = fix(s.heading); });
  p.characters.forEach(function (c) { c.look = fix(c.look); c.arc = fix(c.arc); c.quote = fix(c.quote); });
  p.worlds.forEach(function (w) { w.atmosphere = fix(w.atmosphere); });
  Object.keys(p.bible.docs || {}).forEach(function (k) { p.bible.docs[k].body = fix(p.bible.docs[k].body); });
  (p.bible.deck || []).forEach(function (sl) { sl.headline = fix(sl.headline); sl.body = fix(sl.body); });
  if (p.story.riffWorld && p.story.riffWorld.leadName === oldName) p.story.riffWorld.leadName = newName;
  return count;
}

// ============================================================
// Routing
// ============================================================
function go(view, id, step) {
  S.view = view; if (id !== undefined) S.cur = id; S.step = step || S.step; S.menu = null; S.navOpen = false;
  var h = view === "page" ? "#p-" + S.cur : view === "step" ? "#s-" + S.step + "-" + S.cur : view === "new" ? "#new" : view === "shows" ? "#shows" : "#home";
  if (location.hash !== h) { try { history.replaceState(null, "", h); } catch (e) {} }
  closeSheet();
  window.scrollTo(0, 0);
  draw();
}
function goStep(id) { go("step", S.cur, id); }
function fromHash() {
  var h = (location.hash || "").slice(1);
  var has = function (id) { return S.ips.some(function (x) { return x.id === id; }); };
  if (h.indexOf("p-") === 0 && has(h.slice(2))) { S.view = "page"; S.cur = h.slice(2); return; }
  if (h.indexOf("s-") === 0) {
    var rest = h.slice(2), dash = rest.indexOf("-");
    var st = rest.slice(0, dash), id = rest.slice(dash + 1);
    if (stepIndex(st) !== -1 && has(id)) { S.view = "step"; S.step = st; S.cur = id; return; }
  }
  if (h === "new") { S.view = "new"; return; }
  if (h === "shows" && S.ips.length) { S.view = "shows"; return; }
  S.view = "home";
}
// Enter: your ShowPage if you have one, the show you're building if not,
// and a new show if there's nothing yet.
function enter() {
  var list = S.ips.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; });
  var withPage = list.find(function (p) { return p.page; });
  if (withPage) return go("page", withPage.id);
  if (list[0]) return go("step", list[0].id, resumeStep(list[0]));
  S.copro = null; go("new");
}

// ============================================================
// Drawing
// ============================================================
var ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

function draw() {
  if (PV && PV.stop) PV.stop();
  document.body.classList.toggle("is-studio", S.studio);
  document.body.classList.toggle("editing", !!(S.view === "page" && S.editing));
  document.body.dataset.view = S.view;
  var app = $("#app"), p = P();
  if (S.view === "page" && p) app.innerHTML = drawShowPage(p);
  else if (S.view === "step" && p) app.innerHTML = drawStep(p, S.step);
  else if (S.view === "new") app.innerHTML = drawCopro();
  else if (S.view === "shows") app.innerHTML = drawShows();
  else { S.view = "home"; app.innerHTML = drawHome(); }
  if (S.view === "page") wireEditable();
  mountPlayers();
  drawMenu();
}
function redraw() {
  var y = window.scrollY;
  draw();
  window.scrollTo(0, y);
  if (S.sheet && S.sheet.draw) paintSheet();
}
function sampleNote() {
  if (LIVE.mode !== "sample") return "";
  return '<div class="samplebar"><div class="wrap">Sample mode: the writing is placeholder text because no writer is connected.</div></div>';
}
function fmtLine(p) {
  var f = formatById(p.format.type); if (!f) return "";
  if (f.serial) return f.name + " · " + (p.format.episodes || "?") + " × " + p.format.runtime + " min";
  return f.name + " · " + p.format.runtime + " min";
}

// ---------- front page ----------
function drawHome() {
  var mine = S.ips.length;
  return '<main class="home"><div class="home__in">' +
    '<img class="home__logo" src="' + LOGO + '" alt="">' +
    '<h1 class="home__name">ShowTime</h1>' +
    '<p class="home__what">Turn an idea into a show.</p>' +
    '<p class="home__how">Tell us your idea in one sentence. We’ll help you build the story, the cast, the look, the sound, the scenes and a trailer, one step at a time, and put it all on your own ShowPage.</p>' +
    '<button class="btn btn--go btn--lg home__enter" data-act="enter">Enter</button>' +
    (mine > 1 ? '<button class="link" data-act="shows">Your shows (' + mine + ")</button>" : "") +
    "</div></main>";
}

// ---------- your shows (only reached from the front page or the ShowPage menu) ----------
function drawShows() {
  var cards = S.ips.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; }).map(function (p) {
    return '<button class="showcard" data-open="' + esc(p.id) + '">' +
      '<div class="showcard__cover" style="background:url(&quot;' + coverSrc(p) + '&quot;) center/cover"><h2>' + esc(p.title) + "</h2></div>" +
      '<div class="showcard__body"><div class="showcard__meta">' + esc(fmtLine(p)) + " · edited " + ago(p.updatedAt) + "</div>" +
      '<div class="showcard__next">' + (p.page ? "<span>Open ShowPage</span>" : "Next: <span>" + esc(STEPS[stepIndex(resumeStep(p))].name) + "</span>") + "</div></div></button>";
  }).join("");
  return '<header class="top"><button class="iconbtn" data-act="home" aria-label="Front page">' + ICON.back + '</button><span class="top__title">Your shows</span></header>' +
    '<main class="wrap shows"><div class="showgrid">' + cards + '<button class="newcard" data-act="new"><b>New show</b><span>One sentence is all you need.</span></button></div></main>';
}

// ---------- a new show: the Co-Producer's two questions ----------
function drawCopro() {
  var c = S.copro || (S.copro = { step: 0, idea: "", format: null, episodes: 6, ideas: null, helpBusy: false });
  var head = '<header class="top"><button class="iconbtn" data-act="leave-copro" aria-label="Back">' + ICON.back + '</button><span class="top__title">New show</span></header>';
  var body = "";
  if (c.step === 1) {
    var noun = { short: "short", film: "film", series: "series" }[c.format] || "show";
    body = '<p class="kicker">Start a new ' + noun + '</p><h1 class="copro__q">What\u2019s your ' + noun + " about?</h1>" +
      '<p class="copro__sub">' + ({ short: "One sentence: one person, one moment, one turn.", film: "One sentence: who it\u2019s about, and what goes wrong.",
        series: "One sentence about the whole season: who it follows, and the trouble that keeps them coming back. I\u2019ll shape each episode as its own story." }[c.format] || "One sentence is plenty.") + "</p>" +
      '<div class="copro__field"><label class="sr" for="cpIdea">Your idea</label>' +
      '<textarea id="cpIdea" placeholder="A retired getaway driver is pulled back for one last job when his daughter is taken.">' + esc(c.idea) + "</textarea>" +
      '<div class="copro__row"><button class="btn" data-act="cp-ideas"' + (c.helpBusy ? " disabled" : "") + ">" + (c.helpBusy ? '<span class="spin"></span> Thinking' : c.ideas ? "Three more ideas" : "I need an idea") + "</button>" +
      '<button class="btn btn--quiet" data-act="cp-back">Back</button><button class="btn btn--go btn--lg" data-act="cp-write">Write my first draft</button></div>' +
      (c.ideas ? '<div class="copro__help">' + c.ideas.examples.map(function (x, i) {
        return '<button class="idea" data-idea="' + i + '"><b>' + esc(x.label) + "</b><span>" + esc(x.text) + "</span></button>";
      }).join("") + "</div>" : "") + "</div>" +
      "";
  } else if (c.step === 0) {
    body = '<p class="kicker">Start a new show</p><h1 class="copro__q">What are you making?</h1>' +
      '<p class="copro__sub">Start here, because each one is built differently.</p>' +
      '<div class="choices choices--3">' + FORMATS.map(function (f) {
        var note = { short: "A few minutes. A hook, a story and a twist.", film: "About 90 minutes. One story in three acts.", series: "A season of episodes. Each episode is its own three-act story, and together they tell a bigger one." }[f.id];
        return '<button class="choice" data-format="' + f.id + '" aria-pressed="' + (c.format === f.id) + '"><b>' + esc(f.name) + "</b><span>" + esc(note) + "</span></button>";
      }).join("") + "</div>" +
      (c.format === "series" ? '<div class="copro__field"><span class="lab">How many episodes?</span><div class="chips">' + [4, 6, 8, 10].map(function (n) {
        return '<button class="chip" data-eps="' + n + '" aria-pressed="' + (c.episodes === n) + '">' + n + "</button>";
      }).join("") + "</div></div>" : "") +
      '<div class="copro__field"><div class="copro__row"><button class="btn btn--go btn--lg" data-act="cp-next"' + (c.format ? "" : " disabled") + ">Next</button></div></div>" +
      (!S.ips.length ? '<p class="hint" style="margin-top:28px">Want to see where this goes first? <button class="link" data-act="demo">Open an example ShowPage</button></p>' : "");
  } else {
    var L = c.format === "series" ? ["Reading your idea", "Finding the season\u2019s story", "Meeting your cast and places", "Writing each episode in three acts"]
      : ["Reading your idea", "Finding the story", "Writing the beginning, middle and end", "Meeting your cast", "Finding the places"];
    body = '<p class="kicker">Start a new show</p><h1 class="copro__q">Writing your first draft</h1>' +
      '<p class="copro__sub">This can take up to a minute. Everything here is a starting point you can change.</p>' +
      '<div class="copro__busy">' + L.map(function (t, i) {
        var st = i < c.at ? "done" : i === c.at ? "on" : "wait";
        return '<div class="busyline ' + st + '"><span class="dot">' + (st === "on" ? '<span class="spin"></span>' : "") + "</span>" + esc(t) + "</div>";
      }).join("") + "</div>";
  }
  return sampleNote() + head + '<main class="wrap copro">' + body + "</main>";
}

async function coproWrite() {
  var c = S.copro;
  c.step = 2; c.at = 0; draw();
  var p = blankIP("Untitled show", c.format);
  var serial = c.format === "series";
  var tick = setInterval(function () { if (c.at < (serial ? 2 : 4)) { c.at++; draw(); } }, LIVE.mode === "sample" ? 850 : 6000);
  var res;
  try { res = await riffStory(compilePayload(p, "script", { intent: "riff", episodes: c.episodes }), c.idea, c.format); }
  catch (e) { clearInterval(tick); c.step = 1; draw(); throw e; }
  clearInterval(tick);
  applyRiff(p, res, c.format, c.episodes);
  if (serial) {
    // every episode is written as its own three-act story inside the season
    c.at = 3; draw();
    try { storeSeason(p, await planEpisodes(compilePayload(p, "structure", { episodes: c.episodes }), c.episodes, true)); }
    catch (e) { toast("Your season is drafted. The episodes couldn\u2019t be written yet; plan them on the Story page."); }
  }
  p.team = [{ email: "you", role: "Owner" }];
  p.rev = { story: 0 };
  S.ips.unshift(p);
  S.copro = null;
  save();
  go("step", p.id, "story");
  toast("Here’s your first draft. Read it, change anything, then go to the next step.");
}

// ---------- a step on the path ----------
function drawStep(p, id) {
  var i = stepIndex(id), st = STEPS[i];
  var next = STEPS[i + 1], prev = STEPS[i - 1];
  var dots = STEPS.map(function (s, k) {
    return '<button class="pathdot' + (k === i ? " on" : stepDone(p, s.id) ? " done" : "") + '" data-goto="' + s.id + '" aria-label="' + s.name + '"></button>';
  }).join("");
  var head = '<header class="top"><button class="iconbtn" data-act="' + (p.page ? "to-page" : "home") + '" aria-label="' + (p.page ? "Back to your ShowPage" : "Front page") + '">' + ICON.back + "</button>" +
    '<span class="top__title">' + esc(p.title) + "</span>" +
    '<button class="btn btn--sm btn--page" data-act="' + (p.page ? "to-page" : "make-page") + '">' + (p.page ? "My ShowPage" : "Make my ShowPage") + "</button></header>";
  var body = STEP_DRAW[id](p);
  var foot = '<nav class="pathbar"><div class="wrap pathbar__in">' +
    (prev ? '<button class="btn btn--quiet" data-goto="' + prev.id + '">Back</button>' : '<span></span>') +
    (next ? '<button class="btn btn--go" data-goto="' + next.id + '">Next: ' + next.name + "</button>" :
      '<button class="btn btn--go" data-act="' + (p.page ? "to-page" : "make-page") + '">' + (p.page ? "Go to my ShowPage" : "Make my ShowPage") + "</button>") +
    "</div></nav>";
  return sampleNote() + head + '<main class="wrap step"><div class="path">' + dots + '</div><p class="kicker">Step ' + (i + 1) + " of " + STEPS.length + "</p>" +
    "<h1 class=\"step__title\">" + st.name + '</h1><p class="step__lead">' + esc(st.lead) + "</p>" + body + "</main>" + foot;
}

// One clear thing to do next on this page, when there is one.
function doNext(label, act, why, busyKey) {
  var running = busyKey && S.busy[busyKey];
  return '<div class="donext">' + (why ? "<p>" + esc(why) + "</p>" : "") +
    '<button class="btn btn--go" data-act="' + act + '"' + (running ? " disabled" : "") + ">" + (running ? '<span class="spin"></span> Working on it' : esc(label)) + "</button></div>";
}
function staleNote(p, what, act, label) {
  if (!stale(p, what)) return "";
  return '<div class="stale"><span>Your story has changed since this was made.</span><button class="btn btn--sm" data-act="' + act + '">' + label + "</button></div>";
}

var STEP_DRAW = {
  story: function (p) {
    var short = p.format.type === "short";
    var labels = short ? ["The hook", "The story", "The twist"] : isSerial(p) ? ["The season begins", "The middle of the season", "The season ends"] : ["Beginning", "Middle", "End"];
    var h = '<button class="field-tap" data-edit="title"><span class="lab">Title</span><b class="field-tap__big">' + esc(p.title) + "</b></button>" +
      '<button class="field-tap" data-edit="logline"><span class="lab">In one sentence</span><span>' + esc(p.story.logline || "Tap to write it") + "</span></button>" +
      '<div class="lenline"><span>' + esc(fmtLine(p) || "Length not set") + '</span><button class="link" data-act="shape">Change</button></div>';
    if (S.busy.acts) h += '<p class="note"><span class="spin"></span> Rewriting the three parts to match…</p>';
    h += '<div class="parts">' + [1, 2, 3].map(function (n, i) {
      var t = short ? (p.story.short || {})[["hook", "story", "twist"][i]] : actText(p, n);
      return '<button class="part" data-edit="' + (short ? "short:" + ["hook", "story", "twist"][i] : "act:" + n) + '"><span class="part__k">' + labels[i] + '</span><span class="part__t">' + esc(t || "Tap to write this part.") + "</span></button>";
    }).join("") + "</div>";
    if (!short) {
      h += '<details class="more" id="spineMore"' + (S.openLines ? " open" : "") + '><summary>See it line by line</summary><div><p class="hint">Your story in eight short lines. Change one and the three parts above are rewritten to match.</p><div class="lines">' +
        SPINE_STEPS.map(function (st) { return '<button class="line" data-edit="spine:' + st.key + '"><b>' + esc(st.label) + "</b><span>" + esc(p.story.spine[st.key] || "Tap to write") + "</span></button>"; }).join("") + "</div></div></details>";
    }
    if ((formatById(p.format.type) || {}).serial) {
      h += '<h2 class="subhead">The episodes</h2>' + staleNote(p, "episodes", "plan-eps", "Plan them again");
      if ((p.episodes || []).length) h += '<p class="hint" style="margin:0">Each episode is its own story with a beginning, middle and end. Tap one to read or change it.</p><div class="eps">' + p.episodes.map(function (e) {
        var acts = [1, 2, 3].filter(function (k) { return epAct(p, e.number, k); }).length;
        return '<button class="ep" data-ep="' + e.number + '"><span class="ep__n">' + String(e.number).padStart(2, "0") + '</span><span><span class="ep__t">' + esc(e.title) + '</span><br><span class="ep__p">' + esc(e.premise) + "</span>" +
          '<span class="ep__acts">' + [1, 2, 3].map(function (k) { return '<i class="' + (epAct(p, e.number, k) ? "on" : "") + '"></i>'; }).join("") + (acts === 3 ? "Three acts" : acts + " of 3 acts written") + "</span></span></button>";
      }).join("") + "</div>";
      else h += doNext("Plan the episodes", "plan-eps", "Lay out what happens in each of your " + (p.format.episodes || 6) + " episodes.", "eps");
    }
    return h;
  },
  cast: function (p) {
    var need = p.characters.filter(function (c) { return !c.face; }).length;
    var h = need ? doNext("Make " + plural(need, "face"), "make-faces", "Each person needs a face. It stays the same in every scene.", "step:faces") : "";
    h += '<div class="grid grid--cast">' + p.characters.map(function (c) {
      var working = S.busy["face:" + c.id];
      return '<button class="card card--cast" data-person="' + esc(c.id) + '"><div class="card__img"><img src="' + faceSrc(p, c) + '" alt="">' +
        (working ? '<div class="working"><span class="spin"></span></div>' : !c.face ? '<span class="need">Needs a face</span>' : "") +
        "</div><b>" + esc(c.name) + "</b><small>" + esc(roleName(c.role)) + "</small></button>";
    }).join("") + '<button class="card card--cast card--add" data-act="add-person"><div class="card__img">+ Add someone</div></button></div>';
    return h;
  },
  places: function (p) {
    var need = p.worlds.filter(function (w) { return !w.shot; }).length;
    var h = need ? doNext("Make " + plural(need, "picture"), "make-places", "Make a picture of each place so every scene set there matches.", "step:places") : "";
    h += '<div class="grid grid--places">' + p.worlds.map(function (w) {
      var working = S.busy["plate:" + w.id];
      return '<button class="card card--place" data-place="' + esc(w.id) + '"><div class="card__img"><img src="' + placeSrc(p, w) + '" alt="">' +
        (working ? '<div class="working"><span class="spin"></span></div>' : !w.shot ? '<span class="need">Needs a picture</span>' : "") +
        "</div><b>" + esc(w.name) + "</b><small>" + esc(w.atmosphere || "") + "</small></button>";
    }).join("") + '<button class="card card--place card--add" data-act="add-place"><div class="card__img">+ Add a place</div></button></div>';
    return h;
  },
  look: function (p) {
    var v = p.visual;
    return '<span class="lab">Style</span>' + chips("lk-style", VISUAL_STYLES, v.style) +
      '<span class="lab" style="margin-top:22px">Colour</span><div class="optgrid">' + PALETTES.map(function (pl) {
        return '<button type="button" class="opt" data-lkpal="' + pl.id + '" aria-pressed="' + (v.palette === pl.id) + '"><b>' + esc(pl.name) + '</b><div class="sw">' + pl.swatches.map(function (s) { return '<i style="background:' + s + '"></i>'; }).join("") + "</div></button>";
      }).join("") + "</div>" +

      (v.style && v.palette ? '<div class="preview"><img src="' + art("place", "look:" + v.style + v.palette, palOf(p)) + '" alt=""><span>' + esc(v.style) + " · " + esc(paletteById(v.palette).name) + "</span></div>" : "");
  },
  sound: function (p) {
    var m = p.music;
    var voiced = p.characters.filter(function (c) { return p.voices.assignments[c.id]; }).length;
    var h = !m.genres.length ? doNext("Hear three directions", "music", "Pick the music for your show. I’ll suggest three directions.") :
      voiced < p.characters.length ? doNext("Cast the voices", "cast-voices", "Give everyone a voice that sounds different from the rest.", "step:voices") : "";
    h += '<div class="tiles"><button class="tile" data-act="music"><span class="tile__k">Music</span><span class="tile__v' + (m.genres.length ? "" : " none") + '">' + esc(m.genres.length ? m.genres.join(" + ") : "Not chosen yet") + "</span><p>" +
      esc(m.genres.length ? [m.moods.join(", "), m.tempo + " bpm"].filter(Boolean).join(" · ") : "Tap to choose") + "</p></button>" +
      '<button class="tile" data-act="voices"><span class="tile__k">Voices</span><span class="tile__v' + (voiced ? "" : " none") + '">' + (p.characters.length ? voiced + " of " + p.characters.length : "No cast yet") + "</span><p>" +
      esc(voiced ? p.characters.filter(function (c) { return p.voices.assignments[c.id]; }).map(function (c) { var vv = voiceById(p.voices.assignments[c.id].voiceId); return c.name.split(" ")[0] + ": " + (vv ? vv.name : "?"); }).join(" · ") : "Tap to choose") + "</p></button></div>";
    h += tracksHTML(p, false);
    return h;
  },
  scenes: function (p) {
    var pick = "";
    if (isSerial(p) && (p.episodes || []).length) {
      S.ep = S.ep || 1;
      pick = '<span class="lab">Episode</span><div class="chips">' + p.episodes.map(function (e) {
        var n = p.scenes.filter(function (s) { return (s.ep || 1) === e.number; }).length;
        return '<button type="button" class="chip" data-epick="' + e.number + '" aria-pressed="' + (S.ep === e.number) + '">Ep ' + e.number + (n ? " (" + n + ")" : "") + "</button>";
      }).join("") + "</div>";
      var cur = p.episodes.find(function (e) { return e.number === S.ep; });
      if (cur) pick += '<p class="hint" style="margin:0"><b>' + esc(cur.title) + ".</b> " + esc(cur.premise) + "</p>";
    }
    var list = epScenes(p);
    if (!list.length) return pick + doNext(isSerial(p) ? "Make the scene list for episode " + (S.ep || 1) : "Make the scene list", "break", isSerial(p) ? "I\u2019ll turn this episode\u2019s beginning, middle and end into scenes." : "I\u2019ll turn your story into a list of scenes.", "break");
    var todo = list.filter(function (s) { return s.status !== "rendered"; }).length;
    var h0 = pick;
    var h = h0 + staleNote(p, "scenes", "break", "Make a new scene list");
    if (todo) h += doNext("Make " + plural(todo, "scene"), "make-all", MEDIA.video ? "Each scene becomes a short video clip with your cast, places and voices." : "Each scene is made with your cast, places, look and voices.", "all");
    var short = p.format.type === "short";
    var names = short ? { 1: "The hook", 2: "The story", 3: "The twist" } : { 1: "Beginning", 2: "Middle", 3: "End" };
    var lastAct = null;
    h += '<div class="scenes">' + list.map(function (s, i) {
      var g = "";
      if (s.act && s.act !== lastAct) { lastAct = s.act; g = '<div class="group">' + names[s.act] + "</div>"; }
      var st = S.busy["scene:" + s.id] ? '<span class="pill busy">Making…</span>' : s.status === "rendered" ? '<span class="pill ok">Made</span>' : '<span class="pill">Not made yet</span>';
      return g + '<button class="scene" data-scene="' + esc(s.id) + '"><div class="scene__img"><img src="' + sceneSrc(p, s) + '" alt=""></div><div class="scene__body">' +
        '<span class="scene__n">Scene ' + (i + 1) + '</span><span class="scene__t">' + esc(s.prompt || "Tap to say what happens") + "</span>" + st + "</div></button>";
    }).join("") + '</div><button class="btn btn--quiet" data-act="add-scene" style="margin-top:10px">+ Add a scene</button>';
    return h;
  },
  trailer: function (p) {
    return drawEditRoom(p);
  },
  share: function (p) {
    var docs = Object.keys(p.bible.docs || {}).length + ((p.bible.deck || []).length ? 1 : 0);
    return staleNote(p, "pitch", "pitch", "Make it again") + '<div class="list">' +
      item("share", "Invite people", plural((p.team || []).length, "person", "people") + " on this show") +
      item("pitch", "Pitch pack", docs ? plural(docs, "document") + " ready" : "A one-pager, character bios and a deck") +
      item("promo", "Posters and social", (p.promo || []).length ? plural(p.promo.length, "image") + " ready" : "Key art sized for each platform") +
      item("export", "Download", "Your video, separate audio, captions") + "</div>";
  }
};

// The scenes on screen: one episode's for a series, all of them otherwise.
function epScenes(p) { return isSerial(p) ? p.scenes.filter(function (s) { return (s.ep || 1) === (S.ep || 1); }) : p.scenes; }

function roleName(r) { return { Minor: "Small part" }[r] || r || "Supporting"; }
var SHOTS = [["Wide establishing", "Wide"], ["Medium", "Medium"], ["Close-up", "Close-up"], ["Over the shoulder", "Over the shoulder"], ["Tracking", "Moving with them"]];
function item(act, title, sub) {
  return '<button class="item" data-act="' + act + '"><span><b>' + esc(title) + "</b><small>" + esc(sub) + '</small></span><span class="chev">›</span></button>';
}
function playerHTML(p, url, tag) {
  if (url && !isStandIn(url)) return '<div class="screen"><video src="' + esc(url) + '" controls playsinline poster="' + coverSrc(p) + '"></video></div>';
  return '<div class="screen"><img src="' + coverSrc(p) + '" alt=""><span class="screen__tag">' + esc(tag) + '</span><div class="screen__play"><span></span></div></div>' +
    '<p class="hint">' + (MEDIA.video ? "" : "A preview. Real video plays here once a video service is connected.") + "</p>";
}
function tracksHTML(p, editing) {
  var tr = p.tracks || [];
  if (!tr.length && !editing) return "";
  return '<div class="tracks">' + tr.map(function (t, i) {
    return '<div class="track"><button class="track__play" data-play="' + i + '" aria-label="Play ' + esc(t.name) + '">▶</button><span class="track__name">' + esc(t.name) + '<small>' + esc(t.kind === "score" ? "Score" : "Uploaded") + "</small></span>" +
      (editing ? '<button class="btn btn--sm btn--quiet" data-untrack="' + i + '">Remove</button>' : "") + "</div>";
  }).join("") + "</div>";
}

// ============================================================
// The ShowPage: the show, laid out like a show page
// ============================================================
var PAGE_SECTIONS = [["trailer", "Trailer"], ["story", "Story"], ["cast", "Cast"], ["places", "Places"], ["look", "Look"], ["sound", "Sound"], ["scenes", "Scenes"], ["art", "Artwork"]];

function drawShowPage(p) {
  var f = formatById(p.format.type);
  var genre = (p.story.genres[0] || "").toLowerCase();
  var owner = (p.team || [])[0];
  var nav = '<header class="pnav"><div class="pnav__in">' +
    '<button class="pnav__brand" data-act="home" aria-label="ShowTime front page"><img src="' + LOGO + '" alt=""></button>' +
    '<span class="pnav__title">' + esc(p.title) + "</span>" +
    '<nav class="pnav__links">' + PAGE_SECTIONS.map(function (s) { return '<button data-sec="' + s[0] + '">' + s[1] + "</button>"; }).join("") + "</nav>" +
    '<button class="btn btn--sm' + (S.editing ? " btn--go" : "") + '" data-act="toggle-edit">' + (S.editing ? "Done editing" : "Edit page") + "</button>" +
    '<button class="iconbtn" data-act="menu" aria-label="Menu">' + ICON.menu + "</button></div>" +
    (S.editing ? '<div class="editbar"><div class="wrap">Tap any outlined text to change it. Use <b>Change image</b> on any picture. Changes save as you go.</div></div>' : "") + "</header>";

  var g = gaps(p);
  S.pageBgs = sectionBgs(p);
  var h = sampleNote() + nav;

  // hero
  h += '<section class="phero" id="pg-top"><div class="phero__art" style="background-image:url(&quot;' + coverSrc(p) + '&quot;)"></div>' +
    '<div class="wrap phero__in"><p class="phero__kick">' + esc((owner && owner.email !== "you" ? owner.email.split("@")[0] + " presents" : "ShowTime presents") + " · " + (genre ? "A " + genre + " " : "A ") + (f ? f.name.toLowerCase() : "show")) + "</p>" +
    '<h1 class="phero__tag" data-field="tagline">' + esc(p.tagline || p.title) + "</h1>" +
    '<p class="phero__title" data-field="title">' + esc(p.title) + "</p>" +
    '<p class="phero__line" data-field="logline">' + esc(p.story.logline) + "</p>" +
    '<button class="btn btn--sm phero__img chg" data-act="recover">Change image</button></div></section>';

  if (g.length) {
    h += '<section class="wrap pgaps"><p><b>Your ShowPage is ' + (g.length > 4 ? "just getting started" : "almost there") + ".</b> Still to do: " + esc(g.map(function (x) { return x.what; }).join(", ")) + ".</p>" +
      '<button class="btn btn--sm" data-act="continue">Continue building</button></section>';
  }

  // trailer
  h += pSec("trailer", "The trailer", "trailer");
  if (p.trailer.status === "ready") h += (p.trailer.videoUrl && !isStandIn(p.trailer.videoUrl) ? playerHTML(p, p.trailer.videoUrl, "Trailer") : p.trailer.cutId ? previewHTML("pv-page") : playerHTML(p, p.trailer.videoUrl, "Trailer")) + trailerNotes(p);
  else h += placeholder("wide", "No trailer yet", "Make a short trailer from your show.", "trailer", "Make the trailer");
  h += pEnd();

  // story
  h += pSec("story", "The story", "story");
  var short = p.format.type === "short";
  if (isSerial(p)) h += '<h3 class="psub">The season</h3>';
  h += '<div class="pstory">' + [1, 2, 3].map(function (n, i) {
    var key = short ? "short:" + ["hook", "story", "twist"][i] : "act:" + n;
    var t = short ? (p.story.short || {})[["hook", "story", "twist"][i]] : actText(p, n);
    return '<p data-field="' + key + '">' + esc(t) + "</p>";
  }).join("") + "</div>";
  if ((f || {}).serial) {
    if ((p.episodes || []).length) h += '<h3 class="psub">The episodes</h3><div class="peps">' + p.episodes.map(function (e) {
      return '<details class="pep" id="pep-' + e.number + '"' + ((S.openEps || {})[e.number] || S.editing ? " open" : "") + '><summary><span class="ep__n">' + String(e.number).padStart(2, "0") + '</span><span class="pep__h"><b data-field="ep:' + e.number + ':title">' + esc(e.title) + '</b><span class="pep__p" data-field="ep:' + e.number + ':premise">' + esc(e.premise) + '</span></span><span class="psec__chev" aria-hidden="true"></span></summary>' +
        '<div class="pep__acts">' + [1, 2, 3].map(function (k) {
          return '<div class="pep__act"><span class="pep__k">' + ["Beginning", "Middle", "End"][k - 1] + '</span><p data-field="ep:' + e.number + ":act" + k + '">' + esc(epAct(p, e.number, k)) + "</p></div>";
        }).join("") + (e.carriesOver ? '<p class="pep__next"><b>Leads into the next episode:</b> <span data-field="ep:' + e.number + ':carriesOver">' + esc(e.carriesOver) + "</span></p>" : "") + "</div></details>";
    }).join("") + "</div>";
    else h += placeholder("text", "The episodes aren’t planned yet", "Lay out what happens in each episode.", "story", "Plan the episodes");
  }
  h += pEnd();

  // cast
  h += pSec("cast", "The cast", "cast");
  if (!p.characters.length) h += placeholder("text", "No cast yet", "Add the people in your story.", "cast", "Add your cast");
  // a bigger cast reads better in tiers, the way a show page bills it
  var TIERS = [["Starring", ["Lead", "Antagonist", "Narrator"]], ["Also starring", ["Supporting"]], ["With", ["Minor"]]];
  var tiered = p.characters.length > 6;
  h += (tiered ? "" : '<div class="pcast">') + (tiered ? TIERS.map(function (t) {
    var list = p.characters.filter(function (c) { return t[1].indexOf(c.role || "Supporting") !== -1; });
    if (!list.length) return "";
    return '<h3 class="psub">' + t[0] + '</h3><div class="pcast' + (t[0] === "With" ? " pcast--small" : "") + '">' + list.map(personCard).join("") + "</div>";
  }).join("") : p.characters.map(personCard).join("")) + (tiered ? "" : "</div>") + pEnd();
  function personCard(c) {
    return '<article class="pperson"><div class="pperson__img">' +
      (c.face ? '<img src="' + faceSrc(p, c) + '" alt="' + esc(c.name) + '"><button class="btn btn--sm chg" data-person="' + esc(c.id) + '">Change image</button>'
        : '<button class="ph ph--tall" data-person="' + esc(c.id) + '"><span class="ph__icon">○</span><b>Needs a face</b><span>Tap to make one</span></button>') +
      '</div><p class="pperson__role">' + esc(roleName(c.role)) + '</p><h3 data-field="char:' + c.id + ':name">' + esc(c.name) + "</h3>" +
      '<p data-field="char:' + c.id + ':look">' + esc(c.look || "") + "</p>" +
      (c.arc ? '<p class="pperson__arc" data-field="char:' + c.id + ':arc">' + esc(c.arc) + "</p>" : "") +
      (c.quote ? '<blockquote data-field="char:' + c.id + ':quote">“' + esc(c.quote) + "”</blockquote>" : "") + "</article>";
  }

  // places
  h += pSec("places", "The places", "places");
  if (!p.worlds.length) h += placeholder("text", "No places yet", "Add where your story happens.", "places", "Add a place");
  h += '<div class="pplaces">' + p.worlds.map(function (w) {
    return '<article class="pplace"><div class="pplace__img">' +
      (w.shot ? '<img src="' + placeSrc(p, w) + '" alt="' + esc(w.name) + '"><button class="btn btn--sm chg" data-place="' + esc(w.id) + '">Change image</button>'
        : '<button class="ph ph--wide" data-place="' + esc(w.id) + '"><span class="ph__icon">▱</span><b>Needs a picture</b><span>Tap to make one</span></button>') +
      '</div><h3 data-field="place:' + w.id + ':name">' + esc(w.name) + '</h3><p data-field="place:' + w.id + ':atmosphere">' + esc(w.atmosphere || "") + "</p></article>";
  }).join("") + "</div>" + pEnd();

  // look
  h += pSec("look", "The look", "look");
  var pal = paletteById(p.visual.palette);
  if (p.visual.style && pal) h += '<div class="plook"><div class="plook__sw">' + pal.swatches.map(function (s) { return '<i style="background:' + s + '"></i>'; }).join("") + '</div><p><b>' + esc(p.visual.style) + "</b> in " + esc(pal.name.toLowerCase()) + ".</p></div>";
  else h += placeholder("text", "No look yet", "Pick the style and colours for your show.", "look", "Pick a look");
  h += pEnd();

  // sound
  h += pSec("sound", "The soundtrack", "sound");
  if (p.music.genres.length) h += '<p class="plead">' + esc(p.music.genres.join(" and ")) + ", " + esc(p.music.moods.join(", ").toLowerCase()) + ", around " + p.music.tempo + " beats a minute" + (p.music.instruments.length ? ", with " + esc(p.music.instruments.join(", ").toLowerCase()) : "") + ".</p>";
  else h += placeholder("text", "No music yet", "Choose the sound of your show.", "sound", "Choose the music");
  h += tracksHTML(p, S.editing) +
    '<div class="copro__row" style="margin-top:12px">' + (MEDIA.music && p.music.genres.length ? '<button class="btn btn--sm" data-act="make-score"' + (S.busy.score ? " disabled" : "") + ">" + (S.busy.score ? '<span class="spin"></span> Composing' : "Make the theme") + "</button>" : "") +
    '<label class="btn btn--sm">Upload music<input type="file" accept="audio/*" id="upMusic" hidden></label></div>' + pEnd();

  // scenes
  h += pSec("scenes", "The scenes", "scenes");
  if (!p.scenes.length) h += placeholder("text", "No scenes yet", "Turn your story into scenes.", "scenes", "Make the scene list");
  var lastEp = null, idx = 0;
  h += '<div class="pscenes">' + p.scenes.map(function (s) {
    var made = s.status === "rendered";
    var head = "";
    if (isSerial(p) && (s.ep || 1) !== lastEp) { lastEp = s.ep || 1; idx = 0; var ee = (p.episodes || []).find(function (x) { return x.number === lastEp; }); head = '<div class="pscenes__ep">Episode ' + lastEp + (ee ? ": " + esc(ee.title) : "") + "</div>"; }
    var i = idx++;
    return head + '<button class="pscene" data-scene="' + esc(s.id) + '"><div class="pscene__img">' + (made && s.videoUrl && !isStandIn(s.videoUrl) ? '<video src="' + esc(s.videoUrl) + '" muted playsinline preload="metadata"></video>' : '<img src="' + sceneSrc(p, s) + '" alt="">') +
      (made ? "" : '<span class="need">Not made yet</span>') + '</div><span class="scene__n">Scene ' + (i + 1) + (s.heading ? " · " + esc(s.heading) : "") + '</span><span class="scene__t">' + esc(s.prompt) + "</span></button>";
  }).join("") + "</div>" + pEnd();

  // artwork: everything made or uploaded for the show
  h += pSec("art", "Artwork", null);
  var gal = galleryItems(p);
  h += '<div class="chips artfilter">' + ART_FILTERS.map(function (f) {
    var n = f[0] === "all" ? gal.length : gal.filter(function (g) { return g.kind === f[0]; }).length;
    return n || f[0] === "all" ? '<button type="button" class="chip" data-artf="' + f[0] + '" aria-pressed="' + ((S.artFilter || "all") === f[0]) + '">' + f[1] + " (" + n + ")</button>" : "";
  }).join("") + "</div>";
  var shown = gal.filter(function (g) { return (S.artFilter || "all") === "all" || g.kind === S.artFilter; });
  h += shown.length ? '<div class="pgallery">' + shown.map(function (g) {
    return '<button class="pgal pgal--' + g.shape + '" data-art="' + esc(g.id) + '"><img src="' + g.url + '" alt="' + esc(g.label) + '" loading="lazy"><span>' + esc(g.label) + "</span></button>";
  }).join("") + "</div>" : '<p class="hint">Nothing here yet.</p>';
  h += '<div class="copro__row" style="margin-top:12px"><label class="btn btn--sm">Add artwork<input type="file" accept="image/*" id="upArt" multiple hidden></label><span class="hint">Posters, concept art, mood images. Anything you upload stays with the show.</span></div>' + pEnd();

  // credits
  h += '<footer class="pfoot"><div class="wrap"><p class="pfoot__t">' + esc(p.title) + "</p><p>Created by " + esc(owner && owner.email !== "you" ? owner.email : "you") + "</p><p>Made with ShowTime</p></div></footer>";
  if (S.studio) h += '<div class="wrap">' + secStudio(p) + "</div>";
  return h;
}
// Every ShowPage section folds shut, showing a one-line preview, so the
// page reads as a short list until someone opens a part.
var OPEN_BY_DEFAULT = { trailer: true, story: true };
function pSec(id, title, step) {
  var p = P();
  var open = S.openSecs && id in S.openSecs ? S.openSecs[id] : !!OPEN_BY_DEFAULT[id];
  var bg = (S.pageBgs || {})[id];
  // when a picture is used more than once, show a different part of it each time
  var POS = ["50% 50%", "15% 30%", "85% 70%", "30% 85%", "70% 15%", "50% 100%", "0% 50%", "100% 0%"];
  var pos = POS[Object.keys(S.pageBgs || {}).filter(function (k, i, ks) { return ks.indexOf(k) < ks.indexOf(id) && S.pageBgs[k] === bg; }).length % POS.length];
  return '<details class="psec wrap' + (bg ? " psec--bg" : "") + '" id="pg-' + id + '"' + (open ? " open" : "") + '><summary class="psec__head"' + (bg ? ' style="--bg-img:url(&quot;' + bg + '&quot;);--bg-pos:' + pos + '"' : "") + '><span class="psec__t"><h2>' + title + "</h2>" +
    '<span class="psec__sum">' + secSummary(p, id) + "</span></span>" +
    (step ? '<button class="link" data-goto="' + step + '">Edit ' + STEPS[stepIndex(step)].name.toLowerCase() + "</button>" : "") + '<span class="psec__chev" aria-hidden="true"></span></summary><div class="psec__body">';
}
function pEnd() { return "</div></details>"; }
function mini(urls, shape) {
  return '<span class="mini mini--' + shape + '">' + urls.slice(0, 5).map(function (u) { return '<img src="' + u + '" alt="">'; }).join("") + "</span>";
}
function secSummary(p, id) {
  if (id === "trailer") return p.trailer.status === "ready" ? "Ready \u00B7 " + esc(p.trailer.length) : "Not made yet";
  if (id === "story") return esc(fmtLine(p)) + ((p.episodes || []).length ? " \u00B7 " + plural(p.episodes.length, "episode") : "");
  if (id === "cast") return mini(p.characters.map(function (c) { return faceSrc(p, c); }), "round") + plural(p.characters.length, "person", "people");
  if (id === "places") return mini(p.worlds.filter(function (w) { return w.shot; }).map(function (w) { return placeSrc(p, w); }), "wide") + plural(p.worlds.length, "place");
  if (id === "look") { var pal = paletteById(p.visual.palette); return pal ? '<span class="mini mini--sw">' + pal.swatches.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("") + "</span>" + esc(p.visual.style || "") : "Not picked yet"; }
  if (id === "sound") return p.music.genres.length ? esc(p.music.genres.join(" + ")) + ((p.tracks || []).length ? " \u00B7 " + plural(p.tracks.length, "track") : "") : "Not chosen yet";
  if (id === "scenes") { var made = p.scenes.filter(function (s) { return s.status === "rendered"; }).length; return p.scenes.length ? plural(p.scenes.length, "scene") + " \u00B7 " + made + " made" : "Not made yet"; }
  if (id === "art") { var g = galleryItems(p); return mini(g.map(function (x) { return x.url; }), "sq") + plural(g.length, "image"); }
  return "";
}

// ---------- artwork ----------
var ART_FILTERS = [["all", "All"], ["cast", "Cast"], ["places", "Places"], ["scenes", "Scenes"], ["promo", "Posters"], ["upload", "Uploads"]];
function galleryItems(p) {
  var out = [];
  p.characters.forEach(function (c) {
    (c.looks || []).forEach(function (lk, i) {
      out.push({ id: "lk:" + c.id + ":" + i, kind: "cast", shape: "tall", label: c.name + (i ? " (earlier)" : ""), url: isStandIn(lk.url) ? art("face", lk.seed, palOf(p)) : lk.url, ref: { type: "look", cid: c.id, i: i } });
    });
    if (c.face && !(c.looks || []).length) out.push({ id: "lk:" + c.id + ":x", kind: "cast", shape: "tall", label: c.name, url: faceSrc(p, c), ref: { type: "face", cid: c.id } });
  });
  p.worlds.forEach(function (w) {
    (w.plates || []).forEach(function (pl, i) { out.push({ id: "pl:" + w.id + ":" + i, kind: "places", shape: "wide", label: w.name, url: isStandIn(pl.url) ? art("place", pl.seed, palOf(p)) : pl.url }); });
    if (w.shot && !(w.plates || []).length) out.push({ id: "pl:" + w.id + ":x", kind: "places", shape: "wide", label: w.name, url: placeSrc(p, w) });
  });
  p.scenes.forEach(function (s, i) { if (s.status === "rendered") out.push({ id: "sc:" + s.id, kind: "scenes", shape: "wide", label: "Scene " + (i + 1), url: sceneSrc(p, s), video: s.videoUrl && !isStandIn(s.videoUrl) ? s.videoUrl : null }); });
  (p.promo || []).forEach(function (im) { out.push({ id: "pr:" + im.id, kind: "promo", shape: im.h > im.w ? "tall" : "wide", label: im.name, url: im.url && !isStandIn(im.url) ? im.url : art("place", "promo:" + im.id, palOf(p)) }); });
  (p.artwork || []).forEach(function (a) { out.push({ id: "aw:" + a.id, kind: "upload", shape: "sq", label: a.name, url: a.url, ref: { type: "artwork", id: a.id } }); });
  (p.references || []).filter(function (r) { return r.url && !/^blob:/.test(r.url) && /^(character|world|visual)/.test(r.scope); }).forEach(function (r) {
    out.push({ id: "rf:" + r.id, kind: "upload", shape: "sq", label: r.name, url: r.url });
  });
  return out;
}
function sheetArt(id) {
  var p = P();
  var g = galleryItems(p).find(function (x) { return x.id === id; });
  if (!g) return;
  var st = { confirm: false };
  openSheet({
    title: g.label, kicker: "Artwork", wide: true,
    draw: function () {
      return {
        body: '<div class="artview">' + (g.video ? '<video src="' + esc(g.video) + '" controls playsinline></video>' : '<img src="' + g.url + '" alt="' + esc(g.label) + '">') + "</div>" +
          '<div><span class="lab">Use as the background for</span><div class="chips">' + PAGE_SECTIONS.map(function (sec) {
            var on = (p.bgs || {})[sec[0]] === g.url;
            return '<button type="button" class="chip" data-act="art-bg" data-sec-bg="' + sec[0] + '" aria-pressed="' + on + '">' + sec[1] + "</button>";
          }).join("") + '</div><p class="hint">Tap again to go back to the automatic pick.</p></div>',
        foot: '<button class="btn" data-act="art-cover">' + (p.coverUrl === g.url ? "This is your cover" : "Use as cover image") + "</button>" +
          (g.ref && g.ref.type === "look" ? '<button class="btn" data-act="art-face">Use as ' + esc(p.characters.find(function (c) { return c.id === g.ref.cid; }).name.split(" ")[0]) + "\u2019s face</button>" : "") +
          (g.ref && g.ref.type === "artwork" ? '<button class="btn btn--quiet" data-act="art-del" style="color:var(--accent)">' + (st.confirm ? "Tap again to remove" : "Remove") + "</button>" : "") +
          '<span class="sp"></span><button class="btn btn--go" data-act="close">Done</button>'
      };
    },
    on: function (act, el) {
      if (act === "art-bg" && el) {
        var id = el.dataset.secBg; p.bgs = p.bgs || {};
        if (p.bgs[id] === g.url) delete p.bgs[id]; else p.bgs[id] = g.url;
        save(); redraw(); paintSheet(); return;
      }
      if (act === "art-cover") { var old = p.coverUrl; p.coverUrl = g.url; save(); closeSheet(); redraw(); toast("Cover image changed.", function () { p.coverUrl = old; save(); redraw(); }); }
      if (act === "art-face") { var c = p.characters.find(function (x) { return x.id === g.ref.cid; }); var lk = c.looks[g.ref.i]; c.avatar = lk.url; c.faceSeed = lk.seed; save(); closeSheet(); redraw(); toast(c.name + "\u2019s face changed."); }
      if (act === "art-del") {
        if (!st.confirm) { st.confirm = true; paintSheet(); return; }
        var i = p.artwork.findIndex(function (a) { return a.id === g.ref.id; }); var a = p.artwork.splice(i, 1)[0];
        if (p.coverUrl === a.url) p.coverUrl = null;
        save(); closeSheet(); redraw(); toast("Removed.", function () { p.artwork.splice(i, 0, a); save(); redraw(); });
      }
    }
  });
}
function placeholder(shape, title, how, step, cta) {
  return '<button class="ph ph--' + (shape === "wide" ? "wide" : "text") + '" data-goto="' + step + '"><span class="ph__icon">+</span><b>' + esc(title) + "</b><span>" + esc(how) + '</span><span class="ph__cta">' + esc(cta) + " →</span></button>";
}
function trailerNotes(p) {
  var notes = (p.trailerNotes || []).slice().sort(function (a, b) { return a.t - b.t; });
  var mmss = function (t) { return Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0"); };
  return '<details class="more" id="tnotes"><summary>Notes on the trailer (' + notes.length + ")</summary><div>" +
    notes.map(function (n, i) { return '<div class="tnote"><b>' + mmss(n.t) + "</b><span>" + esc(n.text) + '</span><button class="btn btn--sm btn--quiet" data-unnote="' + i + '">Remove</button></div>'; }).join("") +
    '<div class="tnote__new"><input type="text" id="tnT" placeholder="0:12" aria-label="Time" style="width:80px"><input type="text" id="tnX" placeholder="What should change at this moment?" aria-label="Note"><button class="btn btn--sm" data-act="add-note">Add note</button></div></div></details>';
}

// Inline editing on the ShowPage, like the Red District page.
var FIELD_KEYS = /^(tagline|title|logline|act:\d|short:\w+|ep:\d+:(title|premise|carriesOver|act[123])|char:[^:]+:(name|look|arc|quote)|place:[^:]+:(name|atmosphere))$/;
function getField(p, key) {
  var k = key.split(":");
  if (key === "tagline") return p.tagline || "";
  if (key === "title") return p.title;
  if (key === "logline") return p.story.logline;
  if (k[0] === "act") return actText(p, +k[1]);
  if (k[0] === "short") return (p.story.short || {})[k[1]] || "";
  if (k[0] === "ep") { if (/^act\d$/.test(k[2])) return epAct(p, +k[1], +k[2].slice(3)); var e = (p.episodes || []).find(function (x) { return x.number === +k[1]; }); return e ? e[k[2]] || "" : ""; }
  if (k[0] === "char") { var c = p.characters.find(function (x) { return x.id === k[1]; }); return c ? c[k[2]] || "" : ""; }
  if (k[0] === "place") { var w = p.worlds.find(function (x) { return x.id === k[1]; }); return w ? w[k[2]] || "" : ""; }
  return "";
}
function setField(p, key, v) {
  var old = getField(p, key);
  if (v === old) return false;
  keep(p, key, old);
  var k = key.split(":");
  if (key === "tagline") p.tagline = v;
  else if (key === "title") { p.title = v || old; renameEverywhere(p, old, p.title); }
  else if (key === "logline") { p.story.logline = v; bump(p, "story"); }
  else if (k[0] === "act") { p.story.acts[arcKey(p, +k[1])] = { prose: v, manual: true }; recompose(p); bump(p, "story"); }
  else if (k[0] === "short") { p.story.short[k[1]] = v; recompose(p); bump(p, "story"); }
  else if (k[0] === "ep") { if (/^act\d$/.test(k[2])) { setEpAct(p, +k[1], +k[2].slice(3), v, true); recompose(p); } else { var e = p.episodes.find(function (x) { return x.number === +k[1]; }); if (e) e[k[2]] = v; } }
  else if (k[0] === "char") {
    var c = p.characters.find(function (x) { return x.id === k[1]; });
    if (c) { if (k[2] === "name") { c.name = v || old; renameEverywhere(p, old, c.name); } else c[k[2]] = v.replace(/^[“"]|[”"]$/g, ""); }
  } else if (k[0] === "place") {
    var w = p.worlds.find(function (x) { return x.id === k[1]; });
    if (w) { if (k[2] === "name") { w.name = v || old; renameEverywhere(p, old, w.name); } else w[k[2]] = v; }
  }
  save();
  return true;
}
function wireEditable() {
  $$("[data-field]").forEach(function (el) {
    if (!FIELD_KEYS.test(el.dataset.field)) return;
    if (S.editing) { el.setAttribute("contenteditable", "plaintext-only"); el.setAttribute("tabindex", "0"); el.spellcheck = true; }
    else el.removeAttribute("contenteditable");
  });
}
document.addEventListener("focusout", function (e) {
  var el = e.target.closest && e.target.closest("[data-field][contenteditable]");
  if (!el || !P()) return;
  var p = P(), key = el.dataset.field;
  var v = el.textContent.replace(/\s+/g, " ").trim();
  var old = getField(p, key);
  if (!v) { v = versionsOf(p, key)[0] ? versionsOf(p, key)[0].v : old; }
  if (setField(p, key, v)) {
    var named = /:name$|^title$/.test(key);
    redraw();
    toast(named ? "Saved. The new name is used everywhere." : "Saved.", function () { setField(p, key, old); redraw(); });
  }
});
document.addEventListener("keydown", function (e) {
  var el = e.target.closest && e.target.closest("[data-field][contenteditable]");
  if (el && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); el.blur(); }
});

// ============================================================
// Make my ShowPage: fill in what's missing, then open the page
// ============================================================
function sheetMakePage() {
  var p = P();
  var g = gaps(p);
  openSheet({
    title: p.page ? "Update my ShowPage" : "Make my ShowPage", kicker: p.title,
    draw: function () {
      return {
        body: (g.length ? "<p>Your ShowPage is your show on one page, laid out like a real show page. I’ll fill in what you haven’t done yet:</p>" +
          '<ul class="gaplist">' + g.map(function (x) { return "<li>" + esc(x.what.charAt(0).toUpperCase() + x.what.slice(1)) + "</li>"; }).join("") + "</ul>" :
          "<p>Your ShowPage is your show on one page, laid out like a real show page. Everything is ready to go on it.</p>") +
          '<p class="note"><b>You can change anything afterward.</b> Edit text right on the page, swap any picture, or go back to any step. Videos are only made when you ask, because they take a few minutes each.</p>',
        foot: '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Not yet</button><button class="btn btn--go" data-act="mp-go">' + (p.page ? "Update my ShowPage" : "Make my ShowPage") + "</button>"
      };
    },
    on: function (act) { if (act === "mp-go") { closeSheet(); fillGaps(p); } }
  });
}

async function fillGaps(p) {
  var g = gaps(p).map(function (x) { return x.fill; }).filter(Boolean);
  var labels = { copy: "Writing a tagline and quotes", look: "Picking a look", faces: "Making faces", places: "Making pictures of the places", music: "Choosing the music", voices: "Casting voices", episodes: "Planning the episodes", scenes: "Making the scene list" };
  var order = ["copy", "look", "faces", "places", "music", "voices", "episodes", "scenes"].filter(function (k) { return g.indexOf(k) !== -1; });
  S.filling = { order: order, at: 0, failed: [] };
  S.view = "filling"; drawFilling(labels);
  for (var i = 0; i < order.length; i++) {
    S.filling.at = i; drawFilling(labels);
    try { await FILL[order[i]](p); } catch (e) { S.filling.failed.push(labels[order[i]].replace(/^\w+ /, "").replace(/^a /, "")); }
    save();
  }
  p.page = p.page || { madeAt: Date.now() };
  p.page.updatedAt = Date.now();
  save();
  go("page", p.id);
  if (S.filling.failed.length) toast("Your ShowPage is ready. A few things couldn’t be made: " + S.filling.failed.join(", ") + ". Their spots show what to do.");
  else toast("Your ShowPage is ready. Tap Edit page to change anything.");
  S.filling = null;
}
function drawFilling(labels) {
  var f = S.filling;
  $("#app").innerHTML = '<main class="wrap copro"><p class="kicker">Make my ShowPage</p><h1 class="copro__q">Putting your ShowPage together</h1>' +
    '<p class="copro__sub">Filling in what’s missing. You can change all of it afterward.</p><div class="copro__busy">' +
    f.order.map(function (k, i) { var st = i < f.at ? "done" : i === f.at ? "on" : "wait"; return '<div class="busyline ' + st + '"><span class="dot">' + (st === "on" ? '<span class="spin"></span>' : "") + "</span>" + esc(labels[k]) + "</div>"; }).join("") +
    (f.order.length ? "" : '<div class="busyline on"><span class="dot"><span class="spin"></span></span>Laying out the page</div>') + "</div></main>";
}
var FILL = {
  copy: async function (p) {
    var r = await generateShowPageCopy(compilePayload(p, "design", { showpage: true }));
    if (r.tagline && !p.tagline) p.tagline = r.tagline;
    (r.quotes || []).forEach(function (q) { var c = p.characters.find(function (x) { return x.id === q.id; }); if (c && !c.quote) c.quote = q.quote; });
    if (r.look && !(p.visual.style && p.visual.palette)) { p.visual.style = p.visual.style || r.look.style; p.visual.palette = p.visual.palette || r.look.palette; }
  },
  look: async function (p) {
    if (p.visual.style && p.visual.palette) return;
    p.visual.style = p.visual.style || VISUAL_STYLES[0]; p.visual.palette = p.visual.palette || "cold";
  },
  faces: async function (p) { await Promise.all(p.characters.filter(function (c) { return !c.face; }).map(function (c) { return makeFace(c); })); },
  places: async function (p) { await Promise.all(p.worlds.filter(function (w) { return !w.shot; }).map(function (w) { return makePlate(w); })); },
  music: async function (p) {
    var r = await generateMusicOptions(compilePayload(p, "music", {}));
    var o = r.options[0]; if (!o) return;
    p.music.genres = o.genres; p.music.moods = o.moods; p.music.instruments = o.instruments; p.music.tempo = o.tempo;
  },
  voices: async function (p) {
    var r = await generateVoiceCasting(compilePayload(p, "voice", {}));
    r.casting.forEach(function (x) { if (!p.voices.assignments[x.characterId]) p.voices.assignments[x.characterId] = { voiceId: x.voiceId, accent: x.accent, pace: x.pace, why: x.why }; });
    if (!p.voices.narrator) p.voices.narrator = r.narrator;
  },
  episodes: async function (p) { var r = await planEpisodes(compilePayload(p, "structure", {}), p.format.episodes || 6, p.format.serialized !== false); p.episodes = r.episodes; stamp(p, "episodes"); },
  scenes: async function (p) { await breakScenes(true); }
};

// ---------- menu ----------
function drawMenu() {
  var old = $(".menu"); if (old) old.remove();
  if (!S.menu) return;
  var m = document.createElement("div");
  m.className = "menu"; m.setAttribute("role", "menu");
  var dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  m.innerHTML = '<div class="menu__links">' + PAGE_SECTIONS.map(function (s) { return '<button data-sec="' + s[0] + '">' + s[1] + "</button>"; }).join("") + "<hr></div>" +
    '<button data-act="continue">Continue building</button><button data-act="make-page">Update my ShowPage</button><button data-act="share">Share</button><hr>' +
    '<button data-act="shows">Your shows</button><button data-act="new">New show</button><hr>' +
    '<button data-act="theme">' + (dark ? "Light mode" : "Dark mode") + "</button>" +
    '<button data-act="studio">Studio view <span>' + (S.studio ? "On" : "Off") + "</span></button>" +
    '<hr><button data-act="delete-show" class="danger">Delete this show</button>';
  document.body.appendChild(m);
}

function secStudio(p) {
  var job = S.studioJob || "scene";
  var payload = compilePayload(p, job, {});
  var tree = fileTree(p).map(function (f) { return "<b>" + esc(f.name) + "/</b>\n" + f.files.map(function (x) { return "  " + esc(x); }).join("\n"); }).join("\n");
  return '<section class="studio" id="sec-studio"><h2>Studio view</h2><p>Only you see this. It’s everything the app sends to the models, assembled from the choices above. Turn it off in the menu.</p>' +
    '<div><span class="lab">Working style</span><div class="chips">' + WORKFLOWS.map(function (w) {
      return '<button class="chip" data-workflow="' + w.id + '" aria-pressed="' + ((p.workflow || "guided") === w.id) + '">' + esc(w.name) + "</button>";
    }).join("") + '</div><p class="hint">Sets how many scenes and lines the script steps write.</p></div>' +
    '<div><span class="lab">What we send the AI</span><div class="chips">' + ["spine", "structure", "script", "scene", "trailer", "voice", "music", "design"].map(function (j) {
      return '<button class="chip" data-job="' + j + '" aria-pressed="' + (job === j) + '">' + j + "</button>";
    }).join("") + "</div></div>" +
    '<div class="routing">' + Object.keys(payload.routing).filter(function (k) { return payload.routing[k]; }).map(function (k) { return "<span>" + k + " → " + esc(payload.routing[k]) + "</span>"; }).join("") + "</div>" +
    '<pre class="code">' + esc(JSON.stringify(payload, null, 2)) + "</pre>" +
    '<div class="copro__row"><button class="btn btn--sm" data-act="copy-payload">Copy</button><span class="hint">Readiness ' + readiness(p) + "%</span></div>" +
    '<div><span class="lab">Project files</span><pre class="code tree">' + tree + "</pre></div></section>";
}

// ============================================================
// Sheets
// A sheet is one task. It has a title, a body that can be
// redrawn while work is happening, and a footer of actions.
// ============================================================
function openSheet(spec) {
  S.sheet = spec; S.menu = null; drawMenu();
  paintSheet(true);
}
function closeSheet() { S.sheet = null; $("#layer").innerHTML = ""; }
function paintSheet(first) {
  var sp = S.sheet; if (!sp) return;
  var layer = $("#layer");
  // keep whatever is being typed
  var vals = {};
  $$("#layer [id]").forEach(function (el) { if ("value" in el && el.type !== "file") vals[el.id] = el.value; });
  var openD = {}; $$("#layer details[id]").forEach(function (d) { openD[d.id] = d.open; });
  var scroll = $(".sheet__body") ? $(".sheet__body").scrollTop : 0;
  var d = sp.draw();
  layer.innerHTML = '<div class="scrim" data-act="scrim"><div class="sheet' + (sp.wide ? " sheet--wide" : "") + '" role="dialog" aria-modal="true" aria-labelledby="shTitle"><div class="sheet__grip"></div>' +
    '<div class="sheet__head"><h2 id="shTitle">' + (sp.kicker ? '<span class="sheet__kicker">' + esc(sp.kicker) + "</span>" : "") + esc(sp.title) + "</h2>" +
    '<button class="iconbtn" data-act="close" aria-label="Close">' + ICON.close + "</button></div>" +
    '<div class="sheet__body">' + d.body + "</div>" + (d.foot ? '<div class="sheet__foot">' + d.foot + "</div>" : "") + "</div></div>";
  if (!first) {
    Object.keys(vals).forEach(function (id) { var el = document.getElementById(id); if (el && "value" in el && !el.hasAttribute("data-fresh")) el.value = vals[id]; });
    Object.keys(openD).forEach(function (id) { var el = document.getElementById(id); if (el) el.open = openD[id]; });
    if ($(".sheet__body")) $(".sheet__body").scrollTop = scroll;
  } else {
    var f = $("#layer textarea, #layer input[type=text]");
    if (f && matchMedia("(min-width: 720px)").matches) f.focus();
  }
  if (sp.after) sp.after();
}
function val(id) { var el = document.getElementById(id); return el ? el.value : ""; }
function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }
function chips(name, list, on, multi) {
  return '<div class="chips" role="group">' + list.map(function (x) {
    var v = Array.isArray(x) ? x[0] : x, label = Array.isArray(x) ? x[1] : x;
    var pressed = multi ? (on || []).indexOf(v) !== -1 : on === v;
    return '<button type="button" class="chip" data-chip="' + name + '" data-v="' + esc(v) + '" data-multi="' + (multi ? 1 : 0) + '" aria-pressed="' + pressed + '">' + esc(label) + "</button>";
  }).join("") + "</div>";
}
function versionsHTML(p, key) {
  var list = versionsOf(p, key);
  if (!list.length) return "";
  return '<details class="more" id="vers-' + esc(key.replace(/[^a-z0-9]/gi, "")) + '"><summary>Earlier versions (' + list.length + ')</summary><div class="versions">' + list.map(function (x, i) {
    return '<button type="button" data-restore="' + i + '"><small>' + ago(x.at) + "</small><span>" + esc(x.v) + "</span></button>";
  }).join("") + "</div></details>";
}
function studioLink(job) { return '<button type="button" class="btn btn--sm btn--quiet studiolink" data-payload="' + job + '">What we send</button>'; }

// ---------- one piece of text ----------
// Used for the title, the pitch line, the three parts, the eight lines,
// and episodes. Help and "Try another" come from the same bridge calls
// the old builder used.
function sheetText(o) {
  var p = P();
  var st = { help: null, helpBusy: false, rollBusy: false };
  openSheet({
    title: o.title, kicker: o.kicker,
    draw: function () {
      var body = (o.lead ? '<p class="hint" style="margin:0">' + esc(o.lead) + "</p>" : "") +
        '<div class="field"><label class="sr" for="txt">' + esc(o.title) + "</label>" +
        (o.single ? '<input type="text" id="txt" value="' + esc(o.get()) + '">' : '<textarea id="txt" rows="' + (o.rows || 5) + '">' + esc(o.get()) + "</textarea>") + "</div>";
      if (o.help || o.reroll) {
        body += '<div class="copro__row">' +
          (o.reroll ? '<button type="button" class="btn btn--sm" data-act="t-roll"' + (st.rollBusy ? " disabled" : "") + ">" + (st.rollBusy ? '<span class="spin"></span> Writing' : "Try another") + "</button>" : "") +
          (o.help ? '<button type="button" class="btn btn--sm" data-act="t-help"' + (st.helpBusy ? " disabled" : "") + ">" + (st.helpBusy ? '<span class="spin"></span> Thinking' : "Give me ideas") + "</button>" : "") +
          (o.extra ? o.extra() : "") + "</div>";
      }
      if (st.help) {
        body += '<div class="copro__help">' + (st.help.nudge ? '<p class="hint" style="margin:0">' + esc(st.help.nudge) + "</p>" : "") + st.help.examples.map(function (x, i) {
          return '<button type="button" class="idea" data-pick="' + i + '"><b>' + esc(x.label) + "</b><span>" + esc(x.text) + "</span></button>";
        }).join("") + (st.help.tip ? '<p class="hint">' + esc(st.help.tip) + "</p>" : "") + "</div>";
      }
      body += versionsHTML(p, o.key);
      return { body: body, foot: studioLink(o.job || "script") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="t-save">Save</button>' };
    },
    on: async function (act, el) {
      if (act === "t-save") {
        var v = val("txt").trim(), old = o.get();
        if (v !== old) { keep(p, o.key, old); o.set(v); if (/^(spine|short|act|logline)/.test(o.key)) bump(p, "story"); save(); }
        closeSheet(); redraw();
        if (v !== old) toast(o.saved || "Saved.", function () { o.set(old); save(); redraw(); });
        if (v !== old && o.after) o.after();
      }
      if (act === "t-help") {
        st.helpBusy = true; paintSheet();
        try { st.help = await askForHelp(compilePayload(p, "spine", {}), Object.assign({ current: val("txt") }, o.help)); }
        finally { st.helpBusy = false; paintSheet(); }
      }
      if (act === "t-roll") {
        st.rollBusy = true; paintSheet();
        var t;
        try { t = await o.reroll(val("txt")); } finally { st.rollBusy = false; paintSheet(); }
        keep(p, o.key, val("txt"));
        paintSheet(); setVal("txt", t);
      }
      if (el && el.dataset.pick != null) setVal("txt", st.help.examples[+el.dataset.pick].text);
      if (el && el.dataset.restore != null) setVal("txt", versionsOf(p, o.key)[+el.dataset.restore].v);
      if (o.on) o.on(act, el);
    }
  });
}

function editKey(key) {
  var p = P();
  if (key === "title") return sheetText({ title: "Show title", key: "title", single: true, get: function () { return p.title; }, set: function (v) { var o = p.title; p.title = v || "Untitled show"; renameEverywhere(p, o, p.title); },
    reroll: async function () { var r = await riffStory(compilePayload(p, "script", {}), p.story.logline, p.format.type); return r.title; } });
  if (key === "logline") return sheetText({ title: "The pitch", lead: "One sentence: who it’s about, and what goes wrong. This line goes out with everything we make.", key: "logline", rows: 3,
    get: function () { return p.story.logline; }, set: function (v) { p.story.logline = v; } });
  var parts = key.split(":");
  if (parts[0] === "spine") {
    var st = SPINE_STEPS.find(function (x) { return x.key === parts[1]; });
    return sheetText({ title: st.label, kicker: "Line by line", lead: st.hint, key: key, rows: 3, job: "spine",
      get: function () { return p.story.spine[st.key] || ""; },
      set: function (v) { p.story.spine[st.key] = v; recompose(p); },
      saved: isLive(p) ? "Saved." : "Saved. The three parts were rewritten to match.",
      after: function () { syncActs(p); },
      help: { kind: "spine", key: st.key },
      reroll: async function (seed) { var r = await riffPart(compilePayload(p, "script", {}), "spine", st.key, seed, p.story.riffWorld); return r.text; } });
  }
  if (parts[0] === "short") {
    var k = parts[1], lab = { hook: "The hook", story: "The story", twist: "The twist" }[k];
    var hint = SHORT_STEPS.find(function (x) { return x.key === k; }).hint;
    return sheetText({ title: lab, lead: hint, key: key, rows: 4,
      get: function () { return (p.story.short || {})[k] || ""; },
      set: function (v) { p.story.short = p.story.short || {}; p.story.short[k] = v; recompose(p); },
      after: function () { syncActs(p); },
      help: { kind: "short", key: k },
      reroll: async function (seed) { var r = await riffPart(compilePayload(p, "script", {}), "short", k, seed, p.story.riffWorld); return r.text; } });
  }
  if (parts[0] === "act") {
    var n = +parts[1];
    var rec = p.story.acts[arcKey(p, n)] || {};
    return sheetText({ title: ["Beginning", "Middle", "End"][n - 1], kicker: "The story", key: key, rows: 8, job: "structure",
      lead: "Write it however you like. Once you save, your words stay put even if you change the line-by-line below.",
      get: function () { return actText(p, n); },
      set: function (v) { p.story.acts[arcKey(p, n)] = { prose: v, manual: true }; recompose(p); },
      extra: function () { return rec.manual && p.story.riffWorld ? '<button type="button" class="btn btn--sm btn--quiet" data-act="t-unlock">Rebuild it from the eight lines</button>' : ""; },
      on: function (act) {
        if (act === "t-unlock") {
          keep(p, key, actText(p, n));
          p.story.acts[arcKey(p, n)].manual = false; recompose(p); save(); closeSheet(); redraw();
          toast("Rebuilt from the eight lines.");
        }
      } });
  }
}

// ---------- length / shape ----------
function sheetShape() {
  var p = P();
  var pick = { type: p.format.type || "film", episodes: p.format.episodes || 6, runtime: p.format.runtime || 0 };
  openSheet({
    title: "How long is it?",
    draw: function () {
      var f = formatById(pick.type);
      var rts = { short: [3, 5, 9, 15, 20], film: [75, 90, 100, 120], series: [12, 24, 30, 45, 60] }[pick.type];
      if (rts.indexOf(+pick.runtime) === -1) pick.runtime = f.defaultRuntime;
      return {
        body: '<div class="opts">' + FORMATS.map(function (x) {
          return '<button type="button" class="opt" data-fmt="' + x.id + '" aria-pressed="' + (pick.type === x.id) + '"><b>' + x.name + "</b><span>" + esc(x.note) + "</span></button>";
        }).join("") + "</div>" +
          '<div><span class="lab">' + (f.serial ? "Each episode runs" : "It runs") + "</span>" + chips("rt", rts.map(function (r) { return [String(r), r + " min"]; }), String(pick.runtime)) + "</div>" +
          (f.serial ? '<div><span class="lab">Episodes</span>' + chips("eps", [4, 6, 8, 10, 12].map(function (n) { return [String(n), String(n)]; }), String(pick.episodes)) + "</div>" : "") +
          (p.format.type && pick.type !== p.format.type ? '<p class="note">Changing from ' + esc(formatById(p.format.type).name.toLowerCase()) + " to " + esc(f.name.toLowerCase()) + " keeps your story, cast and look. The scene list may need making again.</p>" : ""),
        foot: '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="shape-save">Save</button>'
      };
    },
    on: function (act, el) {
      if (el && el.dataset.fmt) { pick.type = el.dataset.fmt; pick.runtime = formatById(pick.type).defaultRuntime; paintSheet(); }
      if (el && el.dataset.chip === "rt") { pick.runtime = +el.dataset.v; paintSheet(); }
      if (el && el.dataset.chip === "eps") { pick.episodes = +el.dataset.v; paintSheet(); }
      if (act === "shape-save") {
        p.format.type = pick.type; p.format.runtime = pick.runtime;
        if (formatById(pick.type).serial) { p.format.episodes = pick.episodes; p.format.serialized = true; }
        recompose(p); save(); closeSheet(); redraw(); toast("Length saved.");
      }
    }
  });
}

// ---------- a person ----------
var ROLES = [["Lead", "Lead"], ["Supporting", "Supporting"], ["Antagonist", "Antagonist"], ["Minor", "Small part"], ["Narrator", "Narrator"]];

function sheetPerson(id) {
  var p = P();
  var c = p.characters.find(function (x) { return x.id === id; });
  if (!c) return;
  var st = { confirmRemove: false, swapBusy: false };
  openSheet({
    title: c.name, kicker: "Cast",
    draw: function () {
      var working = S.busy["face:" + c.id];
      var va = p.voices.assignments[c.id] || {};
      var refs = refsFor(p, "character:" + c.id);
      return {
        body: '<div class="portrait"><div class="portrait__img"><img src="' + faceSrc(p, c) + '" alt="">' + (working ? '<div class="working"><span class="spin"></span></div>' : "") + "</div>" +
          '<div class="portrait__side"><button type="button" class="btn btn--go" data-act="p-face"' + (working ? " disabled" : "") + ">" + (working ? '<span class="spin"></span> Making a face' : c.face ? "Make a new face" : "Make their face") + "</button>" +
          ((c.looks || []).length > 1 ? '<span class="lab" style="margin:4px 0 0">Earlier faces</span><div class="looks">' + c.looks.map(function (lk, i) {
            return '<button type="button" data-look="' + i + '" aria-pressed="' + ((c.faceSeed || c.id) === lk.seed) + '" aria-label="Face ' + (i + 1) + '"><img src="' + (isStandIn(lk.url) ? art("face", lk.seed, palOf(p)) : esc(lk.url)) + '" alt=""></button>';
          }).join("") + "</div>" : "") +
          '<p class="hint">Faces are made in your show’s look' + (p.visual.style ? " (" + esc(p.visual.style.toLowerCase()) + ")" : "") + ". Add up to three reference photos to steer it.</p>" +
          '<label class="btn btn--sm" style="justify-self:start">Add a reference photo<input type="file" accept="image/*" id="pRef" hidden></label>' +
          (refs.length ? '<div class="looks">' + refs.map(function (r) { return '<button type="button" aria-label="' + esc(r.name) + '"><img src="' + esc(r.url) + '" alt=""></button>'; }).join("") + "</div>" : "") +
          "</div></div>" +
          '<div class="field"><label class="lab" for="pName">Name</label><input type="text" id="pName" value="' + esc(c.name) + '"></div>' +
          '<div><span class="lab">Part</span>' + chips("role", ROLES, c.role) + "</div>" +
          '<div class="field"><label class="lab" for="pLook">What they look like</label><textarea id="pLook" rows="3">' + esc(c.look || "") + "</textarea></div>" +
          '<div class="field"><label class="lab" for="pArc">What happens to them</label><textarea id="pArc" rows="2">' + esc(c.arc || "") + "</textarea></div>" +
          '<div class="field"><label class="lab" for="pQuote">Something they\u2019d say</label><input type="text" id="pQuote" value="' + esc(c.quote || "") + '" placeholder="Shown under their picture on your ShowPage"></div>' +
          '<div class="field"><label class="lab" for="pVoice">Voice</label><select id="pVoice"><option value="">No voice yet</option>' + VOICE_LIBRARY.map(function (v) {
            return '<option value="' + v.id + '"' + (va.voiceId === v.id ? " selected" : "") + ">" + esc(v.name + " — " + v.quality.toLowerCase()) + "</option>";
          }).join("") + "</select></div>" +
          '<details class="more"><summary>More</summary><div>' +
          '<button type="button" class="btn btn--sm" data-act="p-swap"' + (st.swapBusy ? " disabled" : "") + ">" + (st.swapBusy ? '<span class="spin"></span> Finding someone' : "Replace with someone new") + "</button>" +
          '<button type="button" class="btn btn--sm btn--quiet" data-act="p-remove" style="justify-self:start;color:var(--accent)">' + (st.confirmRemove ? "Tap again to remove " + esc(c.name.split(" ")[0]) : "Remove from the cast") + "</button>" +
          versionsHTML(p, "look:" + c.id) + "</div></details>",
        foot: studioLink("design") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="p-save">Save</button>'
      };
    },
    after: function () {
      var f = $("#pRef"); if (!f) return;
      f.onchange = async function () {
        var file = f.files[0]; if (!file) return;
        if (refsFor(p, "character:" + c.id).length >= 3) { toast("Three reference photos is the most a face can use."); return; }
        var url = URL.createObjectURL(file);
        var r = await uploadReference({ kind: "image", localUrl: url, name: file.name });
        p.references.push({ id: r.id, name: file.name, scope: "character:" + c.id, url: r.storedUrl, weight: "balanced", status: r.status });
        save(); paintSheet(); toast("Reference added. The next face will use it.");
      };
    },
    on: async function (act, el) {
      if (el && el.dataset.chip === "role") { c.role = el.dataset.v; paintSheet(); }
      if (el && el.dataset.look != null) { var lk = c.looks[+el.dataset.look]; c.avatar = lk.url; c.faceSeed = lk.seed; c.face = true; save(); redraw(); }
      if (act === "p-face") { await makeFace(c); }
      if (act === "p-swap") {
        st.swapBusy = true; paintSheet();
        var out;
        try { out = await riffPart(compilePayload(p, "design", { part: "character" }), "character", c.id, c.name, p.story.riffWorld); }
        finally { st.swapBusy = false; paintSheet(); }
        var at = p.characters.indexOf(c), old = c;
        var n = out.character; n.face = false; n.looks = [];
        p.characters.splice(at, 1, n); save(); closeSheet(); redraw();
        toast(old.name + " was replaced by " + n.name + ".", function () { p.characters.splice(p.characters.indexOf(n), 1, old); save(); redraw(); });
      }
      if (act === "p-remove") {
        if (!st.confirmRemove) { st.confirmRemove = true; paintSheet(); return; }
        var i = p.characters.indexOf(c); p.characters.splice(i, 1); save(); closeSheet(); redraw();
        toast(c.name + " was removed.", function () { p.characters.splice(i, 0, c); save(); redraw(); });
      }
      if (act === "p-save") {
        keep(p, "look:" + c.id, c.look);
        var oldName = c.name;
        c.name = val("pName").trim() || c.name; c.look = val("pLook").trim(); c.arc = val("pArc").trim(); c.quote = val("pQuote").trim();
        var moved = renameEverywhere(p, oldName, c.name);
        var v = val("pVoice");
        if (v) p.voices.assignments[c.id] = Object.assign({ accent: "Neutral American", pace: "Natural" }, p.voices.assignments[c.id] || {}, { voiceId: v });
        else delete p.voices.assignments[c.id];
        save(); closeSheet(); redraw(); toast(moved ? "Saved. " + c.name + " is now used everywhere in your show." : "Saved.");
      }
    }
  });
}

async function makeFace(c) {
  var p = P();
  await busy("face:" + c.id, async function () {
    var r = await generatePortrait(compilePayload(p, "design", { subject: "character", characterId: c.id, aspect: "3:4" }), "character", c);
    var seed = c.id + ":" + Date.now();
    c.looks = c.looks || [];
    c.looks.unshift({ id: uid("lk"), url: r.url, seed: seed, at: Date.now() });
    c.avatar = r.url; c.faceSeed = seed; c.face = true;
  });
}
async function makeAllFaces() {
  var p = P();
  var todo = p.characters.filter(function (c) { return !c.face; });
  if (!todo.length) todo = p.characters;
  await busy("step:faces", function () { return Promise.all(todo.map(function (c, i) { return new Promise(function (r) { setTimeout(r, i * 250); }).then(function () { return makeFace(c); }); })); });
  toast("Faces made. Tap anyone to try another.");
}

function sheetAddPerson() {
  var p = P();
  var st = { list: null, busy: false, mode: "suggest" };
  openSheet({
    title: "Add someone", kicker: "Cast",
    draw: function () {
      var body = '<div class="chips">' + [["suggest", "Suggest people"], ["own", "I’ll describe them"]].map(function (x) {
        return '<button type="button" class="chip" data-mode="' + x[0] + '" aria-pressed="' + (st.mode === x[0]) + '">' + x[1] + "</button>";
      }).join("") + "</div>";
      if (st.mode === "suggest") {
        if (!st.list) body += '<div class="empty"><b>Who’s missing?</b><span>I’ll read your story and suggest people it needs, with a reason for each.</span>' +
          '<button type="button" class="btn btn--sm" data-act="ap-suggest"' + (st.busy ? " disabled" : "") + ">" + (st.busy ? '<span class="spin"></span> Reading your story' : "Suggest people") + "</button></div>";
        else body += '<div class="opts">' + st.list.map(function (x, i) {
          return '<div class="opt"><b>' + esc(x.name) + " · " + esc(roleName(x.role)) + "</b><span>" + esc(x.look) + "</span><span><em>" + esc(x.why) + "</em></span>" +
            (x.added ? '<span class="pill ok" style="margin-top:6px">Added</span>' : '<button type="button" class="btn btn--sm" style="justify-self:start;margin-top:6px" data-add="' + i + '">Add to the cast</button>') + "</div>";
        }).join("") + "</div>";
      } else {
        body += '<div class="field"><label class="lab" for="npName">Name</label><input type="text" id="npName" placeholder="Their name"></div>' +
          '<div><span class="lab">Part</span>' + chips("nrole", ROLES, st.role || "Supporting") + "</div>" +
          '<div class="field"><label class="lab" for="npLook">What they look like</label><textarea id="npLook" rows="3" placeholder="Age, build, what they wear, one detail people remember"></textarea></div>';
      }
      return { body: body, foot: '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Done</button>' + (st.mode === "own" ? '<button class="btn btn--go" data-act="ap-add">Add to the cast</button>' : "") };
    },
    on: async function (act, el) {
      if (el && el.dataset.mode) { st.mode = el.dataset.mode; paintSheet(); }
      if (el && el.dataset.chip === "nrole") { st.role = el.dataset.v; paintSheet(); }
      if (act === "ap-suggest") { st.busy = true; paintSheet(); try { var r = await generateCharacters(compilePayload(p, "design", {}), 4); st.list = r.proposals; } finally { st.busy = false; paintSheet(); } }
      if (el && el.dataset.add != null) {
        var x = st.list[+el.dataset.add]; x.added = true;
        p.characters.push({ id: uid("c"), name: x.name, role: x.role, look: x.look, arc: x.arc, tags: [], avatar: x.avatar, face: false, looks: [] });
        save(); redraw();
      }
      if (act === "ap-add") {
        var name = val("npName").trim(); if (!name) { toast("Give them a name first."); return; }
        p.characters.push({ id: uid("c"), name: name, role: st.role || "Supporting", look: val("npLook").trim(), arc: "", tags: [], avatar: "", face: false, looks: [] });
        save(); closeSheet(); redraw(); toast(name + " joined the cast. Make their face when you’re ready.");
      }
    }
  });
}

// ---------- a place ----------
function sheetPlace(id) {
  var p = P();
  var w = p.worlds.find(function (x) { return x.id === id; });
  if (!w) return;
  var st = { confirmRemove: false };
  openSheet({
    title: w.name, kicker: "Places",
    draw: function () {
      var working = S.busy["plate:" + w.id];
      return {
        body: '<div class="portrait__img portrait__img--wide"><img src="' + placeSrc(p, w) + '" alt="">' + (working ? '<div class="working"><span class="spin"></span></div>' : "") + "</div>" +
          '<div class="copro__row"><button type="button" class="btn btn--go btn--sm" data-act="w-plate"' + (working ? " disabled" : "") + ">" + (working ? '<span class="spin"></span> Making a picture' : w.shot ? "Make a new picture" : "Make the picture") + "</button></div>" +
          ((w.plates || []).length > 1 ? '<div class="looks looks--wide">' + w.plates.map(function (pl, i) {
            return '<button type="button" data-plate="' + i + '" aria-pressed="' + ((w.plateSeed || w.id) === pl.seed) + '"><img src="' + (isStandIn(pl.url) ? art("place", pl.seed, palOf(p)) : esc(pl.url)) + '" alt=""></button>';
          }).join("") + "</div>" : "") +
          '<div class="field"><label class="lab" for="wName">Name</label><input type="text" id="wName" value="' + esc(w.name) + '"></div>' +
          '<div class="field"><label class="lab" for="wAtmo">What it feels like</label><textarea id="wAtmo" rows="3">' + esc(w.atmosphere || "") + "</textarea><p class=\"hint\">Light, sound, weather, what’s on the walls.</p></div>" +
          '<details class="more"><summary>More</summary><div><button type="button" class="btn btn--sm btn--quiet" data-act="w-remove" style="justify-self:start;color:var(--accent)">' + (st.confirmRemove ? "Tap again to remove it" : "Remove this place") + "</button></div></details>",
        foot: studioLink("design") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="w-save">Save</button>'
      };
    },
    on: async function (act, el) {
      if (act === "w-plate") await makePlate(w);
      if (el && el.dataset.plate != null) { var pl = w.plates[+el.dataset.plate]; w.thumbnail = pl.url; w.plateSeed = pl.seed; w.shot = true; save(); redraw(); }
      if (act === "w-remove") {
        if (!st.confirmRemove) { st.confirmRemove = true; paintSheet(); return; }
        var i = p.worlds.indexOf(w); p.worlds.splice(i, 1); save(); closeSheet(); redraw();
        toast(w.name + " was removed.", function () { p.worlds.splice(i, 0, w); save(); redraw(); });
      }
      if (act === "w-save") { var on = w.name; w.name = val("wName").trim() || w.name; w.atmosphere = val("wAtmo").trim(); var mv = renameEverywhere(p, on, w.name); save(); closeSheet(); redraw(); toast(mv ? "Saved. The new name is used everywhere." : "Saved."); }
    }
  });
}
async function makePlate(w) {
  var p = P();
  await busy("plate:" + w.id, async function () {
    var r = await generatePortrait(compilePayload(p, "design", { subject: "location", worldId: w.id, aspect: "16:9" }), "world", w);
    var seed = w.id + ":" + Date.now();
    w.plates = w.plates || [];
    w.plates.unshift({ id: uid("pl"), url: r.url, seed: seed, at: Date.now() });
    w.thumbnail = r.url; w.plateSeed = seed; w.shot = true;
  });
}
async function makeAllPlaces() {
  var p = P();
  var todo = p.worlds.filter(function (w) { return !w.shot; });
  if (!todo.length) todo = p.worlds;
  await busy("step:places", function () { return Promise.all(todo.map(function (w, i) { return new Promise(function (r) { setTimeout(r, i * 250); }).then(function () { return makePlate(w); }); })); });
  toast("Places made. Tap one to try another.");
}
function sheetAddPlace() {
  var p = P();
  var st = { list: null, busy: false };
  openSheet({
    title: "Add a place", kicker: "Places",
    draw: function () {
      var body = '<div class="field"><label class="lab" for="npw">Name it yourself</label><input type="text" id="npw" placeholder="The back office"></div>' +
        '<div class="field"><label class="lab" for="npwa">What it feels like</label><textarea id="npwa" rows="2"></textarea></div>' +
        '<div class="copro__row"><button type="button" class="btn btn--go btn--sm" data-act="aw-add">Add this place</button></div>' +
        '<details class="more" open id="awMore"><summary>Or let me suggest some</summary><div>' +
        (!st.list ? '<button type="button" class="btn btn--sm" style="justify-self:start" data-act="aw-suggest"' + (st.busy ? " disabled" : "") + ">" + (st.busy ? '<span class="spin"></span> Reading your story' : "Suggest places") + "</button>" :
          '<div class="opts">' + st.list.map(function (x, i) {
            return '<div class="opt"><b>' + esc(x.name) + "</b><span>" + esc(x.atmosphere) + "</span><span><em>" + esc(x.why) + "</em></span>" +
              (x.added ? '<span class="pill ok" style="margin-top:6px">Added</span>' : '<button type="button" class="btn btn--sm" style="justify-self:start;margin-top:6px" data-addw="' + i + '">Add it</button>') + "</div>";
          }).join("") + "</div>") + "</div></details>";
      return { body: body, foot: '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Done</button>' };
    },
    on: async function (act, el) {
      if (act === "aw-suggest") { st.busy = true; paintSheet(); try { var r = await generateLocations(compilePayload(p, "design", {}), 4); st.list = r.proposals; } finally { st.busy = false; paintSheet(); } }
      if (el && el.dataset.addw != null) { var x = st.list[+el.dataset.addw]; x.added = true; p.worlds.push({ id: uid("w"), name: x.name, atmosphere: x.atmosphere, thumbnail: "", shot: false, plates: [] }); save(); redraw(); }
      if (act === "aw-add") {
        var n = val("npw").trim(); if (!n) { toast("Give the place a name first."); return; }
        p.worlds.push({ id: uid("w"), name: n, atmosphere: val("npwa").trim(), thumbnail: "", shot: false, plates: [] });
        save(); closeSheet(); redraw(); toast(n + " added.");
      }
    }
  });
}

// ---------- look ----------
function sheetLook() {
  var p = P();
  var v = p.visual;
  var pick = { style: v.style, palette: v.palette, camera: v.camera.slice() };
  openSheet({
    title: "The look", wide: true,
    draw: function () {
      var refs = refsFor(p, "visual");
      return {
        body: '<div><span class="lab">Style</span>' + chips("style", VISUAL_STYLES, pick.style) + "</div>" +
          '<div><span class="lab">Colour</span><div class="optgrid">' + PALETTES.map(function (pl) {
            return '<button type="button" class="opt" data-pal="' + pl.id + '" aria-pressed="' + (pick.palette === pl.id) + '"><b>' + esc(pl.name) + '</b><div class="sw">' + pl.swatches.map(function (s) { return '<i style="background:' + s + '"></i>'; }).join("") + "</div></button>";
          }).join("") + "</div></div>" +
          '<details class="more" id="lookMore"><summary>Style references</summary><div>' +
          '<div><span class="lab">Style references</span><p class="hint" style="margin:0 0 8px">Stills, posters or frames from anything that has the feel you want.</p>' +
          '<label class="btn btn--sm">Add a reference<input type="file" accept="image/*" id="lRef" hidden></label>' +
          (refs.length ? '<div class="looks looks--wide" style="margin-top:8px">' + refs.map(function (r) { return '<button type="button"><img src="' + esc(r.url) + '" alt=""></button>'; }).join("") + "</div>" : "") + "</div></div></details>" +
          (p.characters.some(function (c) { return c.face; }) && (pick.style !== v.style || pick.palette !== v.palette) ? '<p class="note">New faces, places and scenes will use this look. The ones you already have stay as they are until you remake them.</p>' : ""),
        foot: studioLink("design") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="l-save"' + (pick.style && pick.palette ? "" : " disabled") + ">Use this look</button>"
      };
    },
    after: function () {
      var f = $("#lRef"); if (!f) return;
      f.onchange = async function () {
        var file = f.files[0]; if (!file) return;
        var url = URL.createObjectURL(file);
        var r = await uploadReference({ kind: "image", localUrl: url, name: file.name });
        p.references.push({ id: r.id, name: file.name, scope: "visual", url: r.storedUrl, weight: "balanced", status: r.status });
        save(); paintSheet();
      };
    },
    on: function (act, el) {
      if (el && el.dataset.chip === "style") { pick.style = el.dataset.v; paintSheet(); }
      if (el && el.dataset.chip === "cam") { var i = pick.camera.indexOf(el.dataset.v); if (i === -1) pick.camera.push(el.dataset.v); else pick.camera.splice(i, 1); paintSheet(); }
      if (el && el.dataset.pal) { pick.palette = el.dataset.pal; paintSheet(); }
      if (act === "l-save") {
        var old = { style: v.style, palette: v.palette, camera: v.camera.slice() };
        v.style = pick.style; v.palette = pick.palette; v.camera = pick.camera;
        save(); closeSheet(); redraw();
        toast("Look saved.", function () { v.style = old.style; v.palette = old.palette; v.camera = old.camera; save(); redraw(); });
      }
    }
  });
}

// ---------- music ----------
function sheetMusic(autoSuggest) {
  var p = P();
  var m = p.music;
  var st = { options: null, busy: false };
  var pick = { genres: m.genres.slice(), moods: m.moods.slice(), instruments: m.instruments.slice(), tempo: m.tempo || 90 };
  async function suggest() { st.busy = true; paintSheet(); try { var r = await generateMusicOptions(compilePayload(p, "music", {})); st.options = r.options; } finally { st.busy = false; paintSheet(); } }
  openSheet({
    title: "The music", wide: true,
    draw: function () {
      var body = "";
      if (!st.options) body += '<div class="empty"><b>Three directions</b><span>I’ll suggest three complete directions for the score, each with a reason.</span><button type="button" class="btn btn--sm" data-act="m-suggest"' + (st.busy ? " disabled" : "") + ">" + (st.busy ? '<span class="spin"></span> Listening to your story' : "Suggest three") + "</button></div>";
      else body += '<div class="opts">' + st.options.map(function (o) {
        var on = pick.genres.join() === o.genres.join() && pick.moods.join() === o.moods.join();
        return '<button type="button" class="opt" data-mopt="' + o.id + '" aria-pressed="' + on + '"><b>' + esc(o.name) + "</b><span>" + esc(o.genres.join(", ") + " · " + o.moods.join(", ") + " · " + o.tempo + " bpm · " + o.instruments.join(", ")) + "</span><span><em>" + esc(o.why) + "</em></span></button>";
      }).join("") + "</div>";
      body += '<details class="more" id="musMore"><summary>Fine-tune it yourself</summary><div>' +
        '<div><span class="lab">Kind of music</span>' + chips("mg", MUSIC_GENRES, pick.genres, true) + "</div>" +
        '<div><span class="lab">Mood</span>' + chips("mm", MUSIC_MOODS, pick.moods, true) + "</div>" +
        '<div><span class="lab">Instruments</span>' + chips("mi", INSTRUMENTS, pick.instruments, true) + "</div>" +
        '<div class="field"><label class="lab" for="mTempo">Speed: <span id="mTempoV">' + pick.tempo + '</span> beats a minute</label><input type="range" id="mTempo" min="50" max="160" value="' + pick.tempo + '" style="width:100%;accent-color:var(--accent)"></div>' +
        '<div><span class="lab">A track that has the sound you want</span><label class="btn btn--sm">Add a reference track<input type="file" accept="audio/*" id="mRef" hidden></label>' +
        refsFor(p, "music").map(function (r) { return '<p class="hint">' + esc(r.name) + "</p>"; }).join("") + "</div></div></details>";
      return { body: body, foot: studioLink("music") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="m-save"' + (pick.genres.length && pick.moods.length ? "" : " disabled") + ">Use this music</button>" };
    },
    after: function () {
      var t = $("#mTempo"); if (t) t.oninput = function () { pick.tempo = +t.value; $("#mTempoV").textContent = t.value; };
      var f = $("#mRef"); if (f) f.onchange = async function () {
        var file = f.files[0]; if (!file) return;
        var r = await uploadReference({ kind: "audio", localUrl: URL.createObjectURL(file), name: file.name });
        p.references.push({ id: r.id, name: file.name, scope: "music", url: r.storedUrl, status: r.status }); save(); paintSheet();
      };
    },
    on: function (act, el) {
      if (act === "m-suggest") suggest();
      if (el && el.dataset.mopt) { var o = st.options.find(function (x) { return x.id === el.dataset.mopt; }); pick = { genres: o.genres.slice(), moods: o.moods.slice(), instruments: o.instruments.slice(), tempo: o.tempo }; paintSheet(); }
      if (el && el.dataset.chip && ["mg", "mm", "mi"].indexOf(el.dataset.chip) !== -1) {
        var arr = pick[{ mg: "genres", mm: "moods", mi: "instruments" }[el.dataset.chip]];
        var i = arr.indexOf(el.dataset.v); if (i === -1) arr.push(el.dataset.v); else arr.splice(i, 1); paintSheet();
      }
      if (act === "m-save") {
        var old = JSON.parse(JSON.stringify(m));
        m.genres = pick.genres; m.moods = pick.moods; m.instruments = pick.instruments; m.tempo = pick.tempo;
        save(); closeSheet(); redraw();
        toast("Music saved.", function () { Object.assign(m, old); save(); redraw(); });
      }
    }
  });
  if (autoSuggest) suggest();
}

// ---------- voices ----------
async function castVoices() {
  var p = P();
  await busy("step:voices", async function () {
    var r = await generateVoiceCasting(compilePayload(p, "voice", {}));
    r.casting.forEach(function (x) { if (!p.voices.assignments[x.characterId]) p.voices.assignments[x.characterId] = { voiceId: x.voiceId, accent: x.accent, pace: x.pace, why: x.why }; });
    if (!p.voices.narrator) p.voices.narrator = r.narrator;
  });
  sheetVoices();
}
function sheetVoices() {
  var p = P();
  openSheet({
    title: "Voices", kicker: "Sound",
    draw: function () {
      var busyAll = S.busy["step:voices"];
      var body = '<div class="copro__row"><button type="button" class="btn btn--sm" data-act="v-auto"' + (busyAll ? " disabled" : "") + ">" + (busyAll ? '<span class="spin"></span> Casting' : "Cast everyone for me") + "</button></div>";
      body += p.characters.map(function (c) {
        var a = p.voices.assignments[c.id] || {};
        return '<div class="portrait" style="grid-template-columns:64px 1fr;gap:12px"><div class="portrait__img"><img src="' + faceSrc(p, c) + '" alt=""></div><div class="portrait__side">' +
          "<b>" + esc(c.name) + '</b><select data-voice="' + esc(c.id) + '" id="v_' + esc(c.id) + '" aria-label="Voice for ' + esc(c.name) + '"><option value="">No voice yet</option>' + VOICE_LIBRARY.map(function (v) {
            return '<option value="' + v.id + '"' + (a.voiceId === v.id ? " selected" : "") + ">" + esc(v.name + " — " + v.quality.toLowerCase()) + "</option>";
          }).join("") + "</select>" +
          '<div class="copro__row"><select data-accent="' + esc(c.id) + '" id="a_' + esc(c.id) + '" aria-label="Accent" style="flex:1;min-width:150px">' + ACCENTS.map(function (x) { return "<option" + (a.accent === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select>" +
          '<button type="button" class="btn btn--sm" data-hear="' + esc(c.id) + '">Hear it</button></div>' +
          (a.why ? '<p class="hint" style="margin:0">' + esc(a.why) + "</p>" : "") + "</div></div>";
      }).join("");
      var n = p.voices.narrator;
      body += '<div class="field"><label class="lab" for="vNarr">Narrator</label><select id="vNarr"><option value="">No narrator</option>' + VOICE_LIBRARY.map(function (v) {
        return '<option value="' + v.id + '"' + (n && n.voiceId === v.id ? " selected" : "") + ">" + esc(v.name + " — " + v.quality.toLowerCase()) + "</option>";
      }).join("") + "</select></div>";
      return { body: body, foot: studioLink("voice") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="v-save">Save voices</button>' };
    },
    on: async function (act, el) {
      if (act === "v-auto") {
        await busy("step:voices", async function () {
          var r = await generateVoiceCasting(compilePayload(p, "voice", {}));
          r.casting.forEach(function (x) { p.voices.assignments[x.characterId] = { voiceId: x.voiceId, accent: x.accent, pace: x.pace, why: x.why }; });
          p.voices.narrator = p.voices.narrator || r.narrator;
        });
        paintSheet();
        p.characters.forEach(function (c) { var a = p.voices.assignments[c.id]; if (a) { setVal("v_" + c.id, a.voiceId); setVal("a_" + c.id, a.accent); } });
      }
      if (el && el.dataset.hear) {
        var vid = val("v_" + el.dataset.hear);
        if (!vid) { toast("Pick a voice first."); return; }
        el.disabled = true;
        try {
          var pv = await previewVoice(vid, "");
          if (pv && pv.audioUrl) { if (!audioEl) audioEl = new Audio(); audioEl.src = pv.audioUrl; audioEl.play().catch(function () {}); }
          else toast("Voice previews play here once the voice service is connected.");
        } finally { el.disabled = false; }
      }
      if (act === "v-save") {
        p.characters.forEach(function (c) {
          var vid = val("v_" + c.id);
          if (!vid) { delete p.voices.assignments[c.id]; return; }
          p.voices.assignments[c.id] = Object.assign({ pace: "Natural" }, p.voices.assignments[c.id] || {}, { voiceId: vid, accent: val("a_" + c.id) });
        });
        var nv = val("vNarr");
        p.voices.narrator = nv ? Object.assign({ accent: "Neutral American", pace: "Slow" }, p.voices.narrator || {}, { voiceId: nv }) : null;
        save(); closeSheet(); redraw(); toast("Voices saved.");
      }
    }
  });
}

// ---------- episodes ----------
function storeSeason(p, r) {
  (p.episodes || []).forEach(function (e) { [1, 2, 3].forEach(function (n) { delete p.story.acts[actKey(e.number, n)]; }); });
  p.episodes = r.episodes.map(function (e) {
    [1, 2, 3].forEach(function (n) { setEpAct(p, e.number, n, (e.acts || {})[n] || (e.acts || {})[String(n)] || "", false); });
    return { number: e.number, title: e.title, premise: e.premise, carriesOver: e.carriesOver };
  });
  stamp(p, "episodes"); recompose(p);
}
async function planEps() {
  var p = P();
  await busy("eps", async function () {
    storeSeason(p, await planEpisodes(compilePayload(p, "structure", { episodes: p.format.episodes }), p.format.episodes || 6, p.format.serialized !== false));
  });
  toast("Season planned. Tap an episode to change it.");
}
function sheetEpisode(n) {
  var p = P();
  var e = p.episodes.find(function (x) { return x.number === n; });
  openSheet({
    title: "Episode " + n, kicker: "The season",
    draw: function () {
      return {
        body: '<div class="field"><label class="lab" for="eT">Title</label><input type="text" id="eT" value="' + esc(e.title) + '"></div>' +
          '<div class="field"><label class="lab" for="eP">In one sentence</label><textarea id="eP" rows="2">' + esc(e.premise) + "</textarea></div>" +
          [1, 2, 3].map(function (k) {
            return '<div class="field"><label class="lab" for="eA' + k + '">' + ["Beginning", "Middle", "End"][k - 1] + '</label><textarea id="eA' + k + '" rows="4">' + esc(epAct(p, n, k)) + "</textarea></div>";
          }).join("") +
          (e.carriesOver != null ? '<div class="field"><label class="lab" for="eC">What it hands to the next episode</label><textarea id="eC" rows="2">' + esc(e.carriesOver || "") + "</textarea></div>" : "") +
          versionsHTML(p, "ep:" + n),
        foot: '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="e-save">Save</button>'
      };
    },
    on: function (act, el) {
      if (el && el.dataset.restore != null) setVal("eP", versionsOf(p, "ep:" + n)[+el.dataset.restore].v);
      if (act === "e-save") {
        keep(p, "ep:" + n, e.premise);
        e.title = val("eT").trim() || e.title; e.premise = val("eP").trim();
        [1, 2, 3].forEach(function (k) { var v = val("eA" + k).trim(); if (v !== epAct(p, n, k)) { keep(p, "ep:" + n + ":act" + k, epAct(p, n, k)); setEpAct(p, n, k, v, true); } });
        recompose(p);
        if (e.carriesOver != null) e.carriesOver = val("eC").trim();
        save(); closeSheet(); redraw(); toast("Saved.");
      }
    }
  });
}

// ---------- scenes ----------
async function breakScenes(quiet, epNum) {
  var p = P();
  var ep = isSerial(p) ? (epNum || S.ep || 1) : null;
  var made;
  await busy("break", async function () {
    var r = await generateSceneList(compilePayload(p, "script", { depth: p.workflow || "guided", episode: ep }));
    var list = r.scenes;
    if (ep && LIVE.mode === "sample") list = list.slice(0, 6);
    var now = Date.now();
    made = list.map(function (x, i) {
      return { id: "s" + (now + i), order: i + 1, ep: ep || 1, act: x.act, beatRole: x.beatRole, heading: x.heading, prompt: x.summary, world: x.world, characters: x.characters,
        shot: i === 0 ? "Wide establishing" : SHOTS[(i % 4) + 1][0], state: "Unchanged", line: x.line || "", status: "draft", forkOf: null, videoUrl: null, still: "s" + (now + i) };
    });
    // a series keeps every other episode's scenes; a film or short replaces its list
    var others = ep ? p.scenes.filter(function (x) { return (x.ep || 1) !== ep; }) : [];
    p.scenes = others.concat(made).sort(function (a, b) { return (a.ep || 1) - (b.ep || 1); });
    p.script.sceneList = p.scenes.map(function (x) { return { id: x.id, act: x.act, beatRole: x.beatRole, heading: x.heading, summary: x.prompt, world: x.world, characters: x.characters, episode: x.ep }; });
  });
  stamp(p, ep ? "scenes:" + ep : "scenes"); if (ep) stamp(p, "scenes"); save();
  if (!quiet) toast(plural(made.length, "scene") + (ep ? " for episode " + ep : "") + " ready. Tap one to change it, or make them all.");
}
async function makeScene(s) {
  var p = P();
  await busy("scene:" + s.id, async function () {
    s.status = "rendering";
    var r = await updateSceneNode(compilePayload(p, "scene", { sceneId: s.id, patch: { prompt: s.prompt, world: s.world, characters: s.characters, shot: s.shot, move: s.move || "", line: s.line } }));
    s.status = r.status; s.videoUrl = r.videoUrl; s.still = s.id + ":" + Date.now();
  });
}
async function makeAllScenes() {
  var p = P();
  var todo = epScenes(p).filter(function (s) { return s.status !== "rendered"; });
  if (!todo.length) return;
  await busy("all", function () { return Promise.all(todo.map(function (s, i) { return new Promise(function (r) { setTimeout(r, i * 400); }).then(function () { return makeScene(s); }); })); });
  toast("All scenes made.");
}
async function addScene() {
  var p = P();
  var last = p.scenes[p.scenes.length - 1];
  var s = await createNextScene(last);
  s.act = last ? last.act : 1; s.still = s.id; s.heading = ""; s.ep = isSerial(p) ? (S.ep || 1) : 1;
  p.scenes.push(s); save(); redraw(); sheetScene(s.id);
}

function sheetScene(id) {
  var p = P();
  var s = p.scenes.find(function (x) { return x.id === id; });
  if (!s) return;
  var idx = p.scenes.indexOf(s);
  var pick = { world: s.world, characters: (s.characters || []).slice(), shot: s.shot || "Medium", move: s.move || "" };
  var st = { pageBusy: false, confirmRemove: false };
  openSheet({
    title: "Scene " + (idx + 1), kicker: s.heading || "Scenes", wide: true,
    after: function () {
      var f = $("#scOwn"); if (!f) return;
      f.onchange = async function () {
        var file = f.files[0]; if (!file) return;
        var dur = await mediaDuration(file);
        var up = MEDIA.server ? await uploadTrack(file) : { url: URL.createObjectURL(file) };
        var url = up.url; if (!dur && up.duration) dur = up.duration;
        s.videoUrl = url; s.status = "rendered"; s.own = true; s.duration = dur || 5; s.still = s.id + ":own"; s.poster = up.poster || (await videoPoster(file));
        save(); paintSheet(); redraw(); toast("Scene " + (idx + 1) + " now uses your clip.");
      };
    },
    draw: function () {
      var working = S.busy["scene:" + s.id];
      var speaker = p.characters.find(function (c) { return c.id === pick.characters[0]; });
      var va = speaker && p.voices.assignments[speaker.id];
      var voice = va && voiceById(va.voiceId);
      var frame = '<div class="frame">' + (s.status === "rendered" && s.videoUrl && !isStandIn(s.videoUrl) ? '<video src="' + esc(s.videoUrl) + '" controls playsinline></video>' : '<img src="' + sceneSrc(p, s) + '" alt="">') +
        (working ? '<div class="working"><span class="spin"></span>Making this scene</div>' : s.status !== "rendered" ? '<div class="working" style="background:rgba(0,0,0,.35)">Not made yet</div>' : "") + "</div>";
      return {
        body: frame +
          '<div class="field"><label class="lab" for="scP">What happens</label><textarea id="scP" rows="3">' + esc(s.prompt || "") + "</textarea></div>" +
          '<div><span class="lab">Where</span>' + (p.worlds.length ? chips("sw", p.worlds.map(function (w) { return [w.id, w.name]; }), pick.world) : '<p class="hint">Add a place first.</p>') + "</div>" +
          '<div><span class="lab">Who’s in it</span>' + (p.characters.length ? chips("sc", p.characters.map(function (c) { return [c.id, c.name]; }), pick.characters, true) : '<p class="hint">Add someone to the cast first.</p>') + "</div>" +
          '<div><span class="lab">How close</span>' + chips("ss", SHOTS, pick.shot) + "</div>" +
          '<div><span class="lab">How the camera moves</span>' + chips("sm", [["", "Let it decide"]].concat(CAMERA_LOOKS.map(function (x) { return [x, x]; })), pick.move) + "</div>" +
          '<div class="field"><label class="lab" for="scL">' + (speaker ? esc(speaker.name.split(" ")[0]) + " says" : "Spoken line") + '</label><input type="text" id="scL" value="' + esc(s.line || "") + '" placeholder="Leave empty for no dialogue">' +
          '<p class="hint">' + (speaker ? (voice ? "Spoken in " + esc(voice.name) + "’s voice." : esc(speaker.name.split(" ")[0]) + " doesn’t have a voice yet. Set one in Voices.") : "The first person you pick says the line.") + "</p></div>" +
          '<div class="copro__row"><label class="btn btn--sm">' + (s.own ? "Replace with another clip" : "Use my own clip instead") + '<input type="file" accept="video/*" id="scOwn" hidden></label>' +
          (s.own ? '<span class="hint" style="margin:0">This scene uses your clip.</span>' : '<span class="hint" style="margin:0">Footage you shot or made elsewhere.</span>') + "</div>" +
          '<details class="more" id="scMore"><summary>The page</summary><div>' +
          '<div class="copro__row"><button type="button" class="btn btn--sm" data-act="sc-page"' + (st.pageBusy ? " disabled" : "") + ">" + (st.pageBusy ? '<span class="spin"></span> Writing' : s.script ? "Write it again" : "Write this scene") + "</button></div>" +
          '<textarea id="scS" rows="10" style="font-family:var(--mono);font-size:14px" placeholder="No page yet. Write one, or type it here.">' + esc(s.script || "") + "</textarea>" +
          '<button type="button" class="btn btn--sm btn--quiet" data-act="sc-remove" style="justify-self:start;color:var(--accent)">' + (st.confirmRemove ? "Tap again to delete this scene" : "Delete this scene") + "</button></div></details>",
        foot: studioLink("scene") + '<span class="sp"></span><button class="btn" data-act="sc-save">Save</button><button class="btn btn--go" data-act="sc-make"' + (working ? " disabled" : "") + ">" + (s.status === "rendered" ? "Make it again" : "Make this scene") + "</button>"
      };
    },
    on: async function (act, el) {
      if (el && el.dataset.chip === "sw") { pick.world = el.dataset.v; paintSheet(); }
      if (el && el.dataset.chip === "ss") { pick.shot = el.dataset.v; paintSheet(); }
      if (el && el.dataset.chip === "sm") { pick.move = el.dataset.v; paintSheet(); }
      if (el && el.dataset.chip === "sc") { var i = pick.characters.indexOf(el.dataset.v); if (i === -1) pick.characters.push(el.dataset.v); else pick.characters.splice(i, 1); paintSheet(); }
      function commit() {
        keep(p, "scene:" + s.id, s.prompt);
        s.prompt = val("scP").trim(); s.line = val("scL").trim(); s.world = pick.world; s.characters = pick.characters; s.shot = pick.shot; s.move = pick.move;
        var sc = val("scS"); if (sc.trim()) s.script = sc;
        if (s.status === "rendered") s.status = "edited";
        save();
      }
      if (act === "sc-page") {
        commit(); st.pageBusy = true; paintSheet();
        var r;
        try { r = await generateSceneScript(compilePayload(p, "script", { sceneId: s.id }), s, idx); } finally { st.pageBusy = false; paintSheet(); }
        s.script = r.script; save(); paintSheet(); setVal("scS", r.script);
      }
      if (act === "sc-save") { commit(); closeSheet(); redraw(); toast("Scene saved."); }
      if (act === "sc-make") { commit(); paintSheet(); await makeScene(s); toast("Scene " + (idx + 1) + " made."); }
      if (act === "sc-remove") {
        if (!st.confirmRemove) { st.confirmRemove = true; paintSheet(); return; }
        p.scenes.splice(idx, 1); save(); closeSheet(); redraw();
        toast("Scene deleted.", function () { p.scenes.splice(idx, 0, s); save(); redraw(); });
      }
    }
  });
}

// ---------- trailer ----------
function sheetTrailer() {
  var p = P();
  var pick = { length: p.trailer.length || "60 sec", vibe: p.trailer.vibe || TRAILER_VIBES[0] };
  openSheet({
    title: "Cut a trailer",
    draw: function () {
      var made = p.scenes.filter(function (s) { return s.status === "rendered"; }).length;
      return {
        body: '<p class="hint" style="margin:0">Cut from your story, cast, look, voices and music. Nothing else to fill in.</p>' +
          '<div><span class="lab">Length</span>' + chips("tl", ["30 sec", "60 sec", "90 sec"], pick.length) + "</div>" +
          '<div><span class="lab">How it’s cut</span>' + chips("tv", TRAILER_VIBES, pick.vibe) + "</div>" +
          '<p class="note">Uses <b>' + plural(p.characters.length, "person", "people") + "</b>, <b>" + plural(p.worlds.length, "place") + "</b>" +
          (made ? ", <b>" + plural(made, "finished scene") + "</b>" : "") + (p.music.genres.length ? " and your <b>" + esc(p.music.genres[0].toLowerCase()) + "</b> score" : "") + ".</p>",
        foot: studioLink("trailer") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="tr-go">Cut the trailer</button>'
      };
    },
    on: async function (act, el) {
      if (el && el.dataset.chip === "tl") { pick.length = el.dataset.v; paintSheet(); }
      if (el && el.dataset.chip === "tv") { pick.vibe = el.dataset.v; paintSheet(); }
      if (act === "tr-go") {
        closeSheet();
        await busy("trailer", async function () {
          jump("trailer");
          var r = await generateTrailer(compilePayload(p, "trailer", { length: pick.length, vibe: pick.vibe }));
          p.trailer = { status: "ready", videoUrl: r.videoUrl, length: pick.length, vibe: pick.vibe };
        });
        jump("trailer"); toast("Trailer ready.");
      }
    }
  });
}

// ---------- pitch pack ----------
function sheetPitch() {
  var p = P();
  var serial = (formatById(p.format.type) || {}).serial;
  var docs = BIBLE_DOCS.filter(function (d) { return d.id !== "comps" && (d.id !== "episodes" || serial); });
  var pick = docs.map(function (d) { return d.id; }).filter(function (id) { return ["onepager", "bios", "deck"].indexOf(id) !== -1 || (p.bible.docs || {})[id]; });
  var st = { busy: false, reading: null };
  openSheet({
    title: "Pitch pack", wide: true,
    draw: function () {
      if (st.reading) {
        var d = docs.find(function (x) { return x.id === st.reading; });
        var text = st.reading === "deck" ? p.bible.deck.map(function (sl) { return sl.name.toUpperCase() + "\n" + sl.headline + "\n" + sl.body; }).join("\n\n") : p.bible.docs[st.reading].body;
        return { body: '<button type="button" class="link" data-act="pp-back">‹ All documents</button><h3 style="font:400 26px/1.1 var(--serif)">' + esc(d.name) + '</h3><div class="page">' + esc(text) + "</div>",
          foot: '<span class="sp"></span><button class="btn" data-act="pp-copy">Copy text</button><button class="btn btn--go" data-act="close">Done</button>' };
      }
      return {
        body: '<p class="hint" style="margin:0">Everything is written from your show as it stands. Make it again any time you change things.</p><div class="opts">' + docs.map(function (d) {
          var ready = d.id === "deck" ? (p.bible.deck || []).length : (p.bible.docs || {})[d.id];
          return '<div class="check"><input type="checkbox" id="pk_' + d.id + '" data-pk="' + d.id + '"' + (pick.indexOf(d.id) !== -1 ? " checked" : "") + '><label for="pk_' + d.id + '" style="flex:1"><b>' + esc(d.name) + "</b><small>" + esc(d.note) + "</small></label>" +
            (ready ? '<button type="button" class="btn btn--sm" data-read="' + d.id + '">Read</button>' : "") + "</div>";
        }).join("") + "</div>",
        foot: studioLink("design") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Close</button><button class="btn btn--go" data-act="pp-go"' + (st.busy ? " disabled" : "") + ">" + (st.busy ? '<span class="spin"></span> Writing' : "Make " + plural(pick.length, "document")) + "</button>"
      };
    },
    on: async function (act, el) {
      if (el && el.dataset.pk) { var i = pick.indexOf(el.dataset.pk); if (el.checked && i === -1) pick.push(el.dataset.pk); if (!el.checked && i !== -1) pick.splice(i, 1); paintSheet(); }
      if (el && el.dataset.read) { st.reading = el.dataset.read; paintSheet(); }
      if (act === "pp-back") { st.reading = null; paintSheet(); }
      if (act === "pp-copy") { copyText($(".page").textContent); }
      if (act === "pp-go" && pick.length) {
        st.busy = true; paintSheet();
        var payload = compilePayload(p, "design", { bible: pick });
        try {
          await Promise.all(pick.map(async function (id) {
            if (id === "deck") { var r = await generateDeck(payload); p.bible.deck = r.slides; }
            else { var d = await generateBibleDoc(payload, id); p.bible.docs[id] = d; }
          }));
        } finally { st.busy = false; stamp(p, "pitch"); save(); redraw(); paintSheet(); }
        toast("Pitch pack ready.");
      }
    }
  });
}

// ---------- posters and social ----------
function sheetPromo() {
  var p = P();
  var pick = p.promo && p.promo.length ? p.promo.map(function (x) { return x.formatId; }) : ["ig_story", "yt_thumb", "poster"];
  var st = { busy: false };
  openSheet({
    title: "Posters and social", wide: true,
    draw: function () {
      var made = (p.promo || []);
      return {
        body: '<p class="hint" style="margin:0">One campaign, sized for each place it will go.</p><div class="opts">' + PROMO_FORMATS.map(function (f) {
          return '<label class="check"><input type="checkbox" data-pf="' + f.id + '"' + (pick.indexOf(f.id) !== -1 ? " checked" : "") + '><span><b>' + esc(f.name) + "</b><small>" + f.w + " × " + f.h + " · " + esc(f.note) + "</small></span></label>";
        }).join("") + "</div>" +
          (made.length ? '<span class="lab">Ready</span><div class="optgrid">' + made.map(function (im) {
            return '<div style="display:grid;gap:6px"><div style="aspect-ratio:' + im.w + " / " + im.h + ';max-height:220px;border-radius:8px;overflow:hidden;background:url(&quot;' + art("place", "promo:" + im.id, palOf(p)) + '&quot;) center/cover;display:flex;align-items:end;padding:8px;max-width:100%"><b style="color:#fff;font:400 18px/1 var(--serif)">' + esc(p.title) + '</b></div><small class="hint" style="margin:0">' + esc(im.name) + "</small></div>";
          }).join("") + "</div>" : ""),
        foot: studioLink("design") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Close</button><button class="btn btn--go" data-act="pr-go"' + (st.busy || !pick.length ? " disabled" : "") + ">" + (st.busy ? '<span class="spin"></span> Making' : "Make " + plural(pick.length, "image")) + "</button>"
      };
    },
    on: async function (act, el) {
      if (el && el.dataset.pf) { var i = pick.indexOf(el.dataset.pf); if (el.checked && i === -1) pick.push(el.dataset.pf); if (!el.checked && i !== -1) pick.splice(i, 1); paintSheet(); }
      if (act === "pr-go") {
        st.busy = true; paintSheet();
        var r = await generatePromo(compilePayload(p, "design", { promo: pick }), pick);
        p.promo = r.images; st.busy = false; save(); redraw(); paintSheet(); toast("Images ready.");
      }
    }
  });
}

// ---------- download ----------
var EXPORT_PLAIN = {
  master: ["The finished video", "Everything mixed, ready to watch or upload"],
  dialogue: ["Voices only", "For an editor finishing the mix"],
  music: ["Music only", "The score on its own"],
  ambience: ["Room sound and effects", "Everything that isn't voices or music"],
  scenes: ["Each scene as its own file", "For cutting it yourself"],
  captions: ["Captions", "Subtitle files from the dialogue"]
};
function sheetExport() {
  var p = P();
  var pick = ["master", "captions"];
  var st = { busy: false, files: null };
  openSheet({
    title: "Download",
    draw: function () {
      var made = p.scenes.filter(function (s) { return s.status === "rendered"; }).length;
      if (st.files) return {
        body: '<div class="files">' + st.files.map(function (f) { return '<div class="file"><span>' + esc(EXPORT_PLAIN[f.id][0]) + '</span><a class="link" href="' + esc(f.url) + '" target="_blank" rel="noopener">Open</a></div>'; }).join("") + "</div>" +
          '<p class="hint">Files open in a new tab. On the live app they come from your storage and stay available.</p>',
        foot: '<span class="sp"></span><button class="btn btn--go" data-act="close">Done</button>'
      };
      return {
        body: (made ? "" : '<p class="note">No scenes are made yet, so the video would be empty. Make your scenes first, or download the captions and pitch pack now.</p>') +
          '<div class="opts">' + EXPORT_TRACKS.map(function (t) {
            return '<label class="check"><input type="checkbox" data-ex="' + t.id + '"' + (pick.indexOf(t.id) !== -1 ? " checked" : "") + "><span><b>" + esc(EXPORT_PLAIN[t.id][0]) + "</b><small>" + esc(EXPORT_PLAIN[t.id][1]) + "</small></span></label>";
          }).join("") + "</div>",
        foot: studioLink("scene") + '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Cancel</button><button class="btn btn--go" data-act="ex-go"' + (st.busy || !pick.length ? " disabled" : "") + ">" + (st.busy ? '<span class="spin"></span> Preparing' : "Prepare " + plural(pick.length, "file")) + "</button>"
      };
    },
    on: async function (act, el) {
      if (el && el.dataset.ex) { var i = pick.indexOf(el.dataset.ex); if (el.checked && i === -1) pick.push(el.dataset.ex); if (!el.checked && i !== -1) pick.splice(i, 1); paintSheet(); }
      if (act === "ex-go") {
        st.busy = true; paintSheet();
        var r = await exportMaster(compilePayload(p, "scene", { export: pick }), pick);
        st.files = r.files; st.busy = false; paintSheet();
      }
    }
  });
}

// ---------- share ----------
// New bridge calls. REAL: POST /api/ips/:id/team, POST /api/ips/:id/publish
// (the Red District portal's magic-link login and role keys live behind these).
async function inviteCollaborator(ipId, email, role) { await wait(700); return { email: email, role: role, status: "invited" }; }
async function publishShowPage(payload) { await wait(1800); return { status: "draft", url: null }; }

function sheetShare() {
  var p = P();
  p.team = p.team || [];
  var st = { role: "Can comment", busy: false, pubBusy: false };
  openSheet({
    title: "Invite people", kicker: "Share",
    draw: function () {
      return {
        body: '<div class="field"><label class="lab" for="shE">Email</label><input type="email" id="shE" placeholder="name@company.com" autocomplete="off"></div>' +
          '<div><span class="lab">They can</span>' + chips("shr", [["Can watch", "Watch"], ["Can comment", "Watch and leave notes"], ["Can edit", "Edit the show"]], st.role) + "</div>" +
          '<div class="copro__row"><button type="button" class="btn btn--go btn--sm" data-act="sh-invite"' + (st.busy ? " disabled" : "") + ">" + (st.busy ? '<span class="spin"></span> Sending' : "Send invite") + "</button></div>" +
          '<div class="list">' + p.team.map(function (m, i) {
            return '<div class="item" style="cursor:default"><span><b>' + esc(m.email) + "</b><small>" + esc(m.role) + (m.status === "invited" ? " · invite sent" : "") + "</small></span>" +
              (m.role === "Owner" ? "" : '<button type="button" class="btn btn--sm btn--quiet" data-unshare="' + i + '">Remove</button>') + "</div>";
          }).join("") + "</div>" +
          '<details class="more" id="pubMore"><summary>A public show page</summary><div><p class="hint" style="margin:0">A single page with the trailer, cast, world and timed notes, like the Red District page. People you invite sign in with a link sent to their email.</p>' +
          '<button type="button" class="btn btn--sm" style="justify-self:start" data-act="sh-pub"' + (st.pubBusy ? " disabled" : "") + ">" + (st.pubBusy ? '<span class="spin"></span> Building the page' : p.published ? "Update the show page" : "Build the show page") + "</button>" +
          (p.published ? '<p class="note">Draft built ' + ago(p.published) + ". It goes live once publishing is connected.</p>" : "") + "</div></details>",
        foot: '<span class="sp"></span><button class="btn btn--go" data-act="close">Done</button>'
      };
    },
    on: async function (act, el) {
      if (el && el.dataset.chip === "shr") { st.role = el.dataset.v; paintSheet(); }
      if (el && el.dataset.unshare != null) { p.team.splice(+el.dataset.unshare, 1); save(); paintSheet(); }
      if (act === "sh-invite") {
        var e = val("shE").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { toast("That email doesn’t look right. Check it and try again."); return; }
        st.busy = true; paintSheet();
        var r = await inviteCollaborator(p.id, e, st.role);
        p.team.push(r); st.busy = false; save(); paintSheet(); setVal("shE", ""); toast("Invite sent to " + e + ".");
      }
      if (act === "sh-pub") { st.pubBusy = true; paintSheet(); await publishShowPage(compilePayload(p, "design", { publish: true })); p.published = Date.now(); st.pubBusy = false; save(); paintSheet(); }
    }
  });
}

// ---------- studio: payload for one job ----------
function sheetPayload(job) {
  var p = P();
  var payload = compilePayload(p, job, {});
  openSheet({
    title: "What we send", kicker: "Studio view · " + job, wide: true,
    draw: function () {
      return { body: '<div class="routing">' + Object.keys(payload.routing).filter(function (k) { return payload.routing[k]; }).map(function (k) { return "<span>" + k + " → " + esc(payload.routing[k]) + "</span>"; }).join("") + "</div>" +
        '<pre class="code">' + esc(JSON.stringify(payload, null, 2)) + "</pre>",
        foot: '<span class="sp"></span><button class="btn" data-act="copy-this">Copy</button><button class="btn btn--go" data-act="close">Done</button>' };
    },
    on: function (act) { if (act === "copy-this") copyText(JSON.stringify(payload, null, 2)); }
  });
}

function sheetDelete() {
  var p = P();
  openSheet({
    title: "Delete " + p.title + "?",
    draw: function () {
      return { body: "<p>This removes the story, cast, pictures, scenes and everything else in this show from this device. It can’t be undone.</p>",
        foot: '<span class="sp"></span><button class="btn btn--quiet" data-act="close">Keep it</button><button class="btn btn--go" data-act="del-yes">Delete the show</button>' };
    },
    on: function (act) {
      if (act === "del-yes") { var t = p.title; S.ips = S.ips.filter(function (x) { return x !== p; }); save(); closeSheet(); go("home"); toast(t + " was deleted."); }
    }
  });
}

function copyText(t) {
  try {
    navigator.clipboard.writeText(t).then(function () { toast("Copied."); }, function () { toast("Couldn’t copy. Select the text and copy it instead."); });
  } catch (e) { toast("Couldn’t copy. Select the text and copy it instead."); }
}


// ============================================================
// Your own media: video clips, music, sounds and images the
// creator uploads. Everything here can go into a cut.
// ============================================================
function mediaKind(file) {
  var t = file.type || "";
  if (/^video\//.test(t)) return "video";
  if (/^image\//.test(t)) return "image";
  if (/^audio\//.test(t)) return /music|song|track|score|theme|beat|instrumental/i.test(file.name) ? "music" : "audio";
  return null;
}
// A frame from an uploaded video, for its thumbnail (used when the server can't make one).
function videoPoster(file) {
  return new Promise(function (resolve) {
    if (!/^video\//.test(file.type || "")) return resolve(null);
    var v = document.createElement("video"), url = URL.createObjectURL(file), done = false;
    var finish = function (r) { if (done) return; done = true; URL.revokeObjectURL(url); resolve(r); };
    v.muted = true; v.playsInline = true; v.preload = "auto";
    v.onloadeddata = function () { try { v.currentTime = Math.min(1, (v.duration || 2) / 2); } catch (e) { finish(null); } };
    v.onseeked = function () {
      try { var c = document.createElement("canvas"); c.width = 480; c.height = Math.round(480 * (v.videoHeight / v.videoWidth || 0.5625)); c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); finish(c.toDataURL("image/jpeg", 0.7)); }
      catch (e) { finish(null); }
    };
    v.onerror = function () { finish(null); };
    setTimeout(function () { finish(null); }, 8000);
    v.src = url;
  });
}
var CLIP_TILE = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#1b1b1f"/><path d="M68 32v26l22-13z" fill="#888"/></svg>');

function mediaDuration(file) {
  return new Promise(function (resolve) {
    if (!/^(video|audio)\//.test(file.type || "")) return resolve(0);
    var el = document.createElement(/^video/.test(file.type) ? "video" : "audio");
    var url = URL.createObjectURL(file);
    var done = function (d) { URL.revokeObjectURL(url); resolve(d); };
    el.preload = "metadata";
    el.onloadedmetadata = function () { done(isFinite(el.duration) ? el.duration : 0); };
    el.onerror = function () { done(0); };
    setTimeout(function () { done(0); }, 8000);
    el.src = url;
  });
}
async function addMedia(p, files, forceKind) {
  p.media = p.media || [];
  var added = 0, big = 0;
  for (var i = 0; i < files.length; i++) {
    var f = files[i], kind = forceKind || mediaKind(f);
    if (!kind) { toast(f.name + " isn’t a video, audio or image file."); continue; }
    var dur = await mediaDuration(f), url, lasting = false, poster = null;
    if (MEDIA.server) { var up = await uploadTrack(f); url = up.url; lasting = true; poster = up.poster; if (!dur && up.duration) dur = up.duration; }
    else if (kind === "image") { try { url = await shrinkImage(f); lasting = true; } catch (e) { continue; } }
    else { url = URL.createObjectURL(f); if (f.size > 50e6) big++; }
    if (kind === "video" && !poster) poster = await videoPoster(f);
    var item = { id: uid("md"), name: f.name.replace(/\.[^.]+$/, ""), kind: kind, url: url, duration: dur, lasting: lasting, at: Date.now(), poster: poster };
    if (kind === "image") { p.artwork = p.artwork || []; p.artwork.push({ id: item.id, name: item.name, url: url, at: item.at }); }
    else p.media.push(item);
    if (kind === "music") { p.tracks = p.tracks || []; p.tracks.push({ name: item.name, url: url, kind: "upload", at: item.at, lasting: lasting, mediaId: item.id, duration: dur }); }
    added++;
  }
  save(); redraw();
  if (added) toast(plural(added, "file") + " added." + (!MEDIA.server && files.length ? " On this preview, clips play until you reload; on the live app they’re kept." : ""));
}
function removeMedia(p, id) {
  var i = (p.media || []).findIndex(function (m) { return m.id === id; });
  if (i === -1) return;
  var m = p.media.splice(i, 1)[0];
  p.tracks = (p.tracks || []).filter(function (t) { return t.mediaId !== id; });
  save(); redraw();
  toast(m.name + " removed.", function () { p.media.splice(i, 0, m); if (m.kind === "music") p.tracks.push({ name: m.name, url: m.url, kind: "upload", at: m.at, lasting: m.lasting, mediaId: m.id, duration: m.duration }); save(); redraw(); });
}

// Everything that can go into a cut, as the editor sees it.
function cutMaterials(p) {
  var out = [];
  p.scenes.forEach(function (s, i) {
    var real = s.videoUrl && !isStandIn(s.videoUrl) && s.status === "rendered";
    if (s.status !== "rendered" && !real) return;
    var who = p.characters.filter(function (c) { return (s.characters || []).indexOf(c.id) !== -1; }).map(function (c) { return c.name; });
    out.push({ ref: "scene:" + s.id, kind: real ? "video" : "still", src: real ? s.videoUrl : null, still: sceneSrc(p, s), duration: real ? (s.duration || 5) : 4,
      label: (isSerial(p) ? "Ep " + (s.ep || 1) + " " : "") + "Scene " + (i + 1), desc: [s.heading, s.prompt, who.length ? "With " + who.join(", ") : "", s.line ? "Line: \"" + s.line + "\"" : ""].filter(Boolean).join(". ") });
  });
  (p.media || []).forEach(function (m) {
    if (m.kind === "video") out.push({ ref: "media:" + m.id, kind: "video", src: m.url, still: m.poster || CLIP_TILE, poster: true, duration: m.duration || 5, label: m.name, desc: "The creator's own clip: " + m.name });
    if (m.kind === "audio") out.push({ ref: "media:" + m.id, kind: "audio", src: m.url, duration: m.duration || 2, label: m.name });
  });
  (p.tracks || []).forEach(function (t, i) { out.push({ ref: "track:" + i, kind: "music", src: t.url, duration: t.duration || 60, label: t.name }); });
  (p.artwork || []).forEach(function (a) { out.push({ ref: "art:" + a.id, kind: "still", src: null, still: a.url, duration: 4, label: a.name, desc: "Artwork: " + a.name }); });
  p.worlds.filter(function (w) { return w.shot; }).forEach(function (w) { out.push({ ref: "place:" + w.id, kind: "still", src: null, still: placeSrc(p, w), duration: 4, label: w.name, desc: "Establishing picture of " + w.name + ". " + (w.atmosphere || "") }); });
  return out;
}
// A cut, with its refs swapped for the files the renderer needs.
function resolveCut(p, cut) {
  var by = {}; cutMaterials(p).forEach(function (m) { by[m.ref] = m; });
  return {
    items: cut.items.map(function (it) {
      if (it.type === "title") return { type: "title", text: it.text, dur: it.dur };
      var m = by[it.ref] || {};
      return { type: "clip", src: m.src || null, still: m.src ? null : (m.still || null), poster: m.still || null, in: it.in, out: it.out, fade: !!it.fade, label: m.label };
    }),
    music: cut.music && by[cut.music.ref] ? { src: by[cut.music.ref].src, start: cut.music.start || 0, volume: 0.8 } : null,
    audio: (cut.audio || []).filter(function (a) { return by[a.ref]; }).map(function (a) { return { src: by[a.ref].src, at: a.at, volume: 1 }; })
  };
}
function cutLength(cut) { return cut.items.reduce(function (t, it) { return t + (it.type === "title" ? it.dur : it.out - it.in); }, 0); }
function mmss(t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); }

// ============================================================
// The preview player: plays a cut in the browser, shot by shot,
// before anything is rendered.
// ============================================================
var PV = null;
function previewHTML(id) {
  return '<div class="pv" id="' + id + '"><div class="pv__stage"><video class="pv__v" playsinline preload="auto"></video><img class="pv__i" alt=""><div class="pv__t"></div>' +
    '<button class="pv__big" data-pv="toggle" aria-label="Play">▶</button></div>' +
    '<div class="pv__bar"><button class="pv__btn" data-pv="toggle" aria-label="Play or pause">▶</button><div class="pv__track" data-pv="seek"><i></i></div><span class="pv__time">0:00</span></div></div>';
}
function mountPreview(id, resolved) {
  if (PV && PV.stop) PV.stop();
  var root = document.getElementById(id); if (!root) return;
  var v = root.querySelector(".pv__v"), img = root.querySelector(".pv__i"), title = root.querySelector(".pv__t");
  var bar = root.querySelector(".pv__track i"), time = root.querySelector(".pv__time");
  var seq = [], t = 0;
  resolved.items.forEach(function (it) { var d = it.type === "title" ? it.dur : Math.max(0.3, it.out - it.in); seq.push({ it: it, start: t, dur: d }); t += d; });
  var total = t, music = null;
  if (resolved.music && resolved.music.src) { music = new Audio(resolved.music.src); music.preload = "auto"; }
  var st = { playing: false, idx: -1, clock: 0, last: 0, raf: 0 };
  function show(i, offset) {
    st.idx = i; var s = seq[i]; if (!s) return;
    var it = s.it;
    title.hidden = it.type !== "title"; img.hidden = true; v.hidden = true;
    root.classList.toggle("pv--title", it.type === "title");
    if (it.type === "title") { title.textContent = it.text; return; }
    if (it.src) {
      v.hidden = false;
      if (v.dataset.src !== it.src) { v.src = it.src; v.dataset.src = it.src; }
      try { v.currentTime = it.in + (offset || 0); } catch (e) {}
      if (st.playing) v.play().catch(function () {});
    } else {
      img.hidden = false; img.src = it.still || "";
      img.style.animation = "none"; void img.offsetWidth; img.style.animation = "pvpush " + s.dur + "s linear forwards";
    }
    if (music) music.volume = it.src ? 0.35 : 0.8;
  }
  function tick(now) {
    if (!st.playing) return;
    var dt = (now - st.last) / 1000; st.last = now;
    var s = seq[st.idx];
    if (s && s.it.src && !v.paused && v.readyState > 2) st.clock = s.start + (v.currentTime - s.it.in);
    else st.clock += dt;
    if (s && st.clock >= s.start + s.dur) {
      if (st.idx + 1 >= seq.length) { stopPlay(); st.clock = total; paint(); return; }
      v.pause(); show(st.idx + 1, 0);
    }
    paint();
    st.raf = requestAnimationFrame(tick);
  }
  function paint() { bar.style.width = (total ? Math.min(100, st.clock / total * 100) : 0) + "%"; time.textContent = mmss(st.clock) + " / " + mmss(total); }
  function startPlay() {
    if (st.clock >= total) { st.clock = 0; show(0, 0); }
    st.playing = true; root.classList.add("pv--on"); st.last = performance.now();
    if (seq[st.idx] && seq[st.idx].it.src) v.play().catch(function () {});
    if (music) { try { music.currentTime = (resolved.music.start || 0) + st.clock; } catch (e) {} music.play().catch(function () {}); }
    st.raf = requestAnimationFrame(tick);
  }
  function stopPlay() { st.playing = false; root.classList.remove("pv--on"); v.pause(); if (music) music.pause(); cancelAnimationFrame(st.raf); }
  function seekTo(frac) {
    var target = frac * total; var i = seq.findIndex(function (s) { return target < s.start + s.dur; }); if (i < 0) i = seq.length - 1;
    st.clock = target; show(i, target - seq[i].start); paint();
    if (music) { try { music.currentTime = (resolved.music.start || 0) + target; } catch (e) {} }
  }
  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pv]"); if (!b) return;
    if (b.dataset.pv === "toggle") { st.playing ? stopPlay() : startPlay(); }
    if (b.dataset.pv === "seek") { var r = b.getBoundingClientRect(); seekTo(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }
  });
  show(0, 0); paint();
  PV = { stop: stopPlay };
}

// ============================================================
// The Edit room (the Trailer step)
// ============================================================
var LENGTHS = ["30 sec", "60 sec", "90 sec"];
function currentCut(p) { var c = p.cuts || []; return c.find(function (x) { return x.id === p.cutSel; }) || c[c.length - 1] || null; }

function drawEditRoom(p) {
  var mats = cutMaterials(p);
  var nPics = mats.filter(function (m) { return m.kind === "video" || m.kind === "still"; }).length;
  var counts = { video: (p.media || []).filter(function (m) { return m.kind === "video"; }).length, audio: (p.media || []).filter(function (m) { return m.kind === "audio"; }).length, music: (p.tracks || []).length,
    scenes: p.scenes.filter(function (s) { return s.status === "rendered"; }).length };
  var cut = currentCut(p);
  var h = "";

  // the material
  h += '<details class="more bin" id="binMore"' + (S.openBin ? " open" : "") + '><summary>Your material: ' + [plural(counts.scenes, "finished scene"), plural(counts.video, "clip"), plural(counts.music, "music track"), plural(counts.audio, "sound")].join(", ") + "</summary><div>" +
    '<label class="btn btn--sm upbtn">Upload clips, music or sound<input type="file" accept="video/*,audio/*,image/*" multiple id="upMedia" hidden></label>' +
    (MEDIA.video ? '<button type="button" class="btn btn--sm" data-act="ai-shot"' + (S.busy.aishot ? " disabled" : "") + ">" + (S.busy.aishot ? '<span class="spin"></span> Making a shot' : "Make a trailer shot with AI") + "</button>" : "") +
    '<p class="hint" style="margin:0">Your own footage, songs, voice-overs and sound effects. Anything you add here can go into a cut.</p>' +
    ((p.media || []).length ? '<div class="binlist">' + p.media.map(function (m) {
      return '<div class="binrow"><span class="binrow__k binrow__k--' + m.kind + '">' + ({ video: "Clip", music: "Music", audio: "Sound" }[m.kind] || m.kind) + '</span><span class="binrow__n">' + esc(m.name) + (m.duration ? " · " + mmss(m.duration) : "") + (m.lasting ? "" : " · this visit only") +
        '</span><button class="btn btn--sm btn--quiet" data-unmedia="' + m.id + '">Remove</button></div>';
    }).join("") + "</div>" : "") + "</div></details>";

  if (!nPics) {
    return h + '<div class="donext"><p>There’s nothing to cut yet. Make some scenes, or upload your own clips above.</p><button class="btn btn--go" data-goto="scenes">Go to scenes</button></div>';
  }

  // settings + cut button
  h += '<div class="cutset"><div><span class="lab">Length</span>' + chips("cut-len", LENGTHS, S.cutLen || (cut && cut.length) || "60 sec") + "</div>" +
    '<div><span class="lab">How it’s cut</span>' + chips("cut-vibe", TRAILER_VIBES, S.cutVibe || (cut && cut.vibe) || TRAILER_VIBES[0]) + "</div></div>";

  if (!cut) {
    return h + doNext("Cut my trailer", "cut", "I’ll pick the best moments from your " + plural(nPics, "shot") + ", lay the music under them and add title cards.", "cut");
  }

  // versions
  if ((p.cuts || []).length > 1) h += '<div class="chips">' + p.cuts.map(function (c, i) {
    return '<button type="button" class="chip" data-cutv="' + c.id + '" aria-pressed="' + (c.id === cut.id) + '">Cut ' + (i + 1) + "</button>";
  }).join("") + "</div>";

  // the player, then the timeline
  h += previewHTML("pv-edit");
  var total = cutLength(cut), by = {}; mats.forEach(function (m) { by[m.ref] = m; });
  h += '<div class="tl">' + cut.items.map(function (it, i) {
    var d = it.type === "title" ? it.dur : it.out - it.in;
    var m = by[it.ref] || {};
    var sel = S.tlSel === i;
    return '<button class="tl__b' + (it.type === "title" ? " tl__b--t" : "") + (sel ? " on" : "") + '" style="flex-grow:' + d.toFixed(2) + '" data-tl="' + i + '" title="' + esc(it.type === "title" ? it.text : m.label || "") + '">' +
      (it.type === "title" ? '<span>' + esc(it.text) + "</span>" : '<img src="' + (m.still || "") + '" alt="">') + "</button>";
  }).join("") + "</div>";
  h += '<div class="tl__meta"><span>' + mmss(total) + " · " + plural(cut.items.length, "shot") + (cut.music && by[cut.music.ref] ? " · music: " + esc(by[cut.music.ref].label) : " · no music") + "</span></div>";
  if (S.tlSel != null && cut.items[S.tlSel]) {
    var it = cut.items[S.tlSel];
    h += '<div class="tl__tools"><b>' + esc(it.type === "title" ? "Title: " + it.text : (by[it.ref] || {}).label || "Shot") + "</b>" +
      (it.type === "clip" ? '<span class="hint" style="margin:0">' + it.in.toFixed(1) + "s to " + it.out.toFixed(1) + "s</span>" : "") +
      '<span class="sp"></span><button class="btn btn--sm" data-tlop="left">Move earlier</button><button class="btn btn--sm" data-tlop="right">Move later</button>' +
      (it.type === "title" ? '<button class="btn btn--sm" data-tlop="text">Change words</button>' : "") +
      '<button class="btn btn--sm btn--quiet" data-tlop="del" style="color:var(--accent)">Remove</button></div>';
  }
  if (cut.why) h += '<p class="note"><b>Why this cut:</b> ' + esc(cut.why) + "</p>";

  // notes + recut
  h += '<div class="field"><label class="lab" for="cutNotes">What should change?</label><textarea id="cutNotes" rows="2" placeholder="Shorter. Open on Elena. Less of the alley. End on the line about channel 83."></textarea></div>' +
    '<div class="copro__row"><button class="btn btn--go" data-act="recut"' + (S.busy.cut ? " disabled" : "") + ">" + (S.busy.cut ? '<span class="spin"></span> Cutting' : "Make a new cut") + "</button>" +
    '<button class="btn" data-act="use-cut">' + (p.trailer && p.trailer.cutId === cut.id ? "This is your trailer" : "Use as my trailer") + "</button></div>";

  // finishing
  var renderBusy = S.busy.render;
  h += '<div class="finish"><h3 class="subhead" style="margin:0">Finish it</h3>' +
    (MEDIA.server ? "" : '<p class="hint" style="margin:0">Rendering and exporting happen on the live app, where your clips are stored.</p>') +
    '<div class="copro__row"><button class="btn" data-act="render-cut"' + (MEDIA.server && !renderBusy ? "" : " disabled") + ">" + (renderBusy ? '<span class="spin"></span> ' + esc(S.renderMsg || "Rendering") : cut.renderUrl ? "Render it again" : "Render the video") + "</button>" +
    '<button class="btn" data-act="export-cut"' + (MEDIA.server && !S.busy.export ? "" : " disabled") + ">" + (S.busy.export ? '<span class="spin"></span> Packing' : "Open in Premiere or Resolve") + "</button></div>" +
    (cut.renderUrl ? '<div class="files"><div class="file"><span>Rendered trailer (MP4)</span><a class="link" href="' + esc(cut.renderUrl) + '" target="_blank" rel="noopener">Open</a></div></div>' : "") +
    (cut.exportUrl ? '<div class="files"><div class="file"><span>Premiere / Resolve package (ZIP)</span><a class="link" href="' + esc(cut.exportUrl) + '" target="_blank" rel="noopener">Download</a></div></div>' : "") + "</div>";
  return h;
}

async function makeTrailerShot(p) {
  await busy("aishot", async function () {
    var r = await generateTrailer(compilePayload(p, "trailer", { vibe: S.cutVibe || TRAILER_VIBES[0] }));
    p.media = p.media || [];
    p.media.push({ id: uid("md"), name: "Trailer shot " + (p.media.filter(function (m) { return /^Trailer shot/.test(m.name); }).length + 1), kind: "video", url: r.videoUrl, duration: 10, lasting: true, at: Date.now() });
  });
  toast("New shot added to your material.");
}
async function makeCut(p, recut) {
  var mats = cutMaterials(p);
  var prev = recut ? currentCut(p) : null;
  var notes = recut ? val("cutNotes").trim() : "";
  var opts = { length: S.cutLen || (prev && prev.length) || "60 sec", vibe: S.cutVibe || (prev && prev.vibe) || TRAILER_VIBES[0], notes: notes,
    previous: prev ? { items: prev.items, music: prev.music } : null, title: p.title, tagline: p.tagline, logline: p.story.logline };
  await busy("cut", async function () {
    var c = await planCut(compilePayload(p, "trailer", { length: opts.length, vibe: opts.vibe, notes: notes }), mats, opts);
    c.id = uid("cut"); c.at = Date.now(); c.length = opts.length; c.vibe = opts.vibe; c.notes = notes;
    p.cuts = p.cuts || []; p.cuts.push(c); p.cutSel = c.id; S.tlSel = null;
  });
  toast(recut ? "New cut ready. Your earlier cuts are still above the player." : "Your first cut is ready. Press play.");
}
function editCut(p, op) {
  var cut = currentCut(p), i = S.tlSel; if (!cut || i == null) return;
  // edits make a new version so the earlier cut is never lost
  var next = JSON.parse(JSON.stringify(cut)); next.id = uid("cut"); next.at = Date.now(); next.renderUrl = null; next.exportUrl = null; next.why = "Your edit of the previous cut.";
  var it = next.items[i];
  if (op === "left" && i > 0) { next.items.splice(i, 1); next.items.splice(i - 1, 0, it); S.tlSel = i - 1; }
  else if (op === "right" && i < next.items.length - 1) { next.items.splice(i, 1); next.items.splice(i + 1, 0, it); S.tlSel = i + 1; }
  else if (op === "del") { next.items.splice(i, 1); S.tlSel = null; }
  else return;
  p.cuts.push(next); p.cutSel = next.id; save(); redraw();
}
function editTitleCard(p) {
  var cut = currentCut(p), i = S.tlSel; if (!cut || i == null || cut.items[i].type !== "title") return;
  sheetText({ title: "Title card", key: "cut:title", single: true, get: function () { return cut.items[i].text; },
    set: function (v) { var next = JSON.parse(JSON.stringify(cut)); next.id = uid("cut"); next.at = Date.now(); next.renderUrl = null; next.items[i].text = v; next.why = "Your edit of the previous cut."; p.cuts.push(next); p.cutSel = next.id; } });
}
async function renderCurrentCut(p) {
  var cut = currentCut(p); if (!cut) return;
  await busy("render", async function () {
    cut.renderUrl = await renderCut(resolveCut(p, cut), function (f, m) { S.renderMsg = Math.round(f * 100) + "% · " + m; var b = $('[data-act="render-cut"]'); if (b) b.innerHTML = '<span class="spin"></span> ' + esc(S.renderMsg); });
    if (p.trailer && p.trailer.cutId === cut.id) p.trailer.videoUrl = cut.renderUrl;
  });
  S.renderMsg = "";
  toast("Your trailer is rendered.");
}
async function exportCurrentCut(p) {
  var cut = currentCut(p); if (!cut) return;
  await busy("export", async function () { cut.exportUrl = await exportCut(resolveCut(p, cut), p.title + " trailer"); });
  toast("Package ready. Download it, unzip, and open cut.xml in Premiere or Resolve.");
}
function useCut(p) {
  var cut = currentCut(p); if (!cut) return;
  p.trailer = { status: "ready", cutId: cut.id, videoUrl: cut.renderUrl || null, length: mmss(cutLength(cut)), vibe: cut.vibe || "" };
  save(); redraw(); toast("This cut is now the trailer on your ShowPage.");
}
// Mount whichever preview player is on screen.
function mountPlayers() {
  var p = P(); if (!p) return;
  if ($("#pv-edit")) { var c = currentCut(p); if (c) mountPreview("pv-edit", resolveCut(p, c)); }
  if ($("#pv-page")) { var c2 = (p.cuts || []).find(function (x) { return x.id === p.trailer.cutId; }); if (c2) mountPreview("pv-page", resolveCut(p, c2)); }
}

// ============================================================
// Events
// ============================================================
var audioEl = null;
function playTrack(p, i) {
  var t = (p.tracks || [])[i]; if (!t) return;
  if (!audioEl) { audioEl = new Audio(); }
  if (audioEl.dataset.i === String(i) && !audioEl.paused) { audioEl.pause(); return; }
  audioEl.src = t.url; audioEl.dataset.i = String(i);
  audioEl.play().catch(function () { toast("This track can’t play here."); });
}
function parseTime(s) {
  s = String(s || "").trim(); if (!s) return null;
  var m = s.match(/^(\d+):(\d{1,2})$/); if (m) return +m[1] * 60 + +m[2];
  return isNaN(+s) ? null : +s;
}

document.addEventListener("click", async function (e) {
  var t = e.target;
  if (S.menu && !t.closest(".menu") && !t.closest('[data-act="menu"]')) { S.menu = null; drawMenu(); }

  // sheets
  if (S.sheet && t.closest("#layer")) {
    if (t.classList && t.classList.contains("scrim")) { closeSheet(); return; }
    var sb = t.closest("[data-act],[data-chip],[data-pick],[data-restore],[data-look],[data-plate],[data-mode],[data-add],[data-addw],[data-fmt],[data-pal],[data-mopt],[data-hear],[data-read],[data-unshare],[data-payload],input[type=checkbox]");
    if (!sb) return;
    if (sb.dataset.act === "close") { closeSheet(); return; }
    if (sb.dataset.payload) { sheetPayload(sb.dataset.payload); return; }
    if (S.sheet.on) await S.sheet.on(sb.dataset.act, sb);
    return;
  }

  // inline editing: a click on editable text edits it, nothing else
  if (S.editing && t.closest("[data-field][contenteditable]")) { if (t.closest("summary")) e.preventDefault(); return; }

  var a = t.closest("[data-act],[data-open],[data-edit],[data-person],[data-place],[data-scene],[data-goto],[data-sec],[data-format],[data-eps],[data-idea],[data-ep],[data-job],[data-workflow],[data-chip],[data-lkpal],[data-play],[data-untrack],[data-unnote],[data-art],[data-artf],[data-epick],[data-unmedia],[data-cutv],[data-tl],[data-tlop]");
  if (!a) return;
  var d = a.dataset, p = P();

  if (d.open) { var q = S.ips.find(function (x) { return x.id === d.open; }); return q.page ? go("page", q.id) : go("step", q.id, resumeStep(q)); }
  if (d.goto) { e.preventDefault(); go("step", S.cur, d.goto); return; }
  if (d.sec) { S.menu = null; drawMenu(); var el = $("#pg-" + d.sec); if (el) { el.open = true; S.openSecs = S.openSecs || {}; S.openSecs[d.sec] = true; } if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); return; }
  if (d.edit) { editKey(d.edit); return; }
  if (d.person) { sheetPerson(d.person); return; }
  if (d.place) { sheetPlace(d.place); return; }
  if (d.scene) { sheetScene(d.scene); return; }
  if (d.ep) { sheetEpisode(+d.ep); return; }
  if (d.job) { S.studioJob = d.job; redraw(); return; }
  if (d.workflow) { p.workflow = d.workflow; save(); redraw(); return; }
  if (d.art) { sheetArt(d.art); return; }
  if (d.epick) { S.ep = +d.epick; redraw(); return; }
  if (d.unmedia) { removeMedia(p, d.unmedia); return; }
  if (d.cutv) { p.cutSel = d.cutv; S.tlSel = null; save(); redraw(); return; }
  if (d.tl != null) { S.tlSel = S.tlSel === +d.tl ? null : +d.tl; redraw(); return; }
  if (d.tlop) { if (d.tlop === "text") editTitleCard(p); else editCut(p, d.tlop); return; }
  if (d.chip === "cut-len") { S.cutLen = d.v; redraw(); return; }
  if (d.chip === "cut-vibe") { S.cutVibe = d.v; redraw(); return; }
  if (d.artf) { S.artFilter = d.artf; redraw(); return; }
  if (d.play != null) { playTrack(p, +d.play); return; }
  if (d.untrack != null) { var tr = p.tracks.splice(+d.untrack, 1)[0]; save(); redraw(); toast(tr.name + " removed.", function () { p.tracks.splice(+d.untrack, 0, tr); save(); redraw(); }); return; }
  if (d.unnote != null) { p.trailerNotes.splice(+d.unnote, 1); save(); redraw(); return; }

  // the Look page saves as you tap
  if (d.chip === "lk-style") { keepLook(p); p.visual.style = d.v; save(); redraw(); return; }
  if (d.lkpal) { keepLook(p); p.visual.palette = d.lkpal; save(); redraw(); return; }

  if (S.view === "new") {
    var c = S.copro;
    if (d.format) { c.format = d.format; draw(); return; }
    if (d.eps) { c.episodes = +d.eps; draw(); return; }
    if (d.idea != null) { c.idea = c.ideas.examples[+d.idea].text; draw(); var ta = $("#cpIdea"); if (ta) ta.focus(); return; }
  }

  switch (d.act) {
    case "home": go("home"); break;
    case "enter": enter(); break;
    case "shows": go("shows"); break;
    case "new": S.copro = null; go("new"); break;
    case "demo": var demo = demoShow(); demo.page = { madeAt: Date.now() }; demo.tagline = "Some channels should stay dead."; S.ips.unshift(demo); save(); go("page", demo.id); break;
    case "leave-copro":
      if (S.copro && S.copro.step === 1) { S.copro.idea = val("cpIdea"); S.copro.step = 0; draw(); }
      else if (!S.copro || S.copro.step !== 2) { S.copro = null; go("home"); }
      break;
    case "cp-ideas":
      S.copro.idea = val("cpIdea"); S.copro.helpBusy = true; draw();
      try { S.copro.ideas = await askForHelp(compilePayload(blankIP("", S.copro.format), "spine", {}), { kind: "spine", key: "once", format: S.copro.format, partial: S.copro.idea.trim(), round: (S.copro.round = (S.copro.round || 0) + 1) }); }
      finally { S.copro.helpBusy = false; draw(); }
      break;
    case "cp-next": if (!S.copro.format) return; S.copro.step = 1; draw(); window.scrollTo(0, 0); break;
    case "cp-back": S.copro.idea = val("cpIdea"); S.copro.step = 0; draw(); break;
    case "cp-write":
      S.copro.idea = val("cpIdea").trim();
      if (S.copro.idea.split(/\s+/).length < 4) { toast("Tell me a little more. Who is it about, and what goes wrong?"); return; }
      coproWrite(); break;
    case "to-page": go("page", S.cur); break;
    case "continue": go("step", S.cur, resumeStep(p)); break;
    case "make-page": S.menu = null; drawMenu(); sheetMakePage(); break;
    case "toggle-edit": S.editing = !S.editing; redraw(); if (S.editing) toast("Tap any outlined text to change it."); break;
    case "menu": S.menu = !S.menu; drawMenu(); break;
    case "theme":
      var dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = dark ? "light" : "dark";
      try { localStorage.setItem("showtime.theme", document.documentElement.dataset.theme); } catch (er) {}
      S.menu = null; drawMenu(); break;
    case "studio": S.studio = !S.studio; S.menu = null; save(); redraw(); toast(S.studio ? "Studio view is on. The details are at the bottom of the page." : "Studio view is off."); break;
    case "shape": sheetShape(); break;
    case "delete-show": S.menu = null; drawMenu(); sheetDelete(); break;
    case "recover":
      if (galleryItems(p).length) { S.openSecs = S.openSecs || {}; S.openSecs.art = true; redraw(); var ae = $("#pg-art"); if (ae) ae.scrollIntoView({ behavior: "smooth" }); toast("Pick any image and choose Use as cover image."); }
      else { p.coverSeed = (p.coverSeed || 0) + 1; save(); redraw(); }
      break;
    case "add-person": sheetAddPerson(); break;
    case "add-place": sheetAddPlace(); break;
    case "make-faces": makeAllFaces(); break;
    case "make-places": makeAllPlaces(); break;
    case "music": sheetMusic(!p.music.genres.length); break;
    case "voices": sheetVoices(); break;
    case "cast-voices": castVoices(); break;
    case "plan-eps": planEps(); break;
    case "break": breakScenes(); break;
    case "make-all": makeAllScenes(); break;
    case "add-scene": addScene(); break;
    case "trailer": sheetTrailer(); break;
    case "share": S.menu = null; drawMenu(); sheetShare(); break;
    case "pitch": sheetPitch(); break;
    case "promo": sheetPromo(); break;
    case "export": sheetExport(); break;
    case "make-score": makeScore(p); break;
    case "cut": makeCut(p, false); break;
    case "recut": makeCut(p, true); break;
    case "use-cut": useCut(p); break;
    case "render-cut": renderCurrentCut(p); break;
    case "export-cut": exportCurrentCut(p); break;
    case "ai-shot": makeTrailerShot(p); break;
    case "add-note":
      var tt = parseTime(val("tnT")), tx = val("tnX").trim();
      if (tt == null || !tx) { toast("Add a time like 0:12 and a note."); return; }
      p.trailerNotes = p.trailerNotes || []; p.trailerNotes.push({ t: tt, text: tx, at: Date.now() }); save(); redraw();
      var tn = $("#tnotes"); if (tn) tn.open = true; break;
    case "copy-payload": copyText(JSON.stringify(compilePayload(p, S.studioJob || "scene", {}), null, 2)); break;
  }
});

function keepLook(p) { keep(p, "look", JSON.stringify({ style: p.visual.style, palette: p.visual.palette })); }

document.addEventListener("change", async function (e) {
  if (e.target.id === "upMedia") { var files = Array.prototype.slice.call(e.target.files || []); S.openBin = true; await addMedia(P(), files); }
});

// artwork upload on the ShowPage
async function shrinkImage(file) {
  var url = URL.createObjectURL(file);
  var img = await new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = url; });
  var k = Math.min(1, 1400 / Math.max(img.width, img.height));
  var c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.82);
}
document.addEventListener("change", async function (e) {
  if (e.target.id !== "upArt") return;
  var p = P(), files = Array.prototype.slice.call(e.target.files || []);
  p.artwork = p.artwork || [];
  for (var i = 0; i < files.length; i++) {
    var f = files[i], url;
    if (MEDIA.server) url = (await uploadTrack(f)).url;
    else { try { url = await shrinkImage(f); } catch (er) { toast(f.name + " couldn\u2019t be read. Try a JPG or PNG."); continue; } }
    p.artwork.push({ id: uid("aw"), name: f.name.replace(/\.[^.]+$/, ""), url: url, at: Date.now() });
  }
  S.artFilter = "upload"; S.openSecs = S.openSecs || {}; S.openSecs.art = true;
  save(); redraw(); toast(plural(files.length, "image") + " added to your artwork.");
});

// music upload on the ShowPage
document.addEventListener("change", async function (e) {
  if (e.target.id !== "upMusic") return;
  var p = P(), file = e.target.files[0]; if (!file) return;
  var r = await uploadTrack(file);
  p.tracks = p.tracks || [];
  p.tracks.push({ name: file.name.replace(/\.[^.]+$/, ""), url: r.url, kind: "upload", at: Date.now(), lasting: r.lasting });
  save(); redraw();
  toast(r.lasting ? "Track added to your soundtrack." : "Track added. It plays until you reload this page; on the live app uploads are kept.");
});

async function makeScore(p) {
  await busy("score", async function () {
    var r = await generateScore(compilePayload(p, "music", {}));
    p.tracks = p.tracks || [];
    p.tracks.unshift({ name: p.title + " theme", url: r.url, kind: "score", at: Date.now(), lasting: true });
  });
  toast("Your theme is ready on the ShowPage.");
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { if (S.sheet) closeSheet(); else if (S.menu) { S.menu = null; drawMenu(); } }
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    if (S.sheet) { var go1 = $("#layer .sheet__foot .btn--go"); if (go1 && !go1.disabled) go1.click(); }
    else if (S.view === "new") { var g = $('[data-act="cp-write"],[data-act="cp-next"]'); if (g && !g.disabled) g.click(); }
  }
});
document.addEventListener("input", function (e) { if (e.target.id === "cpIdea" && S.copro) S.copro.idea = e.target.value; });
document.addEventListener("toggle", function (e) {
  if (e.target.id === "spineMore") S.openLines = e.target.open;
  if (e.target.id === "binMore") S.openBin = e.target.open;
  if (e.target.id && e.target.id.indexOf("pep-") === 0) { S.openEps = S.openEps || {}; S.openEps[e.target.id.slice(4)] = e.target.open; }
  if (e.target.id && e.target.id.indexOf("pg-") === 0) { S.openSecs = S.openSecs || {}; S.openSecs[e.target.id.slice(3)] = e.target.open; }
}, true);
window.addEventListener("hashchange", function () { closeSheet(); fromHash(); draw(); });
window.addEventListener("unhandledrejection", function (e) {
  var r = e.reason || {};
  toast(r.userMessage || "Something went wrong. Try again.");
});

// ---------- boot ----------
(function boot() {
  try { var th = localStorage.getItem("showtime.theme"); if (th) document.documentElement.dataset.theme = th; } catch (e) {}
  load();
  fromHash();
  draw();
  LIVE.ready.then(function () { redraw(); });
})();
