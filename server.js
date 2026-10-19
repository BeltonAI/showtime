// ShowTime server: serves the app and gives it a real writer and image model.
//
//   POST /api/ai      { prompt, tier }  -> { data }   (one JSON answer)
//   POST /api/image   { kind, subject, look, title } -> { url }
//   GET  /api/ai/status                  -> { ok, writer, images, video, voice, music }
//   POST /api/video   { prompt, image?, duration, aspect } -> { id, model }   (Kling / Seedance via fal)
//   GET  /api/video/:id                  -> { status: "working"|"done"|"failed", url }
//   POST /api/voice   { voice, text }    -> { url }   (ElevenLabs)
//   POST /api/music   { prompt, seconds } -> { url }  (ElevenLabs Music, or Suno when you have access)
//   POST /api/upload  raw file body, X-Filename header -> { url }
//
// Secrets (Replit → Tools → Secrets):
//   ANTHROPIC_API_KEY  writes with Claude (preferred)
//   GEMINI_API_KEY     writes with Gemini if there is no Anthropic key, and makes pictures (Nano Banana)
//   FAL_KEY            makes video with Kling and Seedance (one key, many models, like Higgsfield)
//   ELEVENLABS_API_KEY voices, and music if Suno isn't set up
//   SUNO_API_URL + SUNO_API_KEY  music through Suno once you have partner access
//   WRITER_MODEL, WRITER_MODEL_QUICK, IMAGE_MODEL, VIDEO_MODEL_TEXT, VIDEO_MODEL_IMAGE, ELEVEN_VOICES  optional overrides
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use("/api", (req, res, next) => (req.path === "/upload" ? next() : express.json({ limit: "20mb" })(req, res, next)));

