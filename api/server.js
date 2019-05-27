const express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 5000,
  router = express.Router(),
  cors = require('cors'),
  app = express(),
  { GraphQLClient } = require('api/config/graphql');

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(cors());

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

// app.get('/articles', (req, res) => {
//   const query = `{
//     articles {
//       id
//       title
//     }
//   }`;

//   GraphQLClient.request(query)
//     .then(data => {
//       res.send(data);
//     })
//     .catch(function(err) {
//       res.status(500).json({
//         error: 'Something failed!',
//       });
//     });
// });

app.listen(port);
