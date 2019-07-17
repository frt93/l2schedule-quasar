const { Router } = require('express'),
  router = Router(),
  groups = require('api/controllers/groups/controllers');

router.post('/create', groups.create);
router.post('/check/name', groups.checkName);
router.post('/check/slug', groups.checkSlug);

module.exports = router;
