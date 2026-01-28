const pageReferral = document.getElementById("admin-panel");
if (sessionStorage.getItem("userRole") === "admin") {
    pageReferral.style.display = "";
}
async function updatePricing() {
    const priceInput = document.getElementById('pricePerKg');
    const priceVal = priceInput.value;
    const token = sessionStorage.getItem('jwt');

    if (!priceVal || priceVal <= 0) {
        alert("Please enter a valid price greater than 0.");
        return;
    }

    try {

        const response = await fetch('http://localhost:5000/api/company', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                pricePerKg: priceVal
            })
        });

        if (response.ok) {
            alert("Price per Kg updated successfully!");
            priceInput.value = "";
        } else {
            const data = await response.json();
            alert("Error: " + (data.message || "Update failed"));
        }

    } catch (error) {
        console.error(error);
        alert("You don't have access.");
    }
}
//change role
async function updateUserRoleByEmail() {
    const emailInput = document.getElementById('roleUserEmail').value.trim();
    const newRole = document.getElementById('newRoleSelect').value;
    const token = sessionStorage.getItem('jwt');

    if (!emailInput) {
        alert("Please enter a User Email.");
        return;
    }

    try {

        const response = await fetch('http://localhost:5000/api/users/changeRole', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                email: emailInput,
                role: newRole
            })
        });

        if (response.ok) {
            alert(`Success! User ${emailInput} is now a ${newRole}.`);
            document.getElementById('targetUserEmail').value = "";
        } else {
            const data = await response.json();
            alert("Error: " + (data.message || "Failed to update role"));
        }
    } catch (error) {
        console.error(error);
        alert("Server connection error.");
    }
}

//delete user
async function deleteUserByEmail() {
    const userEmail = document.getElementById('deleteUserEmail').value.trim();
    const token = sessionStorage.getItem('jwt');

    if (!userEmail) {
        alert("Please enter the User email.");
        return;
    }

    if (!confirm(`Are you sure you want to PERMANENTLY DELETE User Account with email: ${userEmail}?`)) return;

    try {
        const response = await fetch(`http://localhost:5000/api/users?email=${userEmail}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (response.ok) {
            alert("User deleted successfully.");
            document.getElementById('deleteUserEmail').value = ""; 
        } else {
            const data = await response.json().catch(() => ({}));
            alert("Error: " + (data.message || "Failed to delete user"));
        }
    } catch (error) {
        console.error(error);
        alert("Server connection error.");
    }
}