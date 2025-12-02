const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

let creds;
const credsPath = path.join(__dirname, '../google-credentials.json');

if (fs.existsSync(credsPath)) {
    creds = require(credsPath);
} else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
        creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
    }
} else {
    console.warn('No Google Credentials found (file or env). Sheets integration will fail.');
}

const serviceAccountAuth = creds ? new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
}) : null;

const appendToSheet = async (data) => {
    try {
        if (!serviceAccountAuth) {
            console.warn('Google Service Account not configured. Skipping sheet update.');
            return;
        }

        if (!process.env.GOOGLE_SHEET_ID) {
            console.warn('GOOGLE_SHEET_ID is not set. Skipping Google Sheet update.');
            return;
        }

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); // loads document properties and worksheets
        const sheet = doc.sheetsByIndex[0]; // use the first sheet

        // Check if header row exists, if not add it
        // This is a simple check, ideally we'd check specific headers
        if (sheet.rowCount === 0 || (sheet.headerValues && sheet.headerValues.length === 0)) {
            await sheet.setHeaderRow(['Timestamp', 'User ID', 'Name', 'Email', 'Favorite Genres', 'Favorite Actors', 'Favorite Directors']);
        }

        await sheet.addRow({
            Timestamp: new Date().toISOString(),
            'User ID': data.userId,
            Name: data.name,
            Email: data.email,
            'Favorite Genres': Array.isArray(data.preferences.favoriteGenres) ? data.preferences.favoriteGenres.join(', ') : '',
            'Favorite Actors': Array.isArray(data.preferences.favoriteActors) ? data.preferences.favoriteActors.join(', ') : '',
            'Favorite Directors': Array.isArray(data.preferences.favoriteDirectors) ? data.preferences.favoriteDirectors.join(', ') : ''
        });

        console.log('Added row to Google Sheet');
    } catch (error) {
        console.error('Google Sheets Error:', error);
        // Don't throw, just log. We don't want to break the app if sheets fails.
    }
};

module.exports = { appendToSheet };