const ANTHROPIC = process.env.ANTHROPIC_API_KEY;
const GEMINI = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODELS = {
  default: process.env.WRITER_MODEL || (ANTHROPIC ? "claude-sonnet-5-5" : "gemini-2.5-flash"),
  quick: process.env.WRITER_MODEL_QUICK || (ANTHROPIC ? "claude-haiku-5-5" : "gemini-2.5-flash"),
};
const IMAGE_MODEL = process.env.IMAGE_MODEL || "gemini-2.5-flash-image";
const IMG_DIR = path.join(__dirname, "data", "images");
const MEDIA_DIR = path.join(__dirname, "data", "media");
fs.mkdirSync(MEDIA_DIR, { recursive: true });
const FAL = process.env.FAL_KEY;
const ELEVEN = process.env.ELEVENLABS_API_KEY;
const SUNO = process.env.SUNO_API_URL && process.env.SUNO_API_KEY;
// Text-to-video and image-to-video model ids on fal. Check the model page on fal.ai if a
// newer version is out, and change these in Secrets without touching code.
const VIDEO_TEXT = process.env.VIDEO_MODEL_TEXT || "fal-ai/bytedance/seedance/v1.5/pro/text-to-video";
const VIDEO_IMAGE = process.env.VIDEO_MODEL_IMAGE || "fal-ai/kling-video/o3/standard/image-to-video";
// Every video is made without a score; music is laid in separately.
const VIDEO_SUFFIX = " No music, only sound effects and dialogue.";
// The app's six voices, mapped to ElevenLabs voice ids. Replace with your own via ELEVEN_VOICES (JSON).
const VOICES = Object.assign({
  v1: "pNInz6obpgDQGcFmaJgB", v2: "MF3mGyEYCl7XYWbV9V9O", v3: "ErXwobaYiN019PkySvjV",
  v4: "21m00Tcm4TlvDq8ikWAM", v5: "VR6AewLTigWG4xSOukaG", v6: "EXAVITQu4vr4xnSDxMaL",
}, JSON.parse(process.env.ELEVEN_VOICES || "{}"));
const jobs = new Map();
function saveMedia(buf, ext) {
  const name = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}.${ext}`;
  fs.writeFileSync(path.join(MEDIA_DIR, name), buf);
  return `/media/${name}`;
}
fs.mkdirSync(IMG_DIR, { recursive: true });

// Read one JSON value out of a model reply, tolerating a code fence or a sentence around it.
function parseJSON(text) {
  try { return JSON.parse(text); } catch (e) {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch (e) {} }
  const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (a !== -1 && b > a) return JSON.parse(text.slice(a, b + 1));
  throw new Error("no JSON in reply");
}

async function writeWithClaude(prompt, tier) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODELS[tier] || MODELS.default, max_tokens: 8000, messages: [{ role: "user", content: prompt }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || "writer error " + r.status);
  return (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
}

async function writeWithGemini(prompt, tier) {
  const model = MODELS[tier] || MODELS.default;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": GEMINI, "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 1 } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || "writer error " + r.status);
  return ((j.candidates || [])[0]?.content?.parts || []).map((p) => p.text || "").join("");
}

app.get("/api/ai/status", (req, res) => {
  res.json({ ok: !!(ANTHROPIC || GEMINI), writer: ANTHROPIC ? "claude" : GEMINI ? "gemini" : null, images: !!GEMINI, video: !!FAL, voice: !!ELEVEN, music: !!(SUNO || ELEVEN) });
});

app.post("/api/ai", async (req, res) => {
  const { prompt, tier } = req.body || {};
  if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "Nothing to write from." });
  if (!ANTHROPIC && !GEMINI) return res.status(503).json({ error: "No writer is set up. Add ANTHROPIC_API_KEY or GEMINI_API_KEY in Secrets." });
  try {
    const text = ANTHROPIC ? await writeWithClaude(prompt, tier) : await writeWithGemini(prompt, tier);
    res.json({ data: parseJSON(text) });
  } catch (e) {
    console.warn("[ai]", e.message);
    res.status(502).json({ error: "The writer couldn't finish that. Try again." });
  }
});

app.post("/api/image", async (req, res) => {
  if (!GEMINI) return res.status(503).json({ error: "Pictures need GEMINI_API_KEY in Secrets." });
  const { kind, subject = {}, look = {}, title = "" } = req.body || {};
  const person = kind === "character";
  const prompt = person
    ? `Cinematic character portrait for the show "${title}". ${subject.name}, ${subject.role || ""}. ${subject.look || ""}. ` +
      `Original person, adult, not a likeness of anyone real. Head and shoulders, 3:4 portrait framing, natural expression.`
    : `Cinematic establishing shot of a location for the show "${title}": ${subject.name}. ${subject.look || ""}. No people in frame, 16:9.`;
  const style = [look.style && `Visual style: ${look.style}.`, look.palette && look.palette.hex && `Colour palette: ${look.palette.hex.join(", ")}.`].filter(Boolean).join(" ");
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": GEMINI, "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${prompt} ${style} Clean, smooth digital image, no grain, no text or watermarks.` }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"], imageConfig: { aspectRatio: person ? "3:4" : "16:9" } },
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || "image error " + r.status);
    const part = ((j.candidates || [])[0]?.content?.parts || []).find((p) => p.inlineData);
    if (!part) throw new Error("no image returned");
    const ext = (part.inlineData.mimeType || "image/png").split("/")[1].replace("jpeg", "jpg");
    const name = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}.${ext}`;
    fs.writeFileSync(path.join(IMG_DIR, name), Buffer.from(part.inlineData.data, "base64"));
    res.json({ url: `/images/${name}` });
  } catch (e) {
    console.warn("[image]", e.message);
    res.status(502).json({ error: "The picture couldn't be made. Try again." });
  }
});

// ---------- video: fal queue (Kling, Seedance) ----------
app.post("/api/video", async (req, res) => {
  if (!FAL) return res.status(503).json({ error: "Video needs FAL_KEY in Secrets." });
  const { prompt = "", image, duration = 5, aspect = "16:9" } = req.body || {};
  const model = image ? VIDEO_IMAGE : VIDEO_TEXT;
  const input = { prompt: String(prompt).slice(0, 2400) + VIDEO_SUFFIX, duration: String(duration), aspect_ratio: aspect };
  if (image) input.image_url = image;
  if (!image) { input.resolution = "720p"; input.generate_audio = true; }
  try {
    const r = await fetch(`https://queue.fal.run/${model}`, { method: "POST", headers: { Authorization: `Key ${FAL}`, "content-type": "application/json" }, body: JSON.stringify(input) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.detail ? JSON.stringify(j.detail) : "submit " + r.status);
    jobs.set(j.request_id, { status_url: j.status_url, response_url: j.response_url });
    res.json({ id: j.request_id, model });
  } catch (e) {
    console.warn("[video]", e.message);
    res.status(502).json({ error: "The video couldn't be started. Try again." });
  }
});
app.get("/api/video/:id", async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.json({ status: "failed", error: "That video was lost when the server restarted. Make it again." });
  if (job.url) return res.json({ status: "done", url: job.url });
  try {
    const s = await (await fetch(job.status_url, { headers: { Authorization: `Key ${FAL}` } })).json();
    if (s.status !== "COMPLETED") return res.json({ status: "working" });
    const out = await (await fetch(job.response_url, { headers: { Authorization: `Key ${FAL}` } })).json();
    const src = out.video && out.video.url;
    if (!src) return res.json({ status: "failed", error: "The video service didn't return a video." });
    // fal keeps files for a limited time, so copy the clip to our own storage
    const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
    job.url = saveMedia(buf, "mp4");
    res.json({ status: "done", url: job.url });
  } catch (e) {
    console.warn("[video]", e.message);
    res.json({ status: "working" });
  }
});

