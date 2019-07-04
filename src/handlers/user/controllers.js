import { i18n } from 'boot/i18n.js';
import { Notify } from 'quasar';

import api from './api';

export default {
  /**
   * Валидируем никнейм пользователя
   *
   * @param {String} username   Указанный пользователем никнейм
   */
  validateUsername(username) {
    // Начинаем валидацию только:
    // 1. Если передано какое-то значение, а не пустая строка
    // 2. Если на момент начала срабатывания метода в компоненте авторизации в качестве ключа авторизации используется никнейм
    if (username.length) {
      let message = '',
        charsToRemove = '',
        chars;

      // Выражение ищет пробелы в никнейме
      const spaces = /\s/g.test(username);
      if (spaces) {
        message += `${i18n.t('errors.spaces')} \n`;
      }

      // Запрещенные символы
      const forbiddenChars = /@|~|`|'|"|\/|\\|\|/g;

      // Проверяем строку на наличие запрещенных символов. Проверка длится до конца строки
      while ((chars = forbiddenChars.exec(username))) {
        // Найденный символ дописываем в переменную charsToRemove только в том случае, если конкретно его там еще нет.
        if (charsToRemove.indexOf(chars[0]) === -1) {
          charsToRemove += `${chars[0]} `;
        }
      }

      // Меньше трех (т.е. 2 символа) так как в строку символ добавляется с пробелом
      if (charsToRemove.length && charsToRemove.length < 3)
        message += `${i18n.t('errors.char')} ${charsToRemove}`;
      else if (charsToRemove.length >= 3) {
        message += `${i18n.t('errors.chars')} ${charsToRemove}`;
      }

      if (spaces || charsToRemove.length) {
        return message;
      }

      return '';
    }
  },

  /**
   * Проверяем свободен ли указанный при регистрации пользователем никнейм
   *
   * @param {String} username   Указанный никнейм
   */
  async checkUsername(username) {
    const { error } = await api.checkUsername(username);
    if (error) return this.handleErrors(error);

    return '';
  },

  /**
   * Валидируем email адрес пользователя. В email адресе запрещены только пробелы
   *
   * @param {String} email    Указанный пользователем email
   */
  validateEmail(email) {
    // Начинаем валидацию только:
    // 1. Если передано какое-то значение, а не пустая строка
    // 2. Если на момент начала срабатывания метода в компоненте авторизации в качестве ключа авторизации используется email адрес
    if (email.length) {
      let message = '';
      const spaces = /\s/g.test(email);
      if (spaces) {
        message += `${i18n.t('errors.spaces')}\n`;
      }

      const pattern = /@+\w{1,}\.\w{2,}/g.test(email);
      if (!pattern) {
        message += i18n.t('errors.wrongEmail');
      }

      if (spaces || !pattern) {
        return message;
      }

      return '';
    }
  },

  /**
   * Проверяем свободен ли указанный при регистрации пользователем email адрес
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
      icon: 'far fa-smile-wink',
      message,
    });
  },
};
