/**
 * Форматируем строку убирая из нее пробелы
 * @param value             Значение, которое надо отфарматировать
 * @return String
 */
module.exports.replaceSpaces = value => {
  return value.replace(/\s+/g, '');
};
