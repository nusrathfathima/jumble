# Setting up Jumble on GitHub and locally

This is the one-time setup: getting this folder into a Git repository, onto GitHub, and running on your machine. Written so it can be followed start to finish without anything assumed beyond what's explained here.

## 1. Create the GitHub repository

1. Go to **https://github.com/new** (you'll need to be signed in).
2. **Repository name:** `jumble`
3. **Description (optional):** A personalized kids' activity recommender — backend-focused portfolio project.
4. Leave it **Public** (so it's visible on your portfolio and resume).
5. **Do not** check "Add a README file," "Add .gitignore," or "Choose a license." This project folder already has those — letting GitHub create its own would conflict with the ones already here.
6. Click **Create repository**.

GitHub will show you a page with setup instructions — you can ignore those; the steps below cover it.

## 2. Put this folder where your projects live

Move (or extract, if this arrived as a zip) this `jumble` folder into `B:\Projects\`, next to `mealody`, so you end up with `B:\Projects\jumble\`.

## 3. Turn it into a Git repository and push it

Open **Command Prompt**, and run these one at a time:

```
cd B:\Projects\jumble
```

This moves you into the project folder — every command after this runs from there.

```
git init
```

This turns the folder into a Git repository. Git starts tracking changes from this point on, but nothing has been recorded yet — `init` just switches tracking on.

```
git add .
```

This stages every file in the folder (except anything listed in `.gitignore`, like `node_modules`) — "staged" means "marked as ready to be included in the next commit," not yet actually committed.

```
git commit -m "Initial project scaffolding: docs, backend skeleton, frontend"
```

This takes everything staged and saves it as the first commit — a permanent snapshot in the repository's history, with that message describing what it contains.

```
git branch -M main
```

Names the default branch `main` (GitHub's expected default; a fresh `git init` doesn't always set this automatically).

```
git remote add origin https://github.com/YOUR-USERNAME/jumble.git
```

Replace `YOUR-USERNAME` with your actual GitHub username. This tells your local repository where its GitHub counterpart lives, under the name `origin` — the same setup you already used for Mealody.

```
git push -u origin main
```

This uploads the commit to GitHub. You'll be prompted for credentials:
- **Username:** your GitHub username
- **Password:** your Personal Access Token (PAT) — not your GitHub account password. If you still have the PAT you used for Mealody and it hasn't expired, reuse it here; the same token works across all your repositories. If you need a new one: **GitHub → Settings → Developer settings → Personal access tokens → Generate new token**, with the `repo` scope checked.

Once this finishes, refresh the GitHub page — the whole project should be there.

## 4. Get the backend running

Follow `backend/README.md` — it walks through generating `pom.xml` via Spring Initializr (a one-time step) and then running the server.

## 5. Get the frontend running

```
cd B:\Projects\jumble\frontend
npm install
npm run dev
```

Then open the URL it prints (typically `http://localhost:5173`). With the backend also running (step 4, in a separate Command Prompt window), the page should show **"Backend status: ok."** If it shows **"unreachable,"** the backend isn't running, or isn't running on port 8080 — check the Command Prompt window it's running in for errors.

## 6. Committing further changes, going forward

The same pattern every time, exactly as with Mealody:

```
git add .
git commit -m "describe what changed"
git push
```

## What's already done vs. what's next

**Done:** repository structure, the project docs, a backend that starts up and answers one health-check endpoint, a frontend that starts up and confirms it can reach the backend.

**Next:** connecting the backend to a real Neon Postgres database and running the schema from `docs/jumble-schema.md`, then building the actual entities, the recommendation endpoint, and the React screens.
