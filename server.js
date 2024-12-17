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
app.get('/api/manga/cover/:coverId', async (req, res) => {
    try {
        const coverId = req.params.coverId;

        // Fetch the cover image URL from MangaDex API
        const url = `https://api.mangadex.org/cover/${coverId}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'mangaReader/1.0.0',  // Proper user-agent
            },
        });

        const imageUrl = response.data.data.attributes.fileName;
        const imageUrlWithBase = `https://uploads.mangadex.org/covers/${coverId}/${imageUrl}`;

        // Fetch the actual image file and pipe it to the client
        axios({
            method: 'get',
            url: imageUrlWithBase,
            responseType: 'stream',  // Ensures the image is streamed back
        })
            .then((imageResponse) => {
                res.setHeader('Content-Type', imageResponse.headers['content-type']);
                imageResponse.data.pipe(res);  // Pipe the image stream to the response
            })
            .catch((error) => {
                console.error('Error fetching the image:', error.message);
                res.status(500).json({ error: 'Error fetching the image' });
            });
    } catch (error) {
        console.error('Error fetching cover:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
