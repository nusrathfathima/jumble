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

Lists all 27 seeded activities (12 from the original library, 10 more to widen age/mess/location coverage, and 5 more that need zero materials at all — see `V5__seed_more_activities.sql` and `V6__seed_zero_material_activities.sql`). Grab one's `id` and look at its full detail, including steps:

```
curl http://localhost:8080/api/activities/1 -H "Authorization: Bearer <TOKEN>"
```

Now the real test — get suggestions for a child. You need a child's `id` (from `GET /api/children`) and, ideally, some materials checked in your inventory first, since most activities need at least one:

```
curl "http://localhost:8080/api/children/1/suggestions?availableMinutes=45&maxMessLevel=3&locationType=EITHER" -H "Authorization: Bearer <TOKEN>"
```

**The response shape changed from earlier in this milestone.** It used to be a bare array of suggestions; now it's an object with two lists:

```json
{
  "suggestions": [
    { "activityId": 3, "title": "...", "durationMinutes": 30, "score": 2.0, "explanation": "..." }
  ],
  "nearMisses": []
}
```

`suggestions` is the same ranked list as before (up to 5, each with a `score` and a plain-language `explanation`). `nearMisses` is new: it's only populated when `suggestions` comes back empty, and lists activities that would have qualified on age/time/mess/location but are missing one or more required materials — each entry names exactly which materials are missing, so a dead end becomes an actionable "go grab X and Y" instead of a shrug.

A few things worth deliberately testing to see the filtering actually work, not just trust that it does:

- **Age filtering:** create a child with a birth year that makes them, say, 1 year old, and confirm the results differ from a 7-year-old's — the youngest-friendly activities (shape sorting box) start at age 1, but most still need at least age 3.
- **Time filtering:** set `availableMinutes=10` — everything in the library takes at least 15 minutes, so `suggestions` should come back empty.
- **Mess filtering:** set `maxMessLevel=1` — only the lowest-mess activities should come back; there are now many more of these (paper airplanes, sock puppets, mini books, reading nook fort, cardboard tube tower, and more) than in the original 12.
- **Material filtering, and the near-miss feature:** with your inventory empty (`PUT /api/inventory` with `{"materialIds":[]}`), request suggestions with a fairly generous time limit (30+ minutes) — you'll likely still get real `suggestions` back, from the five zero-material activities (I Spy, Animal Charades, Story Chain, Living Room Animal Yoga, Cloud Watching, Reading Nook Blanket Fort, Nature Scavenger Hunt) that never need anything checked in inventory. To actually see `nearMisses` populate, tighten `availableMinutes` below what those zero-material activities need (try `availableMinutes=20&maxMessLevel=1&locationType=INDOOR`) — `suggestions` should come back empty, and `nearMisses` should list activities like Paper Airplane Contest or Flashlight Shadow Puppets with their missing materials named. Check just the one or two materials a near-miss activity needs and request again — it should move from `nearMisses` into `suggestions`.
- **Zero-material variety:** with inventory empty, run the suggestions call a few times with slightly different `availableMinutes`/`maxMessLevel`/`locationType` combinations for the same child — you should see a genuine mix of the zero-material activities rather than always the same single one.
- **The explanation text:** if the child has declared interests (from `interestTagSlugs` at creation) or has otherwise-elevated tag weights, an activity matching those tags should say so in its `explanation` field, e.g. "Matches an interest in Science."

## Trying out the feedback loop

This is what makes suggestions actually get smarter instead of only reflecting a child's declared interests forever. Recording a completion does two things at once: it saves the history row, and it nudges that activity's tags' weights up or down for that child (`+0.30` loved, `+0.05` ok, `-0.20` skipped, clamped to `[0.2, 3.0]` — schema doc section 5).

Pick a real activity id and child id, then mark it loved:

```
curl -X POST http://localhost:8080/api/children/1/completions -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d "{\"activityId\":4,\"rating\":\"LOVED\"}"
```

`rating` must be exactly `LOVED`, `OK`, or `SKIPPED` — anything else comes back as a 400 with a validation message. `note` is optional free text, also fine to leave out entirely.

List a child's history back:

```
curl http://localhost:8080/api/children/1/completions -H "Authorization: Bearer <TOKEN>"
```

A few things worth deliberately testing:

- **Weights actually move:** request suggestions for that child before and after marking an activity `LOVED` — its tag(s) should score higher afterward, and the `explanation` field on any other activity sharing that tag should start saying "Matches an interest in ..." for that tag if it didn't before.
- **Repeat suppression:** mark an activity as completed (any rating), then immediately request suggestions again with the same filters that used to return it — it should no longer appear for `repeatWindowDays` (14 by default). Pass `repeatWindowDays=0` to bypass this while testing, since otherwise you'd have to wait two weeks to see it come back.
- **The clamp:** mark the same activity `LOVED` repeatedly (six or seven times) for one child — the weight should stop climbing once it hits `3.0`, never going higher, matching `chk_weight_range` in the database.
- **Validation:** try `rating: "loved"` (lowercase) or `rating: "MEH"` — both should come back as a 400 with a message telling you the allowed values, not a 500 or a silent no-op.

