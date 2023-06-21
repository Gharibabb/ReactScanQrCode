const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/data', (req, res) => {
  console.log('GET request received');
  res.send('Hello from the server!');
});

app.post('/api/data', (req, res) => {
  console.log('POST request received');
  console.log(req.body);

  const newData = req.body;

  try {
    let existingData = [];
    if (fs.existsSync('data.json')) {
      const data = fs.readFileSync('data.json', 'utf8');
      if (data) {
        existingData = JSON.parse(data);
      }
    }
    existingData.push(newData);

    fs.writeFileSync('data.json', JSON.stringify(existingData));

    res.send('Data received and inserted into data.json');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/data/scan', (req, res) => {
  res.sendFile(path.join(__dirname, 'data.json'));
  console.log('dir name: ', __dirname);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});