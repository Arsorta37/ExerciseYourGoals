# ExerciseYourGoals
La base de datos está en Clever Cloud, y la web está hosteada en https://exerciseyourgoals.onrender.com/

# Probarlo en local:
docker build -t miweb .

docker run -p 8080:8080 -e EYG_DB_URL="jdbc:postgresql://btsrbpsbagb3crcueyu1-postgresql.services.clever-cloud.com:50014/btsrbpsbagb3crcueyu1?currentSchema=eyg" -e EYG_DB_USER="uykvom2kujiqww6rrjet" -e EYG_DB_PASSWORD="TU_PASSWORD" exerciseyourgoals
