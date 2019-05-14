const express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 5000,
  router = express.Router(),
  cors = require('cors'),
  app = express(),
  db = require('~root/config/database');

// const SocketIO = require('socket.io');
// Create express instnace

// const { io } = require('../server.js');

// const io = require('socket.io').listen(app.listen(4000));
// app.use(async (req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   next();
// });

app.use(bodyParser.json());
app.use(cors());

// Require API routes
const raidbosses = require('./routes/rb');
// const items = require('./routes/items');
// const users = require('./routes/users');
// const accounts = require('./routes/accounts');

// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// Import API Routes
// router.use('/rb', raidbosses);
// router.use('/items', items);
// router.use('/accounts', accounts);
// router.use(users);

app.use('/api', router);
const User = require('./models/users');

const mysql = require('pg');
// app.get('/getusers', (req, res) => {
//   User.findAll()
//     .then(users => {
//       // console.log(users);
//       res.send(users[0]);
//     })
//     .catch(e => {
//       // console.log(e);
//     });
//   mysql
//     .createConnection({
//       user: 'root',
//       password: '',
//     })
//     .then(connection => {
//       connection.query('CREATE DATABASE IF NOT EXISTS test;').then(() => {
//         console.log('table created');
//       });
//     });
// });

app.get('/createusers', (req, res) => {
  User.sync({ force: true })
    .then(() => {
      // Now the `users` table in the database corresponds to the model definition
      // return User.bulkCreate([
      //   { username: 'qq41', email: 'johnDoe@mail.ru', password: '123456' },
      //   { username: 'qq42', email: 'johnDoe@mail.ru', password: '123456' },
      //   { username: 'qq43', email: 'johnDoe@mail.ru', password: '123456' },
      // ]);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/addtable', (req, res) => {
  let tablename = req.query.table;
  const Users = require('./models/users')(tablename);
  Users.sync({ force: true })
    .then(data => {
      res.send(data);
      // Now the `users` table in the database corresponds to the model definition
      // return User.bulkCreate([
      //   { username: 'qq41', email: 'johnDoe@mail.ru', password: '123456' },
      //   { username: 'qq42', email: 'johnDoe@mail.ru', password: '123456' },
      //   { username: 'qq43', email: 'johnDoe@mail.ru', password: '123456' },
      // ]);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/adduser', (req, res) => {
  User.create({
    username: 'qwe3',
    email: 'fdshfsd3',
    password: 'fgdfh',
  })
    .then(response => res.send(response))
    .catch(e => res.status(500).send(e));
});

const { request, GraphQLClient } = require('graphql-request');
const client = new GraphQLClient('http://localhost:8080/v1alpha1/graphql', {
  headers: {
    'content-type': 'application/json',
    'x-hasura-admin-secret': 'myadminsecretkey',
  },
});

app.get('/articles', (req, res) => {
  const query = `{
    articles {
      id
    }
  }`;

  client
    .request(query)
    .then(data => {
      res.send(data);
    })
    .catch(function(err) {
      res.status(500).json({
        error: 'Something failed!',
      });
    });
});

// Дублирование таблицы
// app.get('/duplicatetable', (req, res) => {
//   let data;
//   Neeeew.findAll({ raw: true })
//     .then(news => {
//       data = news;
//     })
//     .catch(e => {
//       // console.log(e);
//     });
//   News.sync({ force: true })
//     .then(() => {
//       // Now the `users` table in the database corresponds to the model definition
//       console.log(data);
//       News.bulkCreate(data);
//     })
//     .then(data => {})
//     .catch(err => {});
// });

// db.authenticate()
//   .then(() => {
//     console.log('db connected');
//   })
//   .catch(e => {
//     console.log('error dirung connetcion');
//   });

// Export the server middleware
app.listen(port);
