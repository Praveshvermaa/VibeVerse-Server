
const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        error: 'Prompt is required',
      });
    }

    const apiKey = process.env.POLLINATION_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'Pollinations API key is not configured',
      });
    }

    const options = {
      method: 'GET',
      url: `https://gen.pollinations.ai/image/${encodeURIComponent(
        prompt.trim()
      )}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      responseType: 'arraybuffer',
      validateStatus: () => true,
    };

    const { data, status, headers } = await axios.request(options);

    if (status !== 200) {
      const errorText = Buffer.from(data).toString('utf8');

      console.error(
        'Pollinations API error while Ai image generation:',
        status,
        errorText
      );

      return res.status(status).json({
        error: 'Failed to generate AI image',
      });
    }

    const imageBuffer = Buffer.from(data);

    res.setHeader(
      'Content-Type',
      headers['content-type'] || 'image/jpeg'
    );

    res.setHeader(
      'Content-Length',
      imageBuffer.length
    );

    return res.status(200).send(imageBuffer);

  } catch (error) {
    console.error(
      'Image generation error:',
      error.message
    );

    return res.status(500).json({
      error: 'Failed to generate AI image',
    });
  }
});

module.exports = router;

