# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --uid 1001 appuser
COPY --from=build /app/target/wfa-*.jar app.jar
USER appuser
EXPOSE 8080
# Keep the JVM inside the container's memory limit (fits a 1 GB t2/t3.micro)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
