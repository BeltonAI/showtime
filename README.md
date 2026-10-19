# ShowTime

How it works for the user:

1. **Front page:** the logo, what ShowTime does, and Enter.
2. **Enter:** opens your ShowPage if you have one, picks up the show you're building if you don't, or starts a new show.
3. **The path:** Story, Cast, Places, Look, Sound, Scenes, Trailer, Share. One page each, with Back, Next and "Make my ShowPage".
4. **Make my ShowPage:** at any point. It says what it will fill in, asks you to confirm, and fills the gaps (tagline, quotes, look, faces, places, music, voices, episodes, scene list). Anything still missing shows a placeholder that says what to do.
5. **ShowPage:** your show laid out like the Red District page. "Edit page" lets you click any text to change it, and every picture gets "Change image". It has music upload and timed notes on the trailer. It's the only page with the full menu.

**A series is built differently from the start.** The format is the first question. For a series, the eight-line outline and its three parts tell the season's story. Every episode is then written as its own film in three acts (beginning with its inciting incident, a middle with a turn, and an end that resolves the episode and hands something to the next one). Scene lists are made one episode at a time from that episode's acts. The acts appear inside each episode on the Story page and the ShowPage, and can be edited there.

**The Edit room (Trailer step).** Claude cuts a trailer from your finished scenes, your own clips, your artwork and place pictures, and your music. You watch it in the browser, move or remove shots, change title cards, write notes ("shorter, open on Elena") and get a recut. Every cut is kept as a version. On the live app:
- **Render the video** turns the cut into one MP4 with ffmpeg. It handles title cards in the show's typewriter font, a slow push-in on stills, music ducked under dialogue, and streaming loudness (−14 LUFS).
- **Open in Premiere or Resolve** gives a ZIP with an FCP7 XML sequence plus every clip it uses, so an editor can finish the cut by hand.

**Your own media.** Upload video clips, music, voice-overs and sound effects in the Edit room, or swap any scene for your own footage from that scene's popup. Music uploads also appear in the ShowPage soundtrack.

Edits carry through. Renaming a character, a place or the show updates every piece of writing. Changing the story flags the scene list, the episodes and the pitch pack as out of date, with a button to remake them.

## Run on Replit

1. Import this folder into a Node.js Repl. Run `npm install`, then `npm start`.
2. Add secrets (Tools → Secrets). Every one is optional, and each one turns a feature on:

| Secret | Turns on |
|---|---|
| `ANTHROPIC_API_KEY` | All the writing (Claude) |
| `GEMINI_API_KEY` | Faces and place pictures (Nano Banana); writing too if there's no Anthropic key |
| `FAL_KEY` | Video: Seedance for text-to-video, Kling for image-to-video (one key, many models, the way Higgsfield does it) |
| `ELEVENLABS_API_KEY` | Voice previews, and music if Suno isn't set |
| `SUNO_API_URL`, `SUNO_API_KEY` | Music through Suno, once you have partner access (Suno has no public API yet) |
| `VIDEO_MODEL_TEXT`, `VIDEO_MODEL_IMAGE` | Swap the fal model ids when newer versions come out |
| `ELEVEN_VOICES` | JSON mapping the app's voices v1–v6 to your own ElevenLabs voice ids |

Every video prompt ends with "No music, only sound effects and dialogue." The server adds this, so it can't be skipped.

3. Deploy as a **Reserved VM**. Generated files are saved in `data/`. For storage that survives redeploys, move them to Replit Object Storage (as in Red District's `lib/storage.js`) or S3.

## Files

- `server.js`: serves `public/`, plus `/api/ai`, `/api/image`, `/api/video`, `/api/voice`, `/api/music`, `/api/upload`, `/api/render` and `/api/export`.
- `lib/render.js`: the ffmpeg render and the Premiere/Resolve XML. Uses `ffmpeg-static`, so there's nothing to install on the server.
- `public/engine.js`: the original data contract, prompt compiler and sample-mode fallbacks.
- `public/live.js`: the real writing and media calls, with the same names and shapes as `engine.js`.
- `public/app.js`: the screens.
- `public/styles.css`: the styles.
- `tests/`: the browser tests used during the build (see `tests/README.md`).
- `docs/HANDOFF.md`: APIs, services, environment variables, architecture and notes for the developer taking this on.

## Still to do

- Shows are saved in each person's browser. Accounts and a database come next, so invites work and a show is the same on every device.
- The Edit room cuts trailers. Cutting full scenes and episodes uses the same engine and is the next step.
- Renders run one at a time on the server. For many users at once, move rendering to a job queue or a render service (Shotstack, Creatomate) that takes the same timeline.
- Check the fal input fields for the Kling 3.0 image-to-video model on its fal.ai page. The server sends `prompt`, `image_url`, `duration` and `aspect_ratio`.