// ---------- voice: ElevenLabs ----------
app.post("/api/voice", async (req, res) => {
  if (!ELEVEN) return res.status(503).json({ error: "Voices need ELEVENLABS_API_KEY in Secrets." });
  const { voice, text } = req.body || {};
  const id = VOICES[voice] || voice;
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}`, {
      method: "POST", headers: { "xi-api-key": ELEVEN, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text: String(text || "").slice(0, 2000), model_id: "eleven_multilingual_v2" }),
    });
    if (!r.ok) throw new Error("tts " + r.status + " " + (await r.text()).slice(0, 200));
    res.json({ url: saveMedia(Buffer.from(await r.arrayBuffer()), "mp3") });
  } catch (e) {
    console.warn("[voice]", e.message);
    res.status(502).json({ error: "The voice couldn't be made. Try again." });
  }
});

// ---------- music: Suno (partner access) or ElevenLabs Music ----------
app.post("/api/music", async (req, res) => {
  const { prompt = "", seconds = 60 } = req.body || {};
  try {
    if (SUNO) {
      // Suno has no public API yet. This assumes a simple JSON endpoint that returns { url };
      // adjust to match the API you're given.
      const r = await fetch(process.env.SUNO_API_URL, { method: "POST", headers: { Authorization: `Bearer ${process.env.SUNO_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ prompt, instrumental: true, duration: seconds }) });
      const j = await r.json();
      if (!r.ok || !j.url) throw new Error("suno " + r.status);
      const buf = Buffer.from(await (await fetch(j.url)).arrayBuffer());
      return res.json({ url: saveMedia(buf, "mp3") });
    }
    if (!ELEVEN) return res.status(503).json({ error: "Music needs ELEVENLABS_API_KEY (or Suno) in Secrets." });
    const r = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST", headers: { "xi-api-key": ELEVEN, "content-type": "application/json" },
      body: JSON.stringify({ prompt: String(prompt).slice(0, 4000), music_length_ms: Math.min(600000, Math.max(10000, seconds * 1000)), force_instrumental: true }),
    });
    if (!r.ok) throw new Error("music " + r.status + " " + (await r.text()).slice(0, 200));
    res.json({ url: saveMedia(Buffer.from(await r.arrayBuffer()), "mp3") });
  } catch (e) {
    console.warn("[music]", e.message);
    res.status(502).json({ error: "The music couldn't be made. Try again." });
  }
});

