// Turns a cut (a timeline of clips, stills, title cards, music and extra
// audio) into one finished MP4 with ffmpeg.
//
// Timeline shape (made by the Edit room, written by Claude):
// {
//   items: [ { type: "clip", src, still, in, out, fade, volume }   // a piece of a video, or a still held for (out - in)
//          | { type: "title", text, dur } ],                       // a black card with text
//   music: { src, start, volume } | null,                          // laid under the whole cut, ducked under dialogue
//   audio: [ { src, at, volume } ]                                 // extra sounds placed at a time in the cut
// }
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const FFMPEG = (() => { try { return require("ffmpeg-static"); } catch (e) { return "ffmpeg"; } })();
const FONT = (() => {
  try { return require.resolve("@fontsource/courier-prime/files/courier-prime-latin-700-normal.woff"); }
  catch (e) { return null; }
})();
const W = 1920, H = 1080, FPS = 24;

function run(args) {
  return new Promise((resolve, reject) => {
    execFile(FFMPEG, ["-nostdin", "-hide_banner", "-loglevel", "error", "-y"].concat(args), { maxBuffer: 1 << 26 }, (err, stdout, stderr) => {
      if (err) reject(new Error((stderr || err.message).toString().slice(-600))); else resolve(stdout);
    });
  });
}
// ffmpeg prints stream info to stderr when given an input and no output
function probe(file) {
  return new Promise((resolve) => {
    execFile(FFMPEG, ["-hide_banner", "-i", file], (err, stdout, stderr) => {
      const s = String(stderr || "");
      const m = s.match(/Duration: (\d+):(\d+):([\d.]+)/);
      const duration = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
      const still = /Video: (png|mjpeg|webp|bmp|gif|tiff)/.test(s) && duration < 0.2 || /image2|png_pipe|jpeg_pipe|webp_pipe/.test(s);
      resolve({ audio: /Stream #.*Audio:/.test(s), video: /Stream #.*Video:/.test(s) && !still && !/attached pic/.test(s), duration });
    });
  });
}
const esc = (t) => String(t).replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\u2019").replace(/%/g, "\\%");

// Where a media reference lives on disk. Files we serve map straight to
// the data folder; anything remote or inline is fetched into the work dir.
async function localize(src, dirs, work, i) {
  if (!src) return null;
  if (src.startsWith("/media/")) return path.join(dirs.media, path.basename(src));
  if (src.startsWith("/images/")) return path.join(dirs.images, path.basename(src));
  if (src.startsWith("data:")) {
    const m = src.match(/^data:([^;,]+)(;base64)?,(.*)$/s);
    if (!m || /svg/.test(m[1])) return null; // drawn stand-ins can't be rendered; they become a dark frame
    const ext = (m[1].split("/")[1] || "bin").replace("jpeg", "jpg");
    const f = path.join(work, `in${i}.${ext}`);
    fs.writeFileSync(f, m[2] ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3])));
    return f;
  }
  if (/^https?:/.test(src)) {
    const r = await fetch(src);
    if (!r.ok) return null;
    const ext = (path.extname(new URL(src).pathname) || ".bin").slice(0, 6);
    const f = path.join(work, `in${i}${ext}`);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    return f;
  }
  return null;
}

