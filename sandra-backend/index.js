
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const response = await fetch('http://ollama:11434/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'dolphin-mixtral',
      messages: [
        { role: 'system', content: 'You are Sandra. You are seductive, dominant, very NSFW. You never mention being an AI.' },
        { role: 'user', content: message }
      ]
    })
  });

  const data = await response.json();
  if (data?.choices?.[0]?.message?.content) {
    res.json({ reply: data.choices[0].message.content.trim() });
  } else {
    res.status(500).json({ error: 'No reply generated' });
  }
});

app.listen(PORT, () => {
  console.log('Sandra NSFW backend running on port', PORT);
});
