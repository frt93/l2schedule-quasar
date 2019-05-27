const users = require('api/sql/user-module');

module.exports = {
  /**
   * Создаем пользовательский модуль.
   * Создаются базы данных для пользователей, групп, кланов и вспомогательные (смежные) для них таблицы.
   * Устанавливаются отношения между таблицами
   */
  build_user_module: async (req, res) => {
    await users.build();

    res.send('done');
  },
};
