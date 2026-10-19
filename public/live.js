// ============================================================
// live.js — real writing, replacing the canned mock text
//
// engine.js still defines every bridge function, but its bodies
// pick from fixed lists. This file redefines the WRITING calls with
// the same names, arguments and return shapes, backed by a model:
//
//   1. inside a Claude artifact viewer: claude.use("sample")
//   2. on the Replit server:            POST /api/ai  (server.js)
//   3. neither available:               the old mock, and the app
//                                       says it is showing sample text
//
// Pictures, video and voice stay on their own services (see
// server.js /api/image for faces and places).
// ============================================================

var LIVE = { mode: null, ready: null, mock: {} };
// Which media services the server has keys for. Filled in at start.
var MEDIA = { server: false, video: false, voice: false, music: false };

// keep the canned versions for sample mode
["askForHelp", "riffStory", "riffPart", "generateCharacters", "generateLocations", "generateMusicOptions",
 "generateVoiceCasting", "planEpisodes", "generateSceneList", "generateSceneScript", "writeAct",
 "generateBibleDoc", "generateDeck", "generatePortrait", "updateSceneNode", "generateTrailer", "previewVoice"].forEach(function (n) { LIVE.mock[n] = window[n]; });

LIVE.ready = (async function () {
  if (window.claude && window.claude.use) {
    try {
      var s = await window.claude.use("sample");
      if (s) { LIVE.sample = s; LIVE.mode = "claude"; return LIVE.mode; }
    } catch (e) {}
  }
  try {
    var r = await fetch("/api/ai/status");
    if (r.ok) {
      var j = await r.json();
      MEDIA.server = true; MEDIA.video = !!j.video; MEDIA.voice = !!j.voice; MEDIA.music = !!j.music;
      if (j && j.ok) { LIVE.mode = "server"; LIVE.images = !!j.images; return LIVE.mode; }
    }
  } catch (e) {}
  LIVE.mode = "sample";
  return LIVE.mode;
})();

function LiveError(message) { var e = new Error(message); e.userMessage = message; return e; }

// One JSON answer from whichever writer is available.
async function ai(prompt, tier) {
  await LIVE.ready;
  if (LIVE.mode === "claude") {
    try {
      return await LIVE.sample.json(prompt, { modelTier: tier || "default", cache: false });
    } catch (e) {
      var code = e && e.code;
      if (code === "not_granted" || code === "sampling_disabled") throw LiveError("ShowTime needs your OK to write with Claude. Allow it when asked, or reload the page to be asked again.");
      if (code === "rate_limited") throw LiveError("Too many requests at once. Wait a minute and try again.");
      if (code === "invalid_json") throw LiveError("The answer came back in the wrong shape. Try again.");
      if (code === "refused") throw LiveError("The writer wouldn't write that. Try changing the wording.");
      throw LiveError("The writer couldn't be reached. Try again in a moment.");
    }
  }
  if (LIVE.mode === "server") {
    var r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: prompt, tier: tier || "default" }) });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) throw LiveError(j.error || "The writer couldn't be reached. Try again in a moment.");
    return j.data;
  }
  return null;
}

// ---------- the brief every prompt carries ----------
function brief(payload) {
  var c = (payload && payload.context) || {};
  var s = c.story || {};
  var out = {
    title: c.title || "",
    format: c.format ? { type: c.format.type, runtimeMinutes: c.format.runtimeMinutes, episodes: c.format.episodes } : null,
    logline: s.logline || "",
    genres: s.genres || [], tones: s.tones || [],
    spine: (s.spine || []).map(function (l) { return l.prompt + " " + l.text; }),
    shortForm: s.shortForm || null,
    acts: ((s.structure && s.structure.acts) || []).map(function (a) { return { act: a.act, prose: a.prose || (a.beats || []).map(function (b) { return b.text; }).join(" ") }; }),
    episodes: (s.episodes || []).map(function (e) {
      return { number: e.number, title: e.title, premise: e.premise, handsOn: e.carriesOver || undefined,
        acts: (e.acts || []).map(function (a) { return a.prose || ""; }).filter(Boolean) };
    }),
    characters: (c.characters || []).map(function (x) { return { id: x.id, name: x.name, role: x.role, look: x.physicalDescription || x.look || "", arc: x.arc || "" }; }),
    locations: (c.locations || []).map(function (l) { return { id: l.id, name: l.name, atmosphere: l.atmosphere || "" }; }),
    look: c.visual ? { style: c.visual.style } : null,
    creatorRules: c.creatorRules || c.notes || []
  };
  return JSON.stringify(out, null, 1).slice(0, 60000);
}

