const http = require('http');

const data = JSON.stringify({
    messages: [{ role: 'user', content: 'Xin chào, bạn tên là gì?' }]
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
        console.log(`CHUNK: ${chunk}`); // Log streams piece by piece
    });
    res.on('end', () => {
        console.log('No more data in response.');
        console.log('FULL BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
