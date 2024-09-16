const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const OpenAI = require("openai");

dotenv.config();

const app = express();
const port = 3003;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

// Middleware to parse JSON bodies
app.use(express.json());

// serving static files 
app.use('/berg/wordthing', express.static(path.join(__dirname, 'public')));

// catch-all route for single page application
app.get('/berg/wordthing/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint for AI description
app.post('/berg/api/description', async (req, res) => {
  const word = req.body.word;
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Provide a detailed description and usage of the word "${word}".`,
      max_tokens: 150,
    });
    res.json({ description: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error fetching AI description:', error);
    res.status(500).json({ error: 'Failed to get AI description' });
  }
});

// Endpoint for AI image
app.post('/berg/api/image', async (req, res) => {
  const word = req.body.word;
  try {
    const response = await openai.createImage({
      prompt: `An illustrative image representing the word "${word}".`,
      n: 1,
      size: '512x512',
    });
    res.json({ imageUrl: response.data.data[0].url });
  } catch (error) {
    console.error('Error fetching AI image:', error);
    res.status(500).json({ error: 'Failed to get AI image' });
  }
});

// Endpoint for Latin roots and breakdown
app.post('/berg/api/latin-roots', async (req, res) => {
  const word = req.body.word;
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Provide the Latin roots and word breakdown for the word "${word}".`,
      max_tokens: 150,
    });
    res.json({ roots: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error fetching Latin roots:', error);
    res.status(500).json({ error: 'Failed to get Latin roots' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

