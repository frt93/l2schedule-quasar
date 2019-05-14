const { Router } = require('express');
const router = Router();

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const accounts = new FileAsync('db/accounts.json');

const config = require('../config');
const mixin = require('../plugins/mixins');
const jwt = require('jsonwebtoken');
const jwtToken = config.jwtSignature;

low(accounts).then(db => {
  db._.mixin({
    // Проверяем уникальность логина, путем поиска среди уже существующих (предварительно прогнав их через метод toLowerCaseAndReplaceSpaces).
    // Эти миксин вызывается в функции create() после получения коллекции аккаунта и перед попыткой сохранить в ней новый
    isUniqueLogin: function(accounts, login) {
      if (
        accounts.findIndex(
          account =>
            mixin.toLowerCaseAndReplaceSpaces(account['login']) ===
            mixin.toLowerCaseAndReplaceSpaces(login)
        ) === -1
      ) {
        return accounts;
      } else {
        throw {
          name: 'This account already exist',
          message: `Аккаунт с логином ${login} уже сушествует`,
        };
      }
    },
  });

  router.get('/all', (req, res) => {
    const accounts = getAllAccounts(db);
    res.send(accounts);
  });

  router.post('/create', (req, res) => {
    const account = req.body.account;
    const user = req.body.user;
    create(db, account, res);
  });

  router.post('/update', (req, res) => {
    const account = req.body.account;
    const user = req.body.user;
    update(db, account, user, req, res);
  });

  router.post('/remove', (req, res) => {
    const account = req.body.account;
    const user = req.body.user;
    remove(db, account, user, req, res);
  });

  router.get('/professions', (req, res) => {
    const professions = getProfessions(db);
    res.send(professions);
  });
});

/**
 * Получаем все партийные аккаунты из БД
 * @param db                Объект доступа к БД
 * @return Array
 */
const getAllAccounts = db => {
  return db.get('accounts').value();
};

/**
 * Поиск партийного аккаунта в БД по ID
 * @param db                Объект доступа к БД
 * @param id                ID искомого аккаунта
 * @return Account Object
 */
const findAccountByID = (db, id) => {
  const account = db
    .get('accounts')
    .find({ id: id })
    .value();
  return account;
};

/**
 * Поиск партийного аккаунта в БД по логину
 * @param db                Объект доступа к БД
 * @param login             Логин искомого аккаунта
 * @return Account Object
 */
const findAccountByLogin = (db, login) => {
  const account = db
    .get('accounts')
    .find(function(account) {
      return (
        mixin.toLowerCaseAndReplaceSpaces(account.login) ===
        mixin.toLowerCaseAndReplaceSpaces(login)
      );
    })
    .value();

  return account;
};

/**
 * Добавляем новый партийный аккаунт.
 * @param db                Объект доступа к БД
 * @param account           Экземпляр создаваемого аккаунта
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным аккаунтом или ошибкой
 */
const create = (db, account, res) => {
  db.get('accounts')
    .isUniqueLogin(account.login)
    .push(account)
    .write()
    .then(accounts => {
      res.send({
        message: `Аккаунт ${account.login} успешно создан и добавлен в базу данных`,
        account,
      });
    })
    .catch(e => {
      res.status(500).send({ message: e });
    });
};

/**
 * Изменяем информацию о партийном аккаунте
 * @param db                Объект доступа к БД
 * @param account           Экземпляр изменяемого аккаунта
 * @param user              Экземпляр пользователя, который инициировал редактирование
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 * @return Promise          Промис с измененным аккаунтом или ошибкой
 */
const update = (db, account, user, req, res) => {
  const isLoginUnique = findAccountByLogin(db, account.login);
  if (isLoginUnique && isLoginUnique.id !== account.id)
    throw {
      name: 'Login already taken',
      message: `Аккаунт с логином ${account.login} уже сушествует`,
    };

  db.get('accounts')
    .chain()
    .find({ id: account.id })
    .assign(account)
    .write()
    .then(account => {
      res.send({ message: `Информация об аккаунте ${account.login} изменена`, account });
    })
    .catch(e => res.status(500).send(e));
};

/**
 * Удаляем информацию о партийном аккаунте
 * @param db                Объект доступа к БД
 * @param account           Экземпляр удаляемого аккаунта
 * @param user              Экземпляр пользователя, который инициировал удаление
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 * @return Promise
 */
const remove = (db, account, user, req, res) => {
  const accountToDelete = findAccountByID(db, account.id);

  if (!accountToDelete)
    throw {
      name: 'Account not found',
      message: `Аккаунт с заданным идентификатором не найден в базе данных`,
    };

  if (accountToDelete.characters.length)
    throw {
      name: 'Account not empty',
      message: `Сначала удалите всех персонажей на аккаунте`,
    };

  db.get('accounts')
    .remove({ id: account.id })
    .write()
    .then(acc => {
      res.send({ message: `Аккаунт ${account.login} успешно удален` });
    })
    .catch(e => res.status(500).send(e));
};
/**
 * Получаем список всех проф
 * @param db                Объект доступа к БД
 * @return Array
 */
const getProfessions = db => {
  return db.get('professions').value();
};
module.exports = router;
