const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'https://mangareader-cream.netlify.app/',
    methods: ['GET', 'POST'],
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})

app.get('/api/manga/:endpoint', async (req, res) => {
    try {
        const endpoint  = req.params.endpoint;
        const query = req.query;

        const url = `https://api.mangadex.org/${endpoint}`;
        
        const response = await axios.get(url, {
            params: query,
            headers:{
                'user-agent': 'mangaReader/1.0.0'
            },
        });

        res.json(response.data);
    } catch (error) {
        console.log('error in proxy', error.message);
        res.status(500).json({error: error.message});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
