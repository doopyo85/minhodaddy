const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const path = require('path');

var authRouter = require('./lib_login/auth');
var authCheck = require('./lib_login/authCheck.js');

const app = express();
const DEFAULT_PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
}));

// 정적 파일 서빙을 위한 경로 설정
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/resource', express.static(path.join(__dirname, 'resource')));

// Content Security Policy 헤더 설정
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; frame-src 'self' https://content-sheets.googleapis.com");
  return next();
});

// 라우팅 설정
app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return;
  }
  res.redirect('/main');
});

app.use('/auth', authRouter);

app.get('/main', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return;
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/get-user', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    res.json({ email: '로그인정보미확인' });
  } else {
    res.json({ email: req.session.nickname });
  }
});

app.get('/scratch', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    res.redirect('/auth/login');
    return;
  }
  
  const scratchGuiUrl = `http://3.34.127.154:8601?scratchSession=${req.sessionID}`;
  res.redirect(scratchGuiUrl);
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('로그아웃 실패');
    }
    res.redirect('/auth/login');
  });
});

function startServer(port) {
  app.listen(port, (err) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying another port...`);
        startServer(port + 1);  // 다른 포트를 시도
      } else {
        console.error(err);
        process.exit(1);
      }
    } else {
      console.log(`Server is running on http://localhost:${port}`);
    }
  });
}

startServer(DEFAULT_PORT);
