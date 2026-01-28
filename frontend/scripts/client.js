document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwt');
    const myEmail = sessionStorage.getItem('userEmail');

    if (!token) return location.href = 'login.html';

    const response = await fetch('http://localhost:5000/api/packages/', {
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();
    const sentTable = document.getElementById('sentTable');
    const receivedTable = document.getElementById('receivedTable');
    const list = data.packages || [];

    list.forEach(pkg => {
        const sender = pkg.sentBy?.email || pkg.sentBy;
        const receiver = pkg.recipient?.email || pkg.recipient;
        const date = new Date(pkg.sendDate).toLocaleDateString('bg-BG');
console.log(sender);
        if (sender === myEmail) {
            sentTable.innerHTML += `
                    <tr>
                        <td>${pkg.id}</td>
                        <td>${date}</td>
                        <td>${sender}</td>
                        <td>${receiver}</td>
                        <td>${pkg.origin} &rarr; ${pkg.destination}</td>
                        <td>${pkg.weight} kg</td>
                        <td style="font-weight:bold;">${pkg.price ? pkg.price.toFixed(2) : '0.00'} euro</td>
                        <td>${pkg.status}</td>
                    </tr>`;
        } else if (receiver === myEmail) {
            receivedTable.innerHTML += `
                    <tr>
                        <td>${pkg.id}</td>
                        <td>${date}</td>
                        <td>${sender}</td>
                        <td>${receiver}</td>
                        <td>${pkg.origin} &rarr; ${pkg.destination}</td>
                        <td>${pkg.weight} kg</td>
                        <td style="font-weight:bold;">${pkg.price ? pkg.price.toFixed(2) : '0.00'} euro</td>
                        <td>${pkg.status}</td>
                    </tr>`;
        }
    });
});