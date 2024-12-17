const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
    origin: 'https://mangareader-cream.netlify.app',  // Frontend URL
    methods: ['GET', 'POST'],
}));

// Proxy endpoint for manga data
app.get('/api/manga/:endpoint', async (req, res) => {
    try {
        const endpoint = req.params.endpoint;
        const query = req.query;

        const url = `https://api.mangadex.org/${endpoint}`;

        const response = await axios.get(url, {
            params: query,
            headers: {
                'User-Agent': 'mangaReader/1.0.0',  // Proper user-agent to prevent issues
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error in proxy:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoint for cover images
app.get('/api/proxy-image/:mangaId/:coverFileName', async (req, res) => {
    try {
        const { mangaId, coverFileName } = req.params;

        // Construct the full image URL
        const imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`;

        // Fetch the image from Mangadex
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer', // Important for handling image data
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Ensure we pass the correct user-agent
            },
        });

        // Set the appropriate content type based on the response headers from Mangadex
        res.set('Content-Type', response.headers['content-type']);

        // Send the image data back to the client
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching image:', error.message);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
