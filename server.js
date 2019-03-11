'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
});

// f42f20ba48d9

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);