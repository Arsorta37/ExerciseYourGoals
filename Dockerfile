FROM tomcat:11.0-jdk25-temurin
RUN rm -rf /usr/local/tomcat/webapps/*
COPY ExerciseYourGoals.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080