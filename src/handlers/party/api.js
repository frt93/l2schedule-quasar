import { axiosInstance } from 'boot/axios';
import controllers from './controllers';

export default {
  async create(payload) {
    let party, user, error;
    await axiosInstance
      .post('/parties/create', payload)
      .then(res => {
        party = res.data.party;
        user = res.data.user;
      })
      .catch(e => {
        error = e;
      });
    return { party, user, error };
  },

  /**
   * Проверяем свободно ли указанное имя пати
   *
   * @param {String} name       Название пати
   */
  async checkName(name) {
    let error;
    await axiosInstance.post('/parties/check/name', { name }).catch(e => {
      error = e;
    });
    return { error };
  },

  /**
   * Проверяем свободна ли указанная ссылка на страницу пати
   *
   * @param {String} slug       Слаг, формирующий ссылку на страницу пати
   */
  async checkSlug(slug) {
    let error;
    await axiosInstance.post('/parties/check/slug', { slug }).catch(e => {
      error = e;
    });
    return { error };
  },

  /**
   * Отправим запрос на получение экземпляра пати
   *
   * @param {String} query      Данные для запроса, содержащие поисковые ключ и значение
   */
  async getParty(query) {
    let party, error;
    await axiosInstance
      .get(`/parties/get?key=${query.key}&value=${query.value}`)
      .then(res => {
        party = res.data.party;
      })
      .catch(e => {
        error = e;
      });
    return { party, error };
  },

  /**
   * Отправим запрос на получение списка пользователей, которых можно заинвайтить в пати
   *
   * @param {String} name        Имя/никнейм, по которому производится фильтрация
   * @param {Int} partyID        ID пати, в которую должны приглашаться полученные пользователи
   */
  async usersToInvite(name, partyID) {
    let users, error;

    await axiosInstance
      .get(`/parties/invite/users-can-be-invited?name=${name}&partyID=${partyID}`)
      .then(res => {
        users = res.data;
      })
      .catch(e => {
        controllers.handleErrors(e);
      });

    return { users, error };
  },

  /**
   * Запрос на отправку инвайта в пати
   *
   * @param {Object} payload    Данные приглашения
   */
  async sendInvite(payload) {
    let party, message;
    await axiosInstance
      .post('/parties/invite', payload)
      .then(res => {
        party = res.data.party;
        message = res.data.message;

        controllers.successNotify(message);
      })
      .catch(e => {
        controllers.handleErrors(e);
      });

    return party;
  },

  /**
   * Запрос на "отмену" инвайта пользователя в группу
   *
   * @param {Object} id         ID приглашения
   */
  async cancelInvite(id) {
    let party, message;
    await axiosInstance
      .post('/parties/invite/cancel', { id })
      .then(res => {
        party = res.data.party;
        message = res.data.message;

        controllers.successNotify(message);
      })
      .catch(e => {
        controllers.handleErrors(e);
      });

    return party;
  },
};
