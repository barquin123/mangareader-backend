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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})

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

        // Filter the results to only include manga with the originalLanguage of 'ko' (Korean)
        const filteredManga = response.data.data.filter((manga) => {
            return manga.attributes.originalLanguage === 'ko';
        });

        // Return the filtered list
        res.json({ data: filteredManga });
    } catch (error) {
        console.error('Error in proxy:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/manga/:endpoint/server/:id', async (req, res) => {
    try {
        const { id, endpoint } = req.params;  // Capture the 'id' parameter from the URL
        const query = req.query;    // Capture any query parameters

        // Construct the URL for the external API (assuming a similar structure)
        const url = `https://api.mangadex.org/${endpoint}/server/${id}`;  // Replace with the correct endpoint

        // Fetch the data from the external API
        const response = await axios.get(url, {
            params: query,
            headers: {
                'User-Agent': 'mangaReader/1.0.0',  // Ensure correct user-agent to avoid issues
            },
        });

        // Send the fetched data back to the client
        res.json(response.data);
    } catch (error) {
        console.error('Error in proxy:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/manga/:endpoint/:id', async (req, res) => {
    try {
        const {endpoint, id} = req.params;
        const query = req.query;

        const url = `https://api.mangadex.org/${endpoint}/${id}`;

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
                'User-Agent': 'mangaReader/1.0.0', // Ensure we pass the correct user-agent
            },
        });

        // Set the appropriate content type based on the response headers from Mangadex
        res.set('Content-Type', response.headers['content-type']);  // Use the content-type from Mangadex's response
        res.send(response.data);  // Send the image data directly to the client
    } catch (error) {
        console.error('Error fetching image:', error.message);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
