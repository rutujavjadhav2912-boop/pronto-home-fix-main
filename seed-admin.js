const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function seedAdmin() {
    const adminUser = {
        full_name: 'System Admin',
        email: 'admin@pronto.com',
        phone: '0000000000',
        password: 'password123',
        role: 'admin'
    };

    try {
        const response = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser)
        });

        const data = await response.json();
        console.log('Seed Result:', data);
    } catch (error) {
        console.error('Seed Failed:', error);
    }
}

seedAdmin();
