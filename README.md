# ExerciseYourGoals
La base de datos está alojada en Clever Cloud, y la web está hosteada en https://exerciseyourgoals.onrender.com/
Como en ambos servicios tengo la versión gratuita, la web se apaga a los 15min sin uso, por lo que la primera conexión puede tardar más de un minuto.
Por parte de la base de datos, solo se pueden tener 5 conexiones a la vez, lo que hace que las rutinas tarden mucho en cargar.

# Probarlo en local
Tras descargar el Dockerfile y ExerciseYourGoals.war en la misma carpeta, ejecutad en la terminal dentro de la carpeta con los archivos los siguientes comandos:

docker build -t exerciseyourgoals .

docker run -p 8080:8080 -e EYG_DB_URL="jdbc:postgresql://btsrbpsbagb3crcueyu1-postgresql.services.clever-cloud.com:50014/btsrbpsbagb3crcueyu1?currentSchema=eyg" -e EYG_DB_USER="uykvom2kujiqww6rrjet" -e EYG_DB_PASSWORD="TU_PASSWORD" exerciseyourgoals
