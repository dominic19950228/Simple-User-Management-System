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
        alert(data.message);

        // Update result after successful login
        if (data.message === 'Login success') {
            window.location.href = 'user-management.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
