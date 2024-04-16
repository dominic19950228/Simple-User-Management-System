document.addEventListener('DOMContentLoaded', () => {
    // Fetch user data and render it in the table
    fetchUsers();

    // Function to fetch user data
    async function fetchUsers() {
        try {
            const response = await fetch('/api/users?' + new URLSearchParams({ refresh: Math.random() }));
            const data = await response.json();
            renderUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
    
    // Function to format date string
    function formatDateString(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    
    // Render user data in the table
    function renderUsers(users) {
        const tableBody = document.querySelector('#user-table tbody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const lastActiveDate = formatDateString(user.lastActive);
            //console.log(user);
            const row = `
                <tr data-id="${user.id}">
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>${lastActiveDate}</td>
                    <td>
                        <button class="edit-btn" data-id="${user.id}">Edit</button>
                        <button class="delete-btn" data-id="${user.id}">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        // Attach event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
    
    // Handle click event on edit button
    function handleEdit(event) {
        const userId = event.target.dataset.id;
        //console.log(userId);
        const userRow = event.target.closest('tr').querySelectorAll('td');
        const modal = document.querySelector('#modal');
        const editHeader = document.querySelector('#modal h2');
        const editNameInput = document.querySelector('#edit-name');
        const editEmailInput = document.querySelector('#edit-email');
        const editRoleInput = document.querySelector('#edit-role');
        const editLastActiveInput = document.querySelector('#edit-lastActive');

        // Fill user data into input fields
        editNameInput.value = userRow[0].innerText;
        editEmailInput.value = userRow[1].innerText;
        editRoleInput.value = userRow[2].innerText;
        editLastActiveInput.value = userRow[3].innerText;

        editHeader.innerText = `Edit User - ${editNameInput.value}`;
        modal.style.display = 'block';

        // Clicking outside the modal closes it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        // Handle click event on confirm edit button
        document.querySelector('#confirm-edit').addEventListener('click', async () => {
            const newName = editNameInput.value;
            const newEmail = editEmailInput.value;
            const newRole = editRoleInput.value;
            let newLastActive = new Date(editLastActiveInput.value); // Convert string to Date object
            newLastActive = newLastActive.toISOString(); // Convert Date object to ISO 8601 format string
           
            // Send POST request to update user data
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        newName,
                        newEmail,
                        newRole,
                        newLastActive
                    })
                });

                // Check response status code
                if (response.ok) {
                    fetchUsers(); // Update data in the table
                } else {
                    console.error('Failed to update user data');
                }
            } catch (error) {
                console.error('Error updating user data:', error);
            }

            modal.style.display = 'none';
        });

    }

    // Handle click event on delete button
    function handleDelete(event) {
        const userId = event.target.dataset.id;
        const confirmDelete = confirm('Are you sure you want to delete this user?');

        // Send delete request to the backend and handle response
        if (confirmDelete) {
            // Send delete request to the backend
            fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Update user list after successful deletion
                    fetchUsers();
                } else {
                    console.error('Failed to delete user');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
            });
        }
    }


    // Handle click event on close button
    document.querySelector('.close').addEventListener('click', () => {
        const modal = document.querySelector('#modal');
        modal.style.display = 'none';
    });

    // Event listener for search input
    document.querySelector('#search').addEventListener('input', (event) => {
        const searchValue = event.target.value.toLowerCase(); // Convert input to lowercase
        const rows = document.querySelectorAll('#user-table tbody tr');

        // Iterate through each row in the table and filter by name or email
        rows.forEach(row => {
            const name = row.querySelector('td:nth-child(1)').innerText.toLowerCase();
            const email = row.querySelector('td:nth-child(2)').innerText.toLowerCase();
            if (name.includes(searchValue) || email.includes(searchValue)) {
                row.style.display = ''; // Show rows that match the search criteria
            } else {
                row.style.display = 'none'; // Hide rows that do not match the search criteria
            }
        });
    });
    
});
