FROM tomcat:11.0-jdk25-temurin
RUN rm -rf /usr/local/tomcat/webapps/*
COPY ExerciseYourGoals.war /usr/local/tomcat/webapps/ROOT.war
RUN sed -i 's/port="8005"/port="-1"/' /usr/local/tomcat/conf/server.xml

EXPOSE 8080
