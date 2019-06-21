const en = require('./en-us');
const ru = require('./ru');

const langs = {
  en,
  ru,
};

const getMessage = lang => {
  if (lang === 'en-us') {
    lang = 'en';
  }
  return langs[lang];
};

module.exports = getMessage;
