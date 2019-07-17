const { Router } = require('express'),
  router = Router(),
  users = require('api/controllers/users/controllers');

router.post('/authorize', users.authorize);

router.post('/check/username', users.checkUsername);
router.post('/check/email', users.checkEmail);

router.post('/create', users.create);
router.post('/signin', users.signin);
router.post('/create/oauth', users.oauthCreate);
router.post('/signin/oauth', users.oauthLogin);
router.post('/confirm/email', users.confirmEmail);

router.post('/repair', users.repair);
router.post('/confirm-repair', users.confirmRepair);
router.post('/repair/change-password', users.repairChangePassword);

router.post('/settings/account', users.accountSettings);
router.post('/settings/change/password', users.savePassword);
router.post('/settings/change/email', users.saveEmail);
router.post('/settings/change/username', users.saveUsername);
// router.post('/settings/safety', users.safetySettings);
router.post('/settings/oauth/updateProviderData', users.updateProviderData);
router.post('/settings/oauth/connect', users.connectOauthProvider);
router.post('/settings/oauth/disconnect', users.disconnectOauthProvider);
router.post('/settings/resendEmailConfirmationKey', users.resendEmailConfirmationKey);

module.exports = router;
