# GA Cosmetology Theory Exam Prep

A static, self-contained study site with three 100-question practice tests for the
Georgia Cosmetology Theory exam — question-by-question quiz flow, instant grading,
section-by-section breakdown, and a scantron-style answer sheet review.

No backend, no build step, no dependencies beyond two Google Fonts loaded via CDN.
Progress/scores are saved locally in the visitor's browser (`localStorage`) — nothing
is sent to a server.

## Files
- `index.html` — page shell
- `styles.css` — all styling
- `app.js` — quiz logic (vanilla JS)
- `data.js` — the 300 questions/answers, generated from the source practice tests

## Deploy to GitHub Pages (no command line needed)

1. Go to https://github.com/new and create a **public** repository
   (e.g. `ga-cosmetology-prep`). Don't add a README — you'll upload one.
2. On the new repo's page, click **"uploading an existing file"** (or
   **Add file → Upload files**).
3. Drag in all files from this folder: `index.html`, `styles.css`, `app.js`,
   `data.js`, `README.md`. Commit directly to `main`.
4. Go to **Settings → Pages** (left sidebar, under "Code and automation").
5. Under **Build and deployment → Source**, choose **Deploy from a branch**.
6. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
7. Wait about a minute, then refresh the Pages settings page — it will show your
   live URL: `https://<your-username>.github.io/ga-cosmetology-prep/`

That's it — the link works on phone, tablet, or desktop, and can be shared with anyone.

## Deploy via git (command line alternative)

```bash
cd ga-cosmetology-prep      # this folder
git init
git add .
git commit -m "Add GA cosmetology theory practice tests"
git branch -M main
git remote add origin https://github.com/<your-username>/ga-cosmetology-prep.git
git push -u origin main
```

Then enable Pages the same way as steps 4–6 above.

## Updating a question later

Edit `data.js` directly (it's plain JSON assigned to `const TESTS = [...]`), or edit
the original markdown practice tests and re-run the parser script provided alongside
this project, then re-upload `data.js`.