var HOUSE = [
  "You are the Co-Producer inside ShowTime, an app where people develop a film or series.",
  "Write like a working TV writer: concrete, specific to THIS story, no generic filler, no clichés like 'nothing will ever be the same'.",
  "Use the names, places and details the creator has already given. Never contradict them.",
  "Stay grounded and literal. People want things, something real stands in their way, and there are consequences you can picture on screen.",
  "Never turn a metaphor into a literal object or event (no bottled feelings, stored grudges, memories in jars, talking emotions). No magic, surreal or supernatural elements unless the creator's idea or chosen genre is fantasy, sci-fi or horror, and even then use one clear element with simple rules.",
  "Plain words. If a sentence needs rereading to understand, rewrite it.",
  "All characters are adults unless the creator's own material says otherwise.",
  "Reply with only the JSON described. No commentary."
].join("\n");

function pickN(list, n) { var a = list.slice(), out = []; while (a.length && out.length < n) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); return out; }
// Grounded genres for ideas. Fantasy, sci-fi and horror come up now and then, never all at once.
var IDEA_GENRES = ["Crime drama", "Family drama", "Thriller", "Comedy", "Workplace drama", "Mystery", "Romance", "Sports drama", "Legal drama", "Coming-of-age", "Dark comedy", "Heist", "Political drama", "Medical drama", "Action"];
var IDEA_GENRES_HIGH = ["Sci-fi", "Horror", "Fantasy"];
var SPARKS = ["a workplace", "a family business", "a small town", "a big city at night", "the near future", "the 1970s", "a sports team", "a hospital", "a church", "a courtroom", "a kitchen", "a music scene", "a border town", "an island", "a reality TV set", "a startup", "a prison", "a wedding", "a heist crew", "a school reunion", "a road trip", "a funeral home", "a radio station", "a dating app", "a political campaign", "a boxing gym", "a cruise ship", "a hotel", "a salon", "a record label"];
var seenIdeas = [];

// ---------- help: ideas and directions ----------
window.askForHelp = async function (payload, target) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.askForHelp(payload, target);
  var c = payload.context || {};
  var blank = !((c.story && c.story.logline) || (c.characters || []).length);
  var shape = '{"nudge": string, "examples": [{"label": string (2-4 words), "text": string (one or two sentences)}] (exactly 3), "tip": string}';
  var prompt;
  if (blank) {
    var genres = pickN(IDEA_GENRES, 3);
    if (Math.random() < 0.25) genres[2] = pickN(IDEA_GENRES_HIGH, 1)[0];
    var worlds = pickN(SPARKS, 3);
    prompt = HOUSE + "\n\nThe creator is starting a brand new show and asked for ideas." +
      (target.partial ? "\nThey have typed this so far, so build on it: " + JSON.stringify(target.partial) : "") +
      "\nGive three completely different, original premises for a " + ({ short: "short (a few minutes: one person, one moment, one turn)", film: "feature film (one story, start to finish)", series: "TV series (a premise that keeps producing episodes: a world, a recurring situation, and a season-long problem)" }[target.format] || "show") + "." +
      "\nEach idea is a clear logline someone could pitch in a room and get understood the first time, like the premise of a real, produced show or film." +
      "\nWrite each as one sentence under 35 words in this shape: when [something specific happens], [a specific person: job or situation, not a name] must [a concrete goal] or [what they lose]." +
      "\nThe hook comes from the situation, the stakes and the person, not from a gimmick. Everything in it must be something a camera could film." +
      "\nIdea 1 is a " + genres[0] + ", idea 2 a " + genres[1] + ", idea 3 a " + genres[2] + ". Settings to draw on, if they fit: " + worlds.join(", ") + "." +
      "\nlabel is the genre plus two or three words about the idea." +
      (seenIdeas.length ? "\nDo not repeat or resemble any of these earlier ideas: " + JSON.stringify(seenIdeas.slice(-12)) : "") +
      '\n"nudge" is one short line to the creator. "tip" is one short line of advice.\nJSON shape: ' + shape;
  } else {
    var what = target.kind === "spine" ? "the story line \"" + ((SPINE_STEPS.find(function (s) { return s.key === target.key; }) || {}).label || target.key) + "\""
      : target.kind === "short" ? "the " + target.key + " of this short"
      : "the " + (target.key || "story");
    prompt = HOUSE + "\n\nThe creator is stuck on " + what + " and asked for ideas." +
      (target.current ? "\nWhat it says now: " + JSON.stringify(target.current) : "") +
      "\nGive three different directions for it, each written as the actual replacement text, built from this show's own characters, places and events." +
      "\n\nThe show so far:\n" + brief(payload) + "\n\nJSON shape: " + shape;
  }
  var out = await ai(prompt, blank ? "quick" : "default");
  if (!out || !Array.isArray(out.examples)) throw LiveError("The ideas came back empty. Try again.");
  out.examples = out.examples.filter(function (x) { return x && x.text; }).slice(0, 3);
  if (blank) out.examples.forEach(function (x) { seenIdeas.push(x.text); });
  return out;
};

