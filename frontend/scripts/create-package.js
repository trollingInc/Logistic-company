// Check package delivery price
async function checkPrice() {

    const destination = getDestinationValue();
    const origin = getOriginValue();

    const weight = document.getElementById('weight').value;
    const priceDisplay = document.getElementById('priceDisplay');
    const priceSpan = document.getElementById('calculatedPrice');

    // Validation
    if (!origin || !destination || !weight) {
        alert("Please fill in Origin, Destination, and Weight.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/packages/getPrice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin, destination, weight })
        });

        const data = await response.json();

        if (response.ok) {
            // Show price
            if (priceDisplay) priceDisplay.style.display = 'block';
            if (priceDisplay) priceDisplay.style.color = 'green';
            if (priceSpan) priceSpan.innerText = parseFloat(data.price).toFixed(2);
        } else {
            alert("Calculation Error: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Check role (for admin only)
    const role = sessionStorage.getItem('userRole');
    if (role === 'admin') {
        const btn = document.getElementById('btnAddOffice');
        if (btn) btn.style.display = 'block';
    }

    await loadOffices();

    toggleDestinationInput();
});

//Create package
async function createPackage(e) {
    if (e) e.preventDefault();

    const destination = getDestinationValue();
    const origin = getOriginValue();

    const packageData = {
        origin: origin,
        destination: destination,
        weight: document.getElementById('weight').value,
        sender: document.getElementById('sender').value,
        recipient: document.getElementById('recipient').value,
        courier: document.getElementById('courier').value
    };

    const token = sessionStorage.getItem('jwt');

    try {
        const response = await fetch('http://localhost:5000/api/packages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(packageData)
        });

        if (response.ok) {
            alert("Package created successfully!");
            window.location.href = 'employee-packages.html';
        } else {
            const data = await response.json();
            alert("Error: " + (data.message || "Could not create package"));
        }
    } catch (err) {
        console.error(err);
        alert("Server connection error");
    }
}

function getDestinationValue() {
    const radioAddress = document.querySelector('input[name="destinationType"][value="address"]');

    if (radioAddress && radioAddress.checked) {
        // Return text input
        return document.getElementById('destinationAddressInput').value;
    } else {
        // Return selected office
        return document.getElementById('destinationOfficeSelect').value;
    }
}
function getOriginValue() {
    const radioAddress = document.querySelector('input[name="originType"][value="address"]');

    if (radioAddress && radioAddress.checked) {
        return document.getElementById('origin').value;
    } else {
        return document.getElementById('originOfficeSelect').value;
    }
}

function toggleDestinationInput(from) {
    const radioAddress = from ? document.querySelector('input[name="destinationType"][value="address"]') : document.querySelector('input[name="originType"][value="address"]');
    const inputAddress = from ? document.getElementById('destinationAddressInput') : document.getElementById('origin');
    const selectOffice = from ? document.getElementById('destinationOfficeSelect') : document.getElementById('originOfficeSelect');

    if (radioAddress.checked) {
        // Show Address Input
        inputAddress.style.display = 'block';
        inputAddress.required = true;

        // Hide Office Select
        selectOffice.style.display = 'none';
        selectOffice.required = false;
        selectOffice.value = "";
    } else {
        // Hide Address Input
        inputAddress.style.display = 'none';
        inputAddress.required = false;
        inputAddress.value = "";

        // Show Office Select
        selectOffice.style.display = 'block';
        selectOffice.required = true;
    }
}

//Load offices
async function loadOffices() {
    try {
        const response = await fetch('http://localhost:5000/api/office');
        const data = await response.json();

        const destSelect = document.getElementById('destinationOfficeSelect');
        const originSelect = document.getElementById('originOfficeSelect');

        if (response.ok && data.offices) {
            // Reset dropdown
            if (destSelect) destSelect.innerHTML = '<option value="" disabled selected>Select an Office...</option>';
            if (originSelect) originSelect.innerHTML = '<option value="" disabled selected>Select an Office...</option>';

            data.offices.forEach(office => {
                if (destSelect) {
                    const opt = document.createElement('option');
                    opt.value = office.address;
                    opt.textContent = office.address;
                    destSelect.appendChild(opt);

                }
                if (originSelect) {
                    const opt = document.createElement('option');
                    opt.value = office.address;
                    opt.textContent = office.address;
                    originSelect.appendChild(opt);
                }
            });
        }
    } catch (error) {
        console.error("Failed to load offices:", error);
    }
}

async function createNewOffice() {
    const address = prompt("Enter the new office address:");

    if (!address || address.trim() === "") return;

    const token = sessionStorage.getItem('jwt');

    try {
        const response = await fetch('http://localhost:5000/api/office', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ address: address.trim() })
        });

        if (response.ok) {
            alert("Office created successfully!");
            await loadOffices();

            const officeRadio = document.querySelector('input[name="destinationType"][value="office"]');
            if (officeRadio) officeRadio.click();

            const destSelect = document.getElementById('destinationOfficeSelect');
            if (destSelect) destSelect.value = address.trim();

        } else {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                alert("Error: " + errorJson.message);
            } catch (e) {
                alert("Error: " + errorText);
            }
        }
    } catch (error) {
        console.error("Network or parsing error:", error);
        alert("Could not connect to server.");
    }
}

const form = document.getElementById('createPackageForm');
if (form) {
    form.addEventListener('submit', createPackage);
}