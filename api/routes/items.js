const { Router } = require('express');
const router = Router();

const mixin = require('../plugins/mixins');

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const items = new FileAsync('db/items.json');

low(items).then(db => {
  db._.mixin({
    // Проверяем уникальность предмета, путем поиска среди уже существующих идентичного полного имени,
    // короткого имени (предварительно прогнав их через метод toLowerCaseAndReplaceSpaces) или ID.
    // Эти три миксина вызываются в функции create() после получения коллекции предметов и перед попыткой сохранить в ней новый
    isUniqueFullname: function(items, fullname) {
      if (
        items.findIndex(
          item =>
            mixin.toLowerCaseAndReplaceSpaces(item['fullname']) ===
            mixin.toLowerCaseAndReplaceSpaces(fullname)
        ) === -1
      ) {
        return items;
      } else {
        throw {
          name: 'Fullname already taken',
          message: `Предмет с наименованием ${fullname} уже сушествует`,
        };
      }
    },
    isUniqueShortname: function(items, shortname) {
      if (
        items.findIndex(
          item =>
            mixin.toLowerCaseAndReplaceSpaces(item['shortname']) ===
            mixin.toLowerCaseAndReplaceSpaces(shortname)
        ) === -1
      ) {
        return items;
      } else {
        throw {
          name: 'Shortname already taken',
          message: `Предмет с сокращенным наименованием ${shortname} уже сушествует`,
        };
      }
    },
    isUniqueID: function(items, id) {
      if (items.findIndex(item => item['id'] === id) === -1) {
        return items;
      } else {
        throw {
          name: 'Item with specified ID already exists',
          message: `Предмет с идентификатором ${id} уже сушествует`,
        };
      }
    },
  });

  router.get('/all', (req, res) => {
    try {
      const items = getAllItems(db);
      res.send(items);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  router.get('/:id', (req, res) => {
    const id = req.params.id;
    const item = findItemByID(db, id, res);
    return res.send(item);
  });

  router.post('/create', (req, res) => {
    const item = req.body;
    create(db, item, res);
  });

  router.post('/update', (req, res) => {
    const item = req.body;
    update(db, item, res);
  });

  router.post('/remove', (req, res) => {
    const item = req.body;
    remove(db, item, res);
  });
});

/**
 * Получаем все предметы
 * @param db                Объект доступа к БД
 * @return Array
 */
const getAllItems = db => {
  return db.get('items').value();
};

/**
 * Поиск предмета в БД по ID
 * @param db                Объект доступа к БД
 * @param id                ID искомого РБ
 * @return Item Object
 */
const findItemByID = (db, id) => {
  const item = db
    .get('items')
    .find({ id: id })
    .value();
  return item;
};

/**
 * Поиск предмета в БД по полному наименованию
 * @param db                Объект доступа к БД
 * @param fullname          Полное наименование искомого предмета
 * @return Item Object
 */
const findItemByFullname = (db, fullname) => {
  const item = db
    .get('items')
    .find(function(item) {
      return (
        mixin.toLowerCaseAndReplaceSpaces(item.fullname) ===
        mixin.toLowerCaseAndReplaceSpaces(fullname)
      );
    })
    .value();

  return item;
};

/**
 * Поиск предмета в БД по сокращенному наименованию
 * @param db                Объект доступа к БД
 * @param shortname         Короткое наименование искомого предмета
 * @return Item Object
 */
const findItemByShortname = (db, shortname) => {
  const item = db
    .get('items')
    .find(function(item) {
      return (
        mixin.toLowerCaseAndReplaceSpaces(item.shortname) ===
        mixin.toLowerCaseAndReplaceSpaces(shortname)
      );
    })
    .value();

  return item;
};

/**
 * Создаем новый предмет
 * @param db                Объект доступа к БД
 * @param item              Экземпляр создаваемого предмета
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным предметом или ошибкой
 */
const create = (db, item, res) => {
  db.get('items')
    .isUniqueID(item.id)
    .isUniqueFullname(item.fullname)
    .isUniqueShortname(item.shortname)
    .push(item)
    .write()
    .then(items => {
      res.send({
        message: `Предмет ${item.fullname} успешно создан и добавлен в базу данных`,
        item,
      });
    })
    .catch(e => res.status(500).send(e));
};

/**
 * Изменяем информацию о предмете
 * @param db                Объект доступа к БД
 * @param item              Экземпляр изменяемого предмета
 * @param res               Объект ответа сервера
 * @return Promise          Промис с измененным предметом или ошибкой
 */
const update = (db, item, res) => {
  const isFullnamelUnique = findItemByFullname(db, item.fullname);
  if (isFullnamelUnique && isFullnamelUnique.id !== item.id)
    throw {
      name: 'Fullname already taken',
      message: `Предмет с полным наименованием ${item.fullname} уже сушествует`,
    };

  const isShortnamelUnique = findItemByShortname(db, item.shortname);
  if (isShortnamelUnique && isShortnamelUnique.id !== item.id)
    throw {
      name: 'Shortname already taken',
      message: `Предмет с коротким наименованием ${item.shortname} уже сушествует`,
    };

  db.get('items')
    .chain()
    .find({ id: item.id })
    .assign(item)
    .write()
    .then(item => {
      res.send({ message: `Информация о предмете ${item.fullname} изменена`, item });
    })
    .catch(e => res.status(500).send(e));
};

/**
 * Удаляем информацию о предмете
 * @param db                Объект доступа к БД
 * @param item              Экземпляр удаляемого предмета
 * @param res               Объект ответа сервера
 * @return Promise
 */
const remove = (db, item, res) => {
  const itemToDelete = findItemByID(db, item.id);

  if (!itemToDelete)
    throw {
      name: 'Item not found',
      message: `Предмет с заданным идентификатором не найден в базе данных`,
    };

  db.get('items')
    .remove({ id: item.id })
    .write()
    .then(rb => {
      res.send({ message: `Предмет ${item.fullname} успешно удален` });
    })
    .catch(e => res.status(500).send(e));
};
module.exports = router;
