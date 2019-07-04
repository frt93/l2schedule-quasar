const express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 5000,
  router = express.Router(),
  cors = require('cors'),
  app = express();

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(cors());

router.use((req, res, next) => {
  // Добавляем языковое свойство в экземпляр ответа сервера. Значение получаем из заголовка запроса, который устанавливается на клиенте
  res.lang = req.headers['lang'];
  if (!req.headers['lang']) {
    res.lang = 'en-us';
  }
  next();
});

// Require API routes
// const raidbosses = require('./routes/rb');
// const items = require('./routes/items');
const users = require('api/routes/users'),
  service = require('api/routes/service');
// const accounts = require('./routes/accounts');

// Import API Routes
// router.use('/rb', raidbosses);
// router.use('/items', items);
// router.use('/accounts', accounts);
router.use('/users', users);
router.use('/service', service);

app.use('/api', router);

app.listen(port);
