var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:page', function(req, res, next) {
	
	var page = req.params.page;
	res.render('site/'+page, { title: 'Express' });
});


router.get('/:page/:id', function(req, res, next) {
	
	var page = req.params.page;
	res.render('site/'+page, { title: 'Express' });
});


module.exports = router;
