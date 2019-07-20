const { Router } = require('express'),
  router = Router(),
  parties = require('api/controllers/parties/controllers');

router.post('/create', parties.create);
router.post('/check/name', parties.checkName);
router.post('/check/slug', parties.checkSlug);
router.get('/get', parties.getParty);

module.exports = router;
