const { Router } = require('express');
const router = Router();

const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const users = new FileAsync('db/users.json');

const config = require('../config');
const mixin = require('../plugins/mixins');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtToken = config.jwtSignature;
const email = require('emailjs/email');
const sendEmail = email.server.connect({
  user: 'lineage2schedule@gmail.com',
  password: 'FhBnIu76_oiLk3',
  host: 'smtp.gmail.com',
  port: 465,
  ssl: true,
});

low(users).then(db => {
  db._.mixin({
    // Проверяем уникальность пользователя, путем поиска среди уже существующих идентичных никнейма, email адреса
    // (предварительно прогнав их через метод toLowerCaseAndReplaceSpaces) или ID.
    // Эти три миксина вызываются в функции create() после получения коллекции пользователей и перед попыткой сохранить в ней нового
    isUniqueUsername: function(users, username) {
      if (
        users.findIndex(
          user =>
            mixin.toLowerCaseAndReplaceSpaces(user['username']) ===
            mixin.toLowerCaseAndReplaceSpaces(username)
        ) === -1
      ) {
        return users;
      } else {
        throw {
          name: 'User already taken',
          message: `Пользователь с никнеймом ${username} уже сушествует`,
        };
      }
    },
    isUniqueEmail: function(users, email) {
      if (
        users.findIndex(
          user =>
            mixin.toLowerCaseAndReplaceSpaces(user['email']) ===
            mixin.toLowerCaseAndReplaceSpaces(email)
        ) === -1
      ) {
        return users;
      } else {
        throw {
          name: 'Email already taken',
          message: `Пользователь с email адресом ${email} уже сушествует`,
        };
      }
    },
    isUniqueID: function(users, id) {
      if (users.findIndex(user => user['id'] === id) === -1) {
        return users;
      } else {
        throw {
          name: 'ID already exist',
          message: `Пользователь с идентификатором ${id} уже сушествует`,
        };
      }
    },

    isUniqueGroupID: function(groups, id) {
      if (groups.findIndex(user => user['id'] === id) === -1) {
        return groups;
      } else {
        throw {
          name: 'Group with this ID already exist',
          message: `Группа с идентификатором ${id} уже сушествует`,
        };
      }
    },

    isUniqueGroupName: function(groups, name) {
      if (groups.findIndex(user => user['name'] === name) === -1) {
        return groups;
      } else {
        throw {
          name: 'Group with this name already exist',
          message: `Группа с названием ${name} уже сушествует`,
        };
      }
    },
  });

  router.get('/users/all', (req, res) => {
    const users = getAllUsers(db);
    res.send(users);
  });

  router.get('/me', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token)
      return res.status(400).send({ type: 'error', message: 'x-access-token header not found.' });
    jwt.verify(token, jwtToken, (error, result) => {
      if (error)
        return res
          .status(403)
          .send({ type: 'error', message: 'Provided token is invalid.', error });
      const user = findUserByID(db, result.id);
      return res.send(user);
    });
  });

  router.post('/me/change/email', (req, res) => {
    const user = req.body;
    changeEmail(db, user, res);
  });

  router.post('/me/confirm/email', (req, res) => {
    confirmEmailChangeHandle(req, res, db);
  });

  router.post('/me/change/password', (req, res) => {
    const user = req.body;
    changePassword(db, user, res);
  });

  router.post('/me/confirm/password', (req, res) => {
    confirmPasswordChangeHandle(req, res, db);
  });

  router.post('/me/update', (req, res) => {
    const user = req.body;
    update(db, user, res);
  }),
    router.post('/users/check/username/', (req, res) => {
      const username = req.body.username;
      const user = findUserByUsername(db, username);

      if (user)
        res.send({ user, error: `Уже существует пользователь с никнеймом ${user.username}` });
      else res.send({ message: `Пользователь с никнеймом ${username} не найден` });
    });

  router.post('/users/check/email/', (req, res) => {
    const email = req.body.email;
    const user = findUserByEmail(db, email);
    if (user)
      res.send({ user, error: `email адрес ${email} уже используется другим пользователем` });
    else res.send({ message: `Пользователь с email-адресом ${email} не найден` });
  });

  router.post('/users/signin', (req, res) => {
    const credentials = req.body;
    signin(db, credentials, res);
  });

  router.post('/users/signup', (req, res) => {
    const user = req.body;
    create(db, user, res);
  });

  router.post('/users/restore', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    let user;
    if (username) {
      user = findUserByUsername(db, username);
      if (!user)
        throw {
          name: 'User not found',
          message: `Пользователя с никнеймом ${username} не существует`,
        };
    }
    if (email) {
      user = findUserByEmail(db, email);
      if (!user)
        throw {
          name: 'User not found',
          message: `Пользователя с email адресом ${email} не сушествует`,
        };
    }

    restoreAccess(user, res);
  });

  router.post('/user/reset', (req, res) => {
    const id = req.body.id;
    const password = req.body.password;
    const user = findUserByID(db, id);

    if (!user) {
      throw {
        name: 'Invalid access recovery code',
        message: `Вы указали неверный код восстановления доступа`,
      };
    }

    reset(db, user, password, res);
  });

  router.post('/group/create', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(400).send({ type: 'error', message: 'Authorization error.' });
    const group = req.body;
    createGroup(db, group, res);
  });

  router.post('/group/invite', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(400).send({ type: 'error', message: 'Authorization error.' });
    const group = req.body.group;
    const invitee = req.body.invitee;
    const inviter = req.body.inviter;

    inviteToGroup(db, group, invitee, inviter, res);
  });

  router.post('/group/accept', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(400).send({ type: 'error', message: 'Authorization error.' });
    const group = req.body.group;
    const invitee = req.body.user;

    joinGroup(db, group, invitee, res);
  });
});