const VNORM = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${FPS},format=yuv420p`;
const ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-shortest"];

async function segment(item, file, info, out) {
  const fades = (dur) => item.fade ? [`,fade=t=in:st=0:d=0.4,fade=t=out:st=${Math.max(0, dur - 0.4).toFixed(2)}:d=0.4`, `,afade=t=in:st=0:d=0.3,afade=t=out:st=${Math.max(0, dur - 0.3).toFixed(2)}:d=0.3`] : ["", ""];
  if (item.type === "title") {
    const dur = Math.max(0.8, +item.dur || 2.5);
    const text = FONT ? `,drawtext=fontfile='${FONT}':text='${esc(String(item.text || "").toUpperCase())}':fontcolor=white:fontsize=${Math.max(36, Math.min(84, Math.floor(1700 / (Math.max(8, String(item.text || "").length) * 0.62))))}:x=(w-tw)/2:y=(h-th)/2,fade=t=in:st=0:d=0.3,fade=t=out:st=${(dur - 0.3).toFixed(2)}:d=0.3` : "";
    await run(["-f", "lavfi", "-t", String(dur), "-i", `color=c=black:s=${W}x${H}:r=${FPS}`, "-f", "lavfi", "-t", String(dur), "-i", "anullsrc=cl=stereo:r=48000",
      "-filter_complex", `[0:v]format=yuv420p${text}[v]`, "-map", "[v]", "-map", "1:a"].concat(ENC, [out]));
    return dur;
  }
  const start = Math.max(0, +item.in || 0);
  let dur = Math.max(0.5, (+item.out || start + 3) - start);
  const [vf, af] = fades(dur);
  const vol = item.volume == null ? 1 : +item.volume;
  if (file && info.video) {
    if (info.duration && start + dur > info.duration) dur = Math.max(0.5, info.duration - start);
    const audioIn = info.audio ? ["-map", "[a]"] : ["-map", "1:a"];
    await run(["-ss", String(start), "-t", String(dur), "-i", file, "-f", "lavfi", "-t", String(dur), "-i", "anullsrc=cl=stereo:r=48000",
      "-filter_complex", `[0:v]${VNORM}${vf}[v]` + (info.audio ? `;[0:a]aresample=48000,volume=${vol}${af}[a]` : ""), "-map", "[v]"].concat(audioIn, ENC, [out]));
    return dur;
  }
  if (file) { // a still: a slow push-in for the length of the shot
    const frames = Math.round(dur * FPS);
    await run(["-loop", "1", "-t", String(dur), "-i", file, "-f", "lavfi", "-t", String(dur), "-i", "anullsrc=cl=stereo:r=48000",
      "-filter_complex", `[0:v]scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},zoompan=z='min(zoom+0.0007,1.15)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},format=yuv420p${vf}[v]`,
      "-map", "[v]", "-map", "1:a"].concat(ENC, [out]));
    return dur;
  }
  // nothing renderable (a drawn stand-in): hold a dark frame so the timing still works
  await run(["-f", "lavfi", "-t", String(dur), "-i", `color=c=0x111111:s=${W}x${H}:r=${FPS}`, "-f", "lavfi", "-t", String(dur), "-i", "anullsrc=cl=stereo:r=48000",
    "-map", "0:v", "-map", "1:a"].concat(ENC, [out]));
  return dur;
}

