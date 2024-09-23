const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const OpenAI = require("openai");

dotenv.config();

const app = express();
const port = 3003;
const chatmodel = 'gpt-4o-mini';

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
    const response = await openai.chat.completions.create({
      model: chatmodel,
      messages: [{"role": "user", "content": `Provide a detailed description and usage of the word "${word}". DO NOT FORMAT WITH MARKDOWN. USE LESS THAN 150 WORDS`}],
      max_tokens: 200,
    });
    res.json({ description: response.choices[0].message.content });
  } catch (error) {
    console.error('Error fetching AI description:', error);
    res.status(500).json({ error: 'Failed to get AI description' });
  }
});

// Endpoint for AI image
app.post('/berg/api/image', async (req, res) => {
  const word = req.body.word;
  try {
    const response = await openai.images.generate({
      prompt: `illustrate "${word}".`,
      model: 'dall-e-3',
      size: '1024x1024',
    });
    res.json({ imageUrl: response.data[0].url });
  } catch (error) {
    console.error('Error fetching AI image:', error);
    res.status(500).json({ error: 'Failed to get AI image' });
  }
});

// Endpoint for Latin roots and breakdown
app.post('/berg/api/latin-roots', async (req, res) => {
  const word = req.body.word;
  try {
    const response = await openai.chat.completions.create({
      model: chatmodel,
      messages: [{"role": "user", "content": `Provide the Latin roots and word breakdown for the word "${word}". Under 20 words. Give no examples.`}],
      max_tokens: 100,
    });
    //  console.log(response.choices[0].message.content)
    res.json({ roots: response.choices[0].message.content });
  } catch (error) {
    console.error('Error fetching Latin roots:', error);
    res.status(500).json({ error: 'Failed to get Latin roots' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

