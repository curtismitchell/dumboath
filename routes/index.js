var express = require('express');
var router = express.Router();
var https = require('https');
var qs = require('querystring');
var unirest = require('unirest');
var cookie = 'oauthdetails';
var tcookie = 'tokencookie';


/* GET home page. */
router.get('/', function(req, res) {
  res.locals.form = req.cookies[cookie];
  if(req.cookies[tcookie]) {
    res.locals.results = JSON.stringify(req.cookies[tcookie], null, '\t');
  }

  res.clearCookie(tcookie);
  res.render('index', { title: 'OAuth2 Test Client' });
});


router.post('/login', function(req, res) {
  res.cookie(cookie, req.body, {secure: true, httpOnly: true});
  var b = req.body;

  res.redirect(b.authurl + '?client_id=' + b.clientid + '&response_type=code&scope=' + b.scope + '&redirect_uri=' + b.callbackurl);
});

router.get('/oauth2/callback', function(req, res){
  var b = req.cookies[cookie];

  unirest.post(b.tokenurl)
  .header('Accept', '*/*')
  .header('Content-Type', 'application/x-www-form-urlencoded')
  .send({
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: b.callbackurl
  })
  .strictSSL(false)
  .auth({user: b.clientid, pass: b.secret})
  .end(function(response){
    res.cookie(tcookie, response.body, {secure: true, httpOnly: true});
    res.redirect('/');
  });

});

module.exports = router;