async function render(timeline, dirs, outFile, onProgress) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "cut-"));
  try {
    const items = (timeline.items || []).filter((x) => x && (x.type === "title" || x.type === "clip"));
    if (!items.length) throw new Error("The cut has nothing in it.");
    const segs = [], starts = [];
    let t = 0;
    for (let i = 0; i < items.length; i++) {
      onProgress && onProgress(i / (items.length + 2), `Cutting shot ${i + 1} of ${items.length}`);
      const it = items[i];
      const file = it.type === "clip" ? (await localize(it.src, dirs, work, i)) || (await localize(it.still, dirs, work, i + 1000)) : null;
      const info = file ? await probe(file) : { video: false, audio: false, duration: 0 };
      const seg = path.join(work, `seg${String(i).padStart(3, "0")}.mp4`);
      starts.push(t);
      t += await segment(it, file, info, seg);
      segs.push(seg);
    }
    onProgress && onProgress(items.length / (items.length + 2), "Joining the shots");
    const list = path.join(work, "list.txt");
    fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join("\n"));
    const body = path.join(work, "body.mp4");
    await run(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", body]);

    onProgress && onProgress((items.length + 1) / (items.length + 2), "Mixing the sound");
    const total = t;
    const inputs = ["-i", body];
    const pre = [];
    let n = 1;
    let music = null;
    if (timeline.music && timeline.music.src) {
      const mf = await localize(timeline.music.src, dirs, work, 9000);
      if (mf) { inputs.push("-ss", String(Math.max(0, +timeline.music.start || 0)), "-i", mf); music = n++; }
    }
    const extras = [];
    for (const [k, a] of (timeline.audio || []).entries()) {
      const af = await localize(a.src, dirs, work, 9100 + k);
      if (af) { inputs.push("-i", af); extras.push({ idx: n++, at: Math.max(0, +a.at || 0), vol: a.volume == null ? 1 : +a.volume }); }
    }
    // every stream gets the same format, or ducking can stall ffmpeg's filter graph
    const AF = "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo";
    let graph = "[0:a]aresample=48000," + AF + "[dlg]";
    let mixIn = ["[dlg]"];
    extras.forEach((x, k) => { graph += `;[${x.idx}:a]aresample=48000,${AF},volume=${x.vol},adelay=${Math.round(x.at * 1000)}|${Math.round(x.at * 1000)}[x${k}]`; mixIn.push(`[x${k}]`); });
    // an inaudible noise floor keeps loudness levelling stable on silent cuts
    graph += `;anoisesrc=c=pink:a=0.00003:r=48000:d=${total.toFixed(2)},${AF}[floor]`; mixIn.push("[floor]");
    graph += `;${mixIn.join("")}amix=inputs=${mixIn.length}:duration=longest:normalize=0,atrim=0:${total.toFixed(2)}[voc]`;
    if (music != null) {
      const mv = timeline.music.volume == null ? 0.8 : +timeline.music.volume;
      graph += `;[${music}:a]aresample=48000,${AF},atrim=0:${total.toFixed(2)},asetpts=PTS-STARTPTS,volume=${mv},afade=t=in:st=0:d=1,afade=t=out:st=${Math.max(0, total - 2.5).toFixed(2)}:d=2.5[mus]` +
        ";[voc]asplit=2[v1][sc];[mus][sc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=450[duck];[v1][duck]amix=inputs=2:duration=longest:normalize=0,atrim=0:" + total.toFixed(2) + "[mix]";
    } else graph += ";[voc]anull[mix]";
    graph += ";[mix]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000," + AF + "[aout]";
    // mix the sound on its own first: running the mix and the video copy in
    // one pass can stall ffmpeg's interleaving when the music is ducked
    const mixFile = path.join(work, "mix.wav");
    await run(inputs.concat(["-filter_complex", graph, "-map", "[aout]", "-c:a", "pcm_s16le", mixFile]));
    await run(["-i", body, "-i", mixFile, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", outFile]);
    return { duration: total, starts };
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

// A timeline as an FCP7 XML sequence, which Premiere Pro and DaVinci
// Resolve both import. Media is referenced from a "media" folder next to
// the XML; the editor relinks once on first open.
function toXml(timeline, title, files) {
  const fr = (s) => Math.round(s * FPS);
  const x = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rate = `<rate><timebase>${FPS}</timebase><ntsc>FALSE</ntsc></rate>`;
  let t = 0, vclips = "", aclips = "", n = 0;
  (timeline.items || []).forEach((it) => {
    if (it.type === "title") {
      const d = fr(+it.dur || 2.5);
      vclips += `<generatoritem id="title-${n++}"><name>${x(it.text)}</name><duration>${d}</duration>${rate}<start>${t}</start><end>${t + d}</end><in>0</in><out>${d}</out>` +
        `<effect><name>Text</name><effectid>Text</effectid><effectcategory>Text</effectcategory><effecttype>generator</effecttype><mediatype>video</mediatype>` +
        `<parameter><parameterid>str</parameterid><name>Text</name><value>${x(it.text)}</value></parameter></effect></generatoritem>`;
      t += d; return;
    }
    const f = files[it.src] || files[it.still];
    const i0 = fr(+it.in || 0), d = Math.max(1, fr((+it.out || 3) - (+it.in || 0)));
    if (!f) { t += d; return; }
    const fileTag = `<file id="${x(f.name)}"><name>${x(f.name)}</name><pathurl>file://localhost/media/${encodeURIComponent(f.name)}</pathurl>${rate}<media><video/><audio/></media></file>`;
    vclips += `<clipitem id="v${n}"><name>${x(f.name)}</name><duration>${fr(f.duration || 10)}</duration>${rate}<start>${t}</start><end>${t + d}</end><in>${i0}</in><out>${i0 + d}</out>${fileTag}</clipitem>`;
    if (f.audio) aclips += `<clipitem id="a${n}"><name>${x(f.name)}</name>${rate}<start>${t}</start><end>${t + d}</end><in>${i0}</in><out>${i0 + d}</out><file id="${x(f.name)}"/><sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack></clipitem>`;
    n++; t += d;
  });
  let music = "";
  if (timeline.music && files[timeline.music.src]) {
    const f = files[timeline.music.src], s0 = fr(+timeline.music.start || 0);
    music = `<track><clipitem id="music"><name>${x(f.name)}</name>${rate}<start>0</start><end>${t}</end><in>${s0}</in><out>${s0 + t}</out>` +
      `<file id="${x(f.name)}"><name>${x(f.name)}</name><pathurl>file://localhost/media/${encodeURIComponent(f.name)}</pathurl>${rate}<media><audio/></media></file></clipitem></track>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE xmeml>\n<xmeml version="5"><sequence id="seq"><name>${x(title)}</name><duration>${t}</duration>${rate}` +
    `<media><video><format><samplecharacteristics>${rate}<width>${W}</width><height>${H}</height></samplecharacteristics></format><track>${vclips}</track></video>` +
    `<audio><track>${aclips}</track>${music}</audio></media></sequence></xmeml>`;
}

module.exports = { render, probe, toXml, localize, FFMPEG };