// How big the generated world is, by format. A short needs a handful of
// people; a series needs a full ensemble with recurring and minor roles.
var CAST_SIZE = {
  short: { text: "2 to 4 people. A short has room for very few: one lead, and only who the moment needs.", places: "1 to 3" },
  film: { text: "8 to 12 people: one Lead, one Antagonist, 3 to 5 Supporting characters with their own wants, and the rest Minor roles who matter in one or two scenes.", places: "5 to 8" },
  series: { text: "12 to 18 people: a main ensemble (one Lead, an Antagonist, and 3 to 5 Supporting characters who could each carry an episode), 4 to 6 recurring characters who keep coming back, and a few Minor roles. A series has to be able to keep generating stories, so the cast needs relationships, rivalries and loyalties to pull on.", places: "6 to 10" }
};

// ---------- one sentence in, a whole first draft out ----------
window.riffStory = async function (payload, idea, format) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.riffStory(payload, idea, format);
  var f = formatById(format) || {};
  var eps = payload.task && payload.task.episodes;
  var prompt = HOUSE + "\n\nThe creator's idea: " + JSON.stringify(idea) +
    "\nFormat: " + f.name + (format === "series" ? " (" + (eps || 6) + " episodes, this draft covers the season)" : "") + ", about " + f.defaultRuntime + " minutes" + (format === "series" ? " an episode" : "") + "." +
    "\n\nWrite a first draft of the whole show from that idea. Everything must come from the idea: its people, its world, its problem. Invent names and specifics that fit it." +
    "\n- title: a strong, short show title (not a sentence)." +
    "\n- logline: one sentence pitch built from their idea." +
    "\n- spine: the Pixar story spine, each a full sentence that starts with its prompt: once (\"Once upon a time...\"), everyDay (\"Every day...\"), untilOneDay (\"Until one day...\"), becauseA, becauseB, becauseC (each \"Because of that...\"), untilFinally (\"Until finally...\"), eversince (\"Ever since that day...\")." +
    "\n- shortForm: hook, story, twist (one or two sentences each), as if it were a short." +
    (format === "series" ? "\nThis is a series, so the spine and acts describe the WHOLE SEASON's arc: where the season starts, how it escalates across episodes, and where it lands. Individual episodes are written separately." : "") +
    "\n- acts: \"1\", \"2\", \"3\" — " + (format === "short" ? "the hook, the story and the twist" : format === "series" ? "how the season begins, its middle, and how it ends" : "beginning, middle and end") + ", each a vivid paragraph of 80-130 words in present tense, naming characters and places." +
    "\n- characters: " + CAST_SIZE[format].text + " Build the cast the story actually needs: the people the lead loves, works with, answers to and is opposed by, and the people who keep the world running. Every one must have a reason to be there that comes from the story. For each: name, role (Lead | Antagonist | Supporting | Minor), look (age, build, clothes, one memorable detail; one sentence), arc (one sentence: what they want and how they change or what they cost someone)." +
    "\n- places: " + CAST_SIZE[format].places + " locations the story actually uses, including the ones it keeps coming back to: name (short), atmosphere (light, sound, texture; one sentence)." +
    '\n\nJSON shape: {"title": string, "logline": string, "genres": [string], "tones": [string], "spine": {"once": string, "everyDay": string, "untilOneDay": string, "becauseA": string, "becauseB": string, "becauseC": string, "untilFinally": string, "eversince": string}, "shortForm": {"hook": string, "story": string, "twist": string}, "acts": {"1": string, "2": string, "3": string}, "characters": [{"name": string, "role": string, "look": string, "arc": string}], "places": [{"name": string, "atmosphere": string}]}' +
    "\ngenres pick from: " + GENRES.join(", ") + ". tones pick from: " + TONES.join(", ") + ".";
  var o = await ai(prompt, "default");
  if (!o || !o.spine || !o.acts) throw LiveError("The draft came back incomplete. Try again.");
  var now = Date.now();
  var lead = (o.characters || []).find(function (x) { return x.role === "Lead"; }) || (o.characters || [])[0] || {};
  return {
    title: o.title || "Untitled show",
    logline: o.logline || idea,
    genres: (o.genres || []).filter(function (g) { return GENRES.indexOf(g) !== -1; }),
    tones: (o.tones || []).filter(function (t) { return TONES.indexOf(t) !== -1; }),
    world: { live: true, idea: idea, leadName: lead.name || "", engine: "live" },
    spine: o.spine,
    shortForm: o.shortForm || { hook: "", story: "", twist: "" },
    acts: { 1: o.acts["1"] || o.acts[1] || "", 2: o.acts["2"] || o.acts[2] || "", 3: o.acts["3"] || o.acts[3] || "" },
    characters: (o.characters || []).slice(0, 24).map(function (x, i) {
      return { id: "c" + (now + i), name: x.name, role: ["Lead", "Supporting", "Antagonist", "Minor", "Narrator"].indexOf(x.role) !== -1 ? x.role : "Supporting", look: x.look || "", arc: x.arc || "", tags: [], avatar: "", looks: [] };
    }),
    worlds: (o.places || []).slice(0, 12).map(function (x, i) {
      return { id: "w" + (now + 90 + i), name: x.name, atmosphere: x.atmosphere || "", thumbnail: "" };
    })
  };
};

