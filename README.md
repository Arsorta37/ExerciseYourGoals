# ExerciseYourGoals
La base de datos está alojada en Clever Cloud, y la web está hosteada en https://exerciseyourgoals.onrender.com/
Como en ambos servicios tengo la versión gratuita, la web se apaga a los 15min sin uso, por lo que la primera conexión puede tardar unos segundos.
Por parte de la base de datos, solo se pueden tener 5 conexiones a la vez, lo que hace que las rutinas tarden mucho en cargar.

# Probarlo en local
1º Descargar el Dockerfile y ExerciseYourGoals.war en la misma carpeta.

2º Pedirme la contraseña de la base de datos por correo, o crearla tú mismo

3º Ejecuta en la terminal dentro de la carpeta con los archivos los siguientes comandos (cambiar el segundo comando si has creado la base de datos):

docker build -t exerciseyourgoals .

docker run -p 8080:8080 -e EYG_DB_URL="jdbc:postgresql://btsrbpsbagb3crcueyu1-postgresql.services.clever-cloud.com:50014/btsrbpsbagb3crcueyu1?currentSchema=eyg" -e EYG_DB_USER="uykvom2kujiqww6rrjet" -e EYG_DB_PASSWORD="TU_PASSWORD" exerciseyourgoals

4º Abrir http://localhost:8080 en el navegador.

# Crear la base de datos
