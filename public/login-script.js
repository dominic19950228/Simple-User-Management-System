// Login form submission event
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        localStorage.setItem('token', data.token);
        if (response.ok && data.token) { //check if response is ok and token is present, and if account is admin
            alert('Login successful!');
            window.location.href = 'user-management.html';
        } else {
            alert('Login failed, only admin can login.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
