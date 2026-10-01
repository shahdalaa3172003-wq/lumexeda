const https = require('https');
https.get('https://drive.google.com/thumbnail?id=1Uxphw4tpasIxrF5Xu9mNlGv9LlVPuDEW&sz=w800', (res) => {
    console.log('Status: ' + res.statusCode);
    console.log('Headers:', res.headers);
});