// ---------- rewrite one block ----------
window.riffPart = async function (payload, part, key, seed, world) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.riffPart(payload, part, key, seed, world);
  if (part === "spine" || part === "short") {
    var label = part === "spine" ? (SPINE_STEPS.find(function (s) { return s.key === key; }) || {}).label : key;
    var o = await ai(HOUSE + "\n\nRewrite one line of this show's story: \"" + label + "\". It currently says: " + JSON.stringify(seed || "") +
      "\nWrite a genuinely different take that still fits every other line of the story and its characters." + (part === "spine" ? " Start it with \"" + label.replace(/…$/, "") + "\"." : "") +
      " One or two sentences.\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"text": string}', "default");
    return { text: (o && o.text) || seed };
  }
  if (part === "character") {
    var o2 = await ai(HOUSE + "\n\nThe creator wants to replace the character currently called " + JSON.stringify(seed) + " with someone new who serves the same place in the story but is a different person." +
      "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"name": string, "role": "Lead"|"Supporting"|"Antagonist"|"Minor", "look": string, "arc": string}', "default");
    return { character: { id: "c" + Date.now(), name: o2.name, role: o2.role || "Supporting", look: o2.look || "", arc: o2.arc || "", tags: [], avatar: "", looks: [] } };
  }
  return LIVE.mock.riffPart(payload, part, key, seed, world);
};

// Rewrite the three parts after the line-by-line changes.
async function rewriteActsLive(payload, short, keep) {
  var o = await ai(HOUSE + "\n\nThe creator changed the outline of their story. Rewrite the three parts so they match the outline exactly" +
    (short ? " (hook, story, twist)" : " (beginning, middle, end)") + ". Each is a vivid paragraph of 80-130 words in present tense." +
    (keep.length ? " Parts " + keep.join(", ") + " were written by the creator: return them unchanged." : "") +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"1": string, "2": string, "3": string}', "default");
  return o;
}

// ---------- cast and places ----------
window.generateCharacters = async function (payload, count) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateCharacters(payload, count);
  var o = await ai(HOUSE + "\n\nSuggest " + (count || 4) + " new people this story needs and doesn't have yet. Each with a reason tied to this story." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"proposals": [{"name": string, "role": "Supporting"|"Antagonist"|"Minor", "look": string, "arc": string, "why": string}]}', "default");
  return { proposals: (o.proposals || []).map(function (x, i) { x.id = "px" + Date.now() + "_" + i; x.avatar = ""; return x; }) };
};
window.generateLocations = async function (payload, count) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateLocations(payload, count);
  var o = await ai(HOUSE + "\n\nSuggest " + (count || 4) + " new places this story would use and doesn't have yet. Each with a reason tied to a moment in this story." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"proposals": [{"name": string, "atmosphere": string, "why": string}]}', "default");
  return { proposals: (o.proposals || []).map(function (x, i) { x.id = "pw" + Date.now() + "_" + i; x.thumbnail = ""; return x; }) };
};

// ---------- sound ----------
window.generateMusicOptions = async function (payload) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateMusicOptions(payload);
  var o = await ai(HOUSE + "\n\nPropose three clearly different directions for this show's score, each with a reason tied to this story." +
    "\nUse only these values. genres: " + MUSIC_GENRES.join(", ") + ". moods: " + MUSIC_MOODS.join(", ") + ". instruments: " + INSTRUMENTS.join(", ") + ". tempo is beats per minute between 50 and 160." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"options": [{"name": string (2-4 words), "genres": [string], "moods": [string], "tempo": number, "instruments": [string], "why": string}]}', "quick");
  var ok = function (list, pool) { return (list || []).filter(function (x) { return pool.indexOf(x) !== -1; }); };
  return { options: (o.options || []).slice(0, 3).map(function (x, i) {
    return { id: "m" + (i + 1), name: x.name, genres: ok(x.genres, MUSIC_GENRES), moods: ok(x.moods, MUSIC_MOODS), instruments: ok(x.instruments, INSTRUMENTS), tempo: Math.max(50, Math.min(160, +x.tempo || 90)), why: x.why };
  }) };
};
window.generateVoiceCasting = async function (payload) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateVoiceCasting(payload);
  var o = await ai(HOUSE + "\n\nCast a voice for every character so they sound different from each other. Voices available: " +
    JSON.stringify(VOICE_LIBRARY) + ". Accents: " + ACCENTS.join(", ") + ". Paces: " + PACES.join(", ") + ". Also pick a narrator." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"casting": [{"characterId": string, "voiceId": string, "accent": string, "pace": string, "why": string}], "narrator": {"voiceId": string, "accent": string, "pace": string}}', "quick");
  var ids = VOICE_LIBRARY.map(function (v) { return v.id; });
  var chars = (payload.context.characters || []);
  return {
    casting: (o.casting || []).filter(function (x) { return ids.indexOf(x.voiceId) !== -1 && chars.some(function (c) { return c.id === x.characterId; }); }).map(function (x) {
      var c = chars.find(function (y) { return y.id === x.characterId; }); var v = VOICE_LIBRARY.find(function (y) { return y.id === x.voiceId; });
      return { characterId: x.characterId, characterName: c.name, voiceId: x.voiceId, voiceName: v.name, accent: ACCENTS.indexOf(x.accent) !== -1 ? x.accent : "Neutral American", pace: PACES.indexOf(x.pace) !== -1 ? x.pace : "Natural", why: x.why };
    }),
    narrator: o.narrator && ids.indexOf(o.narrator.voiceId) !== -1 ? o.narrator : { voiceId: "v3", accent: "Neutral American", pace: "Slow" }
  };
};

