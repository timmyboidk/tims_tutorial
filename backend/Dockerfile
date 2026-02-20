# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Run stage (Using BellSoft Liberica Alpine JRE - one of the smallest)
FROM bellsoft/liberica-openjdk-alpine:17
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Expose port (if needed by other containers or for debugging)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
