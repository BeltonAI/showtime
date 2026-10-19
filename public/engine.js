// ============================================================
// mockData.js — THE DATA CONTRACT
// One IP object holds every creative decision the user makes.
// prompt.js compiles it into the payload sent to the backend.
// Loaded as a plain script — no modules, no build step.
// ============================================================

const PLACEHOLDER_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

// ---- Story spine (Kenn Adams' story spine, as used at Pixar) ----
// Eight prompts. The creator fills them in order; nothing else in the
// app unlocks properly until they do, because every downstream expansion
// is generated from these sentences.
// ---- Short form: Hook / Story / Twist ----
// A nine minute short does not have three acts in it. Asking for eight spine
// sentences and a midpoint is how you get a short that feels like a trailer
// for something longer.
const SHORT_STEPS = [
  { key: "hook", label: "The hook", hint: "The first ten seconds. What makes someone not scroll past?" },
  { key: "story", label: "The story", hint: "What happens in the middle. One situation, played out." },
  { key: "twist", label: "The twist", hint: "The turn at the end that makes the whole thing worth watching." }
];

const SPINE_STEPS = [
  { key: "once", label: "Once upon a time…", hint: "Who is this about? What is their life like?" },
  { key: "everyDay", label: "Every day…", hint: "What do they always do? Describe a normal day." },
  { key: "untilOneDay", label: "Until one day…", hint: "Something happens that changes everything. What?" },
  { key: "becauseA", label: "Because of that…", hint: "What do they do about it?" },
  { key: "becauseB", label: "Because of that…", hint: "What goes wrong because of that?" },
  { key: "becauseC", label: "Because of that…", hint: "And then things get even harder. How?" },
  { key: "untilFinally", label: "Until finally…", hint: "The big moment. What do they face?" },
  { key: "eversince", label: "Ever since that day…", hint: "How is life different now?" }
];

// How each spine sentence lands in three-act structure.
const SPINE_TO_ACT = [
  { key: "once", act: 1, role: "Opening image" },
  { key: "everyDay", act: 1, role: "Setup" },
  { key: "untilOneDay", act: 1, role: "Inciting incident" },
  { key: "becauseA", act: 2, role: "Plot point one" },
  { key: "becauseB", act: 2, role: "Midpoint" },
  { key: "becauseC", act: 2, role: "Plot point two" },
  { key: "untilFinally", act: 3, role: "Climax" },
  { key: "eversince", act: 3, role: "Resolution" }
];

const BEAT_ROLES = [
  "Opening image", "Setup", "Inciting incident", "Plot point one", "Rising action",
  "Midpoint", "Complication", "Plot point two", "Crisis", "Climax", "Resolution", "Tag"
];

const ACT_NAMES = { 1: "Act one — setup", 2: "Act two — confrontation", 3: "Act three — resolution" };

// ---- Formats. The shape decision, made after the story exists. ----
const FORMATS = [
  { id: "short", name: "Short", note: "One sitting, one idea. 3–20 minutes.", defaultRuntime: 9, serial: false,
    lane: "Music videos, sketches, spots and vertical drops all live here." },
  { id: "film", name: "Film", note: "One arc, feature length. 70–120 minutes.", defaultRuntime: 100, serial: false,
    lane: "Documentaries and one-off specials run in this lane too." },
  { id: "series", name: "Series", note: "Recurring cast across episodes.", defaultRuntime: 24, serial: true,
    lane: "Podcasts, audio drama and vertical series are all series underneath." }
];

// which pillars matter for which format — audio skips visual style
const FORMAT_PILLARS = {};
const ALL_PILLARS = ["story", "characters", "visual", "voices", "music", "notes", "designs", "bible"];

const VISUAL_STYLES = [
  "Photoreal", "Cinematic sci-fi", "Neo-noir", "Anime", "Painterly",
  "Stop-motion", "Documentary", "Retro film stock", "Graphic novel", "Claymation"
];

const PALETTES = [
  { id: "neon", name: "Neon night", swatches: ["#0B1020", "#1B2A4A", "#E8317F", "#22D3EE", "#F5F3FF"] },
  { id: "warm", name: "Warm dust", swatches: ["#2B211A", "#6B4B33", "#C98B4B", "#E8D5B7", "#FFF8ED"] },
  { id: "cold", name: "Cold steel", swatches: ["#0E1417", "#26343B", "#5B7480", "#A9BCC4", "#E9F1F4"] },
  { id: "pastel", name: "Soft pastel", swatches: ["#3B3450", "#7C6BA0", "#C9A7D6", "#F3C9D8", "#FFF3F7"] },
  { id: "mono", name: "High contrast mono", swatches: ["#000000", "#2B2B2B", "#767676", "#C9C9C9", "#FFFFFF"] },
  { id: "verdant", name: "Verdant", swatches: ["#10201A", "#1F4034", "#3C7A5A", "#8FC0A3", "#EAF6EF"] }
];

const CAMERA_LOOKS = ["Handheld", "Locked off", "Slow dolly", "Anamorphic wide", "Long lens", "Drone", "Macro detail"];
const GENRES = ["Thriller", "Sci-fi", "Drama", "Comedy", "Horror", "Fantasy", "Romance", "Mystery", "Documentary", "Action"];
const TONES = ["Bleak", "Hopeful", "Wry", "Tense", "Warm", "Absurd", "Melancholy", "Playful", "Epic"];

const VOICE_LIBRARY = [
  { id: "v1", name: "Ash", quality: "Low, gravelled" },
  { id: "v2", name: "Wren", quality: "Bright, quick" },
  { id: "v3", name: "Halden", quality: "Warm, measured" },
  { id: "v4", name: "Juno", quality: "Cool, precise" },
  { id: "v5", name: "Bram", quality: "Rough, weary" },
  { id: "v6", name: "Sable", quality: "Smoky, low" }
];
const ACCENTS = ["Neutral American", "British RP", "Northern English", "Irish", "Scottish", "Australian", "Southern US", "New York", "French", "Japanese"];
const PACES = ["Slow", "Natural", "Clipped", "Urgent"];

const MUSIC_GENRES = ["Synthwave", "Orchestral", "Ambient", "Post-rock", "Jazz", "Industrial", "Folk", "Hip-hop", "Choral", "Minimal piano"];
const MUSIC_MOODS = ["Ominous", "Uplifting", "Wistful", "Driving", "Sparse", "Lush", "Unsettling", "Triumphant"];
const INSTRUMENTS = ["Analog synth", "Strings", "Solo piano", "Drum machine", "Brass", "Acoustic guitar", "Choir", "Taiko", "Cello", "Modular bleeps"];

// ---- Working styles. Same destination, different amount of asking. ----
// What each format needs, and why. Shown on the first question.
const FORMAT_PATHS = {
  short:  { steps: ["shortform", "script"], method: "Hook, story, twist",
            explain: "Three questions. Shorts live or die on the first ten seconds and the last five." },
  film:   { steps: ["spine", "structure", "script"], method: "Story spine, then three acts",
            explain: "One pass: eight sentences, opened out into three acts, then scenes." },
  series: { steps: ["spine", "episodes", "script"], method: "Season spine, then an episode at a time",
            explain: "A season spine first, then three acts inside every episode." }
};

const WORKFLOWS = [
  { id: "import", name: "I already have notes", note: "Upload or paste what you have. We pull the story out of it and you carry on from there.",
    steps: ["import", "structure", "shape", "script"] },
  { id: "instant", name: "Instant", note: "Pick who is in it, say what happens, set a length. We make every other call.",
    steps: ["instant"] },
  { id: "fast", name: "Fast path", note: "Spine, shape, one draft. The acts get written for you.",
    steps: ["spine", "shape", "script"] },
  { id: "guided", name: "Guided", note: "The full method, with a draft offered at every stage.",
    steps: ["spine", "structure", "shape", "script"] },
  { id: "deep", name: "Full craft", note: "Every stage, plus a story check you have to clear and a screenplay pass.",
    steps: ["spine", "structure", "shape", "script"] }
];

// Instant mode shot lengths. Video models are happiest around 5 seconds,
// so duration is really a shot count.
// ---- Co-Producer script ----
// Every step explains the craft idea before it asks for anything. The
// explanation is the product: most people have never been told what a
// story spine is, and asking them for one without saying is how you get
// an empty box and a closed tab.
const COPRO_STEPS = [
  {
    id: "leadName",
    ask: "Before anything else — what is your main character called?",
    placeholder: "Elena Reyes",
    title: "Your lead",
    what: "The person your story happens to. Just a name is fine — we will fill in the rest later.",
    why: "We will use their name from here on, and add them to your cast automatically."
  },
  {
    id: "logline",
    ask: "Give me one sentence. Who is this about, and what goes wrong?",
    placeholder: "A rain-soaked detective with a cybernetic arm hunts a ghost who only appears on dead television channels.",
    title: "The logline",
    what: "One sentence that says who your story is about, what they want, and what is stopping them.",
    why: "We use this everywhere. The clearer it is, the better everything else comes out."
  }
].concat(SPINE_STEPS.map(function (st, i) {
  return {
    id: st.key,
    spineKey: st.key,
    ask: st.label,
    placeholder: st.hint,
    title: st.label,
    what: st.hint,
    why: [
      "Whatever you say here is what the ending will change. Pick something that matters to them.",
      "This is the life the story is about to wreck, so make it feel like home.",
      "Make it something they cannot walk away from.",
      "This should be something they choose to do, not something done to them.",
      "Things should get harder because of what they just did.",
      "Take away their last easy option.",
      "Put them in front of the thing they have been avoiding.",
      "Do not tell us the lesson. Show us a normal day, changed."
    ][i]
  };
}));

const SHOT_SECONDS = 5;
const INSTANT_DURATIONS = [10, 15, 30, 60, 120];

const SCRIPT_JOBS = [
  { id: "sceneList", name: "Scene list", note: "Beats broken into shootable scenes with headings.", needs: null },
  { id: "dialogue", name: "Dialogue", note: "Spoken lines per scene, in your characters' voices.", needs: "sceneList" },
  { id: "screenplay", name: "Screenplay", note: "The whole thing in standard format, ready to read or export.", needs: "sceneList" }
];

// ---- Uploaded references ----
// One flat list. `scope` says what the file is attached to, which is what
// decides where the backend sends it.
//   visual            -> style conditioning on the image/video model
//   character:<id>    -> face/wardrobe consistency
//   world:<id>        -> location consistency
//   music             -> score conditioning
//   voice:<id>        -> voice cloning
const REFERENCE_ROUTES = {
  import: { label: "Imported material", to: "story extraction" },
  notes: { label: "Uploaded notes", to: "document parsing" },
  visual: { label: "Style reference", to: "image + video model" },
  character: { label: "Character reference", to: "face lock on every render" },
  world: { label: "Location reference", to: "location lock" },
  music: { label: "Reference track", to: "music model" },
  voice: { label: "Voice sample", to: "voice cloning" },
  design: { label: "Design reference", to: "image model" }
};

// How hard the model should hold to an image reference.
const REF_WEIGHTS = [
  { id: "loose", name: "Loose", note: "Take the mood only" },
  { id: "balanced", name: "Balanced", note: "Match composition and palette" },
  { id: "strict", name: "Strict", note: "Hold to it closely" }
];

// ---- Show bible ----
const BIBLE_DOCS = [
  { id: "onepager", name: "One-pager", note: "Logline, synopsis, tone and format on a single page.", plate: [1275, 1650] },
  { id: "deck", name: "Pitch deck", note: "The room version. Title, world, cast, look, why now.", plate: [1920, 1080] },
  { id: "bios", name: "Character bios", note: "A page per lead — look, arc, voice, relationships.", plate: [1275, 1650] },
  { id: "world", name: "World guide", note: "Rules, geography, era, what is normal here.", plate: [1275, 1650] },
  { id: "lookbook", name: "Look book", note: "Palette, camera language, reference plates.", plate: [1920, 1080] },
  { id: "episodes", name: "Episode outlines", note: "Beat breakdown per episode.", plate: [1275, 1650] },
  { id: "comps", name: "Comparables", note: "What it sits beside, and how it differs.", plate: [1275, 1650] }
];

const DECK_SLIDES = [
  { id: "title", name: "Title", hint: "Logo, logline, format" },
  { id: "premise", name: "Premise", hint: "The pitch in three lines" },
  { id: "world", name: "The world", hint: "Where and when, and the rule that makes it strange" },
  { id: "cast", name: "The cast", hint: "Faces and one line each" },
  { id: "look", name: "The look", hint: "Palette and reference plates" },
  { id: "season", name: "Season shape", hint: "Where it goes across episodes" },
  { id: "why", name: "Why now", hint: "Audience, comparables, timing" }
];

// ---- Promotional formats ----
// Dimensions are the deliverable here — a poster that is 1080x1080 on a
// platform expecting 1080x1920 reads as an amateur upload.
const PROMO_FORMATS = [
  { id: "ig_square", name: "Instagram post", w: 1080, h: 1080, note: "Feed" },
  { id: "ig_story", name: "Instagram story / Reels", w: 1080, h: 1920, note: "Full bleed, keep text off the bottom 250px" },
  { id: "tiktok", name: "TikTok", w: 1080, h: 1920, note: "Same plate as Reels, different safe area" },
  { id: "fb_link", name: "Facebook link", w: 1200, h: 630, note: "Crops hard on mobile" },
  { id: "yt_thumb", name: "YouTube thumbnail", w: 1280, h: 720, note: "Legible at 210px wide" },
  { id: "x_card", name: "X card", w: 1600, h: 900, note: "16:9" },
  { id: "poster", name: "Key art poster", w: 2000, h: 3000, note: "2:3, print safe" },
  { id: "banner", name: "Channel banner", w: 2560, h: 1440, note: "Centre 1235x338 always visible" }
];

const EXPORT_TRACKS = [
  { id: "master", name: "Master", note: "Everything mixed, H.264" },
  { id: "dialogue", name: "Dialogue stem", note: "Voices only, no score" },
  { id: "music", name: "Music stem", note: "Score only" },
  { id: "ambience", name: "Ambience stem", note: "Room tone and effects" },
  { id: "scenes", name: "Per-scene files", note: "One file per scene, for your own edit" },
  { id: "captions", name: "Captions", note: "SRT and VTT from the dialogue" }
];

const TRAILER_VIBES = ["Slow burn", "Hard cut", "Voice-over led", "Montage", "Single scene tease"];

// Act prose is keyed "episode:act" so a series can hold three acts per
// episode without a second data model. Film and short are always episode 1.
function actKey(ep, act) { return (ep || 1) + ":" + act; }

function emptyActs() { return {}; }

function emptySpine() {
  return { once: "", everyDay: "", untilOneDay: "", becauseA: "", becauseB: "", becauseC: "", untilFinally: "", eversince: "" };
}

function seedIP() {
  return {
    id: "ip_demo",
    title: "Static Bloom",
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 3600000 * 5,
    cover: "neon",

    // set in story step 3
    workflow: "guided",
    script: { sceneList: [], dialogue: {}, screenplay: "" },
    tags: [],
    references: [],
    imported: null,
    episodes: [],
    captures: [],
    bible: { docs: {}, deck: [] },
    promo: [],

    format: { type: "series", runtime: 24, episodes: 8, seasons: 1, serialized: true, aspect: "16:9", language: "English", sceneLength: 1.5 },

    story: {
      step: "shape",
      logline: "A rain-soaked detective with a cybernetic arm hunts a ghost who only appears on dead television channels.",
      synopsis:
        "Elena Reyes lost her arm and her partner on the same night. Three years on she works cold cases in a city that never tore down its analog broadcast towers. When a witness claims a murdered woman is still speaking through channel 83, Elena starts watching — and the broadcasts start answering back.",
      genres: ["Mystery", "Sci-fi"],
      tones: ["Bleak", "Melancholy"],

      acts: {},

      spine: {
        once: "There was a detective named Elena Reyes who worked the cases nobody else would touch.",
        everyDay: "Every day she filed reports on the dead and went home to an apartment with the television left on for the noise.",
        untilOneDay: "Until one day a witness swore that a woman murdered three years ago was still speaking through channel 83.",
        becauseA: "Because of that, Elena reopened a case she had closed herself.",
        becauseB: "Because of that, the broadcasts started addressing her by name.",
        becauseC: "Because of that, she learned the signal had been running since the night her partner died.",
        untilFinally: "Until finally she found the transmitter, and the person still feeding it.",
        eversince: "Ever since that day the city's dead channels have stayed dark, and Elena keeps one television on."
      },

      questions: [
        { id: "q_seed", severity: "hole", act: 2, title: "Nobody is pushing back",
          issue: "There is no antagonist in the cast, so act two reads as things happening to Elena rather than someone opposing her.",
          question: "Who wants the opposite of what your lead wants, and what do they actually do about it in act two?",
          answer: "The person feeding the transmitter is her old partner's widow. She wants the case to stay closed and she has been editing the broadcasts to send Elena the wrong way.",
          status: "answered" }
      ],

      suggestions: [],

      beats: [
        { id: "b1", act: 1, ep: 1, role: "Opening image", title: "Channel 83", text: "A television flickers on in an empty apartment. Someone is already sitting in front of it." },
        { id: "b2", ep: 1, act: 1, role: "Setup", title: "Cold case desk", text: "Elena files the dead. The precinct treats her like a filing cabinet with a pulse." },
        { id: "b3", ep: 1, act: 1, role: "Inciting incident", title: "The witness", text: "A man says a murdered woman spoke to him through static, and names her correctly." },
        { id: "b4", ep: 1, act: 2, role: "Plot point one", title: "Reopening her own file", text: "Elena pulls a case she signed off on three years ago." },
        { id: "b5", ep: 1, act: 2, role: "Midpoint", title: "It says her name", text: "The broadcast stops describing and starts addressing." },
        { id: "b6", ep: 1, act: 2, role: "Plot point two", title: "The night she lost the arm", text: "The signal has been running since her partner died. It was never about the victim." },
        { id: "b7", ep: 1, act: 3, role: "Climax", title: "The transmitter", text: "She finds the tower, and the person still feeding it." },
        { id: "b8", ep: 1, act: 3, role: "Resolution", title: "One set left on", text: "The channels go dark. Elena leaves one television running anyway." }
      ]
    },

    characters: [
      { id: "c1", name: "Elena Reyes", role: "Lead", look: "Cybernetic left arm, long grey coat, wet hair", arc: "From refusing the signal to needing it", tags: ["cybernetic arm", "detective"], avatar: "https://placehold.co/160x160/2b2f36/ffffff?text=E" },
      { id: "c2", name: "Mercer", role: "Supporting", look: "Scarred jaw, transit worker jacket", arc: "Informant who knows more than he sells", tags: ["informant"], avatar: "https://placehold.co/160x160/3a2f36/ffffff?text=M" }
    ],

    worlds: [
      { id: "w1", name: "Neon Alley", atmosphere: "Rain, sodium light, standing water", thumbnail: "https://placehold.co/320x240/1d2430/ffffff?text=Neon+Alley" },
      { id: "w2", name: "Precinct 9", atmosphere: "Fluorescent, overcrowded, beige", thumbnail: "https://placehold.co/320x240/242a24/ffffff?text=Precinct+9" }
    ],

    visual: { style: "Neo-noir", palette: "neon", camera: ["Handheld", "Long lens"], references: [] },

    voices: {
      assignments: { c1: { voiceId: "v6", accent: "New York", pace: "Clipped" } },
      narrator: { voiceId: "v3", accent: "Neutral American", pace: "Slow" }
    },

    music: { genres: ["Synthwave"], moods: ["Ominous"], tempo: 84, instruments: ["Analog synth", "Cello"], reference: "" },

    notes: [
      { id: "n1", text: "The ghost is never shown in full. Reflections and CRT scanlines only.", date: Date.now() - 86400000 * 2 }
    ],

    designs: [
      { id: "d1", name: "Elena — coat turnaround", kind: "Character design", url: "https://placehold.co/400x300/2b2f36/ffffff?text=Turnaround" },
      { id: "d2", name: "Channel 83 title card", kind: "Key art", url: "https://placehold.co/400x300/1d2430/ffffff?text=Ch+83" }
    ],

    trailer: { status: "none", videoUrl: null, length: "60 sec", vibe: "Slow burn" },

    scenes: [
      { id: "s1", order: 1, beatId: "b1", prompt: "A television flickers on in an empty apartment. Someone is already sitting in front of it.", characters: [], world: "w1", shot: "Wide establishing", state: "Unchanged", line: "", status: "rendered", forkOf: null, videoUrl: PLACEHOLDER_VIDEO },
      { id: "s2", order: 2, beatId: "b3", prompt: "Mercer steps out of a doorway behind her, hands raised.", characters: ["c2"], world: "w1", shot: "Medium", state: "Unchanged", line: "You shouldn't be down here.", status: "rendered", forkOf: null, videoUrl: PLACEHOLDER_VIDEO }
    ]
  };
}