// ---------- season, scenes, pages ----------
window.planEpisodes = async function (payload, count, serialized) {
  await LIVE.ready;
  if (LIVE.mode === "sample") {
    var m = await LIVE.mock.planEpisodes(payload, count, serialized);
    m.episodes.forEach(function (e) {
      e.acts = { 1: "Sample act one for \u201C" + e.title + "\u201D: the episode's problem arrives.", 2: "Sample act two: it gets harder, and the season's trouble shows through.", 3: "Sample act three: this episode's problem is settled, and something is handed to the next one." };
    });
    return m;
  }
  var o = await ai(HOUSE + "\n\nWrite the season: " + count + " episodes that together tell the season's story (the outline and season acts below), in order." +
    "\nEvery episode is its own complete film in three acts, while moving the season forward:" +
    "\n- act 1 (beginning): set up this episode's own problem and end on its inciting incident." +
    "\n- act 2 (middle): complications, a midpoint turn, and things getting worse; the season's larger trouble shows through." +
    "\n- act 3 (end): the episode's climax and resolution of ITS problem" + (serialized ? ", then a closing beat that hands something to the next episode (the finale resolves the season)." : ".") +
    "\nEach act is a vivid paragraph of 45-80 words in present tense, naming characters and places. Give each episode a real title (not 'Episode N') and a one-sentence logline." +
    "\n\nThe show:\n" + brief(payload) +
    '\n\nJSON shape: {"episodes": [{"number": number, "title": string, "premise": string (one-sentence logline), "acts": {"1": string, "2": string, "3": string}' + (serialized ? ', "carriesOver": string' : "") + "}]}", "default");
  return { episodes: (o.episodes || []).slice(0, count).map(function (e, i) {
    var a = e.acts || {};
    return { number: i + 1, title: e.title, premise: e.premise, acts: { 1: a["1"] || a[1] || "", 2: a["2"] || a[2] || "", 3: a["3"] || a[3] || "" }, carriesOver: serialized ? (e.carriesOver || "") : null };
  }) };
};

window.generateSceneList = async function (payload) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateSceneList(payload);
  var c = payload.context;
  var depth = (payload.task && payload.task.depth) || "guided";
  var n = depth === "fast" ? 6 : depth === "deep" ? 14 : 9;
  var epNo = payload.task && payload.task.episode;
  var epRec = epNo && (c.story.episodes || []).find(function (e) { return e.number === epNo; });
  var o = await ai(HOUSE + "\n\nBreak " + (epRec ? "EPISODE " + epNo + " (\"" + epRec.title + "\") only" : "this story") + " into about " + n + " shootable scenes, in order, spread across its three acts (act 1, 2, 3)." +
    (epRec ? "\nThis episode's three acts: " + JSON.stringify((epRec.acts || []).map(function (a) { return a.prose; })) + ". Its scenes must cover exactly these, not other episodes." : "") +
    "\nFor each: act (1-3), heading (screenplay slugline, e.g. INT. BACK OFFICE — NIGHT, using one of the locations), summary (what happens, 1-2 specific sentences), world (the id of the location), characters (ids of who is in it), line (one spoken line for the first character, in their voice, or empty)." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"scenes": [{"act": number, "heading": string, "summary": string, "world": string, "characters": [string], "line": string}]}', "default");
  var locIds = (c.locations || []).map(function (l) { return l.id; });
  var chIds = (c.characters || []).map(function (x) { return x.id; });
  return { scenes: (o.scenes || []).map(function (s, i) {
    return { id: "sc" + (Date.now() + i), act: [1, 2, 3].indexOf(+s.act) !== -1 ? +s.act : 1, beatRole: "", heading: s.heading || "",
      summary: s.summary || "", world: locIds.indexOf(s.world) !== -1 ? s.world : (locIds[i % (locIds.length || 1)] || null),
      characters: (s.characters || []).filter(function (id) { return chIds.indexOf(id) !== -1; }), line: s.line || "" };
  }) };
};

window.generateSceneScript = async function (payload, scene, index) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateSceneScript(payload, scene, index);
  var o = await ai(HOUSE + "\n\nWrite this one scene as a screenplay page in Fountain format (slugline, action, CHARACTER cues, dialogue). About 1 page. Keep any spoken line the creator wrote, word for word." +
    "\nThe scene: " + JSON.stringify({ heading: scene.heading, whatHappens: scene.prompt, where: scene.world, who: scene.characters, shot: scene.shot, line: scene.line }) +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"script": string}', "default");
  return { script: o.script || "", format: "fountain" };
};

