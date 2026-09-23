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

## What's here so far

- `JumbleBackendApplication.java` — the entry point.
- `controller/HealthController.java` — `/api/health`, used to prove the server is alive.
- `controller/AuthController.java` — real signup and login, BCrypt-hashed passwords, returns a JWT.
- `controller/TestDataController.java` — **temporary.** Scaffolding used to verify the Parent/Child entities read and write real rows in Neon. Gets deleted once the real child-profile endpoints exist.
- `security/` — `JwtService` (issues/verifies tokens), `JwtAuthFilter` (reads the `Authorization` header on every request), `SecurityConfig` (wires it all together: which endpoints need a token, CORS, stateless sessions).
- `model/` — `Parent` and `Child` JPA entities.
- `repository/` — `ParentRepository` and `ChildRepository`.
- `config/WebConfig.java` — allows the React frontend to call this API from the browser during local development.
- `application.properties` — server configuration. Database credentials and the JWT secret are deliberately *not* here — see above.

Real child-profile endpoints, the activity library, and the recommendation endpoint come next.