function blankIP(title, formatGuess) {
  return {
    id: "ip_" + Date.now(),
    title: title || "Untitled IP",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cover: "cold",
    workflow: "guided",
    script: { sceneList: [], dialogue: {}, screenplay: "" },
    tags: [],
    references: [],
    imported: null,
    episodes: [],
    captures: [],
    bible: { docs: {}, deck: [] },
    promo: [],
    format: { type: formatGuess || "", runtime: 0, episodes: 0, seasons: 1, serialized: false, aspect: "16:9", language: "English", sceneLength: 1.5 },
    story: { step: "spine", logline: "", synopsis: "", genres: [], tones: [], short: { hook: "", story: "", twist: "" }, spine: emptySpine(), acts: {}, beats: [], questions: [], suggestions: [] },
    characters: [],
    worlds: [],
    visual: { style: "", palette: "", camera: [], references: [] },
    voices: { assignments: {}, narrator: null },
    music: { genres: [], moods: [], tempo: 90, instruments: [], reference: "" },
    notes: [],
    designs: [],
    trailer: { status: "none", videoUrl: null, length: "60 sec", vibe: "Slow burn" },
    scenes: []
  };
}

/* ========================================================== */

// ============================================================
// prompt.js — THE PROMPT COMPILER
//
// Every decision the creator makes in the IP Builder is folded into
// one payload. The front end never writes prose prompts; it sends
// this structured object and the backend's prompting protocols turn
// it into model-specific instructions.
//
// Backend: `context` is the block you template against. `routing`
// is a hint, not a contract — override it server side.
// ============================================================

function paletteById(id) {
  return PALETTES.find(function (p) { return p.id === id; }) || null;
}
function voiceById(id) {
  return VOICE_LIBRARY.find(function (v) { return v.id === id; }) || null;
}
function formatById(id) {
  return FORMATS.find(function (f) { return f.id === id; }) || null;
}
function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
}

// ============================================================
// Story
// ============================================================

/** Spine sentences in order, skipping blanks. */
function spineLines(ip) {
  return SPINE_STEPS.map(function (s) {
    return { key: s.key, label: s.label, text: ip.story.spine[s.key] };
  }).filter(function (l) { return l.text && l.text.trim(); });
}

function spineComplete(ip) {
  return spineLines(ip).length === SPINE_STEPS.length;
}

/** The spine read as a single paragraph — this is what the expansion prompt gets. */
function spineParagraph(ip) {
  return spineLines(ip).map(function (l) { return l.text.trim(); }).join(" ");
}

function beatsInAct(ip, act, ep) {
  return ip.story.beats.filter(function (b) {
    if (b.act !== act) return false;
    return ep == null ? true : (b.ep || 1) === ep;
  });
}

function actProseOf(ip, ep, act) {
  return ip.story.acts[actKey(ep, act)] || { prose: "", manual: false };
}

function structureComplete(ip) {
  return [1, 2, 3].every(function (a) { return beatsInAct(ip, a, 1).length > 0; });
}

function refsFor(ip, scope) {
  return (ip.references || []).filter(function (r) { return r.scope === scope; });
}
function refKind(scope) {
  return scope.split(":")[0];
}
function routeFor(scope) {
  return REFERENCE_ROUTES[refKind(scope)] || { label: "Reference", to: "unrouted" };
}

function workflowOf(ip) {
  return WORKFLOWS.find(function (w) { return w.id === (ip.workflow || "guided"); }) || WORKFLOWS[1];
}

/**
 * Which steps this project needs.
 * The format is the first question, and everything after it follows from
 * the answer: a short does not get a spine, a series gets episodes.
 */
function stepsFor(ip) {
  var wf = workflowOf(ip);
  if (wf.id === "instant") return ["instant"];

  var path = FORMAT_PATHS[ip.format.type];
  var core = path ? path.steps.slice() : [];
  var steps = ["format"].concat(core);

  if (wf.id === "import") steps = ["import"].concat(steps);
  return steps;
}

function formatChosen(ip) {
  return !!(ip.format.type && ip.format.runtime > 0 &&
    (ip.format.type !== "series" || ip.format.episodes > 0));
}

function shortComplete(ip) {
  var sh = ip.story.short || {};
  return !!(sh.hook && sh.story && sh.twist);
}

function episodesComplete(ip) {
  return (ip.episodes || []).length > 0 && ip.episodes.every(function (e) {
    return beatsInAct(ip, 1, e.number).length && beatsInAct(ip, 3, e.number).length;
  });
}

function scriptComplete(ip) {
  var sc = ip.script || {};
  if (!(sc.sceneList || []).length) return false;
  if (ip.workflow === "deep") return !!(sc.screenplay && openQuestions(ip).length === 0);
  return true;
}

/**
 * Everything that must be true before scenes can be rendered.
 * Returned as a list so the UI can show what is missing rather than
 * just disabling a button.
 */
function renderGate(ip) {
  var st = storySteps(ip);
  var deliversVideo = ["podcast", "audiodrama", "blog"].indexOf(ip.format.type) === -1;
  var speaking = (ip.script && ip.script.dialogue) ? Object.keys(ip.script.dialogue).length : 0;
  if (ip.workflow === "instant") {
    var iItems = [
      { label: "Cast in the vault", ok: ip.characters.length > 0, required: true },
      { label: "Scene generated", ok: ip.scenes.length > 0, required: true }
    ];
    return { items: iItems, ready: iItems.every(function (i) { return i.ok; }) };
  }

  var items = [
    { label: "Story spine written", ok: st.spine, required: true },
    { label: "Shape chosen", ok: st.shape, required: true },
    { label: "Scene list drafted", ok: (ip.script.sceneList || []).length > 0, required: true },
    { label: "Cast in the vault", ok: ip.characters.length > 0, required: true }
  ];
  if (deliversVideo) {
    items.push({ label: "Visual style locked", ok: !!(ip.visual.style && ip.visual.palette), required: ip.workflow !== "fast" });
  }
  if (ip.workflow !== "fast") {
    items.push({ label: "Dialogue drafted", ok: speaking > 0, required: false });
    items.push({ label: "Voices cast", ok: Object.keys(ip.voices.assignments).length > 0, required: false });
  }
  if (ip.workflow === "deep") {
    items.push({ label: "Three acts written", ok: st.structure, required: true });
    items.push({ label: "Story check cleared", ok: openQuestions(ip).length === 0, required: true });
    items.push({ label: "Screenplay generated", ok: !!ip.script.screenplay, required: true });
  }
  return {
    items: items,
    ready: items.every(function (i) { return !i.required || i.ok; })
  };
}

function shapeComplete(ip) {
  var f = formatById(ip.format.type);
  if (!f) return false;
  if (f.serial) return ip.format.runtime > 0 && ip.format.episodes > 0;
  return ip.format.runtime > 0;
}

/**
 * Runtime maths. Acts run roughly 25 / 50 / 25, which is the
 * proportion the structure step assumes when it splits beats.
 * sceneLength is the creator's average shot length in minutes.
 */
function shapePlan(ip) {
  var f = formatById(ip.format.type);
  if (!f) return null;

  var perPiece = Number(ip.format.runtime) || 0;
  var pieces = f.serial ? (Number(ip.format.episodes) || 0) : 1;
  var seasons = f.serial ? (Number(ip.format.seasons) || 1) : 1;
  var sceneLen = Number(ip.format.sceneLength) || 1.5;

  var acts = {
    1: Math.round(perPiece * 0.25 * 10) / 10,
    2: Math.round(perPiece * 0.5 * 10) / 10,
    3: Math.round(perPiece * 0.25 * 10) / 10
  };

  var scenesPerPiece = perPiece ? Math.max(1, Math.round(perPiece / sceneLen)) : 0;
  var totalBeats = ip.story.beats.length;

  return {
    formatType: f.id,
    formatName: f.name,
    serial: f.serial,
    runtimeMinutes: perPiece,
    pieces: pieces,
    seasons: seasons,
    totalMinutes: Math.round(perPiece * pieces * seasons * 10) / 10,
    actMinutes: acts,
    averageSceneLength: sceneLen,
    scenesPerPiece: scenesPerPiece,
    totalScenes: scenesPerPiece * pieces * seasons,
    beatsTotal: totalBeats,
    // for serial formats, how the existing beats spread across episodes
    beatsPerPiece: pieces ? Math.max(1, Math.round(totalBeats / pieces)) : totalBeats
  };
}

// ============================================================
// Context
// ============================================================

function compileContext(ip) {
  var pal = paletteById(ip.visual.palette);
  var plan = shapePlan(ip);

  return {
    ipId: ip.id,
    title: ip.title,

    format: plan ? {
      type: plan.formatType,
      method: (FORMAT_PATHS[ip.format.type] || {}).method || null,
      serialized: ip.format.type === "series" ? !!ip.format.serialized : null,
      runtimeMinutes: plan.runtimeMinutes,
      episodes: plan.serial ? plan.pieces : null,
      seasons: plan.serial ? plan.seasons : null,
      totalMinutes: plan.totalMinutes,
      actMinutes: plan.actMinutes,
      targetSceneCount: plan.totalScenes,
      averageSceneLengthMinutes: plan.averageSceneLength,
      aspectRatio: ip.format.aspect,
      language: ip.format.language,
      // audio and text formats must never trigger a video render
      deliversVideo: ["podcast", "audiodrama", "blog"].indexOf(ip.format.type) === -1
    } : null,

    // How much latitude the creator wants. On "fast" they have made fewer
    // decisions on purpose — fill the gaps. On "full" do not invent past
    // what is written here.
    creativeControl: ip.workflow || "guided",

    // studio scenes, each with its own page if one has been written
    renderQueue: ip.scenes.map(function (sc, i) {
      return {
        id: sc.id, order: i + 1, status: sc.status,
        direction: sc.prompt, shot: sc.shot,
        characters: sc.characters, world: sc.world,
        dialogue: (sc.dialogue || []).map(function (d) {
          return { character: d.speaker, line: d.line };
        }),
        script: sc.script || null
      };
    }),

    script: {
      sceneCount: (ip.script.sceneList || []).length,
      hasDialogue: Object.keys(ip.script.dialogue || {}).length > 0,
      hasScreenplay: !!ip.script.screenplay,
      scenes: (ip.script.sceneList || []).map(function (sc) {
        return {
          id: sc.id,
          act: sc.act,
          beatRole: sc.beatRole,
          heading: sc.heading,
          summary: sc.summary,
          characters: sc.characters,
          dialogue: (ip.script.dialogue[sc.id] || []).map(function (d) {
            return { character: d.speaker, parenthetical: d.parenthetical || null, line: d.line };
          })
        };
      })
    },

    // set when the creator started from their own material rather than
    // the spine. Treat imported beats as authored, because they were.
    importedFrom: ip.imported ? { at: ip.imported.at, items: ip.imported.items, words: ip.imported.words } : null,

    story: {
      logline: ip.story.logline,
      synopsis: ip.story.synopsis,
      genres: ip.story.genres,
      tones: ip.story.tones,

      // the spine is the source of truth. Structure below is derived
      // from it, so if the two ever disagree, the spine wins.
      spine: spineLines(ip).map(function (l) { return { prompt: l.label, text: l.text }; }),
      spineParagraph: spineParagraph(ip),

      // The creator answered these after a story check. Answers are
      // authored decisions — treat them as binding as creatorRules.
      resolvedQuestions: (ip.story.questions || [])
        .filter(function (q) { return q.status === "answered" && q.answer.trim(); })
        .map(function (q) { return { about: q.title, question: q.question, answer: q.answer }; }),

      // Still unanswered. The model should work around these rather than
      // inventing an answer, and may raise them again.
      openQuestions: (ip.story.questions || [])
        .filter(function (q) { return q.status === "open"; })
        .map(function (q) { return { about: q.title, issue: q.issue, question: q.question }; }),

      // Short form is not three acts. Sending an empty act structure for a
      // nine minute short is how you get a short that plays like a trailer.
      model: ip.format.type === "short" ? "hook-story-twist" : "three-act",
      shortForm: ip.format.type === "short" ? {
        hook: ip.story.short.hook,
        story: ip.story.short.story,
        twist: ip.story.short.twist
      } : null,

      serialized: ip.format.type === "series" ? !!ip.format.serialized : null,

      episodes: (ip.episodes || []).map(function (e) {
        return {
          number: e.number, title: e.title, premise: e.premise,
          carriesOver: e.carriesOver || null,
          acts: [1, 2, 3].map(function (a) {
            return {
              act: a, name: ACT_NAMES[a],
              prose: actProseOf(ip, e.number, a).prose || null,
              beats: beatsInAct(ip, a, e.number).map(function (b) {
                return { role: b.role, title: b.title, text: b.text };
              })
            };
          })
        };
      }),

      structure: {
        model: "three-act",
        acts: [1, 2, 3].map(function (a) {
          return {
            act: a,
            name: ACT_NAMES[a],
            targetMinutes: plan ? plan.actMinutes[a] : null,
            prose: actProseOf(ip, 1, a).prose || null,
            beats: beatsInAct(ip, a, 1).map(function (b) {
              return {
                role: b.role,
                title: b.title,
                text: b.text,
                // beats the creator accepted from a story-check suggestion.
                // They answer a known gap, so do not quietly drop them.
                origin: b.origin || "authored"
              };
            })
          };
        })
      }
    },

    characters: ip.characters.map(function (c) {
      var v = ip.voices.assignments[c.id];
      return {
        id: c.id,
        name: c.name,
        role: c.role,
        physicalDescription: c.look,
        arc: c.arc,
        tags: c.tags,
        referenceImage: c.avatar,
        // every angle the creator uploaded for this face
        referenceImages: refsFor(ip, "character:" + c.id).map(function (r) {
          return { url: r.url, name: r.name, weight: r.weight };
        }),
        voice: v ? {
          voiceId: v.voiceId,
          name: (voiceById(v.voiceId) || {}).name,
          accent: v.accent,
          pace: v.pace,
          // a sample overrides the library voice — clone from this instead
          sample: refsFor(ip, "voice:" + c.id).map(function (r) {
            return { url: r.url, name: r.name };
          })[0] || null
        } : null
      };
    }),

    locations: ip.worlds.map(function (w) {
      return {
        id: w.id, name: w.name, atmosphere: w.atmosphere, referenceImage: w.thumbnail,
        referenceImages: refsFor(ip, "world:" + w.id).map(function (r) {
          return { url: r.url, name: r.name, weight: r.weight };
        })
      };
    }),

    visual: {
      style: ip.visual.style || null,
      palette: pal ? { name: pal.name, hex: pal.swatches } : null,
      cameraLanguage: ip.visual.camera,
      // uploaded style plates. `weight` is how hard to hold to them.
      references: refsFor(ip, "visual").map(function (r) {
        return { url: r.url, name: r.name, weight: r.weight, note: r.note || null };
      })
    },

    audio: {
      narrator: ip.voices.narrator
        ? {
            voiceId: ip.voices.narrator.voiceId,
            name: (voiceById(ip.voices.narrator.voiceId) || {}).name,
            accent: ip.voices.narrator.accent,
            pace: ip.voices.narrator.pace,
            sample: refsFor(ip, "voice:__narrator").map(function (r) {
              return { url: r.url, name: r.name };
            })[0] || null
          }
        : null,
      music: {
        genres: ip.music.genres,
        moods: ip.music.moods,
        tempoBpm: ip.music.tempo,
        instruments: ip.music.instruments,
        reference: ip.music.reference || null,
        referenceTracks: refsFor(ip, "music").map(function (r) {
          return { url: r.url, name: r.name, note: r.note || null };
        })
      }
    },

    // free-text rules the creator wrote. Constraints, not flavour —
    // weight these above anything the model proposes on its own.
    creatorRules: ip.notes.map(function (n) { return n.text; }),

    // flat list too, so a service that only wants "every image for this IP"
    // does not have to walk the tree
    references: (ip.references || []).map(function (r) {
      return {
        id: r.id, kind: r.kind, scope: r.scope,
        routeTo: routeFor(r.scope).to,
        name: r.name, url: r.url, weight: r.weight || null, note: r.note || null,
        // documents the browser could not open. The server has to parse
        // these before anything downstream can use them.
        needsParsing: r.kind === "document" ? !!r.pending : undefined,
        wordCount: r.kind === "document" ? (r.words || 0) : undefined
      };
    }),

    bible: {
      documents: Object.keys(ip.bible.docs || {}),
      deckSlides: (ip.bible.deck || []).map(function (sl) {
        return { id: sl.id, name: sl.name, headline: sl.headline, body: sl.body };
      })
    },

    // promotional set. `w`/`h` are the contract — the image model must
    // compose for the box, not crop a 16:9 frame into a 9:16 slot.
    promo: (ip.promo || []).map(function (im) {
      return { id: im.id, format: im.formatId, width: im.w, height: im.h, caption: im.caption };
    }),

    // stills and clips the creator made while working. Useful as style
    // anchors — they were approved at the moment they were made.
    captures: (ip.captures || []).map(function (cp) {
      return { id: cp.id, step: cp.step, kind: cp.kind, title: cp.title, width: cp.w, height: cp.h, url: cp.url };
    }),

    designReferences: ip.designs.map(function (d) { return { name: d.name, kind: d.kind, url: d.url }; })
  };
}

/**
 * Wrap the context for one job.
 * job: "spine" | "structure" | "script" | "scene" | "trailer" | "voice" | "music" | "design"
 */
function compilePayload(ip, job, extra) {
  var routing = {
    spine:     { text: "claude / gpt", video: null, audio: null },
    check:     { text: "claude / gpt", video: null, audio: null },
    structure: { text: "claude / gpt", video: null, audio: null },
    script:    { text: "claude / gpt", video: null, audio: null },
    scene:     { text: "claude / gpt", video: "kling / runway", audio: "elevenlabs" },
    trailer:   { text: "claude / gpt", video: "kling / runway", audio: "elevenlabs + music model" },
    voice:     { text: null, video: null, audio: "elevenlabs" },
    music:     { text: null, video: null, audio: "music model" },
    design:    { text: "claude / gpt", video: null, audio: null }
  };

  return {
    job: job,
    submittedAt: new Date().toISOString(),
    routing: routing[job] || routing.script,
    context: compileContext(ip),
    task: extra || {}
  };
}

// ============================================================
// Readiness
// ============================================================

function openQuestions(ip) {
  return (ip.story.questions || []).filter(function (q) { return q.status === "open"; });
}

function pillarsFor(ip) {
  return FORMAT_PILLARS[ip.format.type] || ALL_PILLARS;
}

function instantComplete(ip) {
  return ip.scenes.length > 0;
}

function storySteps(ip) {
  return {
    format: formatChosen(ip),
    shortform: shortComplete(ip),
    episodes: episodesComplete(ip),
    import: !!ip.imported,
    instant: instantComplete(ip),
    spine: spineComplete(ip),
    structure: structureComplete(ip),
    shape: shapeComplete(ip),
    script: scriptComplete(ip)
  };
}

function pillarStatus(ip) {
  var st = storySteps(ip);
  var m = ip.music, v = ip.visual;
  return {
    story: st.spine && st.structure && st.shape,
    characters: ip.characters.length > 0,
    visual: !!(v.style && v.palette),
    voices: Object.keys(ip.voices.assignments).length > 0 || !!ip.voices.narrator,
    music: m.genres.length > 0 && m.moods.length > 0,
    notes: ip.notes.length > 0,
    designs: ip.designs.length > 0,
    bible: Object.keys(ip.bible.docs || {}).length > 0 || (ip.bible.deck || []).length > 0
  };
}

function readiness(ip) {
  var pillars = pillarsFor(ip);
  var st = pillarStatus(ip);
  var steps = storySteps(ip);
  // story counts for three of its own, so a finished spine shows progress
  var done = 0, total = 0;
  pillars.forEach(function (p) {
    if (p === "story") {
      var wanted = stepsFor(ip);
      total += wanted.length;
      wanted.forEach(function (k) { done += steps[k] ? 1 : 0; });
    } else {
      total += 1;
      done += st[p] ? 1 : 0;
    }
  });
  return Math.round((done / total) * 100);
}

// ============================================================
// Folders — filled as decisions are made, never user-managed
// ============================================================

