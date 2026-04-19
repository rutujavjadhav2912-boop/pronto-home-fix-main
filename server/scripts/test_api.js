const http = require('http');

async function testApi() {
    // 1. Login
    const loginData = JSON.stringify({
        email: 'system.worker@pronto.com', // wait, is the user using this or admin?
        password: 'password123'
    });

    const loginRes = await new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        req.write(loginData);
        req.end();
    });

    console.log("Login Status:", loginRes.status);
    if (!loginRes.data.token) {
        console.log("No token", loginRes.data);
        return;
    }

    const token = loginRes.data.token;
    console.log("Role:", loginRes.data.user.role);

    // If role is worker, test worker endpoints
    if (loginRes.data.user.role === 'worker') {
        const endpoints = ['/api/worker/profile', '/api/worker/bookings', '/api/reviews/worker', '/api/worker/schedule'];
        for (const ep of endpoints) {
            const res = await new Promise(resolve => {
                const req = http.request({
                    hostname: 'localhost',
                    port: 5000,
                    path: ep,
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                }, (r) => {
                    let data = '';
                    r.on('data', chunk => data += chunk);
                    r.on('end', () => resolve({ status: r.statusCode, data }));
                });
                req.end();
            });
            console.log(ep, res.status, res.data.substring(0, 100));
        }
    } else {
        const endpoints = ['/api/admin/stats', '/api/users', '/api/bookings', '/api/worker/pending'];
        for (const ep of endpoints) {
            const res = await new Promise(resolve => {
                const req = http.request({
                    hostname: 'localhost',
                    port: 5000,
                    path: ep,
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                }, (r) => {
                    let data = '';
                    r.on('data', chunk => data += chunk);
                    r.on('end', () => resolve({ status: r.statusCode, data }));
                });
                req.end();
            });
            console.log(ep, res.status, res.data.substring(0, 100));
        }
    }
}

testApi();
