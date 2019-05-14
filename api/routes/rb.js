const { Router } = require('express');
const router = Router();

const mixin = require('@api/plugins/mixins');

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const bosses = new FileAsync('db/bosses.json');

low(bosses).then(db => {
  db._.mixin({
    // Проверяем уникальность Рейдового Босса, путем поиска среди уже существующих идентичного полного имени,
    // короткого имени (предварительно прогнав их через метод toLowerCaseAndReplaceSpaces) или ID.
    // Эти три миксина вызываются в функции create() после получения коллекции РБ и перед попыткой сохранить в ней нового
    isUniqueFullname: function(bosses, fullname) {
      if (
        bosses.findIndex(
          boss =>
            mixin.toLowerCaseAndReplaceSpaces(boss['fullname']) ===
            mixin.toLowerCaseAndReplaceSpaces(fullname)
        ) === -1
      ) {
        return bosses;
      } else {
        throw {
          name: 'Fullname already taken',
          message: `Рейдовый босс с именем ${fullname} уже сушествует`,
        };
      }
    },
    isUniqueShortname: function(bosses, shortname) {
      if (
        bosses.findIndex(
          boss =>
            mixin.toLowerCaseAndReplaceSpaces(boss['shortname']) ===
            mixin.toLowerCaseAndReplaceSpaces(shortname)
        ) === -1
      ) {
        return bosses;
      } else {
        throw {
          name: 'Shortname already taken',
          message: `Рейдовый босс с коротким именем ${shortname} уже сушествует`,
        };
      }
    },
    isUniqueID: function(bosses, id) {
      if (bosses.findIndex(boss => boss['id'] === id) === -1) {
        return bosses;
      } else {
        throw {
          name: 'Raid Boss with specified ID already exists',
          message: `Рейдовый босс с идентификатором ${id} уже сушествует`,
        };
      }
    },
  });

  router.get('/all', (req, res) => {
    const raidbosses = getAllRaidbosses(db);
    if (!raidbosses) {
      res.status(500).send(e);
    }
    res.send(raidbosses);
  });

  router.get('/:id', (req, res) => {
    const id = req.params.id;
    const rb = findRaidbossByID(db, id);
    return res.send(rb);
  });

  router.post('/create', (req, res) => {
    const boss = req.body.boss;
    const user = req.body.user;
    create(db, boss, user, req, res);
  });

  router.post('/update', (req, res) => {
    const boss = req.body.boss;
    const user = req.body.user;
    update(db, boss, user, req, res);
  });

  router.post('/remove', (req, res) => {
    const boss = req.body.boss;
    const user = req.body.user;
    remove(db, boss, user, req, res);
  });
});

/**
 * Получаем всех Рейдовых Боссов из БД
 * @param db                Объект доступа к БД
 * @return Array
 */
const getAllRaidbosses = db => {
  return db.get('raidbosses').value();
};

/**
 * Поиск Рейдового Босса в БД по ID
 * @param db                Объект доступа к БД
 * @param id                ID искомого РБ
 * @return Raidboss Object
 */
const findRaidbossByID = (db, id) => {
  const boss = db
    .get('raidbosses')
    .find({ id: id })
    .value();
  return boss;
};

/**
 * Поиск Рейдового Босса в БД по полному имени
 * @param db                Объект доступа к БД
 * @param fullname          Полное имя искомого РБ
 * @return Raidboss Object
 */
const findRaidbossByFullname = (db, fullname) => {
  const rb = db
    .get('raidbosses')
    .find(function(rb) {
      return (
        mixin.toLowerCaseAndReplaceSpaces(rb.fullname) ===
        mixin.toLowerCaseAndReplaceSpaces(fullname)
      );
    })
    .value();

  return rb;
};

/**
 * Поиск Рейдового Босса в БД по полному имени
 * @param db                Объект доступа к БД
 * @param shortname         Короткое имя искомого РБ
 * @return Raidboss Object
 */
const findRaidbossByShortname = (db, shortname) => {
  const rb = db
    .get('raidbosses')
    .find(function(rb) {
      return (
        mixin.toLowerCaseAndReplaceSpaces(rb.shortname) ===
        mixin.toLowerCaseAndReplaceSpaces(shortname)
      );
    })
    .value();

  return rb;
};

/**
 * Создаем нового Рейдового Босса
 * @param db                Объект доступа к БД
 * @param boss              Экземпляр создаваемого РБ
 * @param user              Экземпляр пользователя, который инициировал создание рб
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным РБ или ошибкой
 */
const create = (db, boss, user, req, res) => {
  db.get('raidbosses')
    .isUniqueID(boss.id)
    .isUniqueFullname(boss.fullname)
    .isUniqueShortname(boss.shortname)
    .push(boss)
    .write()
    .then(bosses => {
      res.send({
        message: `Рейдовый босс ${boss.fullname} успешно создан и добавлен в базу данных`,
        boss,
      });
    })
    .catch(e => res.status(500).send(e));
};

/**
 * Изменяем информацию о Рейдовом Боссе
 * @param db                Объект доступа к БД
 * @param boss              Экземпляр изменяемого РБ
 * @param user              Экземпляр пользователя, который инициировал редактирование
 * @param req               Объект ответа сервера
 * @param res               Объект запроса сервера
 * @return Promise          Промис с измененным РБ или ошибкой
 */
const update = (db, boss, user, req, res) => {
  const isFullnamelUnique = findRaidbossByFullname(db, boss.fullname);
  if (isFullnamelUnique && isFullnamelUnique.id !== boss.id)
    throw {
      name: 'Fullname already taken',
      message: `РБ с полным именем ${boss.fullname} уже сушествует`,
    };

  const isShortnamelUnique = findRaidbossByShortname(db, boss.shortname);
  if (isShortnamelUnique && isShortnamelUnique.id !== boss.id)
    throw {
      name: 'Shortname already taken',
      message: `РБ с коротким именем ${boss.shortname} уже сушествует`,
    };

  db.get('raidbosses')
    .chain()
    .find({ id: boss.id })
    .assign(boss)
    .write()
    .then(boss => {
      res.send({ message: `Информация о РБ ${boss.fullname} изменена`, boss });
    })
    .catch(e => res.status(500).send(e));
};

/**
 * Удаляем информацию о Рейдовом Боссе
 * @param db                Объект доступа к БД
 * @param boss              Экземпляр изменяемого РБ
 * @param user              Экземпляр пользователя, который инициировал удаление
 * @param req               Объект ответа сервера
 * @param res               Объект запроса сервера
 * @return Promise
 */
const remove = (db, boss, user, req, res) => {
  const raidBossToDelete = findRaidbossByID(db, boss.id);

  if (!raidBossToDelete)
    throw {
      name: 'Raidboss not found',
      message: `РБ с заданным идентификатором не найден в базе данных`,
    };

  db.get('raidbosses')
    .remove({ id: boss.id })
    .write()
    .then(rb => {
      res.send({ message: `РБ ${boss.fullname} успешно удален` });
    })
    .catch(e => res.status(500).send(e));
};
module.exports = router;
