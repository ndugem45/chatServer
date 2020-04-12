
const express = require('express'),
    app = express(),
    port = 3000,
    bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/avatar', express.static(__dirname + '/asset/avatar'));

const routes = require('./routes');
routes(app);

app.listen(port, () => console.log(`app listening...`))