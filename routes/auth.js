const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {dbQuery} = require('../models');
// const bcrypt = require('bcrypt');
// const NaverStrategy = require('passport-naver').Strategy;
// const KakaoStrategy = require('passport-kakao').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

const authOpts = {
  local: {
    usernameField: 'id',
    passwordField: 'pwd',
    passReqToCallback: true
  },
  redirect: {
    successRedirect: '/',
    failureRedirect: '/auth/failed',
    failureFlash: true
  }
};

passport.use('local', new LocalStrategy(authOpts.local, async (req, id, pwd, done) => {
  try {
    console.log(req);
    let dbUser = await dbQuery("GET", "SELECT * FROM user WHERE id = ?", [id]);
    dbUser = dbUser.row[0];
    console.log(dbUser);
    if (dbUser) {
      let result = pwd == dbUser.pwd; // pwd check
      console.log(result);
      if (result) {
        done(null, dbUser);
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

router.post('/local', passport.authenticate('local', authOpts.redirect));

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


module.exports = router;