In the browser, each suggestion card now has three feedback buttons ("Loved it" / "It was okay" / "Skipped") underneath it. Clicking one saves the completion and swaps the buttons for a short confirmation message.

## Trying out stats

History (`GET /api/children/{id}/completions`, above) is the log. Stats is the summary on top of it — the numbers a "your child's activity" screen would actually show, computed fresh from that same log every time rather than stored anywhere separately.

```
curl http://localhost:8080/api/children/1/stats -H "Authorization: Bearer <TOKEN>"
```

Response shape:

```json
{
  "totalCompletions": 14,
  "completionsThisMonth": 5,
  "lovedCount": 9,
  "okCount": 4,
  "skippedCount": 1,
  "favoriteTag": { "slug": "art", "displayName": "Art", "completionCount": 6 }
}
```

- `totalCompletions` — every completion ever recorded for this child, any rating.
- `completionsThisMonth` — completions since the 1st of the current calendar month (not a rolling 30 days), so it resets on a date a parent can predict.
- `lovedCount` / `okCount` / `skippedCount` — a breakdown of `totalCompletions` by rating; the three should always add up to `totalCompletions`.
- `favoriteTag` — whichever tag shows up most often across this child's completed activities (an activity tagged both Art and Quiet counts once toward each). `null` if the child has no completions yet, or if every completed activity happens to carry no tags at all.

A few things worth deliberately testing:

- **A child with no history yet:** all five counts should come back `0` and `favoriteTag` should be `null` — not a 500, not a fabricated favorite.
- **The counts track the feedback loop:** mark a couple more completions with different ratings (see "Trying out the feedback loop" above), then call `/stats` again — `totalCompletions` and the matching rating count should both go up by exactly one each time.
- **Favorite tag changes with real usage:** complete several activities that share a tag (say, three Art activities) for a child who previously favored a different tag — `favoriteTag` should flip to Art once it has the highest count.
- **Ownership:** requesting `/api/children/{id}/stats` for a child that belongs to a different parent's account should come back `404`, the same as every other child-scoped endpoint.

## Trying out weather-aware filtering

On a wet day, "No preference" suggestions quietly skip outdoor-only activities. It only kicks in once a parent has saved a location, and if the weather can't be fetched, suggestions just work the way they did before.

