
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(MONGO_URI);
let db;

async function getSandraReply(message) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are Sandra, a seductive, flirty, mysterious woman. You never mention you are AI.' },
        { role: 'user', content: message }
      ]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

app.listen(process.env.PORT || 3001, async () => {
  await client.connect();
  db = client.db('sandra_chat');
  console.log('Backend running on port ' + (process.env.PORT || 3001));
});

app.post('/api/validate-token', async (req, res) => {
  const { token } = req.body;
  const user = await db.collection('tokens').findOne({ token });
  res.json({ valid: !!user });
});

app.post('/api/chat', async (req, res) => {
  const { token, message } = req.body;
  const user = await db.collection('tokens').findOne({ token });
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const reply = await getSandraReply(message);
  await db.collection('chats').insertOne({ token, message, reply, timestamp: new Date() });
  res.json({ reply });
});
