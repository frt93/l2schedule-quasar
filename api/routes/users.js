const { Router } = require('express'),
  router = Router(),
  users = require('api/controllers/users/controllers');

router.post('/authorize', users.authorize);

router.post('/check/username', users.checkUsername);
router.post('/check/email', users.checkEmail);

router.post('/create', users.create);
router.post('/signin', users.signin);
router.post('/confirm/email', users.confirmEmail);

router.post('/repair', users.repair);
router.post('/confirm-repair', users.confirmRepair);
router.post('/repair/change-password', users.repairChangePassword);

router.post('/settings/account', users.accountSettings);
router.post('/settings/password', users.passwordSettings);
router.post('/settings/resendEmailConfirmationKey', users.resendEmailConfirmationKey);

module.exports = router;
