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

// const User = require('./models/users');

// const mysql = require('pg');
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

// app.get('/createusers', (req, res) => {
//   User.sync({ force: true })
//     .then(() => {
//       // Now the `users` table in the database corresponds to the model definition
//       // return User.bulkCreate([
//       //   { username: 'qq41', email: 'johnDoe@mail.ru', password: '123456' },
//       //   { username: 'qq42', email: 'johnDoe@mail.ru', password: '123456' },
//       //   { username: 'qq43', email: 'johnDoe@mail.ru', password: '123456' },
//       // ]);
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });

// app.get('/addtable', (req, res) => {
//   let tablename = req.query.table;
//   const Users = require('./models/users')(tablename);
//   Users.sync({ force: true })
//     .then(data => {
//       res.send(data);
// Now the `users` table in the database corresponds to the model definition
// return User.bulkCreate([
//   { username: 'qq41', email: 'johnDoe@mail.ru', password: '123456' },
//   { username: 'qq42', email: 'johnDoe@mail.ru', password: '123456' },
//   { username: 'qq43', email: 'johnDoe@mail.ru', password: '123456' },
// ]);
//     })
//     .catch(err => {
//       console.log(err);
//     });
// });

// app.get('/adduser', (req, res) => {
//   User.create({
//     username: 'qwe3',
//     email: 'fdshfsd3',
//     password: 'fgdfh',
//   })
//     .then(response => res.send(response))
//     .catch(e => res.status(500).send(e));
// });
