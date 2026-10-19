# End-to-end tests

These are the browser tests used while building ShowTime. Each one drives the app in headless Chromium, stands in for the AI with canned answers, and prints what it checked. They are scripts, not a test framework yet: read the output, and treat any `errors [...]` that isn't empty, or `overflow true`, as a failure.

| File | Checks |
|---|---|
| `artwork.test.js` | Uploaded artwork becomes the ShowPage hero and the section backgrounds |
| `series.test.js` | Format comes first; a series gets a season arc plus three acts per episode; scene lists per episode; inline act edits save |
| `cast-size.test.js` | A series asks for 12–18 people and 6–10 places; cast billing tiers on the ShowPage |

## Run

```bash
npm install
npm install --no-save playwright
npx playwright install chromium
npm start                      # in another terminal, serves on http://localhost:3000
node tests/series.test.js      # screenshots go to <tmp>/shots, or pass a folder as the first argument
```

Settings:

- `BASE_URL` points the tests at another server (default `http://localhost:3000`).
- `CHROMIUM_PATH` uses a specific Chromium build instead of Playwright's own.

Next step: move these into `@playwright/test` with real assertions and run them in CI.
