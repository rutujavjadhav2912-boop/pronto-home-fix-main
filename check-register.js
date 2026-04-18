fetch('http://localhost:5000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        full_name: 'Test Verify User',
        email: 'verify_' + Date.now() + '@example.com',
        phone: '9876543210',
        password: 'securepassword',
        role: 'user'
    })
})
    .then(res => res.json())
    .then(data => {
        console.log('Registration Result:', data);
        if (data.status === 'ok') process.exit(0);
        else process.exit(1);
    })
    .catch(err => {
        console.error('Registration Verification Failed:', err);
        process.exit(1);
    });
