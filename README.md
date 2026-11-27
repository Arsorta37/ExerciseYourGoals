# ExerciseYourGoals
Web creada para las prácticas de la asignatura Sistemas de información por Andrés Lorente Pérez y Andrés Llorente Ojuel.

La base de datos está alojada en Clever Cloud, y la web está hosteada en https://exerciseyourgoals.onrender.com/

Como en ambos servicios tengo la versión gratuita, la web se apaga a los 15min sin uso, por lo que la primera conexión puede tardar unos segundos.
Por parte de la base de datos, solo se pueden tener 5 conexiones a la vez, lo que hace que no se pueda usar por muchos usuarios simultaneamente.



# Probarlo en local

### 1º Descargar todo el repositorio.


### 2º Tener Docker Desktop instalado e iniciado. 
(asegúrate de no estar usando el puerto 8080 con "docker compose down")


### 3º Abrir la carpeta del repositorio en la terminal y ejecutar lo siguiente:

docker compose up -d --build db    # 1. BD (ejecuta ddl.sql y roles.sql)

docker compose run --rm seed       # 2. puebla los datos

docker compose up -d --build web   # 3. levanta la web

### 4º Abrir http://localhost:8080 en el navegador.


### 5º Puedes iniciar sesión en la cuenta ADMIN con la contraseña "eyg_admin", con la que puedes crear más rutinas globales, ejercicios y administradores.




# Probarlo en local (conectándose a otra base de datos no local)

### Para conectarte, primero tendrás que crear un archivo ".env.cloud" en la misma carpeta.
En este archivo se definirán las variables de entorno. Para ello, modifica las siguientes variables sin dejar ningún espacio al rededor de los '=' y sin poner comillas a los valores:

EYG_DB_URL=jdbc:postgresql://TU_HOST:PUERTO/TU_BD?currentSchema=eyg

EYG_DB_USER=tu_usuario

EYG_DB_PASSWORD=tu_contraseña


### Una vez creado ".env.cloud", la ejecución es igual que creando la base de datos localmente, pero cambiando el paso 3º por lo siguiente:

docker compose -f compose.cloud.yaml up -d --build

docker compose -f compose.cloud.yaml logs -f web

### Poblar la base de datos no local borra todos los datos que estén originalmente, por lo que primero se tiene que confirmar que se está seguro, y para ello asignamos a la variable CONFIRMAR_SEED el valor "SI":

$env:CONFIRMAR_SEED = "SI"

docker compose -f compose.cloud.yaml run --rm seed
