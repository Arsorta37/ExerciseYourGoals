cd $HOME\Desktop\eyg
docker compose up -d --build db       # 1. BD (ejecuta 01_ddl.sql y 02_roles.sql)
docker compose run --rm seed          # 2. puebla los datos
docker compose up -d --build web      # 3. levanta la web