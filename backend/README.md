# jumble-backend

Spring Boot API for Jumble. See `/docs` at the repo root for the full spec and database schema.

## One-time setup: generating pom.xml

This folder ships with the Java source code already written, but **not** with `pom.xml` — the file that tells Maven which version of Spring Boot to use and which libraries to download. That file is generated for you by **Spring Initializr** (start.spring.io), because it always knows the current, correct set of compatible versions — a version pinned by hand today would be out of date within months.

1. Go to **https://start.spring.io** in your browser.
2. Fill in:
   - **Project:** Maven
   - **Language:** Java
   - **Spring Boot:** the default selected version (leave as-is)
   - **Group:** `com.jumble`
   - **Artifact:** `backend`
   - **Name:** `backend`
   - **Package name:** `com.jumble.backend` (should fill in automatically)
   - **Packaging:** Jar
   - **Java:** 21
3. Under **Dependencies**, click "Add Dependencies" and add:
   - **Spring Web**
   - **Spring Data JPA**
   - **PostgreSQL Driver**
   - **Validation**
4. Click **Generate**. A `.zip` file downloads.
5. Unzip it, and copy just the `pom.xml` file out of it into this `backend/` folder, replacing nothing (there isn't one here yet). You can discard the rest of what was in that zip — the `src/` folder it generates is a placeholder, and this folder already has the real one.

## Environment variables

Set these in your shell before running the server (Windows Command Prompt shown; use `export` instead of `set` on Mac/Linux):

```
set DATABASE_URL=jdbc:postgresql://<your-neon-host>/neondb?sslmode=require
set DATABASE_USERNAME=<your-neon-username>
set DATABASE_PASSWORD=<your-neon-password>
set JWT_SECRET=<a base64 string — generate one below>
```

Generate a `JWT_SECRET` once, and reuse the same value every time you start the server locally (changing it invalidates every token already issued, logging everyone out):

```
openssl rand -base64 32
```

No `openssl` on Windows Command Prompt? Run that same command from **Git Bash** (installed alongside Git) instead.

There's deliberately no default for `JWT_SECRET` in `application.properties` — if it's missing, the server refuses to start rather than silently signing tokens with something guessable.

## Running it locally

```
mvn spring-boot:run
```

Then open **http://localhost:8080/api/health** in a browser. You should see:

```json
{"status":"ok","service":"jumble-backend"}
```

## Running the tests

```
mvn test
```

## Trying out auth

With the server running, from a second Command Prompt window:

```
curl -X POST http://localhost:8080/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"a-real-password\",\"displayName\":\"Your Name\"}"
```

That returns a JWT (`{"token":"...", "parentId":1, ...}`). Log in again with the same credentials to confirm it works both ways:

```
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"a-real-password\"}"
```

## Trying out child profiles

Signup/login return a JWT — grab one from step above, then pass it as a Bearer token on everything below (`<TOKEN>` is the `token` field from that response — every endpoint below requires it, including the reads):

```
curl http://localhost:8080/api/tags -H "Authorization: Bearer <TOKEN>"
```

That lists the 7 seeded interest tags. Then create a child:

```
curl -X POST http://localhost:8080/api/children -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d "{\"name\":\"Emma\",\"birthYear\":2019,\"birthMonth\":6,\"interestTagSlugs\":[\"art\",\"building\"]}"
```

And list them back:

```
curl http://localhost:8080/api/children -H "Authorization: Bearer <TOKEN>"
```

There's no `parentId` in either request — the backend reads that from the token, so a parent can only ever see or create their own children.

## Trying out materials and inventory

```
curl http://localhost:8080/api/materials -H "Authorization: Bearer <TOKEN>"
```

Lists the full material catalog (~32 items across kitchen, craft, recycling, outdoor, other). Note each one's `id` — you'll need a few for the next step.

```
curl http://localhost:8080/api/inventory -H "Authorization: Bearer <TOKEN>"
```

Should come back empty (`[]`) the first time — nothing's been saved yet.

```
curl -X PUT http://localhost:8080/api/inventory -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d "{\"materialIds\":[1,2,3]}"
```

Swap `1,2,3` for real ids from the materials list. This call **replaces** the whole inventory with exactly this set — it's not an "add to" call, so submitting `[1,2,3]` and later `[2,3]` drops material `1`. Run the `GET /api/inventory` call again afterward to confirm it comes back matching what you just sent.

## Trying out the activity library and suggestions

This is the big one — the actual "get a suggestion" feature the whole project was built toward.

```
curl http://localhost:8080/api/activities -H "Authorization: Bearer <TOKEN>"
```

Lists all 12 seeded activities. Grab one's `id` and look at its full detail, including steps:

```
curl http://localhost:8080/api/activities/1 -H "Authorization: Bearer <TOKEN>"
```

Now the real test — get suggestions for a child. You need a child's `id` (from `GET /api/children`) and, ideally, some materials checked in your inventory first, since most activities need at least one:

```
curl "http://localhost:8080/api/children/1/suggestions?availableMinutes=45&maxMessLevel=3&locationType=EITHER" -H "Authorization: Bearer <TOKEN>"
```

You should get back up to 5 activities, ranked, each with a `score` and a plain-language `explanation`. A few things worth deliberately testing to see the filtering actually work, not just trust that it does:

- **Age filtering:** create a child with a birth year that makes them, say, 1 year old, and confirm the results are empty or very different from a 7-year-old's — every activity in the seed data requires at least age 3.
- **Time filtering:** set `availableMinutes=10` — everything in the library takes at least 20 minutes, so you should get an empty list back (`[]`), not an error.
- **Mess filtering:** set `maxMessLevel=1` — only the lowest-mess activities (fort building, scavenger hunt, binoculars, shadow puppets) should come back.
- **Material filtering:** with your inventory empty (`PUT /api/inventory` with `{"materialIds":[]}`), request suggestions — you should get very few or none back, since almost every activity needs at least one non-optional material. Then check a handful of materials (flour, salt, cooking_oil, paper, crayons, sidewalk_chalk are good ones to try) and request again — more activities should now qualify.
- **The explanation text:** if the child has declared interests (from `interestTagSlugs` at creation) or has otherwise-elevated tag weights, an activity matching those tags should say so in its `explanation` field, e.g. "Matches an interest in Science."

## What's here so far

- `JumbleBackendApplication.java` — the entry point.
- `controller/HealthController.java` — `/api/health`, used to prove the server is alive.
- `controller/AuthController.java` — real signup and login, BCrypt-hashed passwords, returns a JWT.
- `controller/ChildController.java` — real child-profile endpoints (`GET/POST /api/children`, `GET /api/children/{id}`), ownership always derived from the JWT.
- `controller/TagController.java` — `GET /api/tags`, the interest taxonomy, so the frontend never hard-codes the list.
- `controller/MaterialController.java` — `GET /api/materials`, the full supply catalog.
- `controller/InventoryController.java` — `GET/PUT /api/inventory`, the logged-in parent's household inventory.
- `security/` — `JwtService` (issues/verifies tokens), `JwtAuthFilter` (reads the `Authorization` header on every request), `SecurityConfig` (wires it all together: which endpoints need a token, CORS, stateless sessions).
- `model/` — `Parent`, `Child`, `Tag`, `ChildTag` (declared interests), `ChildTagWeight` (learned ranking weight, seeded at child creation), `Material`, `ParentInventory`.
- `repository/` — one per entity above.
- `config/WebConfig.java` — allows the React frontend to call this API from the browser during local development.
- `application.properties` — server configuration. Database credentials and the JWT secret are deliberately *not* here — see above.
- `db/migration/V2__seed_tags.sql` — the 7 MVP interest tags (art, science, outdoor, building, pretend play, cooking, quiet/reading). Adding more later is just a `V3__...` migration.
- `db/migration/V3__seed_materials.sql` — a starter material catalog (~32 items). Same additive pattern as the tags.
- `db/migration/V4__seed_activities.sql` — 12 fully written activities (with age range, duration, mess level, location, tags, materials, and step-by-step instructions each), the actual content the recommendation engine draws from.
- `controller/ActivityController.java` — `GET /api/activities` (browse the whole library) and `GET /api/activities/{id}` (full detail: tags, materials, steps).
- `controller/SuggestionController.java` — `GET /api/children/{id}/suggestions`, the centerpiece "get a suggestion" endpoint: filters the library by the child's age, the time/mess/location you specify, and what materials you actually have, then ranks by the child's interest weights and returns a plain-English explanation with each result.
- `model/` — now also `Activity`, `ActivityTag`, `ActivityMaterial`, `ActivityStep`, matching the new `activity`, `activity_tag`, `activity_material`, and `activity_step` tables.
- `repository/` — `ActivityRepository` (includes the native ranking/filtering query behind suggestions), `ActivityTagRepository`, `ActivityMaterialRepository`, `ActivityStepRepository`, and `ChildTagWeightRepository` gained a lookup used to build the suggestion explanations.

`TestDataController.java` has been deleted — it was scaffolding for proving Parent/Child persistence worked, and the real endpoints above have replaced it.

**A note on `Short` vs `Integer`:** `Tag.id`, `Material.id`, and the small numeric fields on `Activity`/`ActivityStep` (`minAgeYears`, `maxAgeYears`, `durationMinutes`, `messLevel`, `stepNumber`) are all `Short` in Java, not `Integer`, because their database columns are `SMALLINT`. Hibernate's schema validation checks the exact column type, and this mismatch caused a real startup failure earlier in this project — worth remembering if a future entity maps to a `SMALLINT` column (anything with `GENERATED ALWAYS AS IDENTITY` on a `SMALLINT` in the schema doc, which is the small lookup tables and small numeric fields, as opposed to `BIGINT` ones like `parent`, `child`, and `activity` ids, which correctly use `Long`).

Next up: the feedback loop (marking an activity loved/meh/skipped), which is what actually starts suppressing recent repeats and adjusting each child's interest weights over time.