window.writeAct = async function (payload, act, beats) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.writeAct(payload, act, beats);
  var o = await ai(HOUSE + "\n\nWrite act " + act + " of this story as one vivid paragraph of 80-130 words in present tense." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"prose": string}', "default");
  return { act: act, prose: o.prose || "" };
};

// ---------- pitch pack ----------
window.generateBibleDoc = async function (payload, docId) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateBibleDoc(payload, docId);
  var d = BIBLE_DOCS.find(function (x) { return x.id === docId; }) || { name: docId, note: "" };
  var o = await ai(HOUSE + "\n\nWrite the \"" + d.name + "\" for this show's pitch pack: " + d.note + " Plain text with short headings in capitals. Persuasive but honest; don't invent comparables or numbers." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"body": string}', "default");
  var body = o.body || "";
  return { docId: docId, body: body, pages: Math.max(1, Math.round(body.length / 2600)) };
};
window.generateDeck = async function (payload) {
  await LIVE.ready;
  if (LIVE.mode === "sample") return LIVE.mock.generateDeck(payload);
  var o = await ai(HOUSE + "\n\nWrite a pitch deck for this show, one entry per slide: " + JSON.stringify(DECK_SLIDES.map(function (s) { return { id: s.id, name: s.name, hint: s.hint }; })) +
    ". Each slide gets a headline (short) and body (2-4 sentences)." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"slides": [{"id": string, "headline": string, "body": string}]}', "default");
  return { slides: DECK_SLIDES.map(function (sl) {
    var m = (o.slides || []).find(function (x) { return x.id === sl.id; }) || {};
    return { id: sl.id, name: sl.name, headline: m.headline || sl.name, body: m.body || "", plate: [1920, 1080] };
  }) };
};

// ---------- faces and places (server only) ----------
window.generatePortrait = async function (payload, kind, subject) {
  await LIVE.ready;
  if (LIVE.mode !== "server" || !LIVE.images) return LIVE.mock.generatePortrait(payload, kind, subject);
  var r = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: kind, subject: { name: subject.name, look: subject.look || subject.atmosphere || "", role: subject.role || "" }, look: payload.context.visual, title: payload.context.title }) });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw LiveError(j.error || "The picture couldn't be made. Try again.");
  return { url: j.url };
};

// ---------- ShowPage copy: tagline, quotes, a look if none was picked ----------
window.generateShowPageCopy = async function (payload) {
  await LIVE.ready;
  var c = payload.context;
  if (LIVE.mode === "sample") {
    return { tagline: (c.story.logline || c.title).split(/[,.]/)[0] + ".", quotes: (c.characters || []).map(function (x) { return { id: x.id, quote: "I didn't come this far to stop now." }; }),
      look: { style: VISUAL_STYLES[0], palette: "cold", camera: [] } };
  }
  var o = await ai(HOUSE + "\n\nWrite the copy for this show's ShowPage, the page that presents it to the world." +
    "\n- tagline: a short poster line, 3 to 8 words, that sells the show's tension. Not the title, not a summary." +
    "\n- quotes: one line each character would actually say, in their voice, under 14 words, no quotation marks." +
    "\n- look: if the show has no look yet, the visual style and colour palette that suit it best. style from: " + VISUAL_STYLES.join(", ") + ". palette id from: " + PALETTES.map(function (x) { return x.id + " (" + x.name + ")"; }).join(", ") + "." +
    "\n\nThe show:\n" + brief(payload) + '\n\nJSON shape: {"tagline": string, "quotes": [{"id": string, "quote": string}], "look": {"style": string, "palette": string}}', "default");
  if (o.look) {
    if (VISUAL_STYLES.indexOf(o.look.style) === -1) o.look.style = VISUAL_STYLES[0];
    if (!paletteById(o.look.palette)) o.look.palette = "cold";
  }
  return o;
};

