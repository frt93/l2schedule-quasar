module.exports = {
  errors: {
    'Empty credentials': 'Заполните форму полностью',
    'Name already exists': name => {
      return `Пати с названием ${name} уже существует`;
    },
    'Slug already exists': 'Указанный адрес уже занят',
    'You already have party': 'Вы уже состоите в пати',
  },
};
