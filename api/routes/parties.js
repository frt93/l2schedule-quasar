const { Router } = require('express'),
  router = Router(),
  parties = require('api/controllers/parties/controllers');

router.post('/create', parties.create);
router.post('/check/name', parties.checkName);
router.post('/check/slug', parties.checkSlug);
router.get('/get', parties.getParty);

router.get('/invite/users-can-be-invited', parties.usersCanBeInvited);
router.post('/invite', parties.sendInvite);
router.post('/invite/cancel', parties.cancelInvite);

module.exports = router;
