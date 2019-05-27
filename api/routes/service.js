const { Router } = require('express'),
  router = Router(),
  service = require('api/controllers/service/controllers');

router.get('/build-user-module', service.build_user_module);

module.exports = router;
