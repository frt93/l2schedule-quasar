import { i18n } from 'boot/i18n.js';
import { Notify } from 'quasar';

import api from './api';

export default {
  /**
   * Делаем запрос для валидации никнейма
   *
   * @param {String} username   Указанный никнейм
   */
  async checkUsername(username) {
    const { error } = await api.checkUsername(username);
    if (error) return this.handleErrors(error);

    return '';
  },

  /**
   * Делаем запрос для валидации email адреса
   *
   * @param {String} email    Указанный адрес электронной почты
   */
  async checkEmail(email) {
    const { error } = await api.checkEmail(email);
    if (error) return this.handleErrors(error);

    return '';
  },

  /**
   * Валидируем пароль пользователя. Запрещены только пробелы
   *
   * @param {String} password      Указанный пользователем пароль
   */
  validatePassword(password) {
    const spaces = /\s/g.test(password);

    if (spaces) {
      return `${i18n.t('errors.spaces')}\n`;
    }
  },

  /**
   * Получаем интанс гугл аккаунта пользователя и отбираем необходимые данные
   *
   * @param {String} data          Инстанс данных гугл аккаунта пользователя
   */
  googleInstance(data) {
    let user = {
      provider: 'google',
      id: data.getId(),
      email: data.getEmail(),
    };

    if (data.getImageUrl()) {
      user.avatar = data.getImageUrl();
    }
    if (data.getName()) {
      user.name = data.getName();
    }

    return user;
  },

  /**
   * Получаем интанс facebook аккаунта пользователя и отбираем необходимые данные
   *
   * @param {String} data          Инстанс данных фейсбук аккаунта пользователя
   */
  facebookInstance(data) {
    let user = {
      provider: 'facebook',
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
    };

    if (data.email) {
      user.email = data.email;
    }

    return user;
  },

  /**
   * Получаем интанс аккаунта vk.com пользователя и отбираем необходимые данные
   *
   * @param {String} data          Инстанс данных vk аккаунта пользователя
   */
  vkInstance(data) {
    let profile = data.session.user;

    let user = {
      provider: 'vk',
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
    };

    if (profile.domain) {
      user.username = profile.domain;
    }

    return user;
  },

  /**
   * Получаем интанс телеграм аккаунта пользователя и отбираем необходимые данные
   *
   * @param {String} data          Инстанс данных telegram аккаунта пользователя
   */
  telegramInstance(data) {
    let user = {
      provider: 'telegram',
      id: data.id,
    };

    if (data.username) {
      user.username = data.username;
    }

    if (data.photo_url) {
      user.avatar = data.photo_url;
    }

    if (data.first_name) {
      user.name = data.first_name;
    }

    if (data.last_name) {
      user.name = `${data.first_name} ${data.last_name}`;
    }

    return user;
  },

  /**
   * Обрабатываем ошибки, полученные в результате отправки формы
   *
   * @param {Object} e        Экземпляр ошибки
   * @param {String} from     Место (компонент) откуда пришел запрос на обработку ошибки
   */
  handleErrors(e, from) {
    /**
     * Описанные на стороне сервера кастомные ошибки.
     * У них задано свойство type, совпадающее с наименованием свойств data, отвечающих за выброс ошибок.
     * Свойство msgType совпадает с наименованием свойст data, хранящих в себе текст ошибок
     */

    if (e.response) {
      const err = e.response.data;
      const status = e.response.status;

      if (status >= 500) {
        this.errorNotify(err.message);
        return false;
      } else {
        if (
          from &&
          from === 'signin' &&
          (err.type === 'usernameError' || err.type === 'emailError')
        ) {
          err.type = 'loginError';
        }

        return { errorType: err.type, message: err.message };
      }
    }

    // Сгенерированные сервером/браузером ошибки
    if (e.message === 'Network Error') {
      this.errorNotify(i18n.t('errors.network'));
      return false;
    }
  },

  /**
   * Вызов оповещения об ошибке
   *
   * @param {String} message   Текст ошибки
   */
  errorNotify(message) {
    Notify.create({
      color: 'negative',
      position: 'bottom',
      icon: 'fas fa-exclamation',
      message,
    });
  },

  /**
   * Вызов оповещения об успешном завершении операции
   *
   * @param {String} message   Текст оповещения
   */
  successNotify(message) {
    Notify.create({
      color: 'green-6',
      position: 'bottom-right',
      icon: 'mdi-emoticon-wink-outline',
      message,
    });
  },
};
