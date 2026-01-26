document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwt');
    if (!token) return location.href = 'login.html';

    // Използваме твоя endpoint за служители
    const response = await fetch('http://localhost:5000/api/packages/employeeAccess', {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (response.status === 403) {
        alert("Нямате права!");
        location.href = 'client-packages.html';
        return;
    }

    const data = await response.json();
    const tableBody = document.getElementById('allPackagesBody');
    const list = data.packages || [];

    if (list.length === 0) tableBody.innerHTML = "<tr><td colspan='5'>Няма пратки</td></tr>";

    list.forEach(pkg => {
        // Проверка дали полетата са обекти (populate) или само ID-та
        const sender = pkg.sentBy?.email || pkg.sentBy || 'N/A';
        const receiver = pkg.recipient?.email || pkg.recipient || 'N/A';
        const date = new Date(pkg.sendDate).toLocaleDateString('bg-BG');

        tableBody.innerHTML += `
            <tr>
                <td>${date}</td>
                <td>${sender}</td>
                <td>${receiver}</td>
                <td>${pkg.origin} -> ${pkg.destination}</td>
                <td>${pkg.status}</td>
            </tr>
        `;
    });
});