
const updateButton = document.getElementById('updatePackage');
updateButton.addEventListener('click',()=>{
    updatePackage();
})
const statusChange = document.getElementById('statusChange');
statusChange.addEventListener('click',()=>{
    statusChange.disabled=true;
});

// Update package
async function updatePackage() {
    const token = sessionStorage.getItem('jwt');
    const role = sessionStorage.getItem('userRole');

    // Check role
    if (!token || (role !== 'office' && role !== 'admin')) {
        alert("Access Denied.");
        window.location.href = 'login.html';
        return;
    }

    const packageId = document.getElementById('packageId').value.trim();
    const recipient = document.getElementById('newRecipient').value.trim();
    const courier = document.getElementById('newCourier').value.trim();
    const weight = document.getElementById('newWeight').value;

    if (!packageId) {
        alert("Package ID is required.");
        return;
    }

    const payload = {};
    if (recipient) payload.recipient = recipient;
    if (courier) payload.courier = courier;
    if (weight) payload.weight = weight;
    payload.status = statusChange.value;

    // Validation
    if (Object.keys(payload).length === 0) {
        alert("Please fill in at least one field to update (Recipient, Courier, or Weight).");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/packages/updatePackage/${packageId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            let msg = "Package updated successfully!";

            // Update price if weight is changed
            if (payload.weight) {
                msg += `\nNew Price: ${data.package.price.toFixed(2)} euro`;
            }

            alert(msg);

            document.getElementById('newRecipient').value = "";
            document.getElementById('newCourier').value = "";
            document.getElementById('newWeight').value = "";
            document.getElementById('statusChange').value = false;

        } else {
            const data = await response.json();
            alert("Error: " + (data.message || "Failed to update package"));
        }

    } catch (error) {
        console.error(error);
        alert("Server connection error.");
    }
}