/**
 * Получаем всех пользователей из БД
 * @param db                Объект доступа к БД
 * @return Array
 */
const getAllUsers = db => {
  return db.get('users').value();
};

/**
 * Поиск пользователя в БД по ID
 * @param db                Объект доступа к БД
 * @param id                ID искомого пользователя
 * @return user Object
 */
const findUserByID = (db, id) => {
  const user = db
    .get('users')
    .find({ id: id })
    .value();
  return user;
};

/**
 * Поиск пользователя в БД по никнейму
 * @param db                Объект доступа к БД
 * @param username          Никнейм искомого пользователя
 * @return user Object
 */
const findUserByUsername = (db, username) => {
  const user = db
    .get('users')
    .find(function(user) {
      return (
        mixin.toLowerCaseAndReplaceSpaces(user.username) ===
        mixin.toLowerCaseAndReplaceSpaces(username)
      );
    })
    .value();

  return user;
};

/**
 * Поиск пользователя в БД по email-адресу
 * @param db                Объект доступа к БД
 * @param email             Email-адрес искомого пользователя
 * @return user Object
 */
const findUserByEmail = (db, email) => {
  const user = db
    .get('users')
    .find(function(user) {
      return (
        mixin.toLowerCaseAndReplaceSpaces(user.email) === mixin.toLowerCaseAndReplaceSpaces(email)
      );
    })
    .value();
  return user;
};

/**
 * Создаем нового пользователя. Перед записью в БД хэшируем пароль и присваиваем рядовую группу
 * @param db                Объект доступа к БД
 * @param user              Экземпляр создаваемого пользователя
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным пользователем или ошибкой
 */
const create = (db, user, res) => {
  const plaintextPassword = user.password;
  user.password = hashPassword(plaintextPassword);
  user.privileges = 'common';
  const { token, code } = emailConfirmToken(user);
  user.emailConfirmCode = `${code}`;

  const message = config.registrationConfirmMessage(user, token, code, plaintextPassword);

  db.get('users')
    .isUniqueID(user.id)
    .isUniqueUsername(user.username)
    .isUniqueEmail(user.email)
    .push(user)
    .write()
    .then(async users => {
      await emailConfirmMessage(message);
      await signin(db, { username: user.username, password: plaintextPassword }, res);
    })
    .catch(e => {
      res.status(500).send({ message: e });
    });
};

/**
 * Изменяем информацию пользователя
 * @param db                Объект доступа к БД
 * @param user              Экземпляр пользователя
 * @param res               Объект ответа сервера
 * @return Promise          Промис с измененным пользователем или ошибкой
 */
const update = (db, user, res) => {
  const isUsernamelUnique = findUserByUsername(db, user.username);
  if (isUsernamelUnique && isUsernamelUnique.id !== user.id)
    throw {
      name: 'Username already taken',
      message: `Пользователь с никнеймом ${user.username} уже сушествует`,
    };

  db.get('users')
    .chain()
    .find({ id: user.id })
    .assign(user)
    .write()
    .then(user => {
      res.send({ message: `Информация об аккаунте изменена`, user });
    })
    .catch(e => res.status(500).send(e));
};

