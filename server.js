const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();
const port = 3000;

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

app.use(connectLivereload());

app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => console.log(`Listening on port ${port}!`));