function fileTree(ip) {
  var t = [];
  function folder(name, files) { if (files.length) t.push({ name: name, files: files }); }

  folder("story", [
    spineLines(ip).length ? "spine.md" : null,
    ip.story.logline ? "logline.txt" : null,
    ip.story.synopsis ? "synopsis.md" : null,
    beatsInAct(ip, 1).length ? "act-1 (" + beatsInAct(ip, 1).length + " beats).md" : null,
    beatsInAct(ip, 2).length ? "act-2 (" + beatsInAct(ip, 2).length + " beats).md" : null,
    beatsInAct(ip, 3).length ? "act-3 (" + beatsInAct(ip, 3).length + " beats).md" : null,
    formatChosen(ip) ? "format.json" : null,
    shortComplete(ip) ? "hook-story-twist.md" : null,
    (ip.story.questions || []).length ? "story-check (" + openQuestions(ip).length + " open).md" : null
  ].filter(Boolean));

  folder("script", [
    (ip.script.sceneList || []).length ? "scene-list (" + ip.script.sceneList.length + ").json" : null,
    Object.keys(ip.script.dialogue || {}).length ? "dialogue (" + Object.keys(ip.script.dialogue).length + " scenes).json" : null,
    ip.script.screenplay ? slug(ip.title) + ".fountain" : null
  ].filter(Boolean));

  folder("characters", ip.characters.map(function (c) { return slug(c.name) + ".json"; }));
  folder("locations", ip.worlds.map(function (w) { return slug(w.name) + ".json"; }));

  folder("bible", (BIBLE_DOCS || []).filter(function (d) {
    return d.id === "deck" ? (ip.bible.deck || []).length : (ip.bible.docs || {})[d.id];
  }).map(function (d) { return d.id === "deck" ? "pitch-deck (" + ip.bible.deck.length + " slides).pdf" : slug(d.name) + ".md"; }));

  folder("captures", (ip.captures || []).map(function (cp) {
    return slug(cp.step + "-" + cp.title) + (cp.kind === "video" ? ".mp4" : ".png");
  }));

  folder("promo", (ip.promo || []).map(function (im) { return slug(im.name) + "-" + im.w + "x" + im.h + ".png"; }));

  folder("references", (ip.references || []).map(function (r) { return slug(r.name); }));

  folder("visual", [
    ip.visual.style ? "style.json" : null,
    ip.visual.palette ? "palette.json" : null,
    ip.visual.camera.length ? "camera.json" : null
  ].filter(Boolean));

  folder("voices", Object.keys(ip.voices.assignments).map(function (cid) {
    var c = ip.characters.find(function (x) { return x.id === cid; });
    return (c ? slug(c.name) : cid) + ".voice.json";
  }).concat(ip.voices.narrator ? ["narrator.voice.json"] : []));

  folder("music", ip.music.genres.length ? ["moodboard.json", "tempo-" + ip.music.tempo + "bpm.json"] : []);
  folder("designs", ip.designs.map(function (d) { return slug(d.name) + ".png"; }));
  folder("notes", ip.notes.length ? ["creator-rules (" + ip.notes.length + ").md"] : []);
  folder("scenes", ip.scenes.reduce(function (list, s, i) {
    var n = String(i + 1).padStart(2, "0");
    list.push("scene-" + n + ".json");
    if (s.script) list.push("scene-" + n + ".fountain");
    return list;
  }, []));
  folder("trailer", ip.trailer.videoUrl ? ["trailer-v1.mp4"] : []);

  return t;
}

/* ========================================================== */

// ============================================================
// api.js — THE BRIDGE
// Every network-shaped call in the app goes through here and
// resolves after a fake delay. Backend: replace each body with a
// fetch(), keep the names, arguments and resolved shapes.
//
// Note every function takes the compiled payload from prompt.js,
// so the request body is already assembled — you are wiring a
// transport, not rebuilding context.
// ============================================================

function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// Short beat name from the creator's sentence. Trailing function words make
// a title read as a truncation, so drop them.
var TRAILING = ["is", "was", "the", "a", "an", "and", "that", "to", "of", "in", "on", "her", "his", "their", "who", "has", "have", "had", "for", "with"];
function titleFrom(sentence) {
  var w = sentence.replace(/[.!?,;]+$/, "").split(/\s+/).slice(0, 6);
  while (w.length > 2 && TRAILING.indexOf(w[w.length - 1].toLowerCase()) !== -1) w.pop();
  return w.join(" ");
}

/**
 * Draft the eight spine sentences from a logline.
 * REAL: POST /api/ips/:id/spine  body = compilePayload(ip, "spine", { logline })
 * The model must return exactly the eight keys in SPINE_STEPS.
 */
async function draftSpine(payload) {
  await wait(3200);
  var line = (payload.task.logline || "the story").replace(/\.$/, "");
  return {
    once: "There was someone at the centre of this: " + line + ".",
    everyDay: "Every day they kept to a routine that worked well enough to avoid the real question.",
    untilOneDay: "Until one day something arrived that could not be filed away or ignored.",
    becauseA: "Because of that, they had to go back to the thing they had decided never to look at again.",
    becauseB: "Because of that, the people around them started behaving as though they already knew.",
    becauseC: "Because of that, the safe version of the story stopped being available.",
    untilFinally: "Until finally they came face to face with what had been driving all of it.",
    eversince: "Ever since that day, nothing has gone back to how it was, and that is mostly a good thing."
  };
}

/**
 * Expand the spine into three-act beats.
 * REAL: POST /api/ips/:id/structure  body = compilePayload(ip, "structure", { targetBeats })
 * Each beat needs act (1-3), role, title, text.
 */
async function expandStructure(payload) {
  await wait(3600);
  var spine = payload.context.story.spine;
  var beats = [];
  SPINE_TO_ACT.forEach(function (map, i) {
    var src = spine[i];
    if (!src) return;
    beats.push({
      id: "b" + (Date.now() + i),
      act: map.act,
      role: map.role,
      title: map.role,
      text: src.text
    });
  });
  // the model also proposes connective beats act two usually needs
  beats.splice(5, 0, {
    id: "b" + (Date.now() + 90),
    act: 2,
    role: "Rising action",
    title: "The cost becomes visible",
    text: "A scene where the choice made at the plot point starts taking something away."
  });
  return { beats: beats };
}

/**
 * Read the story back and find what does not hold up.
 * REAL: POST /api/ips/:id/check  body = compilePayload(ip, "check")
 *
 * The contract that matters: the model returns QUESTIONS, never rewrites.
 * Prompt it to interrogate, not to fix — the creator answers, and their
 * answers become constraints on every later generation.
 *
 * Each question: { id, severity: "hole" | "craft", act, title, issue, question }
 */
async function checkStory(payload) {
  await wait(4200);

  var c = payload.context;
  var acts = c.story.structure.acts;
  var beatsIn = function (n) { return (acts.find(function (a) { return a.act === n; }) || {}).beats || []; };
  var all = acts.reduce(function (m, a) { return m.concat(a.beats); }, []);
  var text = all.map(function (b) { return b.text; }).join(" ").toLowerCase();
  var qs = [];
  var n = 0;
  var add = function (sev, act, title, issue, question) {
    qs.push({ id: "q" + Date.now() + "_" + (n++), severity: sev, act: act, title: title, issue: issue, question: question, answer: "", status: "open" });
  };

  // --- structural checks, run against the real beats ---

  if (beatsIn(2).length < 4) {
    add("hole", 2, "Act two is thin",
      "Act two carries half the runtime and has " + beatsIn(2).length + " beats. There is not enough here to fill the middle without somebody making it up, and that somebody will be us.",
      "What goes wrong between the inciting incident and the climax that your lead cannot talk their way out of?");
  }

  var incit = beatsIn(1).find(function (b) { return b.role === "Inciting incident"; });
  var res = beatsIn(3).find(function (b) { return b.role === "Resolution"; });
  if (incit && res) {
    var words = incit.text.toLowerCase().split(/\W+/).filter(function (w) { return w.length > 4; });
    var overlap = words.filter(function (w) { return res.text.toLowerCase().indexOf(w) !== -1; });
    if (overlap.length < 2) {
      add("hole", 3, "The ending does not answer the beginning",
        "Your resolution shares almost no language with your inciting incident, which usually means the story ends on a different question from the one it opened.",
        "The thing that started this was: \u201c" + incit.text + "\u201d — what does your ending say about that specifically?");
    }
  }

  var antagonist = c.characters.find(function (ch) { return ch.role === "Antagonist"; });
  if (!antagonist) {
    add("hole", 2, "Nobody is pushing back",
      "There is no antagonist in your cast, and act two beats read as things happening to your lead rather than someone opposing them.",
      "Who wants the opposite of what your lead wants, and what do they actually do about it in act two?");
  }

  var lead = c.characters.find(function (ch) { return ch.role === "Lead"; });
  if (lead && !lead.arc) {
    add("craft", null, "The lead has no arc written",
      lead.name + " has a description but no arc, so every scene will render them the same person at the end as at the start.",
      "What does " + lead.name + " believe at the opening that they cannot believe by the last beat?");
  }

  var ghosts = c.characters.filter(function (ch) {
    return text.indexOf(ch.name.split(" ")[0].toLowerCase()) === -1;
  });
  if (ghosts.length) {
    add("hole", null, "Cast members who never appear",
      ghosts.map(function (g) { return g.name; }).join(", ") + " " + (ghosts.length > 1 ? "are" : "is") + " in your cast but never named in a beat.",
      "What is " + ghosts[0].name + " doing during act two, and does the story break if you cut them?");
  }

  var mid = beatsIn(2).find(function (b) { return b.role === "Midpoint"; });
  if (mid && mid.text.length < 70) {
    add("craft", 2, "The midpoint is vague",
      "Your midpoint is one short line. The midpoint is where the story usually changes its own question, so a thin one leaves the second half unanchored.",
      "At the midpoint, what does your lead learn that makes going back impossible?");
  }

  if (!c.story.synopsis) {
    add("craft", null, "No synopsis",
      "The beats exist but there is no prose synopsis, which is what the script model reads first for voice and rhythm.",
      "In two or three sentences, how would you pitch this out loud to someone who has not read the beats?");
  }

  // --- always end with one question about stakes ---
  add("craft", null, "Stakes",
    "Nothing in the beats states what your lead loses if they fail. Without it, the ending has nothing to weigh.",
    "If your lead fails, what exactly is lost, and who else feels it?");

  return { questions: qs, checkedBeats: all.length };
}

/**
 * Help for whoever is stuck.
 * REAL: POST /api/ips/:id/help  body = compilePayload(ip, "help", target)
 *
 * Design rules, in order of importance:
 *  1. Every suggestion is a COMPLETE sentence about THEIR story — their
 *     character names, their places, the words from their own logline. A
 *     suggestion about someone else's neighbour and someone else's brother
 *     is worse than no suggestion, because now they have to translate it.
 *  2. No blanks. They tap one and edit it.
 *  3. If the project is too empty to build from, say so and offer to write
 *     the thing that is missing instead of inventing a cast for them.
 *
 * target: { kind: "spine" | "question" | "section", key, round, question }
 * returns { nudge, examples: [{ label, text }], tip }
 */
