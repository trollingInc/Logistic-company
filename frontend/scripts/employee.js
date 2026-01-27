function toggleReportInputs() {
    const type = document.getElementById('reportType').value;
    const emailGroup = document.getElementById('inputEmailGroup');
    const dateGroup = document.getElementById('inputDateGroup');

    // Reset visibility
    if (emailGroup) emailGroup.style.display = 'none';
    if (dateGroup) dateGroup.style.display = 'none';

    // Show email for reports that require it
    if (['by_employee', 'sent_by_client', 'received_by_client'].includes(type)) {
        if (emailGroup) emailGroup.style.display = 'block';
    }

    // Show dates for revenue report
    if (type === 'revenue') {
        if (dateGroup) dateGroup.style.display = 'flex';
    }
}

// Main Generator Function
async function generateReport() {
    const type = document.getElementById('reportType').value;
    const emailInput = document.getElementById('reportEmail');
    const email = emailInput ? emailInput.value.trim() : "";
    const token = sessionStorage.getItem('jwt');
    console.log(type);
    // UI Elements
    const tableHead = document.getElementById('reportTableHead');
    const tableBody = document.getElementById('reportTableBody');
    const revenueDisplay = document.getElementById('revenueDisplay');
    const revenueAmount = document.getElementById('revenueAmount');

    // Basic Validation
    if (type === 'none' || !type) {
        alert("Please select a report type.");
        return;
    }

    // Reset UI
    tableBody.innerHTML = '<tr><td colspan="6">Loading data...</td></tr>';
    if (revenueDisplay) revenueDisplay.style.display = 'none';
    tableHead.innerHTML = ''; 

    try {
        let url = '';
        let dataKey = 'packages'; // Default key in JSON response
        let isUserReport = false; // Flag to render user table vs package table

        // --- CONSTRUCT URL BASED ON TYPE ---
        switch (type) {
            case 'all_employees': // a.
                url = 'http://localhost:5000/api/users/employees';
                dataKey = 'employees';
                isUserReport = true;
                break;
                
            case 'all_clients': // b.
                url = 'http://localhost:5000/api/users/customers';
                dataKey = 'customers';
                isUserReport = true;
                break;

            case 'all_packages': // c.
                url = 'http://localhost:5000/api/packages/employeeAccess';
                break;

            case 'by_employee': // d.
                if(!email) { alert("Please enter an employee email"); return; }
                url = `http://localhost:5000/api/packages/employeeAccess?employee=${email}`;
                break;

            case 'sent_only': // e.
                url = 'http://localhost:5000/api/packages/employeeAccess?sentOnly=true';
                break;

            case 'sent_by_client': // f.
                if(!email) { alert("Please enter a client email"); return; }
                url = `http://localhost:5000/api/packages/employeeAccess/userRelated/sent/${email}`;
                break;

            case 'received_by_client': // g.
                if(!email) { alert("Please enter a client email"); return; }
                url = `http://localhost:5000/api/packages/employeeAccess/userRelated/received/${email}`;
                break;
            case 'revenue': // h.
                // Fetch ALL packages, then filter by date in Frontend
                url = 'http://localhost:5000/api/packages/employeeAccess';
                break;
        }

        //FETCH DATA
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            tableBody.innerHTML = `<tr><td style="color:red; font-weight:bold;">Error: ${data.message || 'Request Failed'}</td></tr>`;
            return;
        }

        let list = data[dataKey] || [];

        //SPECIAL LOGIC FOR REVENUE
        if (type === 'revenue') {
            const startStr = document.getElementById('startDate').value;
            const endStr = document.getElementById('endDate').value;

            if (!startStr || !endStr) {
                alert("Please select Start and End dates.");
                tableBody.innerHTML = '<tr><td>Waiting for dates...</td></tr>';
                return;
            }

            // Convert to timestamps for comparison
            const startDate = new Date(startStr).setHours(0,0,0,0);
            const endDate = new Date(endStr).setHours(23,59,59,999);
            let total = 0;

            // Filter packages
            const filtered = list.filter(pkg => {
                if(!pkg.sendDate) return false; 
                const pkgDate = new Date(pkg.sendDate).getTime();
                return pkgDate >= startDate && pkgDate <= endDate;
            });

            // Calculate Sum
            filtered.forEach(pkg => total += (pkg.price || 0));

            // Update UI
            if (revenueDisplay) revenueDisplay.style.display = 'block';
            if (revenueAmount) revenueAmount.innerText = total.toFixed(2);
            
            // Show only the relevant packages in the table
            list = filtered; 
        }

        //RENDER TABLE
        if (list.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No records found for this query.</td></tr>';
            return;
        }

        if (isUserReport) {
            // RENDER USERS (Employees / Clients)
            tableHead.innerHTML = `
                <tr>
                    <th style="background:#444; color:white;">Email</th>
                    <th style="background:#444; color:white;">Role</th>
                    <th style="background:#444; color:white;">ID</th>
                </tr>`;
            
            tableBody.innerHTML = '';
            list.forEach(u => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${u.email}</td>
                        <td><span class="status-badge">${u.role}</span></td>
                        <td><small>${u._id}</small></td>
                    </tr>`;
            });

        } else {
            // RENDER PACKAGES
            tableHead.innerHTML = `
                <tr>
                    <th style="background:#444; color:white;">Date</th>
                    <th style="background:#444; color:white;">Sender</th>
                    <th style="background:#444; color:white;">Recipient</th>
                    <th style="background:#444; color:white;">Route</th>
                    <th style="background:#444; color:white;">Status</th>
                    <th style="background:#444; color:white;">Price</th>
                </tr>`;
            
            tableBody.innerHTML = '';
            list.forEach(pkg => {
                const sender = pkg.sentBy?.email || pkg.sentBy || 'N/A';
                const recipient = pkg.recipient?.email || pkg.recipient || 'N/A';
                const date = new Date(pkg.sendDate).toLocaleDateString('bg-BG');
                
                tableBody.innerHTML += `
                    <tr>
                        <td>${date}</td>
                        <td>${sender}</td>
                        <td>${recipient}</td>
                        <td>${pkg.origin} &rarr; ${pkg.destination}</td>
                        <td>${pkg.status}</td>
                        <td style="font-weight:bold;">${pkg.price ? pkg.price.toFixed(2) : '0.00'} euro</td>
                    </tr>`;
            });
        }

    } catch (error) {
        console.error("Report Error:", error);
        tableBody.innerHTML = `<tr><td style="color:red">Server connection failed.</td></tr>`;
    }
}

// Function to delete a package (Must be global for onclick)
async function deletePackage(id) {
    if(!confirm('Сигурни ли сте, че искате да изтриете тази пратка?')) return;
    const token = sessionStorage.getItem('jwt');
    try {
        await fetch(`http://localhost:5000/api/packages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        location.reload();
    } catch (e) {
        console.error(e);
        alert("Грешка при изтриване.");
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Load initial "All Packages" table for the Employee Dashboard
    const mainTableBody = document.getElementById('allPackagesBody');
    
    if (mainTableBody) {
        try {
            const response = await fetch('http://localhost:5000/api/packages/employeeAccess', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (response.status === 403) {
                alert("You don't have access to this page!");
                window.location.href = 'client-packages.html';
                return;
            }

            const data = await response.json();
            const list = data.packages || [];

            if (list.length === 0) {
                mainTableBody.innerHTML = "<tr><td colspan='6'>There are no packages</td></tr>";
            } else {
                mainTableBody.innerHTML = ''; // Clear existing content
                list.forEach(pkg => {
                    const sender = pkg.sentBy?.email || pkg.sentBy || 'N/A';
                    const recipient = pkg.recipient?.email || pkg.recipient || 'N/A';
                    const date = new Date(pkg.sendDate).toLocaleDateString('bg-BG');

                    mainTableBody.innerHTML += `
                        <tr>
                            <td>${date}</td>
                            <td>${sender}</td>
                            <td>${recipient}</td>
                            <td>${pkg.origin} -> ${pkg.destination}</td>
                            <td>${pkg.weight} kg</td>
                            <td>${pkg.price ? pkg.price.toFixed(2) : 0} euro</td>
                            <td>${pkg.status}</td>
                            <td>
                                <button onclick="deletePackage('${pkg.id}')" class="btn-small btn-delete">X</button>
                            </td>
                        </tr>`;
                });
            }
        } catch (error) {
            console.error(error);
        }
    }
});