const { Router } = require('express'),
  router = Router(),
  users = require('api/controllers/users/controllers');

router.post('/create', users.create);
router.post('/signin', users.signin);
router.post('/check/username', users.checkUsername);
router.post('/check/email', users.checkEmail);

module.exports = router;