/**
 * Меняем email адрес пользователя. Предварительно генерируем код подтверждения и токен.
 * В случае успешного изменения - отправляет письмо на новый электронный адрес
 * @param db                Объект доступа к БД
 * @param user              Экземпляр пользователя
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным пользователем или ошибкой
 */
const changeEmail = (db, user, res) => {
  const isEmailUnique = findUserByEmail(db, user.email);
  if (isEmailUnique)
    throw {
      name: 'User exist',
      message: `Пользователь с email адресом ${user.email} уже сушествует`,
    };

  const { token, code } = emailConfirmToken(user);
  const message = config.emailChangeConfirmMessage(user, token, code);

  db.get('users')
    .chain()
    .find({ id: user.id })
    .assign({ email: user.email, emailConfirmCode: `${code}` })
    .write()
    .then(async user => {
      await emailConfirmMessage(message);
      res.send({ message: `На новый email адрес было выслано письмо для подтверждения`, user });
    })
    .catch(e => res.status(500).send({ message: e }));
};

/**
 * Определяем каким способом подтверждается смена email адреса: путем перехода по ссылке из письма или
 * с помощью кода подтверждения в личном кабинете
 * @param req               Объект запроса серверу
 * @param res               Объект ответа сервера
 * @param db                Объект доступа к БД
 * @return mixed
 */
const confirmEmailChangeHandle = (req, res, db) => {
  const token = req.body.token;
  const byCode = req.body.code;
  let code, id;
  if (byCode) {
    // Если подтверждаем с помощью кода подтверждения в личном кабинете
    code = byCode;
    id = req.body.id;
  }
  if (token) {
    // Если подтверждаем с помощью ссылки из письма
    jwt.verify(token, jwtToken, (error, result) => {
      if (error) {
        return res.status(403).send({ type: 'error', message: 'Код подтвержения неверен', error });
      }
      id = result.id;
      code = result.code;
    });
  }
  const user = findUserByID(db, id);

  if (!user) {
    throw {
      name: 'User not found',
      message: `Пользователь не найден`,
    };
  }
  if (Number(user.emailConfirmCode) === Number(code)) {
    return confirmEmail(db, id, res);
  } else if (!user.emailConfirmCode) {
    throw {
      name: 'email already confirmed',
      message: `Данный email адрес уже подтвержден`,
    };
  } else {
    throw {
      name: 'Confirmation token invalid',
      message: `Код подтвержения неверен`,
    };
  }
};

/**
 * Подтверждаем email адрес пользователя.
 * @param db                Объект доступа к БД
 * @param id                ID пользователя
 * @param res               Объект ответа сервера
 * @return Object
 */
const confirmEmail = (db, id, res) => {
  let user = db.get('users').find({ id: id });
  user.unset('emailConfirmCode').write();

  return res.send({ message: `email адрес подтвержден`, user });
};

/**
 * Запускаем процесс смены пароля пользователя. Предварительно проверим, чтобы пользователь ввел правильный текущий пароль.
 * Если пароль верный - генерируем код подтверждения и токен. Затем обновляем экземпляр пользователя в бд добавляя к нему свойства
 * с новым паролем (в незашифрованном виде) и кода подтверждения. По итогам высылается пимьсо на email с кодом и ссылкой для подтверждения
 * @param db                Объект доступа к БД
 * @param user              Экземпляр пользователя
 * @param res               Объект ответа сервера
 * @return Object
 */
const changePassword = (db, user, res) => {
  const plaintextCurrentPassword = user.oldPassword;
  const compare = comparePasswords(plaintextCurrentPassword, user.password);
  if (!compare) {
    res.status(403).send({ key: 'currentPassword', message: `Вы ввели неверный текущий пароль` });
    return;
  }

  const { token, code } = emailConfirmToken(user);
  const message = config.passwordChangeConfirmMessage(user, token, code, user.newPassword);

  db.get('users')
    .chain()
    .find({ id: user.id })
    .assign({ newPassword: user.newPassword, passwordConfirmCode: `${code}` })
    .write()
    .then(async user => {
      await emailConfirmMessage(message);
      res.send({ message: `На ваш email адрес было выслано письмо для подтверждения`, user });
    })
    .catch(e => res.status(500).send({ message: e }));
};

/**
 * Определяем каким способом подтверждается смена пароля: путем перехода по ссылке из письма или
 * с помощью кода подтверждения в личном кабинете
 * @param req               Объект запроса
 * @param res               Объект ответа сервера
 * @param db                Объект доступа к БД
 * @return mixed
 */
