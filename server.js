const express = require('express');
const path = require('path');
const livereload = require('livereload');

const app = express();
const port = 3001;

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

app.use('/', express.static(path.join(__dirname, 'public')));
app.listen(port, () => {
    console.log(`Bubble ready on http://localhost:${port}`);
})