// ---------- video: Kling and Seedance through the server ----------
// The server adds "no music, only sound effects and dialogue" to every
// video prompt, so the score can be laid in separately.
function absUrl(u) { if (!u || /^data:|placehold\.co/.test(u)) return null; return /^https?:/.test(u) ? u : location.origin + u; }
async function runVideo(body) {
  var r = await fetch("/api/video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw LiveError(j.error || "The video couldn't be started. Try again.");
  for (var i = 0; i < 180; i++) {
    await new Promise(function (res) { setTimeout(res, 5000); });
    var s = await fetch("/api/video/" + encodeURIComponent(j.id) + "?model=" + encodeURIComponent(j.model)).then(function (x) { return x.json(); }).catch(function () { return {}; });
    if (s.status === "done") return s.url;
    if (s.status === "failed") throw LiveError(s.error || "The video couldn't be made. Try again.");
  }
  throw LiveError("The video is taking too long. Try again later.");
}
function lookLine(c) {
  var v = c.visual || {};
  return [v.style && "Style: " + v.style + ".", v.palette && v.palette.hex && "Colour palette: " + v.palette.hex.join(", ") + "."].filter(Boolean).join(" ");
}
window.updateSceneNode = async function (payload) {
  await LIVE.ready;
  if (!MEDIA.video) return LIVE.mock.updateSceneNode(payload);
  var c = payload.context, pt = (payload.task && payload.task.patch) || {};
  var who = (c.characters || []).filter(function (x) { return (pt.characters || []).indexOf(x.id) !== -1; });
  var where = (c.locations || []).find(function (l) { return l.id === pt.world; });
  var speaker = who[0];
  var prompt = [(pt.shot || "Medium") + " shot" + (where ? " in " + where.name + " (" + (where.atmosphere || "") + ")" : "") + ".",
    pt.move ? "Camera movement: " + pt.move + "." : "",
    who.map(function (x) { return x.name + ": " + (x.physicalDescription || ""); }).join(" "),
    pt.prompt || "",
    pt.line && speaker ? speaker.name + " says: \"" + pt.line + "\"" : "",
    lookLine(c)].filter(Boolean).join(" ");
  var image = speaker ? absUrl(speaker.referenceImage || speaker.avatar) : null;
  var url = await runVideo({ prompt: prompt, image: image, duration: 5, aspect: (c.format && c.format.aspectRatio) || "16:9" });
  return { success: true, status: "rendered", videoUrl: url };
};
window.generateTrailer = async function (payload) {
  await LIVE.ready;
  if (!MEDIA.video) return LIVE.mock.generateTrailer(payload);
  var c = payload.context, t = payload.task || {};
  var prompt = "Cinematic trailer for the show \"" + c.title + "\". " + (c.story.logline || "") + " Cut style: " + (t.vibe || "slow burn") + ". " +
    (c.characters || []).slice(0, 3).map(function (x) { return x.name + ": " + (x.physicalDescription || ""); }).join(" ") + " " + lookLine(c);
  var url = await runVideo({ prompt: prompt, duration: 10, aspect: (c.format && c.format.aspectRatio) || "16:9" });
  return { success: true, status: "ready", videoUrl: url };
};

// ---------- voices: ElevenLabs ----------
window.previewVoice = async function (voiceId, line) {
  await LIVE.ready;
  if (!MEDIA.voice) return LIVE.mock.previewVoice(voiceId, line);
  var r = await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voice: voiceId, text: line || "This is how I sound. Every line I say in your show will sound like this." }) });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw LiveError(j.error || "The voice couldn't be made. Try again.");
  return { success: true, audioUrl: j.url };
};

// ---------- music: ElevenLabs Music (or Suno, once you have access) ----------
window.generateScore = async function (payload) {
  await LIVE.ready;
  if (!MEDIA.music) throw LiveError("Music needs a music service. Add ELEVENLABS_API_KEY on the server.");
  var c = payload.context, m = (c.audio && c.audio.music) || {};
  var prompt = "Instrumental main theme for the " + ((c.format && c.format.type) || "show") + " \"" + c.title + "\". " + (c.story.logline || "") +
    " Genre: " + (m.genres || []).join(", ") + ". Mood: " + (m.moods || []).join(", ") + ". Tempo about " + (m.tempo || 90) + " BPM. Instruments: " + (m.instruments || []).join(", ") + ".";
  var r = await fetch("/api/music", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: prompt, seconds: 60 }) });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw LiveError(j.error || "The music couldn't be made. Try again.");
  return { url: j.url };
};

// ---------- uploads ----------
window.uploadTrack = async function (file) {
  await LIVE.ready;
  if (MEDIA.server) {
    var r = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream", "X-Filename": encodeURIComponent(file.name) }, body: file });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) throw LiveError(j.error || "The upload didn't go through. Try again.");
    return { url: j.url, lasting: true, duration: j.duration || 0, poster: j.poster || null };
  }
  return { url: URL.createObjectURL(file), lasting: false };
};

