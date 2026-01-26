document.addEventListener('DOMContentLoaded', loadMyPackages);

async function loadMyPackages() {
    const tableBody = document.getElementById('myPackagesTable');
    const loadingMsg = document.getElementById('loadingMsg');
    
    const token = sessionStorage.getItem('jwt');
    const myEmail = sessionStorage.getItem('userEmail'); // Взимаме имейла, който запазихме при логин

    // Проверка за автентикация
    if (!token || !myEmail) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Използваме твоя филтър: ?employee=EMAIL
        const url = `http://localhost:5000/api/packages/employeeAccess?employee=${myEmail}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();
        loadingMsg.style.display = 'none';

        if (!response.ok) {
            console.error(data);
            tableBody.innerHTML = `<tr><td colspan="6" style="color:red">Грешка: ${data.message}</td></tr>`;
            return;
        }

        const packages = data.packages;

        if (!packages || packages.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center">Все още нямате регистрирани пратки.</td></tr>';
            return;
        }

        // Рендиране на таблицата
        tableBody.innerHTML = '';
        
        packages.forEach(pkg => {
            const row = document.createElement('tr');
            
            // Форматиране на дата
            const date = new Date(pkg.sendDate).toLocaleDateString('bg-BG');
            
            // Проверка за имена (ако са обекти или ID-та)
            const sender = pkg.sentBy?.email || pkg.sentBy || 'N/A';
            const recipient = pkg.recipient?.email || pkg.recipient || 'N/A';

            // Статус стилове
            let statusBadge = `<span class="status-badge">${pkg.status}</span>`;
            if (pkg.status === 'sent') statusBadge = '<span class="status-badge status-sent">Пътува</span>';
            if (pkg.status === 'received') statusBadge = '<span class="status-badge status-delivered">Получена</span>';

            row.innerHTML = `
                <td>${date}</td>
                <td>${sender}</td>
                <td>${recipient}</td>
                <td>${pkg.destination}</td>
                <td>${pkg.price.toFixed(2)} лв.</td>
                <td>${statusBadge}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        loadingMsg.textContent = 'Грешка при свързване със сървъра.';
    }
}