const jsonServer = require('json-server')
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const server = jsonServer.create() // Returns an Express server
const router = jsonServer.router('db.json') // Returns an Express router
const path = require("path");
const app = express();

server.use(cookieParser("secret", {"path": "/"}));

server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");res.setHeader("Access-Control-Expose-Headers","Access-Control-Allow-Origin");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,X-Prototype-Version,Content-Type,Cache-Control,Pragma,Origin");
  next();
});

server.post('/auth/login', (req, res) => {
  const users = router.db.object.users;
  const username = req.query.username;
  const password = req.query.password;

  for (var i=0;i<=users.length -1; i++) {
    //verifies through the users in the db.json. It will then create a cookie for the user. Sends json if true.
    if(users[i].username == username && users[i].password == password) {
      res.cookie('usersession', users[i].id, {maxAge: 255, httpOnly: false, signed: true});
      res.send(JSON.stringify({success: true}));
      return;
    }
  }
  res.send(JSON.stringify({ success: false, error: 'Incorrect Username. Please try again.' }));
});

server.get('/profile', (req,res) => {
  const userID = req.signedCookies.usersession;
  const users = router.db.object.profiles;

  for(const i=0; i<=users.length -1; i++){
    if(users[i].userId == userID){
      res.send(JSON.stringify(users[i]));
      return;
    }
  }
  res.send();
});

server.use(jsonServer.defaults) // logger, static and cors middlewares
server.use(router) // Mount router on '/'
server.listen(5000);

app.use(cookieParser("secret", {"path": "/"}));
app.get('/', (req, res) => {
  if (!req.signedCookies.usersession) {
    res.redirect('/pages/auth/auth.html');

  }else{
    res.sendFile(path.join(__dirname+'/../app/index.html'));
  }
});

app.get('/auth/logout', (req, res) => {
  res.clearCookie('usersession');
  res.redirect('/pages/auth/auth.html');
});

app.get('/pages/auth/auth.html', (req, res) => {
  res.sendFile(path.join(__dirname+'/../app/pages/auth/auth.html'));
});

app.use(express.static(path.join(__dirname, '../')));

const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(8080);

io.on('connection', (socket)=>{
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});