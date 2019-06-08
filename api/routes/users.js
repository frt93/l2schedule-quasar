const { Router } = require('express'),
  router = Router(),
  users = require('api/controllers/users/controllers');

router.post('/authorize', users.authorize);

router.post('/check/username', users.checkUsername);
router.post('/check/email', users.checkEmail);

router.post('/create', users.create);
router.post('/signin', users.signin);

router.post('/repair', users.repair);
router.post('/confirm-repair', users.confirmRepair);
router.post('/repair/change-password', users.changePassword);

router.post('/settings/account', users.accountSettings);

module.exports = router;