// ---------- the Edit room: Claude makes the cut ----------
// materials: [{ ref, kind: "video"|"still"|"music"|"audio", duration, label, desc }]
// opts: { length, vibe, notes, previous, title, tagline, logline }
// Returns a cut: { items: [{type:"clip", ref, in, out, fade} | {type:"title", text, dur}], music: {ref, start} | null, audio: [{ref, at}], why }
window.planCut = async function (payload, materials, opts) {
  await LIVE.ready;
  var target = parseInt(opts.length, 10) || 60;
  var pics = materials.filter(function (m) { return m.kind === "video" || m.kind === "still"; });
  var music = materials.filter(function (m) { return m.kind === "music"; });
  var sounds = materials.filter(function (m) { return m.kind === "audio"; });
  if (LIVE.mode === "sample") {
    var items = [{ type: "title", text: opts.title, dur: 2 }], t = 2;
    pics.slice(0, Math.max(3, Math.floor((target - 6) / 3))).forEach(function (m, i) {
      var d = Math.min(3, m.duration || 3); items.push({ type: "clip", ref: m.ref, in: 0, out: d, fade: i === 0 }); t += d;
    });
    if (opts.tagline) items.push({ type: "title", text: opts.tagline, dur: 2 });
    items.push({ type: "title", text: opts.title, dur: 2.5 });
    return { items: items, music: music[0] ? { ref: music[0].ref, start: 0 } : null, audio: [], why: "A sample cut: open on the title, run the strongest pictures in story order, end on the tagline and the title." };
  }
  var prompt = HOUSE + "\n\nYou are the trailer editor for \"" + opts.title + "\". Cut a trailer of about " + target + " seconds. Style: " + (opts.vibe || "slow burn") + "." +
    "\nPitch: " + (opts.logline || "") + (opts.tagline ? "\nTagline: " + opts.tagline : "") +
    "\n\nYour material (use only these refs; in and out are seconds inside each clip and must stay within its length):\n" +
    JSON.stringify(pics.map(function (m) { return { ref: m.ref, kind: m.kind, length: Math.round((m.duration || 5) * 10) / 10, what: m.desc || m.label }; })) +
    (music.length ? "\nMusic you can lay under the whole cut:\n" + JSON.stringify(music.map(function (m) { return { ref: m.ref, length: Math.round(m.duration || 60), what: m.label }; })) : "\nThere is no music yet.") +
    (sounds.length ? "\nSound clips you can place at a time in the cut:\n" + JSON.stringify(sounds.map(function (m) { return { ref: m.ref, length: Math.round((m.duration || 2) * 10) / 10, what: m.label }; })) : "") +
    "\n\nHow to cut it, like a professional trailer editor:" +
    "\n- Open strong: a striking image or a line in the first three seconds. Title cards are short (1.5 to 3 seconds) and use few words." +
    "\n- Build in three movements: set up the world, show the trouble, then speed up the cutting toward the end." +
    "\n- Shots are usually 1.5 to 4 seconds; let one or two important moments run longer. Pick the best part of each clip with in and out." +
    "\n- Don't reveal the ending. End on the title card, then nothing." +
    "\n- Stills are fine; they get a slow push-in." +
    (opts.previous ? "\n\nThis is a recut. The previous cut was:\n" + JSON.stringify(opts.previous) + (opts.notes ? "\nThe creator's notes on it, which you must follow: " + JSON.stringify(opts.notes) : "") : (opts.notes ? "\nThe creator's notes: " + JSON.stringify(opts.notes) : "")) +
    '\n\nJSON shape: {"items": [{"type": "clip", "ref": string, "in": number, "out": number, "fade": boolean} or {"type": "title", "text": string, "dur": number}], "music": {"ref": string, "start": number} or null, "audio": [{"ref": string, "at": number}], "why": string (two sentences on the choices, to the creator)}';
  var o = await ai(prompt, "default");
  var byRef = {}; materials.forEach(function (m) { byRef[m.ref] = m; });
  var clean = (o.items || []).map(function (it) {
    if (it.type === "title") return { type: "title", text: String(it.text || "").slice(0, 60), dur: Math.max(1, Math.min(5, +it.dur || 2)) };
    var m = byRef[it.ref]; if (!m || (m.kind !== "video" && m.kind !== "still")) return null;
    var len = m.duration || 5, a = Math.max(0, Math.min(len - 0.5, +it.in || 0)), b = Math.max(a + 0.5, Math.min(len, +it.out || a + 3));
    return { type: "clip", ref: it.ref, in: Math.round(a * 10) / 10, out: Math.round(b * 10) / 10, fade: !!it.fade };
  }).filter(Boolean);
  if (!clean.length) throw LiveError("The cut came back empty. Try again.");
  return {
    items: clean,
    music: o.music && byRef[o.music.ref] && byRef[o.music.ref].kind === "music" ? { ref: o.music.ref, start: Math.max(0, +o.music.start || 0) } : (music[0] ? { ref: music[0].ref, start: 0 } : null),
    audio: (o.audio || []).filter(function (a) { return byRef[a.ref] && byRef[a.ref].kind === "audio"; }).map(function (a) { return { ref: a.ref, at: Math.max(0, +a.at || 0) }; }),
    why: o.why || ""
  };
};

// Render a resolved timeline to one MP4 on the server.
window.renderCut = async function (timeline, onProgress) {
  var r = await fetch("/api/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ timeline: timeline }) });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw LiveError(j.error || "The render couldn't start. Try again.");
  for (var i = 0; i < 720; i++) {
    await new Promise(function (res) { setTimeout(res, 2500); });
    var s = await fetch("/api/render/" + j.id).then(function (x) { return x.json(); }).catch(function () { return {}; });
    if (onProgress && s.status === "working") onProgress(s.progress || 0, s.message || "");
    if (s.status === "done") return s.url;
    if (s.status === "failed") throw LiveError(s.error || "The render failed. Try again.");
  }
  throw LiveError("The render is taking too long. Try again later.");
};
window.exportCut = async function (timeline, title) {
  var r = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ timeline: timeline, title: title }) });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok) throw LiveError(j.error || "The export couldn't be made. Try again.");
  return j.url;
};
