const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.error) {
                console.error('API Error:', response.error);
            } else {
                console.log('Available Models:');
                if (response.models) {
                    response.models.forEach(model => {
                        if (model.name.includes('gemini')) {
                            console.log(model.name);
                        }
                    });
                } else {
                    console.log('No models found in response:', response);
                }
            }
        } catch (e) {
            console.error('Parse Error:', e.message);
            console.log('Raw Data:', data);
        }
    });

}).on('error', (err) => {
    console.error('Request Error:', err.message);
});
