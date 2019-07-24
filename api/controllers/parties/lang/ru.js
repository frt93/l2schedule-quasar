module.exports = {
  success: {
    'Invite send': username => {
      return `Вы отправили @${username} инвайт в пати`;
    },
  },
  errors: {
    'Empty credentials': 'Заполните форму полностью',
    'Name already exists': name => {
      return `Пати с названием ${name} уже существует`;
    },
    'Slug already exists': 'Указанный адрес уже занят',
    'You already have party': 'Вы уже состоите в пати',
    'Party name length': 'От 3 до 30 символов',
    'Party slug length': 'От 3 to 20 characters',
    'Party slug spaces': 'Пробелы запрещены',
    'Party slug pattern': 'Только латинские буквы, числа, а также _ и .',
    'Special characters location': 'Символы _ и . не должны быть в начале или конце',
    'Already invited': username => {
      return `У @${username} уже есть инвайт в вашу пати`;
    },
    'Self invite': 'Нельзя пригласить самого себя',
    'User already in your party': username => {
      return `Пользователь @${username} уже состоит в вашей пати`;
    },
  },
};
