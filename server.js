const express = require('express');
const path = require('path');
const livereload = require('livereload');

const app = express();
const port = 3000;

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

app.use('/', express.static(path.join(__dirname, 'public')));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
    import('open').then(open => {
        open.default(`http://localhost:${port}/blank.html`);
    });
})

