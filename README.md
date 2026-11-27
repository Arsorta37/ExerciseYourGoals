# ExerciseYourGoals
Web creada para las prácticas de la asignatura Sistemas de información

La base de datos está alojada en Clever Cloud, y la web está hosteada en https://exerciseyourgoals.onrender.com/
Como en ambos servicios tengo la versión gratuita, la web se apaga a los 15min sin uso, por lo que la primera conexión puede tardar unos segundos.
Por parte de la base de datos, solo se pueden tener 5 conexiones a la vez, lo que hace que las rutinas tarden mucho en cargar.

# Probarlo en local
1º Descargar todo el repositorio y tener Docker Desktop iniciado.

2º Abrir la carpeta del repositorio en la terminal y ejecutar lo siguiente (asegúrate de no estar usando el puerto 8080):
docker compose up -d --build db    # 1. BD (ejecuta ddl.sql y roles.sql)
docker compose run --rm seed       # 2. puebla los datos
docker compose up -d --build web   # 3. levanta la web

3º Abrir http://localhost:8080 en el navegador.