async function askForHelp(payload, target) {
  await wait(1800);

  var c = payload.context;
  var round = target.round || 0;

  // ---- what do we actually know about this story? ----
  var chars = c.characters || [];
  var leadRec = chars.find(function (x) { return x.role === "Lead"; }) || chars[0];
  var named = leadRec && ["lead", "protagonist", "hero"].indexOf(leadRec.name.toLowerCase()) === -1;
  var lead = named ? leadRec.name.split(" ")[0] : null;
  var others = chars.filter(function (x) { return x !== leadRec; }).map(function (x) { return x.name.split(" ")[0]; });
  var other = others[0] || null;
  var place = (c.locations[0] || {}).name || null;
  var place2 = (c.locations[1] || {}).name || null;

  // distinctive words from their own writing, used to keep suggestions
  // anchored to the story they are actually telling
  // Pull the THINGS out of their writing, not the adjectives. Words that
  // follow an article are almost always nouns, which is what a suggestion
  // can point at — "handed over the transmitter" works, "handed over
  // rain-soaked" does not.
  var source = [c.story.logline, c.story.synopsis]
    .concat((c.story.spine || []).map(function (x) { return x.text; }))
    .concat((c.story.structure.acts || []).reduce(function (m, a) {
      return m.concat(a.beats.map(function (b) { return b.text; }));
    }, [])).join(" ").toLowerCase();

  // People words must never end up in an object slot. "Working on the woman"
  // is what happens when they do.
  var PEOPLE = ("woman man women men boy girl child children kid kids baby lady gentleman "
    + "mother father mum dad mom brother sister son daughter wife husband partner friend "
    + "neighbour neighbor stranger nurse doctor teacher officer detective keeper cleaner driver "
    + "student soldier guard priest widow uncle aunt cousin grandmother grandfather boss "
    + "somebody anybody everybody himself herself themselves").split(" ");

  var STOP = ("time thing things people person someone something nothing anyone place places "
    + "story night morning day week year years months while reason way ways part parts other others "
    + "first last same next only whole).").split(" ");

  // Places are not objects. "Working on the town" and "handed the town over"
  // are what happens when a location lands in an object slot.
  var PLACES = ("town towns city cities village house home flat room kitchen street road lane "
    + "school hospital office station yard pool river bridge harbour harbor coast beach factory "
    + "shop store church hall pub bar library ward corridor cellar attic garden field forest "
    + "island valley estate building apartment museum studio country county region state "
    + "borough district neighbourhood neighborhood suburb motorway highway border").split(" ");
  var SETTLEMENTS = ("town towns city cities village estate valley island coast country county "
    + "region state borough district neighbourhood neighborhood suburb").split(" ");

  var counts = {}, placeCounts = {};
  var artic = /\b(?:the|a|an|her|his|their|that|this|one)\s+([a-z][a-z'-]{3,})\b/g;
  var m;
  while ((m = artic.exec(source)) !== null) {
    var w = m[1].replace(/'s$/, "").replace(/'$/, "");   // mother's -> mother
    if (w.length < 4) continue;
    if (w.indexOf("-") !== -1) continue;                 // compound adjectives
    if (/(ed|ing|ly|est|ous|ful)$/.test(w)) continue;    // not a noun
    if (STOP.indexOf(w) !== -1) continue;
    if (PEOPLE.indexOf(w) !== -1) continue;
    if (/(s|es)$/.test(w) && PEOPLE.indexOf(w.replace(/e?s$/, "")) !== -1) continue;
    var known = chars.concat(c.locations).some(function (x) {
      return (x.name || "").toLowerCase().indexOf(w) !== -1;
    });
    if (known) continue;                                  // already have a name for it
    if (PLACES.indexOf(w) !== -1) { placeCounts[w] = (placeCounts[w] || 0) + 1; continue; }
    counts[w] = (counts[w] || 0) + 1;
  }
  var keyWords = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
  var placeWords = Object.keys(placeCounts).sort(function (a, b) { return placeCounts[b] - placeCounts[a]; });
  var thing = keyWords[0] || null;
  var thing2 = keyWords[1] || null;
  var thing3 = keyWords[2] || null;

  // If their writing has not given us a concrete object yet, borrow one that
  // fits the genre. A suggestion has to name the thing — "they were good at
  // this" is not an idea, it is a gap with a full stop on it.
  var GENRE_PROPS = {
    "Mystery":     { thing: "case file", place: "the records room", area: "the division", act: "pulled a file that was supposed to have been destroyed", stake: "the job that pays the rent", proof: "a receipt with a phone number on the back" },
    "Thriller":    { thing: "burner phone", place: "the car park under the office", area: "the city", act: "took a call they were not supposed to answer", stake: "the one person who has never been dragged into this", proof: "a photograph taken from across the street" },
    "Sci-fi":      { thing: "transmitter", place: "the old relay station", area: "the coast", act: "switched it on to see what would happen", stake: "everything they believed about the place they live", proof: "a signal that answers back" },
    "Horror":      { thing: "cellar door", place: "the house at the end of the lane", area: "the village", act: "went down there alone with a phone torch", stake: "the people still asleep upstairs", proof: "a sound from a room that is empty" },
    "Drama":       { thing: "letter", place: "the family kitchen", area: "the town", act: "read it out loud at the kitchen table", stake: "any chance of the family speaking to them again", proof: "a date on the envelope that cannot possibly be right" },
    "Comedy":      { thing: "van", place: "the car boot sale", area: "the town", act: "sold something that was not theirs to sell", stake: "a reputation in a town of four thousand people", proof: "a receipt with their own name on it" },
    "Fantasy":     { thing: "iron key", place: "the water under the bridge", area: "the valley", act: "used it once, badly, and told nobody", stake: "the bargain they made to get it", proof: "a door that is warm to the touch" },
    "Romance":     { thing: "voicemail", place: "the flat above the shop", area: "the neighbourhood", act: "played it back nine times and never replied", stake: "the eleven years they have spent not asking", proof: "a name nobody has said out loud since" },
    "Documentary": { thing: "archive tape", place: "the community hall", area: "the town", act: "put it on the projector in front of everyone", stake: "the version of events the town agreed on", proof: "a face in the crowd that should not be there" },
    "Action":      { thing: "hold-all", place: "the freight yard", area: "the yard", act: "carried it across town without opening it", stake: "the only person who ever covered for her", proof: "a tracker sewn into the lining" }
  };
  var props = GENRE_PROPS[(c.story.genres || [])[0]] || GENRE_PROPS.Drama;

  // guaranteed concrete: their own noun if we found one, otherwise the genre's
  var thingRaw = thing;
  thing = thing || props.thing;
  thing2 = thing2 || props.proof;
  var ownRoom = placeWords.find(function (w) { return SETTLEMENTS.indexOf(w) === -1; });
  var ownArea = placeWords.find(function (w) { return SETTLEMENTS.indexOf(w) !== -1; });
  var placeName = place || (ownRoom ? "the " + ownRoom : props.place);   // somewhere you can stand
  var areaName = place || (ownArea ? "the " + ownArea : props.area);     // somewhere people live


  var incident = ((c.story.spine || []).find(function (x) { return /until one day/i.test(x.prompt); }) || {}).text || null;
  var everyDay = ((c.story.spine || []).find(function (x) { return /every day/i.test(x.prompt); }) || {}).text || null;
  var tone = (c.story.tones[0] || "").toLowerCase();

  var pick = function (pool) {
    var usable = pool.filter(Boolean);
    var out = [];
    for (var i = 0; i < Math.min(3, usable.length); i++) out.push(usable[(round * 3 + i) % usable.length]);
    return out;
  };
  var trim = function (t) {
    if (!t) return "";
    t = t.trim().replace(/\.$/, "");
    return t.length > 90 ? t.slice(0, 88).replace(/\s\S*$/, "") : t;
  };

  // ---- Nothing written yet ----
  // Judged on their own words only. Once the genre props started filling in
  // `thing` this check silently stopped firing, which is how someone on a
  // blank project got told never to show "the letter".
  var hasStory = !!(lead || thingRaw || (c.story.logline || "").trim() ||
    (c.story.spine || []).length || chars.length);

  // A story-shaped step on a blank project needs whole story ideas, not
  // mid-story detail. You cannot suggest act two of nothing.
  var STORY_SEEDS = [
    { label: "Family drama, the house", text: "When her mother dies owing two years of back taxes, a nurse has ninety days to save the family house her three brothers want to sell." },
    { label: "Crime drama, one last job", text: "When his daughter is arrested for a robbery he planned years ago, a retired getaway driver must find the real crew before she takes a twenty-year sentence." },
    { label: "Workplace drama, the kitchen", text: "When a food critic's review shuts the restaurant for a week, a line cook must keep twelve unpaid staff together long enough to reopen." },
    { label: "Sports drama, last season", text: "When the town's only high school is told it will close in June, its losing basketball coach has one season to win enough to keep it open." },
    { label: "Thriller, the witness", text: "When a night bus driver sees a city councilman leave a crime scene, she must decide whether to testify while someone starts riding her route every night." },
    { label: "Comedy, the wedding", text: "When his sister's wedding planner quits a week before the big day, a broke stand-up comic talks his way into running the whole thing himself." },
    { label: "Legal drama, the confession", text: "When her client confesses to a murder she has already won his acquittal for, a young public defender must decide whether to break privilege." },
    { label: "Coming-of-age, the summer job", text: "When a sixteen-year-old takes a summer job cleaning houses with her estranged father, she learns why her mother really left." }
  ];

  var SCENE_SEEDS = [
    { label: "Two people, one problem", text: "Two people are stuck in a lift together and only one of them knows why it stopped." },
    { label: "Somebody arrives", text: "A child answers the front door to someone who says they used to live there." },
    { label: "A small disaster", text: "Someone is trying to make dinner for a person they want to impress, and everything in the kitchen is going wrong at once." },
    { label: "Found something", text: "A dog walker finds a suitcase by the river and spends a full minute deciding whether to open it." },
    { label: "The last customer", text: "A shopkeeper is closing up when one more customer comes in and asks for something impossible." },
    { label: "Caught", text: "Somebody is going through a desk that is not theirs when the light in the hallway comes on." }
  ];

  var SEED_STEPS = ["spine", "question"];
  if (!hasStory) {
    var seedIsScene = target.kind === "section" && (target.key === "instant" || target.key === "script");
    var seedForStory = seedIsScene ||
      SEED_STEPS.indexOf(target.kind) !== -1 ||
      (target.kind === "section" && ["characters", "structure", "bible", "promo", "designs", "notes"].indexOf(target.key) !== -1);

    if (seedForStory) {
      return {
        nudge: seedIsScene
          ? "Nothing written down yet, so here are three whole scenes you could make. Pick one and we will build it."
          : "Nothing written down yet, so here are three whole stories you could tell. Pick one and change anything you like.",
        examples: pick(seedIsScene ? SCENE_SEEDS : STORY_SEEDS),
        tip: seedIsScene
          ? "Once there is a scene here, these suggestions start using your own characters and places."
          : "Pick one and the rest of the questions get much easier, because every suggestion after this is built from it."
      };
    }
    // taste decisions — look, sound, length — do not need a story first
  }

  // "your lead" is not a name and reads like a form field. With nobody named,
  // lift the role straight out of their own logline instead.
  var roleSource = [c.story.logline, (c.story.spine[0] || {}).text, c.story.synopsis]
    .filter(Boolean).join(" ");
  // Only accept it if the phrase actually names a person — an early version
  // decided the main character of one story was "the room".
  var roleFound = null;
  var roleRe = /\b(?:a|an|the|two|three|four|both|her|his|their|my)\s+([a-z][a-z' -]{2,28}?)\s+(?:who|that|keeps|starts|gets|finds|wakes|hunts|goes|decides|is|was|has)\b/gi;
  var rm;
  while ((rm = roleRe.exec(roleSource)) !== null) {
    var phrase = rm[1].trim().toLowerCase();
    var headWord = phrase.split(/[\s-]+/).pop();
    if (PEOPLE.indexOf(headWord) !== -1 || PEOPLE.indexOf(headWord.replace(/e?s$/, "")) !== -1) {
      roleFound = phrase;
      break;
    }
  }
  var who = lead || (roleFound ? "the " + roleFound : "your main character");
  var them = other || "someone else in the story";

  // Templates cannot assume a name exists. "There was someone called the
  // night nurse" is what happens when they do.
  var intro = lead ? "There was someone called " + who : "There was " + who;
  var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };

  var SPINE = {
    once: {
      nudge: "Tell us who this is about and what their life is like right now.",
      tip: "Whatever you say here is what the ending will change. Pick something that matters to " + who + ".",
      pool: [
        { label: "Their job", text: intro + " who spent every working day dealing with the " + thing + ", and had got very good at not asking where it came from." },
        { label: "What they are good at", text: cap(who) + " could read a room faster than anyone else in " + areaName + ", which had kept them out of trouble for fifteen years." },
        { label: "Where they live", text: "In " + areaName + ", where everybody had known everybody since school, " + (lead ? "there was someone called " + who : "there was " + who) + "." },
        { label: "What they have lost", text: cap(who) + " had been living alone since the year everything went wrong, and had started calling it a preference." },
        { label: "Their reputation", text: "Everyone in " + areaName + " knew " + who + " as the one who walked away from the " + thing + " and never explained why." },
        { label: "One small habit", text: cap(who) + " kept every " + thing + " they had ever been given, in date order, in a box under the bed." }
      ]
    },
    everyDay: {
      nudge: "Describe a normal day for " + who + ". What do they always do?",
      tip: "This is the life your story is about to wreck, so make it feel like somewhere they live.",
      pool: [
        { label: "The routine", text: "Every day " + who + " logged the " + thing + ", filed the paperwork, and was out of the door by six with nothing to show anyone." },
        { label: "Something avoided", text: "Every day " + who + " walked past " + placeName + " on the way home and did not once look up at it." },
        { label: "A small comfort", text: "Every day ended the same way — the same chair, the radio on low, and a cup of tea they let go cold." },
        other ? { label: "Who else is there", text: "Every day " + who + " called in on " + them + ", sat for twenty minutes, and left without saying what was actually wrong." } : null,
        { label: "The same route", text: "Every day " + who + " took the long way round to avoid the " + thing + ", and told themselves it was for the walk." },
        { label: "What it costs", text: "Every day the work took a little more out of " + who + ", and every day they decided that was a fair trade." }
      ]
    },
    untilOneDay: {
      nudge: "Something happens that breaks that routine. What is it?",
      tip: "Make it something " + who + " cannot ignore. If they could go home and forget it, it is not big enough yet.",
      pool: [
        { label: "Something arrives", text: "Until one day a " + thing + " turned up with " + who + "'s name on it and a date on it from before they were born." },
        other ? { label: "Someone says it", text: "Until one day " + them + " said, in front of everyone, that the " + thing + " had never belonged to " + who + " in the first place." } : null,
        { label: "The routine fails", text: "Until one day the " + thing + " was simply not there, and the log said " + who + " had signed it out themselves." },
        { label: "They see something", text: "Until one day " + who + " saw " + thing2 + ", and there was no version of events that made it make sense." },
        { label: "Someone comes back", text: "Until one day the person " + who + " had spent eleven years not thinking about was standing in " + placeName + ", waiting." },
        { label: "They are asked", text: "Until one day " + who + " was asked to sign off on the " + thing + ", knowing exactly what that would mean." }
      ]
    },
    becauseA: {
      nudge: "What does " + who + " do about it? This should be their choice, not something done to them.",
      tip: "Pick something that shuts a door behind them, so going back stops being easy.",
      pool: [
        { label: "They break a rule", text: "Because of that, " + who + " went back into " + placeName + " when nobody else was there, and " + props.act + "." },
        other ? { label: "They ask for help", text: "Because of that, " + who + " went to " + them + " — the one person they had sworn never to ask for anything again — and asked." } : null,
        { label: "They lie", text: "Because of that, " + who + " told everyone they were taking a week off, and spent it working on the " + thing + " instead." },
        { label: "They go back", text: "Because of that, " + who + " drove out to " + placeName + " for the first time since the funeral." },
        { label: "They keep it quiet", text: "Because of that, " + who + " put the " + thing + " in the bottom of a drawer and told nobody it existed." },
        { label: "They start digging", text: "Because of that, " + who + " started asking about the " + thing + " in front of four separate people who would rather they had not." }
      ]
    },
    becauseB: {
      nudge: "What goes wrong because of that choice?",
      tip: "Trouble is better when it comes from what they just did, not from somewhere new.",
      pool: [
        { label: "It works too well", text: "Because of that, " + who + " found the answer in a fortnight, and then had to decide what to do with something they were not ready to know." },
        { label: "Someone notices", text: "Because of that, someone started going through " + who + "'s records at " + placeName + ", politely, and every single day." },
        { label: "The lie grows", text: "Because of that, " + who + " had to invent a second story to explain the first, and the second one involved " + them + "." },
        other ? { label: "Someone pays", text: "Because of that, " + them + " lost their job over a signature they had put on the " + thing + " as a favour." } : null,
        other ? { label: "A friend turns", text: "Because of that, " + them + " stopped taking " + who + "'s calls, and started taking somebody else's." } : null,
        { label: "It is bigger", text: "Because of that, " + who + " learned the " + thing + " had been passing through " + areaName + " for thirty years before they ever arrived." }
      ]
    },
    becauseC: {
      nudge: "Now take away " + who + "'s last easy option.",
      tip: "By the end of this line, the only way out should be straight through the middle.",
      pool: [
        { label: "The backup is gone", text: "Because of that, the money " + who + " had been keeping for exactly this went on a solicitor in a single afternoon." },
        other ? { label: "They are alone", text: "Because of that, there was nobody left who would speak to " + who + " on the record, including " + them + "." } : null,
        { label: "It gets personal", text: "Because of that, it stopped being about the " + thing + " and became about what " + who + "'s own family had signed, years ago." },
        { label: "Time runs out", text: "Because of that, " + who + " had until the end of the month, and then " + placeName + " would be sold and cleared." },
        { label: "The way back closes", text: "Because of that, " + who + " could not go back to work, because going back meant handing over the " + thing + "." },
        { label: "Found out", text: "Because of that, everyone in " + areaName + " knew what " + who + " had done, and almost all of them were wrong about why." }
      ]
    },
    untilFinally: {
      nudge: "The big moment. What does " + who + " finally face, and what do they do?",
      tip: incident ? "It should answer the thing that started all this: \u201c" + trim(incident) + "\u201d." : "It should answer the question the break at the start asked.",
      pool: [
        { label: "Face to face", text: "Until finally " + who + " stood in " + placeName + " with the person who had been moving the " + thing + " all along, and asked them to say it out loud." },
        { label: "A hard choice", text: "Until finally " + who + " had to choose between handing over the " + thing + " and protecting " + props.stake + "." },
        { label: "They give it up", text: "Until finally " + who + " handed the " + thing + " over, all of it, kept no copy, and asked for nothing in return." },
        { label: "Said out loud", text: "Until finally " + who + " stood up in " + placeName + " and told the whole room what had actually happened, with everyone who was there listening." },
        { label: "They fail on purpose", text: "Until finally " + who + " let the case collapse, because winning it would have cost " + props.stake + "." },
        other ? { label: "The two of them", text: "Until finally it came down to " + who + " and " + them + " in " + placeName + ", both holding a version of the truth, only one of which could survive the night." } : null
      ]
    },
    eversince: {
      nudge: "How is life different now? Show us a normal day, after all that.",
      tip: everyDay ? "Mirror your \u201cevery day\u201d line and the ending will land: \u201c" + trim(everyDay) + "\u201d." : "Do not tell us the lesson. Show us the new routine.",
      pool: [
        { label: "The routine, changed", text: "Ever since that day " + who + " does the same job, leaves at five instead of six, and walks home the short way, past " + placeName + "." },
        { label: "What they kept", text: "Ever since that day " + who + " has kept one " + thing + " in a coat pocket, and has never once explained it to anybody." },
        { label: "What is missing", text: "Ever since that day nobody in " + areaName + " has mentioned the " + thing + ", and nobody has said why not." },
        { label: "The cost stays", text: "Ever since that day " + props.stake + " has been gone, and " + who + " has stopped pretending it is coming back." },
        other ? { label: "Someone else now", text: "Ever since that day it has been " + them + " who handles the " + thing + ", and " + who + " who signs it off without reading it." } : null,
        { label: "Almost normal", text: "Ever since that day life has been almost exactly as it was before, which is the part " + who + " cannot get used to." }
      ]
    }
  };

  var SECTION = {
    characters: {
      nudge: "Add people who make life harder for " + who + ".",
      tip: "Three or four people is plenty. Every extra face is another one to keep looking the same in every shot.",
      pool: [
        { label: "Someone who knows", text: "A neighbour of twenty years who saw what happened to the " + thing + " and has decided, kindly, that " + who + " is better off not knowing." },
        { label: "Someone to look after", text: "A younger brother who lives with " + who + ", cannot be left alone for long, and always needs something at the worst possible hour." },
        { label: "Someone in the way", text: "A supervisor who says no to every request " + who + " makes, as a matter of policy, and is not wrong to." },
        { label: "Someone who believes", text: "A seventeen year old who has decided " + who + " is the only honest adult in " + areaName + ", and follows them around saying so." },
        { label: "The other choice", text: "Someone who faced exactly what " + who + " is facing, twelve years earlier, took the money, and has been comfortable and quiet ever since." },
        { label: "Someone who wants it too", text: "A rival who has been after the " + thing + " since long before " + who + " had heard of it, and is better funded." }
      ]
    },
    visual: {
      nudge: "Pick how it should look. One clear idea beats five vague ones.",
      tip: "This gets used on every single shot, so choose something you will still like in a month.",
      pool: [
        { label: "Real and plain", text: "Photoreal, lit only by what is in the room — desk lamps, phone screens, the window. No lighting rig anywhere in the story." },
        { label: "Night and rain", text: "Neo-noir. Long lenses, wet pavements, faces picked out of dark backgrounds by shop signs. Everything slightly blue except skin." },
        { label: "Bright and flat", text: "Documentary flatness. Daylight, no grade, handheld, nothing hidden in shadow because nothing here is a secret." },
        { label: "Drawn", text: "Hand-drawn anime line work over painted backgrounds, limited animation, held frames on faces." },
        { label: "Old film", text: "Retro film stock — heavy grain, greens slightly wrong, the look of something shot in 1978 and left in a cupboard." },
        { label: "Warm and soft", text: "Golden hour for the whole story, soft edges, shallow focus, the way somebody remembers a summer rather than how it was." }
      ]
    },
    voices: {
      nudge: "Give each person a voice that sounds different from the others.",
      tip: "You should be able to tell them apart with your eyes shut.",
      pool: [
        { label: "Low and slow", text: "Give " + who + " the lowest, slowest voice in the cast, so that everyone else in every scene sounds like they are reacting to them." },
        other ? { label: "Quick against slow", text: "Give " + them + " a fast, bright voice that never quite finishes a sentence, so every scene they share with " + who + " has two speeds running in it." } : null,
        { label: "From somewhere else", text: "Give one character an accent from a place the story never visits, and never explain how they ended up in " + areaName + "." },
        { label: "Barely speaks", text: "Cast someone who says less than ten lines in the whole thing, and let the others talk to fill the gap they leave." },
        { label: "A narrator", text: "Add a narrator who sounds thirty years older than everyone in the story, as though remembering it rather than watching it." },
        { label: "Use a real one", text: "Upload a recording of the voice you already hear when you read " + who + "'s lines, and we will cast from that instead of the library." }
      ]
    },
    music: {
      nudge: "Choose the feeling the music should give people.",
      tip: "Music works best playing the feeling underneath a scene, not the obvious one on top.",
      pool: [
        { label: "Gentle over sad", text: "Warm, quiet piano playing over the worst thing that happens to " + who + ", so the scene hurts more than it would in silence." },
        { label: "One instrument", text: "A single cello for the whole story, nothing else, so the one moment it stops is the loudest thing in the film." },
        { label: "A heartbeat", text: "A low synth pulse at around 60bpm that creeps up to 100 across the story and cuts out completely at the climax." },
        { label: "Big and old-fashioned", text: "Full strings and brass, the way an adventure film sounded in 1985, played absolutely straight." },
        { label: "Almost nothing", text: "No score at all until the halfway point, so the first cue people hear means something has changed." },
        { label: "From the room", text: "Music that starts as a radio playing in " + placeName + ", then quietly becomes the score once nobody is listening to it." }
      ]
    },
    shape: {
      nudge: "Decide how long this should be. Shorter is easier to finish.",
      tip: "A finished short beats an unfinished series, and you can always make more.",
      pool: [
        { label: "Make it short", text: "A nine minute short: one location, two characters, one conversation that goes wrong. About sixty shots." },
        { label: "One episode", text: "A single twenty-four minute episode that works on its own but is written as though seven more exist." },
        { label: "A film", text: "Ninety-five minutes, three acts, one storyline, no subplots you would have to keep alive." },
        { label: "Six and done", text: "Six twenty-four minute episodes that finish the story completely, with the midpoint at the end of episode three." },
        { label: "Very short", text: "Twelve episodes of ninety seconds, one beat each, shot 9:16 for phones." },
        { label: "Three minutes", text: "One three minute piece cut to music, no dialogue at all, built from about thirty shots." }
      ]
    },
    script: {
      nudge: "Scenes work best when they are short and end a little early.",
      tip: "If a scene has done its job, cut it there. You never have to show people leaving a room.",
      pool: [
        { label: "Get in late", text: "Start every scene after the conversation has already begun, so the first line is already an answer to something." },
        { label: "One job each", text: "Give each scene one job — deliver one fact, or change one relationship — and cut it the moment that job is done." },
        { label: "Cut a line", text: "Take the last line out of every conversation. Nine times out of ten the scene is better without it." },
        { label: "Someone wants something", text: "Make sure somebody in every scene wants something from somebody else and does not get all of it." },
        { label: "No talking", text: "Write one scene with no dialogue — " + who + " alone in " + placeName + ", doing one thing carefully — and put it just before the climax." },
        { label: "End on a face", text: "End three scenes on " + who + " deciding something, before they say what they have decided." }
      ]
    },
    notes: {
      nudge: "Write the rules you want us to follow, in plain words.",
      tip: "These beat everything else we would do, so keep them short and keep them few.",
      pool: [
        { label: "Never show", text: "We never see the " + thing + " properly. Reflections, edges of frame, and other people's reactions only." },
        { label: "Always there", text: placeName + " is visible from somewhere in every single scene, even the interiors." },
        { label: "Nothing like that", text: "No blood and no on-screen violence anywhere in this. A ten year old should be able to watch it." },
        { label: "How people talk", text: "Nobody explains anything they would not explain out loud in real life. If it needs explaining, cut the scene instead." },
        { label: "One colour rule", text: "The colour red appears on screen only in scenes where " + who + " is lying." },
        { label: "Keep it quiet", text: "Nobody raises their voice in this story. The tensest moments are the quietest ones." }
      ]
    },
    designs: {
      nudge: "Ask for the pictures you will look at over and over.",
      tip: "Anything you already have beats anything we make. Upload it instead.",
      pool: [
        { label: who + " turnaround", text: who + " from the front, the side and the back, same light, same clothes, neutral expression." },
        { label: "The " + thing, text: "The " + thing + ", photographed close up on a plain surface, the way a catalogue would shoot it." },
        { label: "Title card", text: "The title of the story as it would appear on screen, in the typeface it would really use." },
        { label: placeName, text: placeName + ", wide and completely empty, at the hour it appears most often in the story." },
        { label: "After", text: who + " in the last scene, after everything has happened, wearing whatever they are wearing by then." },
        { label: "A poster", text: "A poster: " + who + "'s face, the " + thing + " somewhere in frame, and six words of text." }
      ]
    },
    bible: {
      nudge: "This is for someone with money and no time. Keep it short.",
      tip: "Most people read the first page and stop, so put your best idea on it.",
      pool: [
        { label: "One page only", text: "One page: the logline, three short paragraphs of story, the cast in one line each, and one image of the look. Nothing else at all." },
        { label: "Lead with the strange bit", text: "Open the document on the " + thing + ", because it is the oddest true thing in here and it is what people will remember." },
        { label: "Show the whole season", text: "One sentence per episode down a single page, so anyone can see the shape of the season in ten seconds." },
        { label: "Be honest about comparisons", text: "Name the two things it sits beside, then one sentence on the thing yours does that neither of them does." },
        { label: "Why you", text: "Three lines on why this story came from you and would not have come from anybody else." },
        { label: "Who watches", text: "Two lines naming exactly who this is for and where they already watch things like it." }
      ]
    },
    promo: {
      nudge: "Pick where people will see this, then design for that shape.",
      tip: "Most people see it small, on a phone. Make sure it still reads at that size.",
      pool: [
        { label: "One face", text: who + "'s face filling the whole frame, eyes just above centre, no text over the features — readable at thumbnail size." },
        { label: "The object", text: "The " + thing + " alone on a plain background, lit hard from one side, title small in the bottom corner." },
        { label: "Six words", text: "Your logline cut to six words across the middle of the image, and nothing else on it at all." },
        { label: "Keep text central", text: "Every word inside the middle half of the frame, so the same artwork survives being cropped square, tall and wide." },
        { label: "Tall first", text: "Design the 1080 × 1920 version first, then crop upward for everything else. Most of this will be seen vertically." },
        { label: "One colour", text: "One strong colour across all eight sizes so the set reads as one campaign rather than eight separate posts." }
      ]
    }
  };

  // ---- answering a story-check question ----
  if (target.kind === "question") {
    var asked = target.question || "";
    return {
      nudge: asked
        ? "Here is how you could answer that, using the people and places already in your story."
        : "Answer it with what you already know about your own story.",
      examples: pick([
        other ? { label: "Point at " + them, text: "It is " + them + ", and it has been " + them + " since before " + who + " ever got involved. They started moving the " + thing + " for what felt at the time like a good reason, and have never found a moment to stop." } : null,
        { label: "Point at the " + thing, text: "It comes down to the " + thing + ". " + who + " has known where it came from since the beginning and has never once said so out loud." },
        { label: "Say what it costs", text: "If " + who + " gets this wrong they lose " + props.stake + ", and " + them + " loses everything they spent twenty years building." },
        { label: "Point at " + placeName, text: "The answer has been sitting in " + placeName + " the whole time, which is exactly why " + who + " has found eleven reasons not to go back there." },
        incident ? { label: "Tie it to the start", text: "It goes back to where this started: " + trim(incident) + ". Nothing that has happened since then has been an accident." } : null,
        { label: "Leave it unsaid", text: "We never explain it on screen. We just see " + who + " stop logging the " + thing + ", and nobody in " + placeName + " asks why." }
      ]),
      tip: "Even half an answer helps. Whatever you write here, we hold to."
    };
  }

  // Instant and the acts step need their own ideas. Falling back to Notes is
  // how someone on the Instant step was told what never to show on camera.
  SECTION.instant = {
    nudge: "Say what happens in the scene. One thing, clearly.",
    tip: "Keep it to one moment. Ten seconds of something specific beats a minute of something vague.",
    pool: [
      { label: "Someone arrives", text: who + " opens the door to somebody who should not be standing there." },
      { label: "Someone finds something", text: who + " finds the " + thing + " where it should not be, and stands there working out what that means." },
      other ? { label: "Two people", text: who + " and " + them + " finally say the thing neither of them has said, in " + placeName + ", with nobody else around." } : null,
      { label: "Getting caught", text: who + " is halfway through something they should not be doing when somebody else walks in." },
      { label: "Alone, deciding", text: who + " sits in " + placeName + " with the " + thing + " in front of them and decides, on camera, not to do the sensible thing." },
      { label: "The last moment", text: who + " walks out of " + placeName + " for the last time and does not look back at it." }
    ]
  };

  SECTION.structure = {
    nudge: "This is about the middle of your story, where most of it happens.",
    tip: "Act two is half the running time. It needs more than the spine gave it.",
    pool: [
      { label: "Make it cost something", text: "Add a beat where " + who + " gets what they wanted and immediately loses something better." },
      other ? { label: "Turn an ally", text: "Add a beat where " + them + " stops helping " + who + ", for a reason " + who + " cannot argue with." } : null,
      { label: "Raise the clock", text: "Add a beat that gives " + who + " a deadline — a date, a hearing, a last train." },
      { label: "A quiet one", text: "Add a beat with no dialogue at all: " + who + " alone in " + placeName + ", doing one small thing very carefully." },
      { label: "Make it personal", text: "Add a beat where " + who + " learns their own family is tied to the " + thing + "." },
      { label: "A false win", text: "Add a beat where everything appears to be solved, twenty minutes before it very much is not." }
    ]
  };

  var SHORT = {
    hook: {
      nudge: "The first ten seconds. What stops somebody scrolling past?",
      tip: "Start after the beginning. Whatever the situation is, we should already be in it.",
      pool: [
        { label: "Already in trouble", text: who + " is halfway up a ladder holding something they should not be holding, and somebody is coming up behind them." },
        { label: "A strange sentence", text: "Somebody says the one sentence that makes no sense yet — and " + who + " turns round." },
        { label: "One odd image", text: "Open on the " + thing + " where it absolutely should not be, with nobody explaining it." },
        { label: "Straight into a row", text: who + " and " + them + " are already arguing, and we join at the worst line." },
        { label: "A countdown", text: "Something is about to happen in sixty seconds and " + who + " is the only person who knows." },
        { label: "Looking at us", text: who + " looks directly into camera and asks a question we cannot answer yet." }
      ]
    },
    story: {
      nudge: "What happens in the middle? One situation, played all the way out.",
      tip: "A short only has room for one problem. Follow it, do not add a second.",
      pool: [
        { label: "Try and fail", text: who + " tries three times to fix it, and each attempt makes it slightly worse." },
        { label: "A conversation", text: who + " and " + them + " talk about one thing while clearly meaning another." },
        { label: "A small job", text: who + " has to get the " + thing + " from one side of " + placeName + " to the other without being seen." },
        { label: "Waiting", text: who + " waits for something that may not come, and we watch them decide how long to give it." },
        { label: "A favour", text: who + " agrees to do something small for " + them + " and it turns out not to be small." },
        { label: "One rule", text: who + " sets themselves one rule at the start and we watch them break it." }
      ]
    },
    twist: {
      nudge: "The turn at the end. What makes the whole thing worth watching?",
      tip: "The best twist makes you re-read the beginning, not the end. It should be fair.",
      pool: [
        { label: "We had it backwards", text: "It turns out " + who + " was never the one in trouble — " + them + " was, the whole time." },
        { label: "They knew", text: "The last shot shows " + who + " knew exactly what was going to happen before it started." },
        { label: "The cost", text: "They get what they wanted, and the last shot shows what it cost." },
        { label: "It is still going", text: "It ends exactly where it began, with somebody else now in " + who + "'s position." },
        { label: "The object", text: "The " + thing + " turns out to be the one thing nobody was looking at." },
        { label: "Nobody notices", text: "Something enormous happens and the people in the room carry on as if it had not." }
      ]
    }
  };

  if (target.kind === "short") {
    var sh = SHORT[target.key];
    if (sh) return { nudge: sh.nudge, examples: pick(sh.pool), tip: sh.tip };
  }

  var src = target.kind === "spine" ? SPINE[target.key] : SECTION[target.key];
  if (!src) {
    src = {
      nudge: "Here are a few directions you could take this.",
      tip: "Anything you pick can be changed afterwards.",
      pool: SECTION.notes.pool
    };
  }

  return { nudge: src.nudge, examples: pick(src.pool), tip: src.tip };
}

/**
 * Turn an answered story-check question into a SUGGESTED beat.
 * REAL: POST /api/ips/:id/beats/suggest  body = compilePayload(ip, "check", { questionId })
 *
 * Two hard requirements on the prompt:
 *  - the beat text must be built from the creator's answer, not from the
 *    model's own idea of what should happen next;
 *  - `reasoning` must explain the placement in terms of their structure,
 *    because a suggestion the creator cannot argue with is a suggestion
 *    they cannot properly reject.
 *
 * Returns { suggestion: { act, role, title, text, reasoning } }
 */
async function suggestBeat(payload, question) {
  await wait(3000);

  var acts = payload.context.story.structure.acts;
  var beatsIn = function (n) { return (acts.find(function (a) { return a.act === n; }) || {}).beats || []; };
  var act = question.act || 2;
  var answer = question.answer.trim().replace(/\s+/g, " ");
  var first = answer.split(/(?<=[.!?])\s/)[0] || answer;

  var roleByAct = { 1: "Setup", 2: "Rising action", 3: "Crisis" };
  var thin = beatsIn(act).length < 4;

  return {
    suggestion: {
      act: act,
      role: roleByAct[act] || "Rising action",
      // title from the creator's own words, not a mangled version of the
      // question — this is their beat once they accept it
      title: titleFrom(first),
      text: first.charAt(0).toUpperCase() + first.slice(1) +
        " Play it as one scene rather than explanation — the audience should watch it happen.",
      reasoning:
        "You answered \u201c" + question.title.toLowerCase() + "\u201d with something the beats never show. " +
        "Right now it is true in your head and invisible on screen. Dropping it into act " + act +
        (thin ? ", which is your thinnest act, " : " ") +
        "puts it in front of the audience at the point your structure has room for it. " +
        "If you would rather reveal it later, move it to act three and this becomes a late turn instead."
    }
  };
}

/**
 * Co-Producer turn. Reacts to what the creator just wrote, then moves on.
 * REAL: POST /api/ips/:id/coproducer  body = compilePayload(ip, "coproducer", { step, answer })
 *
 * Keep the reaction SHORT and specific to their words. A co-producer who
 * praises everything is worth nothing; one who notices the actual detail
 * they chose earns the next answer.
 */
async function coproducerReact(step, answer, index) {
  await wait(1400);
  var words = answer.trim().split(/\s+/);
  var hook = words.filter(function (w) { return w.length > 5; }).slice(-1)[0] || words[words.length - 1] || "that";
  hook = hook.replace(/[^a-zA-Z0-9'-]/g, "").toLowerCase();

  var openers = [
    "Good — \u201c" + hook + "\u201d is the kind of detail I can build on.",
    "Noted. I am holding on to \u201c" + hook + "\u201d — it will come back later.",
    "That works. It gives the next beat something to push against.",
    "Clear enough to shoot. On we go.",
    "Right — that changes what your ending has to do."
  ];
  return { reaction: openers[index % openers.length] };
}

/**
 * Generate one show bible document.
 * REAL: POST /api/ips/:id/bible/:docId -> returns markdown + a rendered PDF url
 */
async function generateBibleDoc(payload, docId) {
  await wait(3200);
  var c = payload.context;
  var body = {
    onepager: [c.title, "", c.story.logline, "", c.story.synopsis,
      "", "Format: " + (c.format ? c.format.type : "—"), "Tone: " + c.story.tones.join(", ")],
    bios: c.characters.map(function (ch) {
      return ch.name + " — " + ch.role + "\n" + (ch.physicalDescription || "") + "\nArc: " + (ch.arc || "to be written");
    }),
    world: c.locations.map(function (l) { return l.name + " — " + (l.atmosphere || ""); }),
    lookbook: ["Style: " + (c.visual.style || "—"),
      "Palette: " + (c.visual.palette ? c.visual.palette.hex.join("  ") : "—"),
      "Camera: " + c.visual.cameraLanguage.join(", ")],
    episodes: c.story.structure.acts.map(function (a) {
      return a.name + "\n" + a.beats.map(function (b) { return "  · " + b.role + " — " + b.title; }).join("\n");
    }),
    comps: ["Sits beside: yours to fill in. We will not invent comparables we cannot stand behind."]
  }[docId] || ["Draft."];

  return { docId: docId, body: [].concat(body).join("\n\n"), pages: Math.max(1, Math.ceil([].concat(body).length / 3)) };
}

/** REAL: POST /api/ips/:id/bible/deck -> slides + rendered images */
async function generateDeck(payload) {
  await wait(4200);
  var c = payload.context;
  return {
    slides: DECK_SLIDES.map(function (sl) {
      return {
        id: sl.id,
        name: sl.name,
        headline: sl.id === "title" ? c.title
          : sl.id === "premise" ? c.story.logline
          : sl.id === "world" ? (c.locations[0] ? c.locations[0].name : "The world")
          : sl.id === "cast" ? c.characters.map(function (x) { return x.name; }).join(" · ")
          : sl.id === "look" ? (c.visual.style || "The look")
          : sl.id === "season" ? (c.format ? (c.format.episodes || 1) + " x " + c.format.runtimeMinutes + " min" : "Season shape")
          : "Why now",
        body: sl.hint,
        plate: [1920, 1080]
      };
    })
  };
}

/**
 * Promotional set at platform dimensions.
 * REAL: POST /api/ips/:id/promo -> image model per format, same key art seed
 * so the set looks like one campaign rather than eight unrelated posters.
 */
async function generatePromo(payload, formatIds) {
  await wait(4000);
  var c = payload.context;
  return {
    images: formatIds.map(function (id) {
      var f = PROMO_FORMATS.find(function (x) { return x.id === id; });
      return {
        id: "pr" + Date.now() + "_" + id,
        formatId: id, name: f.name, w: f.w, h: f.h,
        caption: c.title + " — " + (c.story.tones[0] || "") + " " + (c.format ? c.format.type : ""),
        status: "ready"
      };
    })
  };
}

/**
 * Final export.
 * REAL: POST /api/ips/:id/export -> ffmpeg worker.
 * Stems matter: anyone finishing properly needs dialogue away from score.
 */
async function exportMaster(payload, trackIds) {
  await wait(3600);
  return {
    success: true,
    files: trackIds.map(function (id) {
      var t = EXPORT_TRACKS.find(function (x) { return x.id === id; });
      return { id: id, name: t.name, url: PLACEHOLDER_VIDEO, kind: id === "captions" ? "text" : id === "master" || id === "scenes" ? "video" : "audio" };
    })
  };
}

// ============================================================
// Riff generation
//
// The thing that makes a riff feel written rather than assembled is
// that every line knows about every other line. So we do not randomise
// line by line — we pick ONE WORLD at random (who opposes them, what
// is being hidden, where, what it costs, by when) and then derive all
// eight spine lines, the three acts and the cast from it.
//
// That gives two properties at once:
//   · every riff is different, because the world is rolled fresh
//   · every riff holds together, because one world produced all of it
//
// A re-roll of a single line draws another variant from the SAME world,
// so swapping one sentence can never contradict the other seven.
// ============================================================

// ============================================================
// Story engines
//
// One premise is not like another. "A porter finds doors that are not on
// the plan" is an investigation; "two brothers who have not spoken drive
// across the country" is a journey about a wound. Running both through the
// same cover-up template is how you get brothers who "signed for things
// they never checked" and an auditor nobody asked for.
//
// So: work out which engine the premise is, then generate from that
// engine's logic. Every engine supplies its own eight lines, its own cast
// roles, and its own answer to whether the premise is the incident or the
// situation the incident interrupts.
// ============================================================

var RIFF_ENGINES = {

  // ---------- somebody finds something that does not add up ----------
  investigation: {
    name: "investigation",
    strong: /\b(cover[- ]?up|investigat\w*|evidence|the case|murder|fraud|missing person)\b/i,
    premiseRole: "incident",
    detect: /\b(find|finds|finding|found|discover|discovers|missing|vanish|evidence|body|case|secret|records?|hidden|uncover|proof|investigat|detective|murder|theft|stolen|fraud|cover|clue|witness)\b/i,
    cast: { ant: "the person who has been keeping it quiet", antLabel: "Antagonist", ally: "the one person who will go on the record", allyLabel: "Supporting" },
    triggers: ["the second one turned up", "somebody asked a question in the wrong meeting", "the file came back with a page missing"],
    leadArc: "From filing it away to refusing to",
    closers: { 1: " By the end of the act it is not something that can be handed back.", 2: " Whatever was being saved for later is spent by the close of this act." },
    spine: function (w) {
      var T = w.T, They = w.They;
      return {
        once: [
          T + " " + w.HAD + " a job that ran on rails, and " + w.room + " was just somewhere " + (w.plural ? "they" : "they") + " passed through.",
          T + " had been doing the same work long enough to stop seeing " + w.room + " at all.",
          "Everyone in " + w.area + " knew " + They + " well enough to nod at, and nobody knew " + (w.plural ? "them" : "them") + " at all."
        ],
        everyDay: [
          "Every day meant the same round, the same sign-off, and the same quiet evening at the end of it.",
          "Every day " + They + " noticed small things that did not add up, and let every one of them go.",
          "Every day " + w.room + " was locked by six, and nobody ever asked who had the other key."
        ],
        untilOneDay: [
          "Until one day " + w.lower + ".",
          "Until one day " + w.lower + ", and it was not something that could be filed away.",
          "Until one day the same thing turned up twice, which meant it was not a mistake."
        ],
        becauseA: [
          "Because of that, " + They + " went back into " + w.room + " when nobody else was there, and started reading.",
          "Because of that, " + They + " said nothing to anyone and started pulling the paperwork apart alone.",
          "Because of that, " + They + " asked " + w.allyName + " a question " + (w.plural ? "they" : "they") + " could not un-ask."
        ],
        becauseB: [
          "Because of that, " + They + " found out " + w.secret + ".",
          "Because of that, " + w.antName + " — " + w.antRole + " — started paying very polite attention.",
          "Because of that, " + w.allyName + " was moved to a different shift, with no explanation given."
        ],
        becauseC: [
          "Because of that, " + They + " had until " + w.deadline + " before the whole thing was somebody else's to bury.",
          "Because of that, " + w.stake + " went on the table, and " + w.antName + " made sure " + They + " knew it.",
          "Because of that, there was nobody left in " + w.area + " who would say any of it out loud."
        ],
        untilFinally: [
          "Until finally " + They + " stood in " + w.room + " with " + w.antName + " and said it in front of everyone who was there.",
          "Until finally " + They + " had to choose between proving it and keeping " + w.stake + ".",
          "Until finally " + They + " handed the lot over, kept no copy, and let somebody else decide what it was worth."
        ],
        eversince: [
          "Ever since that day the round has been the same, except for the one door that stays locked.",
          "Ever since that day nobody in " + w.area + " has mentioned it, and nobody has said why not.",
          "Ever since that day " + w.stakeShort + " has been gone, and " + They + " " + w.HAS + " stopped pretending otherwise."
        ]
      };
    }
  },

  // ---------- people forced into the same space, going somewhere ----------
  journey: {
    name: "journey",
    strong: /\b(drive across|road trip|journey|travels? to|walks? to|take \w+ to)\b/i,
    premiseRole: "situation",
    detect: /\b(drive|drives|driving|drove|road|trip|journey|travel|across|walk|hike|sail|flight|fly|train|bus|move|moving|migrat|pilgrimage|deliver|escort|take .* to)\b/i,
    cast: { ant: "the other half of this, who refuses to let it go", antLabel: "Supporting", ally: "somebody met on the way", allyLabel: "Supporting" },
    triggers: ["a phone call came at four in the morning", "the letter from the solicitor arrived", "somebody died and left the arrangements to both of them", "a date was set and neither could claim to be busy"],
    leadArc: "From keeping the distance to crossing it",
    closers: { 1: " By the end of the act they are both in the car.", 2: " By the close of the act there is nowhere left to put any of it." },
    spine: function (w) {
      var T = w.T, They = w.They;
      return {
        once: [
          T + " had built " + (w.plural ? "lives" : "a life") + " that worked perfectly well as long as " + (w.plural ? "they" : "they") + " stayed where " + (w.plural ? "they were" : "they were") + ".",
          "There was a distance between them that had taken years to get comfortable.",
          T + " had " + w.wound + ", and had arranged everything since around not having to discuss it."
        ],
        everyDay: [
          "Every day that arrangement held, because nothing ever required them to be in the same place.",
          "Every day went by without the subject coming up, which both of them counted as a success.",
          "Every day the gap got a little easier to live with and a little harder to cross."
        ],
        untilOneDay: [
          "Until one day " + w.trigger + ", and " + w.lower + ".",
          "Until one day " + w.trigger + " — and there was no version of it that did not involve both of them.",
          "Until one day " + w.lower + ", because " + w.trigger + " and nobody else could go."
        ],
        becauseA: [
          "Because of that, the first two hundred miles went by almost entirely in silence.",
          "Because of that, they agreed on a route, a schedule, and nothing else whatsoever.",
          "Because of that, " + They + " set off, each quietly certain the other would be the one to crack."
        ],
        becauseB: [
          "Because of that, somewhere past the halfway point, the thing neither of them says got said.",
          "Because of that, a small argument about the radio turned into the real one — the one about " + w.wound + ".",
          "Because of that, they had to stop for the night, and there was nowhere left to put the silence."
        ],
        becauseC: [
          "Because of that, one of them got out of the car, and for an hour it was not clear they were getting back in.",
          "Because of that, " + w.stake + " stopped being something either of them could protect by saying nothing.",
          "Because of that, they were going to arrive either as two people who had sorted it out or two people who never would."
        ],
        untilFinally: [
          "Until finally they arrived, and had to decide whether any of it had been worth saying.",
          "Until finally one of them said the thing that could not be taken back, with the engine still running.",
          "Until finally they got where they were going, and the reason for the trip turned out to be the smallest part of it."
        ],
        eversince: [
          "Ever since that drive they speak about once a month, which is more than before and less than it should be.",
          "Ever since that drive neither of them has mentioned what was said somewhere around hour six.",
          "Ever since that drive the distance has been the same distance, and it costs less to cross."
        ]
      };
    }
  },

  // ---------- a wound between people, forced into the open ----------
  relationship: {
    name: "relationship",
    strong: /\b(have not spoken|had not spoken|estranged|falling out|divorce|reconcil\w*)\b/i,
    premiseRole: "situation",
    detect: /\b(brother|brothers|sister|sisters|mother|father|son|daughter|wife|husband|married|marriage|divorce|estranged|ex|love|lover|friend|friends|spoken|speaking|family|parent|twins?|couple|wedding|funeral)\b/i,
    cast: { ant: "the one who thinks the past is settled", antLabel: "Supporting", ally: "the person caught in the middle", allyLabel: "Supporting" },
    triggers: ["somebody died and left the arrangements to both of them", "a wedding invitation arrived with both names on it", "the hospital rang and asked for next of kin", "the house finally sold"],
    leadArc: "From managing it at a distance to saying it out loud",
    closers: { 1: " By the end of the act they are in the same room.", 2: " By the close of the act the arrangement that held for years is gone." },
    spine: function (w) {
      var T = w.T, They = w.They;
      return {
        once: [
          T + " had " + w.wound + ", and had spent years arranging a life around not discussing it.",
          "There were two people here who could go a decade without being in the same room, and had.",
          T + " " + w.HAD + " every reason to believe the whole thing was closed."
        ],
        everyDay: [
          "Every day the silence held, because nobody was ever going to be the first to break it.",
          "Every day they managed it the same way: politely, at a distance, through other people.",
          "Every day the subject stayed where it had been put, which everyone agreed was for the best."
        ],
        untilOneDay: [
          "Until one day " + w.trigger + ", and " + w.lower + ".",
          "Until one day " + w.trigger + ", which made the whole arrangement impossible to keep.",
          "Until one day " + w.lower + " — and the one thing nobody had said in years was suddenly in the room."
        ],
        becauseA: [
          "Because of that, they were civil, which was worse than an argument and everybody knew it.",
          "Because of that, " + They + " agreed to do this one thing and nothing else, and meant it.",
          "Because of that, " + w.allyName + " was asked to be there, to keep it from going wrong."
        ],
        becauseB: [
          "Because of that, " + w.wound + " came up in front of people it should never have come up in front of.",
          "Because of that, somebody repeated a version of events that was not the agreed version.",
          "Because of that, " + w.allyName + " took a side, and could not take it back."
        ],
        becauseC: [
          "Because of that, " + w.stake + " stopped being something either of them could keep out of it.",
          "Because of that, there was no going back to the arrangement that had held for years.",
          "Because of that, they had until " + w.deadline + " to decide whether this was a family or just people with the same surname."
        ],
        untilFinally: [
          "Until finally one of them said the true thing, badly, at the worst possible moment.",
          "Until finally they had the conversation nine years late, and it took eleven minutes.",
          "Until finally " + They + " had to choose between being right and being in the same room again."
        ],
        eversince: [
          "Ever since that day they speak about once a month, which is more than before.",
          "Ever since that day nobody has brought it up again, and this time that is a decision rather than a habit.",
          "Ever since that day " + w.stakeShort + " has been gone, and nobody pretends it is coming back."
        ]
      };
    }
  },

  // ---------- something impossible gets into an ordinary life ----------
  strange: {
    name: "strange",
    strong: /\b(ghost|haunt\w*|letters? from|voices?|impossible|that should not|never on any)\b/i,
    premiseRole: "incident",
    detect: /\b(ghost|haunt|dream|impossible|appears|appearing|voice|voices|signal|letters? from|dead|time|loop|door|doors|mirror|shadow|creature|monster|curse|magic|visions?|sleepwalk|static|broadcast|radio|tape)\b/i,
    cast: { ant: "the one who needs it to stay unexplained", antLabel: "Antagonist", ally: "the only other person who has seen it", allyLabel: "Supporting" },
    triggers: ["it happened a second time, in daylight", "somebody else saw it", "the same date came up twice in the same week"],
    leadArc: "From explaining it away to needing an answer",
    closers: { 1: " By the end of the act it has happened twice, which rules out a mistake.", 2: " By the close of the act there is no version of this that is ordinary." },
    spine: function (w) {
      var T = w.T, They = w.They;
      return {
        once: [
          T + " " + w.HAD + " an ordinary life in " + w.area + ", and no particular opinion about anything strange.",
          T + " " + w.HAD + " never once been the sort of person this happens to.",
          "There was somebody here who dealt in facts, schedules and things that could be checked."
        ],
        everyDay: [
          "Every day was the same, and the sameness was the point of it.",
          "Every day " + w.room + " was exactly as it had been the day before, which is how anyone would notice if it were not.",
          "Every day " + They + " locked up, went home, and thought about none of it."
        ],
        untilOneDay: [
          "Until one day " + w.lower + ".",
          "Until one day " + w.lower + ", and there was no sensible explanation available.",
          "Until one day it happened again, in front of " + w.allyName + ", who went very quiet."
        ],
        becauseA: [
          "Because of that, " + They + " started writing it down, times and all, like evidence.",
          "Because of that, " + They + " went back to " + w.room + " at the same hour to see whether it would do it again.",
          "Because of that, " + They + " told exactly one person, and chose badly."
        ],
        becauseB: [
          "Because of that, " + They + " found out " + w.secret + ", which made it worse rather than better.",
          "Because of that, " + w.antName + " — " + w.antRole + " — made it clear this was not to be discussed.",
          "Because of that, " + w.allyName + " stopped answering, and the next time they met, pretended not to remember."
        ],
        becauseC: [
          "Because of that, " + They + " could not tell any more which parts of the day " + (w.plural ? "they had" : "they had") + " actually lived through.",
          "Because of that, " + w.stake + " went on the table, because people had started to talk.",
          "Because of that, there was nobody left in " + w.area + " who would sit in that room after dark."
        ],
        untilFinally: [
          "Until finally " + They + " went back one last time and waited for it, with the lights off.",
          "Until finally " + They + " got an answer, and it was worse than not knowing.",
          "Until finally " + They + " had to choose between making it stop and finding out what it wanted."
        ],
        eversince: [
          "Ever since that night " + w.room + " has stayed locked, and nobody has asked for the key.",
          "Ever since that night it has not happened again, which is its own kind of unbearable.",
          "Ever since that night " + They + " " + w.HAS + " kept one light on, and has never explained why."
        ]
      };
    }
  },

  // ---------- they want something and go after it ----------
  goal: {
    name: "goal",
    strong: /\b(to win|to save|to build|tries to|trying to|compet\w*|contest|heist|robs?)\b/i,
    premiseRole: "situation",
    detect: /\b(steal|rob|heist|win|build|save|rescue|compete|race|contest|open|start|launch|prove|beat|escape|get back|reclaim|buy|audition|run for)\b/i,
    cast: { ant: "whoever stands between them and it", antLabel: "Antagonist", ally: "the one who signs on first", allyLabel: "Supporting" },
    triggers: ["the deadline was announced", "the last slot came free", "somebody else entered and made it a race", "the money came through, and only just"],
    leadArc: "From wanting it quietly to committing in public",
    closers: { 1: " By the end of the act backing out costs more than carrying on.", 2: " By the close of the act there is one attempt left." },
    spine: function (w) {
      var T = w.T, They = w.They;
      return {
        once: [
          T + " " + w.HAD + " wanted this for longer than " + (w.plural ? "they" : "they") + " would admit to anybody.",
          T + " " + w.HAD + " a plan, no money, and a deadline nobody else took seriously.",
          "There was somebody in " + w.area + " with one idea and nothing else going on."
        ],
        everyDay: [
          "Every day went on the ordinary work that paid for it, and the evenings went on the plan.",
          "Every day the thing got slightly closer and slightly more expensive.",
          "Every day somebody told them it was not going to happen, and every day they agreed and carried on."
        ],
        untilOneDay: [
          "Until one day " + w.trigger + ", and " + w.lower + ".",
          "Until one day it became now or not at all: " + w.lower + ".",
          "Until one day " + w.lower + ", with " + w.deadline + " as the hard stop."
        ],
        becauseA: [
          "Because of that, " + They + " brought in " + w.allyName + ", who should have said no.",
          "Because of that, " + They + " spent money that was not there and told nobody.",
          "Because of that, " + They + " committed in public, which made backing out the expensive option."
        ],
        becauseB: [
          "Because of that, " + w.antName + " — " + w.antRole + " — worked out what was going on.",
          "Because of that, the first attempt went wrong in a way nobody had planned for.",
          "Because of that, " + w.allyName + " wanted out, and had every reason to be let out."
        ],
        becauseC: [
          "Because of that, " + w.stake + " was on it, and there was no quiet way to stop.",
          "Because of that, they had one go left and " + w.deadline + " to take it.",
          "Because of that, the only remaining plan was the one everybody had already rejected."
        ],
        untilFinally: [
          "Until finally they went for it, and found out which parts of the plan were ever real.",
          "Until finally " + They + " got it, and it cost " + w.cost + ".",
          "Until finally " + They + " had to choose between winning it and keeping " + w.stake + "."
        ],
        eversince: [
          "Ever since then it has been theirs, and " + They + " " + w.HAS + " not once said it was worth it.",
          "Ever since then nobody in " + w.area + " brings it up, and everybody knows.",
          "Ever since then " + w.stakeShort + " has been gone, and the thing they wanted is sitting right there."
        ]
      };
    }
  },

  // ---------- somebody comes back, or somebody new arrives ----------
  arrival: {
    name: "arrival",
    strong: /\b(returns? to|comes? back to|moves? in|turns? up|inherits?|new in town)\b/i,
    premiseRole: "situation",
    detect: /\b(arrives?|arrived|returns?|returned|comes? back|came back|moves? in|moved in|turns? up|turned up|stranger|newcomer|inherits?|inherited|new neighbou?r|back to)\b/i,
    cast: { ant: "whoever benefits from nothing changing", antLabel: "Antagonist", ally: "the first person glad they came", allyLabel: "Supporting" },
    triggers: ["the letter said the house was theirs", "the job came up and nowhere else would have them", "there was nowhere else left to go"],
    leadArc: "From passing through to being part of it",
    closers: { 1: " By the end of the act everybody knows they are here.", 2: " By the close of the act staying is a position, not a choice." },
    spine: function (w) {
      var T = w.T, They = w.They;
      return {
        once: [
          "In " + w.area + " everything had settled into a shape that suited the people who set it.",
          T + " had left " + w.area + " a long time ago and had very good reasons not to go back.",
          "There was a balance here that had held for years and that nobody examined too closely."
        ],
        everyDay: [
          "Every day ran the way it had always run, and nobody could remember deciding on any of it.",
          "Every day the same people said the same things in the same order.",
          "Every day the thing that happened back then stayed unmentioned, which counted as resolved."
        ],
        untilOneDay: [
          "Until one day " + w.lower + ".",
          "Until one day " + w.lower + ", and " + w.area + " had to decide how to behave.",
          "Until one day " + w.trigger + ", and " + w.lower + "."
        ],
        becauseA: [
          "Because of that, people were extremely welcoming, in the way that makes it clear you are being watched.",
          "Because of that, " + They + " started asking about something everybody had agreed to leave alone.",
          "Because of that, " + w.allyName + " was the only one who said anything honest in the first week."
        ],
        becauseB: [
          "Because of that, " + w.secret + " started to surface in ordinary conversation.",
          "Because of that, " + w.antName + " — " + w.antRole + " — decided this had gone far enough.",
          "Because of that, somebody who had been quiet for twenty years decided to speak."
        ],
        becauseC: [
          "Because of that, staying stopped being a choice and started being a position.",
          "Because of that, " + w.stake + " was suddenly on the table for people who had nothing to do with it.",
          "Because of that, " + w.area + " split into people who wanted this dealt with and people who wanted it over."
        ],
        untilFinally: [
          "Until finally it came out, in public, in front of the people it was being kept from.",
          "Until finally " + They + " had to decide whether to stay and live in it or go and leave it exactly as it was.",
          "Until finally " + They + " got what " + (w.plural ? "they" : "they") + " came for, and it changed nothing for anybody else."
        ],
        eversince: [
          "Ever since then " + w.area + " has gone back to normal, except that everybody knows.",
          "Ever since then the balance has held again, held differently, and nobody says so.",
          "Ever since then " + They + " " + w.HAS + " stayed, and it is not comfortable, and it is not leaving."
        ]
      };
    }
  }
};

// Extra facts certain engines need. Rolled with the rest of the world.
var RIFF_EXTRAS = {
  wound: ["a falling out nobody has repeated the details of since",
          "nine years of not speaking and no clear memory of who started it",
          "one afternoon that neither of them describes the same way",
          "a debt that was paid back and never actually settled",
          "something said at a funeral that cannot be unsaid"],
  trigger: ["a phone call came at four in the morning",
            "the solicitor's letter arrived",
            "somebody died and left the arrangements to both of them",
            "the house finally sold",
            "a date was set and neither could claim to be busy",
            "the hospital rang and asked for next of kin"],
  prize: ["the lease", "the licence", "the last slot", "the deeds", "the recording"]
};

function rpick(list, avoid) {
  var pool = avoid == null ? list : list.filter(function (x) { return x !== avoid; });
  if (!pool.length) pool = list;
  return pool[Math.floor(Math.random() * pool.length)];
}

var RIFF_NAMES = {
  lead: ["Ro Calder", "Elena Reyes", "Ash Moreau", "Nita Varga", "Sam Deverell", "Mia Okafor",
         "Theo Brandt", "Jude Halloran", "Cass Petrov", "Ivy Marchetti"],
  antagonist: ["Mercer Hale", "Wren Abbot", "Victor Sallow", "Dinah Brecht", "Lowell Grice",
               "Esther Vane", "Col Rafferty", "Marguerite Dax"],
  ally: ["Dess Okonjo", "Tobias Rees", "Nell Hask", "Pilar Ruiz", "Fen Adeyemi",
         "Gus Lindqvist", "Bea Thornton", "Ravi Shah"]
};

var RIFF_WORLD = {
  antRole: ["the person who signs everything off", "the one with keys to every door",
            "somebody two levels above them", "the only other person who was there",
            "the family that has run it for three generations", "the auditor nobody expected"],
  allyRole: ["a colleague on the same shift", "somebody half their age who notices everything",
             "an old friend who owes them nothing", "the one person still answering the phone",
             "a neighbour who has watched this for years"],
  secret: ["money has been moving through it for twenty years",
           "somebody was paid to look the other way",
           "the records were rewritten after the fact",
           "the person everyone thinks died is not dead",
           "the same thing happened before, and was buried",
           "they have been signing for things that never arrived",
           "there is a name on the paperwork that cannot be there"],
  motive: ["to protect somebody who is already dead",
           "because stopping now would cost more than carrying on",
           "to keep a promise made to the wrong person",
           "because nobody ever asked them to stop",
           "to hold a family together that is not worth holding"],
  stake: [
    { it: "the only job that would have them", short: "the job" },
    { it: "the house", short: "the house" },
    { it: "custody of their kid", short: "the custody hearing" },
    { it: "the one person who still trusts them", short: "that trust" },
    { it: "everything they have spent eleven years building", short: "eleven years of work" },
    { it: "their name in a town of four thousand people", short: "their good name" }
  ],
  deadline: ["the end of the month", "Friday", "the hearing", "the sale going through",
             "the night shift ending", "the inspection"],
  room: ["the back room", "the room nobody uses", "the storeroom", "the office upstairs",
         "the yard after dark", "the place they work", "the corridor at the end"],
  area: ["the town", "the district", "the estate", "the valley", "the borough", "the village"],
  cost: ["their job", "a friendship they cannot get back", "any chance of leaving quietly",
         "the version of themselves they could live with"]
};

/**
 * Which kind of story is this? Scored on the creator's own words, so a road
 * trip gets the journey engine and a cover-up gets the investigation one.
 * Nothing matches → pick at random, which is still better than always
 * reaching for the same template.
 */
function pickRiffEngine(text) {
  var best = null, bestScore = 0;
  Object.keys(RIFF_ENGINES).forEach(function (id) {
    var e = RIFF_ENGINES[id];
    var hits = (text.match(new RegExp(e.detect.source, "gi")) || []).length;
    // A phrase like "have not spoken" or "returns to" names the kind of story
    // outright, so it outweighs a scatter of single-word matches.
    if (e.strong && e.strong.test(text)) hits += 3;
    if (hits > bestScore) { bestScore = hits; best = id; }
  });
  if (best) return best;
  return rpick(Object.keys(RIFF_ENGINES));
}

/** Roll one coherent world. Everything downstream reads from this. */
function buildRiffWorld(text, format) {
  var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };

  var PEOPLEW = ("woman man girl boy child kid mother father brother brothers sister sisters wife "
    + "husband friend neighbour neighbor nurse doctor teacher detective keeper cleaner driver porter "
    + "student soldier guard widow people someone chef cook writer artist pilot").split(" ");
  var PLACEW = ("country city town village house home flat room kitchen street road lane school "
    + "hospital office station yard pool river bridge coast beach factory shop store church hall "
    + "corridor cellar attic garden field forest island valley building world restaurant bar pub "
    + "cafe hotel museum library theatre theater studio").split(" ");
  var TIMEW = ("century decade year years month months week weeks day days night nights morning "
    + "evening afternoon hour hours minute minutes moment time times while past future").split(" ");

  // ---- who this is about, lifted from their own sentence ----
  var ROLE_VERBS = "who|that|keeps|starts|gets|finds|wakes|hunts|is|was|has|have|must|decides|goes|"
    + "returns|discovers|realises|realizes|learns|meets|refuses|agrees|inherits|buys|loses|becomes|tries|spends|works|lives";
  var roleRe = new RegExp("\\b(?:a|an|the|two|three|four|both)\\s+([a-z][a-z'-]+(?:\\s+[a-z][a-z'-]+)?)\\s+(?:" + ROLE_VERBS + ")\\b", "gi");
  var role = null, rm;
  while ((rm = roleRe.exec(text)) !== null) {
    var cand = rm[1].trim().toLowerCase().replace(/\s+(who|that|which|whose|whom)$/i, "").trim();
    var head = cand.split(/\s+/).pop();
    if (!cand) continue;
    if (PLACEW.indexOf(head) !== -1 || TIMEW.indexOf(head) !== -1) continue;
    if (["she", "he", "they", "it", "him", "her", "them"].indexOf(head) !== -1) continue;
    role = cand;
    break;
  }

  // ---- the concrete object, also theirs where possible ----
  var nouns = (text.toLowerCase().match(/\b(?:the|a|an|her|his|their)\s+([a-z][a-z'-]{3,})\b/g) || [])
    .map(function (m) { return m.split(/\s+/).pop().replace(/'s$/, ""); })
    .filter(function (w) {
      return PEOPLEW.indexOf(w) === -1 && PLACEW.indexOf(w) === -1 && TIMEW.indexOf(w) === -1 &&
        !/(ed|ing|ly)$/.test(w) && (!role || role.indexOf(w) === -1);
    });

  // Not every object gets an article. "starts finding doors" has no "the",
  // and without this the whole story falls back on "all of it".
  if (!nouns.length) {
    var bare = text.toLowerCase().match(/\b(?:finding|hiding|carrying|collecting|receiving|selling|burning|keeping|stealing|reading|writing|sending|getting)\s+([a-z][a-z'-]{3,})\b/);
    if (bare && PEOPLEW.indexOf(bare[1]) === -1 && PLACEW.indexOf(bare[1]) === -1 && TIMEW.indexOf(bare[1]) === -1) {
      nouns.push(bare[1]);
    }
  }

  // A place of their own, if they named one. "A lighthouse keeper" names a
  // lighthouse — taking the room from a generic pool there is how a keeper
  // ends up doing their rounds through "the old ward".
  var ownPlace = (text.toLowerCase().match(/\b(?:the|a|an|her|his|their)\s+([a-z][a-z'-]{3,})\b/g) || [])
    .map(function (m) { return m.split(/\s+/).pop(); })
    .filter(function (w) { return PLACEW.indexOf(w) !== -1; })[0];

  if (!ownPlace && role && role.indexOf(" ") !== -1) {
    var head = role.split(/\s+/).pop();
    ownPlace = role.split(/\s+/).filter(function (x) {
      return x !== head && PEOPLEW.indexOf(x) === -1 && TIMEW.indexOf(x) === -1 && x.length > 4;
    })[0];
  }

  var plural = !!role && (/s$/.test(role.split(" ").pop()) || /^(two|three|four|both)\b/i.test(text));

  var stakeRec = rpick(RIFF_WORLD.stake);
  var engineId = pickRiffEngine(text);
  var engine = RIFF_ENGINES[engineId];

  return {
    engine: engineId,
    premiseRole: engine.premiseRole,
    wound: rpick(RIFF_EXTRAS.wound),
    trigger: rpick(engine.triggers || RIFF_EXTRAS.trigger),
    prize: rpick(RIFF_EXTRAS.prize),
    text: text,
    lower: text.charAt(0).toLowerCase() + text.slice(1),
    format: format,
    role: role,
    They: role ? "the " + role : "our lead",
    T: (function (t) { return t.charAt(0).toUpperCase() + t.slice(1); })(role ? "the " + role : "our lead"),
    plural: plural,
    HAS: plural ? "have" : "has",
    HAD: "had",
    STOPS: plural ? "stop" : "stops",
    GOES: plural ? "go" : "goes",
    hasThing: nouns.length > 0,
    thing: nouns[0] || null,
    theThing: nouns.length ? "the " + nouns[0] : "all of it",
    thing2: nouns[1] || null,

    leadName: rpick(RIFF_NAMES.lead),
    antName: rpick(RIFF_NAMES.antagonist),
    allyName: rpick(RIFF_NAMES.ally),
    antRole: engine.cast.ant,
    allyRole: engine.cast.ally,
    secret: rpick(RIFF_WORLD.secret),
    motive: rpick(RIFF_WORLD.motive),
    stake: stakeRec.it,
    stakeShort: stakeRec.short,
    deadline: rpick(RIFF_WORLD.deadline),
    room: ownPlace ? "the " + ownPlace : rpick(RIFF_WORLD.room),
    area: rpick(RIFF_WORLD.area),
    cost: rpick(RIFF_WORLD.cost)
  };
}

/**
 * Every variant of every line, all reading from one world.
 * Re-rolling a line picks another entry from the same list, which is why
 * a swap can never contradict the rest of the story.
 */
function riffSpineVariants(w) {
  var engine = RIFF_ENGINES[w.engine] || RIFF_ENGINES.investigation;
  return engine.spine(w);
}

function riffShortVariants(w) {
  var They = w.They;
  return {
    hook: [
      "Open on " + They + " already halfway into trouble in " + w.room + ", before anybody explains why.",
      "One image that makes no sense yet: " + They + " in " + w.room + " at an hour nobody should be there.",
      w.antName + " asks " + They + " one question, and the answer takes the whole film.",
      "Thirty seconds of something perfectly ordinary, and then one detail that is wrong."
    ],
    story: [
      w.text + ", and the next few minutes " + w.GOES + " on trying to undo it quietly.",
      They + " " + (w.plural ? "try" : "tries") + " three times to put it back, and each attempt makes it worse.",
      "A conversation with " + w.allyName + " about one thing that is clearly about another.",
      They + " " + (w.plural ? "have" : "has") + " until " + w.deadline + " to make this look like it never happened."
    ],
    twist: [
      (w.hasThing ? "The " + w.thing : "What they found") + " was never the problem. " + w.antName + " was.",
      "It turns out " + w.secret + ", and " + They + " already knew.",
      "The last shot shows " + w.allyName + " doing exactly what " + They + " just did.",
      They + " " + (w.plural ? "get" : "gets") + " away with it, and the final frame shows what it cost."
    ]
  };
}

/** Acts are composed FROM the chosen spine lines, so they can never drift. */
function riffActsFrom(spine, w, short) {
  var end = function (t) {
    t = (t || "").trim();
    return /[.!?]$/.test(t) ? t : t + ".";
  };
  var join = function (list) {
    return list.filter(Boolean).map(end).join(" ");
  };

  // The spine says "Because of that" three times, which is right for a list
  // of beats and wrong for a paragraph. Vary the joins so an act reads as
  // prose while still saying exactly what the eight lines say.
  // Names keep their capital. An earlier version produced "Which means
  // wren Abbot", which is the kind of detail that makes a draft look machine-made.
  var PROPER = [w.leadName, w.antName, w.allyName]
    .filter(Boolean).map(function (n) { return n.split(" ")[0]; });
  var lead = function (t) {
    var first = t.split(/\s+/)[0].replace(/[^A-Za-z'-]/g, "");
    if (PROPER.indexOf(first) !== -1) return t;
    return t.charAt(0).toLowerCase() + t.slice(1);
  };

  var engine = RIFF_ENGINES[w.engine] || RIFF_ENGINES.investigation;
  var closers = engine.closers;

  var flow = function (list, joins) {
    return list.filter(Boolean).map(function (t, i) {
      t = t.trim().replace(/^Because of that,\s*/i, "");
      if (i === 0) return end(t.charAt(0).toUpperCase() + t.slice(1));
      return end(joins[(i - 1) % joins.length] + lead(t));
    }).join(" ");
  };

  if (short) {
    return {
      1: join([spine.hook]) + " No titles, no setup, no explanation for the first thirty seconds.",
      2: join([spine.story]) + " One problem, followed the whole way, with nothing competing for attention.",
      3: join([spine.twist]) + " Land it and cut — a short should end a beat before the audience expects it to."
    };
  }

  return {
    1: join([spine.once, spine.everyDay, spine.untilOneDay]) + closers[1],
    2: flow([spine.becauseA, spine.becauseB, spine.becauseC],
            ["Which means ", "And by the time that lands, "]) + closers[2],
    3: join([spine.untilFinally, spine.eversince])
  };
}

function riffCastFrom(w) {
  var now = Date.now();
  var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  // the engine decides who is worth having in the room
  var engine = RIFF_ENGINES[w.engine] || RIFF_ENGINES.investigation;
  var LOOKS = {
    lead: ["Forties, practical coat, hands that never stop moving.",
           "Fifties, heavy set, grey stubble, a coat two sizes too big.",
           "Thirties, cropped hair, work clothes, always carrying something.",
           "Sixties, neat, slow-moving, misses nothing."],
    ant: ["Fifties, good coat, never hurries, calmest person in the room.",
          "Forties, expensive shoes, a handshake like a contract.",
          "Seventies, cardigan, sharp eyes, moves slowly on purpose.",
          "Thirties, immaculate, permanently halfway out of the door."],
    ally: ["Twenties, work boots, headphones round the neck, ink on the hands.",
           "Teens, jacket two sizes too big, notices everything.",
           "Sixties, overalls, forearms like rope.",
           "Thirties, tired, kind, always on a late shift."]
  };

  return [
    { id: "c" + now, name: w.leadName, role: "Lead",
      look: rpick(LOOKS.lead),
      arc: engine.leadArc },
    { id: "c" + (now + 1), name: w.antName, role: engine.cast.antLabel,
      look: rpick(LOOKS.ant),
      arc: cap(w.antRole) + (engine.cast.antLabel === "Antagonist" ? ", doing it " + w.motive : "") },
    { id: "c" + (now + 2), name: w.allyName, role: engine.cast.allyLabel,
      look: rpick(LOOKS.ally),
      arc: cap(w.allyRole) }
  ].map(function (c, i) {
    c.tags = [];
    c.avatar = "https://placehold.co/400x400/2b2f36/ffffff?text=" + encodeURIComponent(c.name.split(" ")[0]);
    c.looks = [{ id: "lk" + (now + i), label: "Default look", url: c.avatar, at: now }];
    return c;
  });
}

function riffPlacesFrom(w) {
  var now = Date.now();
  var strip = function (p) { return p.replace(/^the\s+/i, ""); };
  var set = [
    { name: strip(w.room).replace(/^./, function (m) { return m.toUpperCase(); }),
      atmosphere: rpick(["Strip light, filing cabinets, a window that does not open.",
                         "Cold, concrete, the hum of something always running.",
                         "Too warm, too quiet, nowhere comfortable to stand."]) },
    { name: rpick(["Outside, after dark", "The yard", "The car park", "The street below"]),
      atmosphere: rpick(["Sodium light, wet ground, nobody about.",
                         "Open, exposed, the sound of traffic two streets away."]) },
    { name: rpick(["The flat", "The family house", "Where they sleep", "The back room"]),
      atmosphere: rpick(["Half packed, dust sheets, nobody coming back for any of it.",
                         "Lived in by one person, kept for two.",
                         "The radio on low, the same chair, a cup of tea going cold."]) }
  ];
  return set.map(function (p, i) {
    return {
      id: "w" + (now + 90 + i), name: p.name, atmosphere: p.atmosphere,
      thumbnail: "https://placehold.co/320x240/1d2430/ffffff?text=" + encodeURIComponent(p.name.split(" ")[0])
    };
  });
}

function riffTitleFrom(w) {
  var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  var patterns = [];
  if (w.thing) {
    patterns.push("The " + cap(w.thing));
    patterns.push(cap(w.thing) + " Nights");
  }
  if (w.thing2) patterns.push("The " + cap(w.thing2));
  if (w.role) {
    var head = cap(w.role.split(" ").pop());
    patterns.push(w.plural ? "The " + head : head + "'s Turn");
    patterns.push("The Last " + head.replace(/s$/, ""));
  }
  // The area is a last resort. "Estate Rules" is not a title for a story
  // about a baking contest.
  if (!patterns.length) {
    patterns.push(cap(w.area.replace(/^the\s+/i, "")) + " Rules", "Nobody Asked", "Quiet Hours");
  }
  return rpick(patterns);
}

/**
 * One sentence in, a whole story out.
 * REAL: POST /api/ips/:id/riff  body = compilePayload(ip, "riff", { idea, format })
 *
 * Returns everything at once and returns something different every time,
 * because the world is rolled fresh on each call. Keep that: a creator who
 * presses Riff twice on the same sentence and gets the same paragraph
 * stops pressing it.
 */
async function riffStory(payload, idea, format) {
  await wait(4200);

  var text = (idea || "").trim().replace(/[.\s]+$/, "");
  var w = buildRiffWorld(text, format);
  var short = format === "short";

  var sv = riffSpineVariants(w);
  var spine = {};
  Object.keys(sv).forEach(function (k) { spine[k] = rpick(sv[k]); });
  // their own sentence always leads the inciting incident on a first pass
  spine.untilOneDay = sv.untilOneDay[0];

  var shv = riffShortVariants(w);
  var shortForm = {};
  Object.keys(shv).forEach(function (k) { shortForm[k] = rpick(shv[k]); });
  if (short) shortForm.story = shv.story[0];

  return {
    title: riffTitleFrom(w),
    logline: text.charAt(0).toUpperCase() + text.slice(1) + ".",
    world: w,
    spine: spine,
    shortForm: shortForm,
    acts: riffActsFrom(short ? shortForm : spine, w, short),
    characters: riffCastFrom(w),
    worlds: riffPlacesFrom(w)
  };
}

/**
 * Re-roll ONE block, from the SAME world.
 * REAL: POST /api/ips/:id/riff/part  body = compilePayload(ip, "riff", { part, key, world })
 *
 * The world travels with the request so a swapped line still refers to the
 * same antagonist, the same secret and the same place. Re-rolling one line
 * must never be able to contradict the other seven.
 */
async function riffPart(payload, part, key, seed, world) {
  await wait(1400);
  var w = world || buildRiffWorld(seed || "", "series");

  if (part === "spine") {
    var sv = riffSpineVariants(w);
    return { text: rpick(sv[key] || sv.once, seed) };
  }

  if (part === "short") {
    var shv = riffShortVariants(w);
    return { text: rpick(shv[key] || shv.hook, seed) };
  }

  if (part === "act") {
    // An act is a view of the spine, so a re-roll re-angles how it is told
    // rather than inventing events the eight lines do not contain.
    var ANGLES = {
      1: ["Stay with one person the whole way, and let us learn only what they learn.",
          "Open in the middle of it, and let the first few minutes explain themselves.",
          "Give the act to the routine, and let the break land in the last two minutes."],
      2: ["Every attempt to fix it makes it slightly worse, and the people helping start to notice.",
          "Split it: the small problem gets solved and the big one gets lost at the same time.",
          "Hand the middle to " + w.antName + " for a stretch, and watch our lead from outside."],
      3: ["A room, a decision, and witnesses. No chase, no reveal, just the choice.",
          "They get what they wanted early in the act, and spend the rest paying for it.",
          "The confrontation happens off screen. We stay with whoever is waiting outside."]
    };
    return { text: rpick(ANGLES[key] || ANGLES[1], seed) };
  }

  if (part === "character") {
    var POOL = [
      { role: "Antagonist", names: RIFF_NAMES.antagonist,
        look: "Fifties, good coat, calmest person in any room.",
        arc: "Wants the same thing, and has wanted it longer" },
      { role: "Supporting", names: RIFF_NAMES.ally,
        look: "Twenties, work boots, ink on the hands.",
        arc: "Helps once and pays for it" },
      { role: "Supporting", names: RIFF_NAMES.lead,
        look: "Seventies, cardigan, sharp eyes, moves slowly on purpose.",
        arc: "Knows exactly what happened and has decided not to say" },
      { role: "Minor", names: RIFF_NAMES.ally,
        look: "Forties, hi-vis jacket, permanently mid-sandwich.",
        arc: "Controls the one door that matters" },
      { role: "Supporting", names: RIFF_NAMES.lead,
        look: "Thirties, expensive shoes, tired face, always on a call.",
        arc: "Made the opposite choice years ago and came back" }
    ];
    var pickRec = rpick(POOL);
    var name = rpick(pickRec.names, seed);
    var id = "c" + Date.now();
    var url = "https://placehold.co/400x400/2b2f36/ffffff?text=" + encodeURIComponent(name.split(" ")[0]);
    return {
      character: {
        id: id, name: name, role: pickRec.role, look: pickRec.look, arc: pickRec.arc, tags: [],
        avatar: url,
        looks: [{ id: "lk" + Date.now(), label: "Default look", url: url, at: Date.now() }]
      }
    };
  }

  return {};
}

/**
 * Make a still or a clip of whatever the creator is looking at.
 * REAL: POST /api/ips/:id/capture  body = compilePayload(ip, "design"|"scene", { step, kind })
 *
 * The point is not the picture. It is that a creator can see the thing they
 * just described before committing an hour to it, and that whatever they
 * approve becomes a style anchor for everything after.
 */
async function generateCapture(payload, step, kind, title) {
  await wait(kind === "video" ? 4200 : 2600);
  var label = encodeURIComponent((title || step).slice(0, 16));
  return {
    id: "cap" + Date.now(),
    step: step,
    kind: kind,
    title: title || step,
    w: kind === "video" ? 1280 : 1280,
    h: 720,
    url: kind === "video" ? PLACEHOLDER_VIDEO : "https://placehold.co/1280x720/1d2430/ffffff?text=" + label,
    seconds: kind === "video" ? 5 : null
  };
}

/**
 * Hook / story / twist -> the beats a short actually needs.
 * REAL: POST /api/ips/:id/shortform
 * Do not pad a short into three acts. Three beats, one per answer, and let
 * the scene list do the rest.
 */
async function expandShort(payload) {
  await wait(2800);
  var sh = payload.context.story.shortForm || {};
  var now = Date.now();
  return {
    beats: [
      { id: "b" + now, ep: 1, act: 1, role: "Opening image", title: "Hook", text: sh.hook || "" },
      { id: "b" + (now + 1), ep: 1, act: 2, role: "Rising action", title: "Story", text: sh.story || "" },
      { id: "b" + (now + 2), ep: 1, act: 3, role: "Climax", title: "Twist", text: sh.twist || "" }
    ]
  };
}

/**
 * Lay out a season: one premise per episode.
 * REAL: POST /api/ips/:id/episodes
 * Serialized means every episode has to hand something to the next one, so
 * `carriesOver` is required for those and omitted for episodic.
 */
async function planEpisodes(payload, count, serialized) {
  await wait(3600);
  var c = payload.context;
  var lead = (c.characters[0] || {}).name || "your lead";
  var out = [];
  for (var i = 1; i <= count; i++) {
    out.push({
      number: i,
      title: i === 1 ? "Pilot" : i === count ? "Finale" : "Episode " + i,
      premise: i === 1
        ? "Establish the world and end on the thing that breaks it for " + lead + "."
        : i === count
          ? "Pay off what the season has been promising, and leave one thing unresolved on purpose."
          : "A self-contained problem that costs " + lead + " something they will need later.",
      carriesOver: serialized
        ? (i === count ? "Nothing — this is where it lands." : "One unanswered question, handed to episode " + (i + 1) + ".")
        : null
    });
  }
  return { episodes: out };
}

/**
 * Read whatever the creator already has and pull a story out of it.
 * REAL: POST /api/ips/:id/import  (multipart: text + files)
 *
 * Server side this is document parsing plus one model call. Two rules:
 *  - Extract, never invent. Every item comes back with the line it came
 *    from, so the creator can see why we think it is a character.
 *  - Return it as a list to confirm, not as a finished project. Somebody
 *    who already has notes has opinions; overwriting them is the fastest
 *    way to lose them.
 *
 * This mock genuinely parses the pasted text — what you see is what your
 * own notes produced, not a canned response.
 */
async function parseNotes(payload, input) {
  await wait(3800);

  var text = (input.text || "").replace(/\r/g, "");
  var lines = text.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
  var found = { logline: null, characters: [], locations: [], beats: [], notes: [], title: null };
  var seenChar = {}, seenLoc = {};

  var labelled = function (line, words) {
    var m = line.match(new RegExp("^(" + words + ")\\s*[:\\-\u2014]\\s*(.+)$", "i"));
    return m ? m[2].trim() : null;
  };

  var section = null;
  lines.forEach(function (line, i) {
    // explicit headings: "Characters:", "Locations", "Beats" and so on
    var head = line.match(/^#*\s*(title|logline|premise|synopsis|characters?|cast|locations?|settings?|places?|beats?|outline|story|notes?|rules?)\s*:?\s*$/i);
    if (head) { section = head[1].toLowerCase(); return; }

    var asTitle = labelled(line, "title|working title");
    if (asTitle && !found.title) { found.title = { value: asTitle, source: line }; return; }

    var asLog = labelled(line, "logline|premise|pitch|one liner");
    if (asLog && !found.logline) { found.logline = { value: asLog, source: line }; return; }

    // script slug lines are locations, unambiguously
    var slug = line.match(/^(?:INT|EXT)[\.\s]+([^\-\u2014]+?)(?:\s*[\-\u2014]\s*.*)?$/i);
    if (slug) {
      var lname = slug[1].trim().replace(/\s+/g, " ");
      if (!seenLoc[lname.toLowerCase()]) {
        seenLoc[lname.toLowerCase()] = 1;
        found.locations.push({ value: lname, note: "", source: line });
      }
      return;
    }

    // "NAME - description" or "NAME: description"
    var person = line.match(/^([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+)?)\s*[:\-\u2014]\s*(.{4,})$/);
    if (person && person[1].split(" ").length <= 2 && !/^(int|ext|act|scene|note|rule|logline|title)$/i.test(person[1])) {
      var key = person[1].toLowerCase();
      if (!seenChar[key]) {
        seenChar[key] = 1;
        found.characters.push({ value: person[1], note: person[2].trim(), source: line });
      }
      return;
    }

    // rules the creator already wrote down
    if (/^(never|always|no\s|don'?t|rule|note)\b/i.test(line) || section === "notes" || section === "rules") {
      found.notes.push({ value: line.replace(/^(rule|note)\s*[:\-\u2014]\s*/i, ""), source: line });
      return;
    }

    // bullets and numbered lines are beats
    if (/^([\-\*\u2022]|\d+[\.\)])\s+/.test(line) || section === "beats" || section === "outline") {
      found.beats.push({ value: line.replace(/^([\-\*\u2022]|\d+[\.\)])\s+/, ""), source: line });
      return;
    }

    if (section === "characters" || section === "cast") {
      found.characters.push({ value: line.split(/[,\-\u2014:]/)[0].trim(), note: line, source: line });
      return;
    }
    if (section === "locations" || section === "settings" || section === "places") {
      found.locations.push({ value: line.split(/[,\-\u2014:]/)[0].trim(), note: line, source: line });
      return;
    }

    // longer prose: first one is the logline if we have not found one
    if (!found.logline && line.length > 40 && i < 6) {
      found.logline = { value: line, source: line };
      return;
    }
    if (line.length > 60) found.beats.push({ value: line, source: line });
  });

  // names that keep coming up are probably people, even unlabelled
  var caps = text.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  var tally = {};
  caps.forEach(function (w) { tally[w] = (tally[w] || 0) + 1; });
  Object.keys(tally).forEach(function (w) {
    if (tally[w] < 3) return;
    if (seenChar[w.toLowerCase()]) return;
    // already have them under a fuller name — "Ash" when "Ash Moreau" is listed
    var already = found.characters.some(function (c) {
      return c.value.toLowerCase().split(" ").indexOf(w.toLowerCase()) !== -1;
    });
    if (already) return;
    if (["The", "This", "That", "There", "They", "Then", "When", "What", "Int", "Ext", "Act", "Scene"].indexOf(w) !== -1) return;
    seenChar[w.toLowerCase()] = 1;
    found.characters.push({ value: w, note: "Mentioned " + tally[w] + " times in your notes", source: "" });
  });

  var files = (input.files || []);
  return {
    found: found,
    fileCount: files.length,
    imageCount: files.filter(function (f) { return f.kind === "image"; }).length,
    wordCount: text.split(/\s+/).filter(Boolean).length
  };
}

/**
 * Propose a cast from the story.
 * REAL: POST /api/ips/:id/characters/suggest  body = compilePayload(ip, "cast")
 *
 * Nothing here is saved. The creator accepts one at a time, because a cast
 * that arrives whole belongs to whoever generated it.
 */
async function generateCharacters(payload, count) {
  await wait(3600);

  var c = payload.context;
  var lead = c.characters.find(function (x) { return x.role === "Lead"; }) || c.characters[0];
  var leadName = lead ? lead.name.split(" ")[0] : "your lead";
  var tone = (c.story.tones[0] || "").toLowerCase();

  var pool = [
    { name: "Wren Abbot", role: "Antagonist",
      look: "Fifties, good coat, never hurries. Always the calmest person in the room.",
      arc: "Wants the same thing as " + leadName + " and has been at it much longer",
      why: "Your story has nobody pushing back yet. This is someone with a reason, not a villain." },
    { name: "Sam Okonjo", role: "Supporting",
      look: "Twenties, work boots, headphones round the neck, ink on the hands.",
      arc: "Helps " + leadName + " once, and pays for it",
      why: "Someone who helps early gives you a cost to collect later." },
    { name: "Miriam Vance", role: "Supporting",
      look: "Seventies, cardigan, sharp eyes, moves slowly on purpose.",
      arc: "Knows exactly what happened and has decided not to say",
      why: "A person who has the answer is more useful than a document that has it." },
    { name: "Deke Farrow", role: "Minor",
      look: "Forties, hi-vis jacket, permanently halfway through a sandwich.",
      arc: "Controls access to the one place " + leadName + " needs to get into",
      why: "Small obstacles make a world feel real. He is not important, which is the point." },
    { name: "Iris Lund", role: "Supporting",
      look: "Thirties, expensive shoes, tired face, always on a call.",
      arc: "Left years ago, came back successful, and is not happy",
      why: "Someone who made the opposite choice shows what " + leadName + " gave up." },
    { name: "Tobias Rees", role: "Supporting",
      look: "Teens, too-big jacket, talks constantly, notices everything.",
      arc: "Believes in " + leadName + " more than they deserve",
      why: (tone ? "A " + tone + " story needs someone to protect. " : "") + "He raises the stakes just by being there." }
  ];

  return {
    proposals: pool.slice(0, count || 4).map(function (x, i) {
      return {
        id: "px" + Date.now() + "_" + i,
        name: x.name, role: x.role, look: x.look, arc: x.arc, why: x.why,
        avatar: "https://placehold.co/160x160/2b2f36/ffffff?text=" + encodeURIComponent(x.name.split(" ")[0])
      };
    })
  };
}

/**
 * Propose locations from the story.
 * REAL: POST /api/ips/:id/locations/suggest
 */
async function generateLocations(payload, count) {
  await wait(3200);

  var c = payload.context;
  var style = (c.visual.style || "").toLowerCase();

  var pool = [
    { name: "The back office", atmosphere: "Strip light, filing cabinets, a window that does not open.",
      why: "Every story needs one room where people say true things because they are too tired to lie." },
    { name: "The water", atmosphere: "Grey, moving, louder than you expect. Nobody talks over it.",
      why: "Somewhere wide and empty to put the quiet scenes." },
    { name: "The house", atmosphere: "Half packed. Dust sheets over furniture nobody is coming back for.",
      why: "The place your lead avoids. Save it for the moment they cannot avoid it." },
    { name: "The all-night place", atmosphere: "Yellow light, wipe-clean tables, one other customer.",
      why: "Neutral ground. Useful when two people need to meet and neither can go to the other's home." },
    { name: "The corridor", atmosphere: "Long, identical doors, a floor that squeaks in one spot.",
      why: "Somewhere to walk and talk when a scene needs to move." },
    { name: "Above it all", atmosphere: (style ? style + ", " : "") + "wind, a view of everything, nowhere to hide.",
      why: "Somewhere to put the last scene so it feels like the last scene." }
  ];

  return {
    proposals: pool.slice(0, count || 3).map(function (x, i) {
      return {
        id: "pw" + Date.now() + "_" + i,
        name: x.name, atmosphere: x.atmosphere, why: x.why,
        thumbnail: "https://placehold.co/320x240/1d2430/ffffff?text=" + encodeURIComponent(x.name.split(" ").slice(-1)[0])
      };
    })
  };
}

/**
 * Draw a portrait or a location plate.
 * REAL: POST /api/ips/:id/portrait -> image model, seeded with visual.style
 * and any reference images already attached to this character.
 */
async function generatePortrait(payload, kind, subject) {
  await wait(2800);
  var label = encodeURIComponent((subject.name || "art").slice(0, 12));
  return {
    url: kind === "character"
      ? "https://placehold.co/400x400/2b2f36/ffffff?text=" + label
      : "https://placehold.co/480x360/1d2430/ffffff?text=" + label
  };
}

/**
 * Propose three complete score directions.
 * REAL: POST /api/ips/:id/music/suggest
 */
async function generateMusicOptions(payload) {
  await wait(3000);

  var c = payload.context;
  var tone = c.story.tones[0] || "";

  return {
    options: [
      { id: "m1", name: "Quiet and close",
        genres: ["Minimal piano"], moods: ["Wistful"], tempo: 62,
        instruments: ["Solo piano", "Strings"],
        why: "Stays out of the way and lets the faces do the work. Hard to get wrong." },
      { id: "m2", name: "A pulse underneath",
        genres: ["Synthwave"], moods: ["Ominous"], tempo: 96,
        instruments: ["Analog synth", "Drum machine"],
        why: "Gives every scene a clock. Good if your story is about running out of time." },
      { id: "m3", name: "Big and old-fashioned",
        genres: ["Orchestral"], moods: [tone === "Hopeful" ? "Uplifting" : "Lush"], tempo: 84,
        instruments: ["Strings", "Brass", "Choir"],
        why: "Tells people this matters. Works best when the pictures are wide." }
    ]
  };
}

/**
 * Cast a voice for everyone who does not have one.
 * REAL: POST /api/ips/:id/voices/suggest
 *
 * Cast for contrast: the prompt should look at who is already cast and pick
 * something that sounds different, not something that sounds good alone.
 */
async function generateVoiceCasting(payload) {
  await wait(3200);

  var c = payload.context;
  var accents = ["Neutral American", "British RP", "Northern English", "Irish", "New York"];
  var used = [];

  var picks = c.characters.map(function (ch, i) {
    var v = VOICE_LIBRARY.filter(function (x) { return used.indexOf(x.id) === -1; })[i % 3] || VOICE_LIBRARY[i % VOICE_LIBRARY.length];
    used.push(v.id);
    var isLead = ch.role === "Lead";
    return {
      characterId: ch.id,
      characterName: ch.name,
      voiceId: v.id,
      voiceName: v.name,
      accent: accents[i % accents.length],
      pace: isLead ? "Clipped" : i % 2 ? "Natural" : "Slow",
      why: isLead
        ? "Lowest voice in the cast, so everyone else sounds like they are reacting to them."
        : "Sounds different enough from your lead that you can tell them apart with your eyes shut."
    };
  });

  return { casting: picks, narrator: { voiceId: "v3", accent: "Neutral American", pace: "Slow" } };
}

/**
 * Write one act as prose.
 * REAL: POST /api/ips/:id/acts/:act  body = compilePayload(ip, "structure", { act })
 *
 * Two rules: use the creator's beats in their order, and use their @tags
 * verbatim rather than resolving them to names — an unresolved tag is a
 * decision they have not made yet, and quietly choosing for them is how a
 * draft stops feeling like theirs.
 */
async function writeAct(payload, act, beats) {
  await wait(3400);

  var c = payload.context;
  var lead = c.characters.find(function (x) { return x.role === "Lead"; }) || c.characters[0];
  var who = lead ? lead.name : "@lead";
  var place = c.locations[0] ? c.locations[0].name : "@location1";

  var opener = {
    1: "We open in " + place + ". " + who + " is introduced doing the thing they are known for, and doing it well enough that nobody looks closer. ",
    2: "The middle belongs to consequence. Every choice " + who + " made in the first act comes back wearing a different face. ",
    3: "The last act pays the bill. " + who + " walks into the room they have been avoiding since the first scene. "
  }[act];

  var body = beats.map(function (b, i) {
    var t = (b.text || "").trim();
    if (!t) return "";
    var joins = ["", "From there, ", "Which means ", "By the time that lands, ", "And then "];
    return (joins[i % joins.length]) + t.charAt(0).toLowerCase() + t.slice(1);
  }).filter(Boolean).join(" ");

  var closer = {
    1: " By the end of the act the door behind them is shut.",
    2: " Whatever they were saving for later is spent by the close of this act.",
    3: " What is left is the new normal, and the cost of it."
  }[act];

  return { act: act, prose: opener + body + closer };
}

/**
 * Instant mode: cast + prompt + duration in, finished scene out.
 * REAL: POST /api/ips/:id/instant  body = compilePayload(ip, "instant", opts)
 *
 * The prompt here is doing the most work in the product, because the model
 * is making every call the creator did not: shot breakdown, coverage,
 * dialogue, and any missing style or score direction. Two requirements:
 *  - respect anything already set on the IP; only fill what is empty
 *  - return `decisions` explaining what was chosen and why, so the creator
 *    can go and overrule it. Silent choices are the thing people resent.
 */
async function instantScene(payload, opts) {
  await wait(5200);

  var c = payload.context;
  var shots = Math.max(1, Math.round(opts.duration / SHOT_SECONDS));
  var cast = c.characters.filter(function (ch) { return opts.characters.indexOf(ch.id) !== -1; });
  var loc = c.locations[0] || { id: null, name: "LOCATION" };
  var decisions = [];

  // fill only what the creator left empty
  var style = c.visual.style;
  if (!style) {
    style = "Photoreal";
    decisions.push({ label: "Visual style", value: style, why: "You had not set one, and photoreal holds up across the widest range of scenes." });
  }
  var palette = c.visual.palette;
  if (!palette) {
    decisions.push({ label: "Palette", value: "Cold steel", why: "Neutral enough not to fight whatever you shoot next." });
  }
  if (!c.audio.music.genres.length) {
    decisions.push({ label: "Score", value: "Ambient, sparse", why: "Underscores dialogue without competing with it." });
  }

  var pattern = ["Wide establishing", "Medium", "Close-up", "Over the shoulder", "Medium", "Tracking"];
  decisions.push({
    label: "Coverage",
    value: shots + " shots at " + SHOT_SECONDS + " seconds",
    why: "Your " + opts.duration + " second scene, cut the way this kind of beat usually plays: establish, land on a face, then hold."
  });
  if (cast.length > 1) {
    decisions.push({ label: "Dialogue", value: "Alternating, " + cast.length + " speakers", why: "Two people in frame reads as a conversation unless you say otherwise." });
  }

  var out = [];
  for (var i = 0; i < shots; i++) {
    var speaker = cast.length ? cast[i % cast.length] : null;
    out.push({
      id: "sc" + (Date.now() + i),
      act: 1,
      beatRole: i === 0 ? "Opening image" : i === shots - 1 ? "Resolution" : "Rising action",
      heading: (i % 3 === 0 ? "EXT. " : "INT. ") + loc.name.toUpperCase() + " — " + (i === 0 ? "CONTINUOUS" : "SAME"),
      summary: i === 0
        ? opts.prompt.trim()
        : i === shots - 1
          ? "Hold on what changed. No dialogue."
          : "Continue: " + opts.prompt.trim().replace(/\.$/, "") + " — " + pattern[i % pattern.length].toLowerCase() + ".",
      world: loc.id,
      characters: speaker ? [speaker.id] : [],
      shot: pattern[i % pattern.length],
      dialogue: speaker && i !== shots - 1
        ? [{
            id: "dl" + (Date.now() + i),
            characterId: speaker.id,
            speaker: speaker.name.toUpperCase(),
            parenthetical: "",
            line: "Draft line for " + speaker.name + " — rewrite it in the studio."
          }]
        : []
    });
  }

  return { scenes: out, decisions: decisions, appliedStyle: style };
}

/**
 * A screenplay for ONE scene, in the studio.
 * REAL: POST /api/scenes/:id/script  body = compilePayload(ip, "script", { sceneId })
 * Give the model the surrounding scenes as context so the page reads as part
 * of something rather than as an isolated fragment.
 */
async function generateSceneScript(payload, scene, index) {
  await wait(3400);

  var c = payload.context;
  var cast = scene.characters.map(function (id) {
    var ch = c.characters.find(function (x) { return x.id === id; });
    return ch ? ch.name.toUpperCase() : "VOICE";
  });
  var loc = c.locations.find(function (l) { return l.id === scene.world; });
  var head = (index % 3 === 0 ? "EXT. " : "INT. ") + ((loc ? loc.name : "LOCATION").toUpperCase()) + " — NIGHT";

  var lines = [head, "", scene.prompt || "Action.", ""];
  if (scene.shot) lines.push("[" + scene.shot + "]", "");

  (scene.dialogue && scene.dialogue.length ? scene.dialogue : (cast.length ? [{ speaker: cast[0], line: scene.line || "Draft line." }] : []))
    .forEach(function (d) {
      lines.push(d.speaker || cast[0] || "VOICE");
      if (d.parenthetical) lines.push("(" + d.parenthetical + ")");
      lines.push(d.line);
      lines.push("");
    });

  lines.push("Hold. Cut.");
  return { script: lines.join("\n"), format: "fountain" };
}

/**
 * Store an uploaded reference and return what the services need.
 * REAL: POST /api/ips/:id/references  (multipart)
 *
 * Server side this should: put the file in object storage, return a signed
 * URL that outlives the session, and compute the embedding the target
 * service wants — CLIP-style for images, a speaker embedding for voice.
 * The browser object URL used here dies on refresh, which is exactly the
 * thing real storage fixes.
 */
async function uploadReference(meta) {
  await wait(1300);
  return {
    id: "ref" + Date.now() + Math.floor(Math.random() * 999),
    status: "processed",
    storedUrl: meta.localUrl,
    embedding: meta.kind === "image" ? "clip-vit-l/14" : "speaker-v2",
    durationSeconds: meta.kind === "image" ? null : 0
  };
}

/**
 * Beats -> shootable scenes with headings.
 * REAL: POST /api/ips/:id/script/scenes  body = compilePayload(ip, "script", { depth })
 *
 * depth comes from the creator's working style. On "fast" the model gets
 * more latitude and returns one scene per beat; on "full" it should break
 * beats down and hit the shot budget in context.format.targetSceneCount.
 */
async function generateSceneList(payload) {
  await wait(4000);

  var c = payload.context;
  var depth = payload.task.depth || "guided";
  var perBeat = depth === "fast" ? 1 : depth === "deep" ? 3 : 2;
  var locs = c.locations.length ? c.locations : [{ id: null, name: "LOCATION" }];
  var cast = c.characters;
  var out = [];
  var n = 0;

  c.story.structure.acts.forEach(function (a) {
    a.beats.forEach(function (b, bi) {
      for (var i = 0; i < perBeat; i++) {
        var loc = locs[(n + i) % locs.length];
        var interior = (n + i) % 3 !== 0;
        var timeOfDay = ["NIGHT", "DAY", "CONTINUOUS", "LATER"][(n + i) % 4];
        var who = cast.length ? [cast[(n + i) % cast.length].id] : [];
        if (perBeat > 1 && cast.length > 1 && i === 1) who = [cast[0].id, cast[1].id];

        out.push({
          id: "sc" + (Date.now() + n * 7 + i),
          act: a.act,
          beatRole: b.role,
          heading: (interior ? "INT. " : "EXT. ") + loc.name.toUpperCase() + " — " + timeOfDay,
          summary: i === 0
            ? b.text
            : (i === 1
              ? "Continue on " + (b.title || b.role).toLowerCase() + ": the moment lands on somebody, and they have to answer it."
              : "Aftermath of " + (b.title || b.role).toLowerCase() + " — quiet, no dialogue, hold on what changed."),
          world: loc.id,
          characters: who
        });
      }
      n += perBeat;
    });
  });

  return { scenes: out };
}

/**
 * Dialogue for the scene list.
 * REAL: POST /api/ips/:id/script/dialogue  body = compilePayload(ip, "script", { sceneIds, depth })
 *
 * Character voice notes and arcs are already in context.characters — the
 * prompt should lean on those rather than inventing a register per scene.
 */
async function generateDialogue(payload, scenes) {
  await wait(4500);

  var cast = payload.context.characters;
  var depth = payload.task.depth || "guided";
  var byId = {};
  var name = function (id) {
    var c = cast.find(function (x) { return x.id === id; });
    return c ? c.name.toUpperCase() : "VOICE";
  };

  scenes.forEach(function (sc, si) {
    if (!sc.characters.length) return;
    var lines = [];
    var speakers = sc.characters.length > 1 ? sc.characters : [sc.characters[0]];
    var count = depth === "fast" ? 2 : depth === "deep" ? 4 : 3;

    for (var i = 0; i < count; i++) {
      var cid = speakers[i % speakers.length];
      lines.push({
        id: "dl" + (Date.now() + si * 11 + i),
        characterId: cid,
        speaker: name(cid),
        parenthetical: depth === "deep" && i === 1 ? "not looking up" : "",
        line: i === 0
          ? "Draft line opening the scene — replace this with how " + name(cid).toLowerCase() + " would actually say it."
          : i === 1
            ? "A reply that withholds something rather than explaining it."
            : "The line that makes the scene turn."
      });
    }
    byId[sc.id] = lines;
  });

  return { dialogue: byId };
}

/**
 * Assemble the screenplay from scenes + dialogue.
 * REAL: POST /api/ips/:id/script/screenplay -> returns Fountain, render to PDF server side
 */
async function generateScreenplay(payload, scenes, dialogue) {
  await wait(3800);

  var c = payload.context;
  var out = [];
  out.push("Title: " + c.title);
  out.push("Credit: written by");
  out.push("Author: " + (c.characters.length ? "you" : "you"));
  out.push("");

  scenes.forEach(function (sc) {
    out.push(sc.heading);
    out.push("");
    out.push(sc.summary);
    out.push("");
    (dialogue[sc.id] || []).forEach(function (d) {
      out.push(d.speaker);
      if (d.parenthetical) out.push("(" + d.parenthetical + ")");
      out.push(d.line);
      out.push("");
    });
  });

  return { screenplay: out.join("\n"), format: "fountain" };
}

/**
 * Turn beats into scene stubs sized to the chosen format.
 * REAL: POST /api/ips/:id/scenes/plan  body = compilePayload(ip, "script", { plan })
 */
async function planScenes(payload) {
  await wait(2400);
  var beats = [];
  payload.context.story.structure.acts.forEach(function (a) {
    a.beats.forEach(function (b) { beats.push(b); });
  });
  return {
    scenes: beats.map(function (b, i) {
      return {
        order: i + 1,
        beatRole: b.role,
        prompt: b.text,
        shot: i === 0 ? "Wide establishing" : "Medium"
      };
    })
  };
}

/**
 * Concept sentence -> a starter IP with story, cast and locations.
 * REAL: POST /api/ips  { concept, format }
 */
async function generateIP(concept, format) {
  await wait(3000);
  var ip = blankIP(concept.split(/[.,]/)[0].slice(0, 42), format);
  ip.story.logline = concept.trim();
  ip.story.genres = ["Drama"];
  ip.story.tones = ["Tense"];
  ip.characters = [
    { id: "c" + Date.now(), name: "Lead", role: "Lead", look: "Describe the look to lock the face across scenes", arc: "", tags: [], avatar: "https://placehold.co/160x160/2b2f36/ffffff?text=L" }
  ];
  ip.worlds = [
    { id: "w" + Date.now(), name: "Primary location", atmosphere: "", thumbnail: "https://placehold.co/320x240/1d2430/ffffff?text=Location" }
  ];
  return ip;
}

/**
 * REAL: POST /api/ips/:id/trailer  body = compilePayload(ip, "trailer", opts)
 */
async function generateTrailer(payload) {
  await wait(6000);
  return { success: true, status: "ready", videoUrl: PLACEHOLDER_VIDEO + "?t=" + Date.now() };
}

/**
 * REAL: POST /api/scenes/:id/render  body = compilePayload(ip, "scene", { sceneId, patch })
 */
async function updateSceneNode(payload) {
  await wait(5000);
  return { success: true, status: "rendered", videoUrl: PLACEHOLDER_VIDEO + "?v=" + Date.now() };
}

/** REAL: POST /api/ips/:id/scenes */
async function createNextScene(previousScene) {
  await wait(900);
  return {
    id: "s" + Date.now(),
    order: (previousScene ? previousScene.order : 0) + 1,
    prompt: "",
    characters: previousScene ? previousScene.characters : [],
    world: previousScene ? previousScene.world : null,
    shot: "Medium",
    state: "Unchanged",
    line: "",
    status: "pending",
    forkOf: null,
    videoUrl: null
  };
}

/** REAL: POST /api/scenes/:id/fork — then run impact propagation downstream */
async function forkScene(scene) {
  await wait(700);
  return Object.assign({}, scene, {
    id: "s" + Date.now(),
    status: "pending",
    videoUrl: null,
    forkOf: scene.id
  });
}

/** REAL: POST /api/ips/:id/vault — multipart upload + face/style embedding */
async function addVaultItem(kind, data) {
  await wait(900);
  var label = encodeURIComponent(data.name.slice(0, 12));
  if (kind === "character") {
    return {
      id: "c" + Date.now(),
      name: data.name,
      role: data.role || "Supporting",
      look: data.look || "",
      arc: "",
      tags: data.tags ? data.tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean) : [],
      avatar: "https://placehold.co/160x160/2b2f36/ffffff?text=" + label
    };
  }
  return {
    id: "w" + Date.now(),
    name: data.name,
    atmosphere: data.look || "",
    thumbnail: "https://placehold.co/320x240/1d2430/ffffff?text=" + label
  };
}

/** REAL: POST /api/ips/:id/designs — image model, seeded with visual + character context */
async function generateDesign(payload, name) {
  await wait(2600);
  return {
    id: "d" + Date.now(),
    name: name,
    kind: "Concept art",
    url: "https://placehold.co/400x300/1d2430/ffffff?text=" + encodeURIComponent(name.slice(0, 14))
  };
}

/** REAL: POST /api/voices/preview -> returns an audio URL */
async function previewVoice(voiceId, line) {
  await wait(1200);
  return { success: true, audioUrl: null };
}

/** REAL: POST /api/ips/:id/export -> ffmpeg worker, signed URL */
async function exportEpisode(payload) {
  await wait(2500);
  return { success: true, url: PLACEHOLDER_VIDEO };
}

/* ========================================================== */