const confirmPasswordChangeHandle = (req, res, db) => {
  const token = req.body.token;
  const byCode = req.body.code;
  let code, id;
  if (byCode) {
    // Если подтверждаем с помощью кода подтверждения в личном кабинете
    code = byCode;
    id = req.body.id;
  }
  if (token) {
    // Если подтверждаем с помощью ссылки из письма
    jwt.verify(token, jwtToken, (error, result) => {
      if (error) {
        return res.status(403).send({ type: 'error', message: 'Код подтвержения неверен', error });
      }
      id = result.id;
      code = result.code;
    });
  }
  const user = findUserByID(db, id);

  if (!user) {
    throw {
      name: 'User not found',
      message: `Пользователь не найден`,
    };
  }
  if (Number(user.passwordConfirmCode) === Number(code)) {
    return confirmPasswordChange(db, id, res);
  } else if (!user.passwordConfirmCode) {
    throw {
      name: 'Password already confirmed',
      message: `Пароль уже подтвержден`,
    };
  } else {
    throw {
      name: 'Confirmation token invalid',
      message: `Код подтвержения неверен`,
    };
  }
};

/**
 * Подтверждаем смену пароля пользователя. Хэшируем новый пароль. Затем удаляем из эксземпляра пользователя в БД свойства с новым паролем
 * в незашифрованном виде и кода подтверждения. Перезаписываем пароль от аккаунта и сохраняем
 * @param db                Объект доступа к БД
 * @param id                ID пользователя
 * @param res               Объект ответа сервера
 * @return Object
 */
const confirmPasswordChange = (db, id, res) => {
  let user = db.get('users').find({ id: id });
  const newPassword = hashPassword(user.value().newPassword);

  user.unset('newPassword').value();
  user.unset('passwordConfirmCode').value();
  user.assign({ password: newPassword }).value();
  user.write();

  return res.send({ message: `Смена пароля подтверждена`, user });
};

/**
 * Начало процедуры восстановления доступа к аккаунту
 * @param db                Объект доступа к БД
 * @param id                ID пользователя
 * @param res               Объект ответа сервера
 * @return Object
 */
const restoreAccess = (user, res) => {
  const message = config.restoreAccessMessage(user);
  emailConfirmMessage(message);
  res.send({
    message: `На ваш email адрес ${
      user.email
    } было выслано письмо с кодом восстановления доступа. Введите его в поле ниже, чтобы сменить пароль к своему аккаунту`,
  });
};

/**
 * Завершаем процедуру восстановления доступа к аккаунту путем смены пароля.
 * В результате успешной смены - отправляем пользователю на электронную почту письмо с новым паролем
 * @param db                Объект доступа к БД
 * @param user              Экземпляр пользователя
 * @param password          Новый пароль пользователя
 * @param res               Объект ответа сервера
 * @return Object
 */
const reset = (db, user, password, res) => {
  const newPassword = hashPassword(password);

  const message = config.resetedPasswordMessage(user, password);

  db.get('users')
    .chain()
    .find({ id: user.id })
    .assign({ password: newPassword })
    .write()
    .then(async user => {
      await emailConfirmMessage(message);
      await signin(db, { username: user.username, password: password }, res);
    })
    .catch(e => res.status(500).send({ message: e }));
};

/**
 * Составляем токен для подтверждения email адреса или смены пароля
 * @param user              Экземпляр пользователя, id которого войдет в состав токена
 * @return Object           token, code
 */
const emailConfirmToken = user => {
  const code = Math.floor(Math.random() * (9999999999 - 1000000000) + 1000000000);
  const token = jwt.sign({ id: user.id, code: code }, jwtToken);
  return { token, code };
};

/**
 * Составляем и отправляем письмо на почту для подтверждения email адреса
 * @param message           Текст сообщения
 */
const emailConfirmMessage = message => {
  sendEmail.send(message, function(err, response) {
    console.log(err || response);
  });
};

/**
 * Хэшируем пароль пользователя
 * @param password          Пароль пользователя
 * @return String
 */
const hashPassword = password => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Проверяем совпадение указанного пароля с паролем, сохраненным в ДБ
 * @param plaintext         Пароль, указанный пользователем в виде строки
 * @param hash              Пароль, сохраненный в ДБ в виде хэша
 * @return Boolean
 */
const comparePasswords = (plaintext, hash) => {
  return bcrypt.compareSync(plaintext, hash);
};

