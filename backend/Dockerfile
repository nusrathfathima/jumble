# Two stages: the first one compiles the app with Maven, the second one
# is a small image that only contains Java and the finished .jar. The
# build tools never ship to production, which keeps the final image small.

# ---- Stage 1: build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first and download dependencies on their own. Docker caches
# each step, so later builds skip the slow download unless pom.xml changes.
COPY pom.xml .
RUN mvn -q dependency:go-offline

COPY src ./src
RUN mvn -q clean package -DskipTests

# ---- Stage 2: run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# A free Render server has 512 MB of RAM in total. Cap Java at 75 percent
# of it, so the operating system and Java's own overhead still fit.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"

# Render sets PORT at runtime; application.properties already reads it.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
