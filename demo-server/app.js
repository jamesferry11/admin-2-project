const express = require("../node_modules/express");
const app = express();
const path = require("path");

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/../app/index.html'));
});

app.use(express.static(path.join(__dirname, '../')));
const http = require('http').Server(app);
http.listen(8080);