/**
 * Пробуем авторизовать пользователя
 * @param db                Объект доступа к БД
 * @param credentials       Данные, с помощью которых пользователь пытается авторизовать.
 *                          Это никнейм/email и пароль
 * @param res               Объект ответа сервера
 * @return Object           Экземпляр пользователя
 */
const signin = async (db, credentials, res) => {
  let user;
  let errorMessage;
  if (credentials.username) {
    // Если пользователь авторизуется с помощью никнейма
    user = await findUserByUsername(db, credentials.username);
    errorMessage = `Пользователь с никнеймом ${credentials.username} не найден`;
  } else if (credentials.email) {
    // Если пользователь авторизуется с помощью email-адреса
    user = await findUserByEmail(db, credentials.email);
    errorMessage = `Пользователь с email-адресом ${credentials.email} не найден`;
  }

  if (user) {
    const compare = await comparePasswords(credentials.password, user.password);
    if (compare) {
      const token = jwt.sign({ id: user.id, username: user.username }, jwtToken);
      const message = `Здравствуйте, ${user.username}. Вы успешно авторизовались`;
      res.send({ user, token, message });
    } else {
      res.status(403).send({ key: 'password', message: `Вы ввели неверный пароль` });
    }
  } else {
    res.status(403).send({ key: 'login', message: errorMessage });
  }
};

/**
 * Создаем новую группу. После создания сразу же инвайтим в нее создателя
 * @param db                Объект доступа к БД
 * @param group             Экземпляр создаваемой группы
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным пользователем или ошибкой
 */
const createGroup = (db, group, res) => {
  db.get('groups')
    .isUniqueGroupID(group.id)
    .isUniqueGroupName(group.name)
    .push(group)
    .write()
    .then(groups => {
      joinGroup(db, group, { id: group.creatorID }, res);
    })
    .catch(e => {
      res.status(500).send({ message: e });
    });
};

/**
 * Создаем новую группу. После создания сразу же инвайтим в нее создателя
 * @param db                Объект доступа к БД
 * @param group             Экземпляр группы, в которую приглашают пользователя
 * @param invitee           Экземпляр пользователя, которого приглашают!
 * @param inviter           Экземпляр пользователя, который приглашает!
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным пользователем или ошибкой
 */
const inviteToGroup = async (db, group, invitee, inviter, res) => {
  await db
    .get('users')
    .chain()
    .find({ id: invitee.id })
    .assign({ groupInvite: { id: group.id, name: group.name, inviterID: inviter.id } })
    .write()
    .then(user => {
      res.send({
        invitee: user,
        message: `Пользователь ${invitee.username} приглашен в группу ${group.name}`,
      });
    })
    .catch(e => res.status(500).send({ message: e }));
};

/**
 * Присоединяемся к группе
 * @param db                Объект доступа к БД
 * @param group             Экземпляр группы, в которую вступает пользователь
 * @param invitee           Экземпляр пользователя, который вступает в группу
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным пользователем или ошибкой
 */
const joinGroup = async (db, group, invitee, res) => {
  let role;
  let inviter;
  if (group.creatorID === invitee.id) {
    // Если пользователь вступает в только что созданную собой группу
    role = 'admin';
  } else {
    // Если пользователя кто-то пригласил.
    // Помимо присвоения его "рядовой" роли получим экземпляр пригласившего пользователя.
    // Он понадобится на клиенте для передачи в сокет
    role = 'newbie';
    inviter = await findUserByID(db, invitee.groupInvite.inviterID);
  }

  let invitee2 = await db.get('users').find({ id: invitee.id });

  invitee2.unset('groupInvite').value();
  invitee2.assign({ group: { name: group.name, id: group.id }, groupRole: role }).value();

  invitee2
    .write()
    .then(async user => {
      const message = `Вы присоединились к группе ${group.name}`;
      res.send({ invitee: user, inviter, message });
    })
    .catch(e => res.status(500).send({ message: e }));
};

/**
 * Изменяем внутригрупповые привилегии пользователя
 * @param db                Объект доступа к БД
 * @param user              Экземпляр пользователя, чьи привилегии изменяются
 * @param role              Новая роль пользователя
 * @param res               Объект ответа сервера
 * @return Promise          Промис с созданным пользователем или ошибкой
 */
const changeGroupRole = async (db, user, role, res) => {
  await db
    .get('users')
    .chain()
    .find({ id: user.id })
    .assign({ groupRole: role })
    .write()
    .then(user => {
      const message = `Привилегии успешно изменены`;
      res.send({ message });
    })
    .catch(e => res.status(500).send({ message: e }));
};
module.exports = router;
