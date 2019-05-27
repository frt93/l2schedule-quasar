# Соединяем поднятую postgres БД с pgadmin

> После выполнения npm run docker: Переходим на http://localhost:5050. Логинимся используя данные, указанные в docker-compose.yaml. Далее создаем новый сервер: Вкладка General: Name: Hasura Вкладка Connection: Host: postgres username: postgres password: оставляем пустым

# Бекап БД:

> docker exec -t <Название контейнера postgres (напр. quasar_postgres_1)> pg_dumpall -c -U <Имя пользователя БД (напр. postgres)> <Путь и название дампа>.sql

# Восстановление БД

> cat <Путь и название дампа>.sql | docker exec -i <Название контейнера postgres> psql -U <Имя пользователя БД> -d <Имя БД>