How it decides: Jumble asks [Open-Meteo](https://open-meteo.com) (free, no API key) for today's weather code, high temperature, and highest chance of precipitation. The day counts as wet if the code means drizzle, rain, snow, showers, or thunderstorms, or if the chance of precipitation is 50% or more. The answer is cached in `weather_cache`, one row per ~11 km area per day, so a whole neighbourhood costs one API call a day, however many times anyone asks for suggestions.

What a wet day changes:

- **No preference:** outdoor-only activities are left out (activities marked "either" still show).
- **Outdoor, picked on purpose:** outdoor ideas still show, and the response includes a `weatherWarning` message.
- **Indoor:** nothing changes.

Save a location (the browser's "Use my location" button in Settings does this for you):

```
curl -X PUT http://localhost:8080/api/me/location -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d "{\"latitude\":41.88,\"longitude\":-87.63}"
```

The location is stored rounded to 2 decimal places (about 1 km), never the exact GPS fix.

Check today's weather for that location:

```
curl http://localhost:8080/api/weather/today -H "Authorization: Bearer <TOKEN>"
```

```json
{ "locationSet": true, "available": true, "condition": "Rain", "tempC": 12.4, "precipitationChance": 85, "outdoorFriendly": false }
```

`locationSet: false` means no location is saved yet. `available: false` means a location is saved but the weather couldn't be fetched right now.

Remove the location (turns weather filtering off again):

```
curl -X DELETE http://localhost:8080/api/me/location -H "Authorization: Bearer <TOKEN>"
```

A few things worth deliberately testing:

- **See a wet day for real:** look up a city where it's raining today, save its coordinates with the `PUT` above, then call `/api/weather/today` and confirm `outdoorFriendly` is `false`. Then request suggestions with `locationType=EITHER`, and again with `locationType=OUTDOOR`, and compare: the first should have no outdoor-only activities, the second should have outdoor ones plus a `weatherWarning`.
- **The cache works:** call `/api/weather/today` a few times. Only the first call of the day for that area should reach Open-Meteo; you can see the single row in the `weather_cache` table in Neon.
- **No location, no change:** `DELETE` the location, and suggestions should behave exactly as before, with `weatherWarning` always `null`.

Open-Meteo's free tier requires credit under its CC BY licence, so the weather line on the home page includes a small "Weather data by Open-Meteo.com" link.

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
- `db/migration/V4__seed_activities.sql` — the original 12 fully written activities (age range, duration, mess level, location, tags, materials, and step-by-step instructions each), the actual content the recommendation engine draws from.
- `db/migration/V5__seed_more_activities.sql` — 10 more activities, deliberately weighted toward INDOOR + low-mess and a wider age spread (as young as 1), since that combination was the gap that made a real search come back empty during testing. Also adds two new household materials (`socks`, `blanket`) the same additive way `V3` added the rest.
- `db/migration/V6__seed_zero_material_activities.sql` — 5 more activities that need no materials at all (I Spy, Animal Charades, Story Chain, Living Room Animal Yoga, Cloud Watching). Added after testing showed that with an empty inventory, every child got shown the exact same single suggestion (Reading Nook Blanket Fort was the only zero-material option) — this spreads that "always have something to offer" baseline across six-plus real choices instead of one repeated one.
- `controller/ActivityController.java` — `GET /api/activities` (browse the whole library) and `GET /api/activities/{id}` (full detail: tags, materials, steps).
- `controller/SuggestionController.java` — `GET /api/children/{id}/suggestions`, the centerpiece "get a suggestion" endpoint: filters the library by the child's age, the time/mess/location you specify, and what materials you actually have, then ranks by the child's interest weights and returns a plain-English explanation with each result. Now also returns a `nearMisses` list — activities that almost qualified, missing only specific materials — whenever the main `suggestions` list comes back empty.
- `model/` — now also `Activity`, `ActivityTag`, `ActivityMaterial`, `ActivityStep`, matching the new `activity`, `activity_tag`, `activity_material`, and `activity_step` tables.
- `repository/` — `ActivityRepository` (includes both the native ranking query behind `suggestions` and the native near-miss query behind `nearMisses`), `ActivityTagRepository`, `ActivityMaterialRepository`, `ActivityStepRepository`, and `ChildTagWeightRepository` gained a lookup used to build the suggestion explanations.
- `controller/CompletionController.java` — `GET/POST /api/children/{id}/completions`, the feedback loop: recording a rated completion saves the history row (which the suggestions query's repeat suppression reads) and nudges that activity's tags' weights up or down for that child in the same transaction (schema doc section 5).
- `model/Completion.java` and `repository/CompletionRepository.java` — the `completion` table's entity, plus the native weight-adjustment `UPDATE` from schema doc section 5, ported the same way the suggestions and near-miss queries were: as a native query, because it's a plain, well-understood `UPDATE ... WHERE tag_id IN (subquery)`, not something JPQL or Criteria API would express any more clearly. `CompletionRepository` now also has the four count lookups and the native `findTopTag` query that `StatsController` runs.
- `controller/StatsController.java` — `GET /api/children/{id}/stats`, the aggregate view on top of the completion log: total completions, this-calendar-month count, a loved/ok/skipped breakdown, and the child's favorite tag by completion count.
- `controller/WeatherController.java` — `PUT/DELETE /api/me/location` (save or forget the parent's location, stored rounded to about 1 km) and `GET /api/weather/today` (today's weather for the home page line).
- `service/WeatherService.java` — calls Open-Meteo with short timeouts, decides whether today is wet, and caches one result per area per day. Returns nothing (instead of an error) if there's no location or the lookup fails, so weather can never break suggestions.
- `model/WeatherCache.java` and `repository/WeatherCacheRepository.java` — the `weather_cache` table from `V1`, finally in use. `SuggestionController` now reads today's weather and swaps "No preference" to indoor on wet days, or adds a `weatherWarning` when Outdoor was picked on purpose.

`TestDataController.java` has been deleted — it was scaffolding for proving Parent/Child persistence worked, and the real endpoints above have replaced it.

**A note on `Short` vs `Integer`:** `Tag.id`, `Material.id`, and the small numeric fields on `Activity`/`ActivityStep` (`minAgeYears`, `maxAgeYears`, `durationMinutes`, `messLevel`, `stepNumber`) are all `Short` in Java, not `Integer`, because their database columns are `SMALLINT`. Hibernate's schema validation checks the exact column type, and this mismatch caused a real startup failure earlier in this project — worth remembering if a future entity maps to a `SMALLINT` column (anything with `GENERATED ALWAYS AS IDENTITY` on a `SMALLINT` in the schema doc, which is the small lookup tables and small numeric fields, as opposed to `BIGINT` ones like `parent`, `child`, and `activity` ids, which correctly use `Long`).

That completes every MVP feature in the spec. Next up would be the stretch features (weekly digest email, photo log, household sharing, admin view) and deployment.
