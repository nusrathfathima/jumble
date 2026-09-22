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

## Running it locally

```
mvn spring-boot:run
```

Then open **http://localhost:8080/api/health** in a browser. You should see:

```json
{"status":"ok","service":"jumble-backend"}
```

## Running the test

```
mvn test
```

## What's here so far

- `JumbleBackendApplication.java` — the entry point. You won't need to change this again.
- `controller/HealthController.java` — the one endpoint that exists right now, `/api/health`, used to prove the server is alive.
- `config/WebConfig.java` — allows the React frontend to call this API from the browser during local development (see the comments in the file for why this is necessary).
- `application.properties` — server configuration. Database credentials are deliberately *not* here (see the comments in that file).

Database connection, the entity classes, and the real endpoints come next.