// ---------- uploads (music tracks) ----------
app.post("/api/upload", express.raw({ type: () => true, limit: "500mb" }), (req, res) => {
  const name = decodeURIComponent(req.get("X-Filename") || "track");
  const ext = (name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  if (!req.body || !req.body.length) return res.status(400).json({ error: "The file was empty." });
  const url = saveMedia(req.body, ext);
  const file = path.join(MEDIA_DIR, path.basename(url));
  const { probe, FFMPEG } = require("./lib/render");
  probe(file).then((info) => {
    if (!info.video) return res.json({ url, duration: info.duration || 0 });
    // a frame from a second in, as the clip's thumbnail
    const poster = url.replace(/\.[^.]+$/, "") + "-poster.jpg";
    require("child_process").execFile(FFMPEG, ["-nostdin", "-y", "-ss", String(Math.min(1, (info.duration || 2) / 2)), "-i", file, "-frames:v", "1", "-vf", "scale=640:-2", path.join(MEDIA_DIR, path.basename(poster))],
      (err) => res.json({ url, duration: info.duration || 0, poster: err ? null : poster }));
  });
});

// ---------- the Edit room: render a cut, export it for Premiere/Resolve ----------
const { render, probe, toXml, localize } = require("./lib/render");
const archiver = require("archiver");
const renders = new Map();
const DIRS = { media: MEDIA_DIR, images: IMG_DIR };
app.post("/api/render", (req, res) => {
  const { timeline } = req.body || {};
  if (!timeline || !Array.isArray(timeline.items) || !timeline.items.length) return res.status(400).json({ error: "The cut is empty." });
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const job = { status: "working", progress: 0, message: "Starting", url: null };
  renders.set(id, job);
  const out = path.join(MEDIA_DIR, `cut-${id}.mp4`);
  render(timeline, DIRS, out, (f, m) => { job.progress = f; job.message = m; })
    .then((r) => { job.status = "done"; job.progress = 1; job.url = `/media/cut-${id}.mp4`; job.duration = r.duration; })
    .catch((e) => { console.warn("[render]", e.message); job.status = "failed"; job.error = "The cut couldn't be rendered. Try again, or remove the last shot you added."; });
  res.json({ id });
});
app.get("/api/render/:id", (req, res) => {
  const job = renders.get(req.params.id);
  if (!job) return res.json({ status: "failed", error: "That render was lost when the server restarted. Render it again." });
  res.json(job);
});
// A zip with the sequence XML and every file it uses, ready to open in Premiere or Resolve.
app.post("/api/export", async (req, res) => {
  const { timeline, title = "ShowTime cut" } = req.body || {};
  if (!timeline) return res.status(400).json({ error: "Nothing to export." });
  const work = fs.mkdtempSync(path.join(require("os").tmpdir(), "exp-"));
  try {
    const srcs = new Set();
    (timeline.items || []).forEach((it) => { if (it.src) srcs.add(it.src); else if (it.still) srcs.add(it.still); });
    if (timeline.music && timeline.music.src) srcs.add(timeline.music.src);
    const files = {};
    let k = 0;
    for (const src of srcs) {
      const local = await localize(src, DIRS, work, k++);
      if (!local) continue;
      const info = await probe(local);
      files[src] = { path: local, name: `${String(k).padStart(2, "0")}-${path.basename(local)}`, duration: info.duration, audio: info.audio };
    }
    const name = `${title.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "cut"}-${Date.now().toString(36)}.zip`;
    const zipPath = path.join(MEDIA_DIR, name);
    await new Promise((resolve, reject) => {
      const out = fs.createWriteStream(zipPath);
      const zip = archiver("zip", { zlib: { level: 6 } });
      out.on("close", resolve); zip.on("error", reject);
      zip.pipe(out);
      zip.append(toXml(timeline, title, files), { name: "cut.xml" });
      zip.append("Open cut.xml in Premiere Pro (File > Import) or DaVinci Resolve (File > Import > Timeline).\nIf it asks where the media is, point it at the media folder in this zip.\nMusic is on its own audio track so you can remix it.\n", { name: "README.txt" });
      Object.values(files).forEach((f) => zip.file(f.path, { name: "media/" + f.name }));
      zip.finalize();
    });
    res.json({ url: `/media/${name}` });
  } catch (e) {
    console.warn("[export]", e.message);
    res.status(502).json({ error: "The export couldn't be made. Try again." });
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
});

app.use("/media", express.static(MEDIA_DIR, { maxAge: "30d" }));
app.use("/images", express.static(IMG_DIR, { maxAge: "30d" }));
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`ShowTime on :${port} · writer: ${ANTHROPIC ? "Claude" : GEMINI ? "Gemini" : "none (sample mode)"} · pictures: ${GEMINI ? "on" : "off"} · video: ${FAL ? "on" : "off"} · voices: ${ELEVEN ? "on" : "off"} · music: ${SUNO ? "Suno" : ELEVEN ? "ElevenLabs" : "off"}`));
