const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {init: dbInit, dbQuery, getTodayMovies} = require("../controllers/dbController");
// const bcrypt = require('bcrypt');
// const NaverStrategy = require('passport-naver').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { formDataUpload } = require('../CommenUtil');

const router = express.Router();

const authOpts = {
  local: {
    usernameField: 'id',
    passwordField: 'pwd',
    passReqToCallback: true
  },
  kakao: {
    clientID: '0dd390801a8b8179ce19935428daf3ae',
    callbackURL: '/auth/kakao_oauth'
  },
  redirect: {
    successRedirect: '/',
    failureRedirect: '/auth/failed',
    failureFlash: true
  },
};

function passportLoginByThirdparty(info, done) {
  console.log('process :', JSON.stringify(info));
  done(null, info);
}


passport.use('local', new LocalStrategy(authOpts.local, async (req, id, pwd, done) => {
  // console.log(req);
  try {
    console.log(req.body);
    let dbUser = await dbQuery("GET", "SELECT * FROM user WHERE id = ?", [id]);
    let user = dbUser.row[0];
    console.log(user);
    if (user) {
      let result = req.body.pwd == user.pwd; // pwd check
      console.log(result);
      if (result) {
        done(null, dbUser.row[0]);
      }
      else {
        done(null, false, {message: '비밀번호가 일치하지 않습니다.'});
      }
    }
    else {
      done(null, false, {message: '가입되지 않은 회원입니다.'});
    }
  } catch (error) {
    console.error(error);
    done(error);
  }
}));

passport.use('kakao', new KakaoStrategy(authOpts.kakao, (accessToken, refreshToken, profile, done) => {
  let _profile = profile._json;
  passportLoginByThirdparty({
    'type': 'kakao',
    'id': _profile.id,
    'name': _profile.properties.nickname,
    'email': _profile.id,
    'token': accessToken
  }, done);
}));

// router.post('/local', function(req,res, next) {
//   res.send(`<h1>Custom Property Value: ${req.body.id}</h1>`);

// });

router.post('/local', formDataUpload.none(), passport.authenticate('local', authOpts.redirect));


router.get('/failed', function (req, res, next) {
  let text = req.flash();
  console.log(text);
  if(text.error) res.status(201).json({result: text.error[0]});
  else res.status(201).json({result: "로그인 실패 했습니다."});
});

router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.save((err) => {
    if (err) throw err;
    res.status(201).json({result: "로그아웃 완료"});
    // res.redirect('/');
  });
});


// kakao 로그인 / 콜백 연동
router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao_oauth', passport.authenticate('kakao', authOpts.redirect));

module.exports = router;
