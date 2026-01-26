async function checkPrice() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const weight = document.getElementById('weight').value;
    const priceDisplay = document.getElementById('priceDisplay');
    const priceSpan = document.getElementById('calculatedPrice');

    if (!origin || !destination || !weight) {
        alert("Моля попълнете От, До и Тегло, за да изчислите цената.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/packages/getPrice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin: origin,
                destination: destination,
                weight: weight
            })
        });

        const data = await response.json();

        if (response.ok) {
            priceDisplay.style.display = 'block';
            priceDisplay.style.color = 'green';
            priceSpan.innerText = data.price.toFixed(2); 
        } else {
            alert("Грешка при изчисление: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Сървърна грешка.");
    }
}

document.getElementById('createPackageForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const token = sessionStorage.getItem('jwt');
    const msgBox = document.getElementById('messageBox');
    
    const packageData = {
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        weight: document.getElementById('weight').value,
        sender: document.getElementById('sender').value,     // Email на подателя
        recipient: document.getElementById('recipient').value, // Email на получателя
        courier: document.getElementById('courier').value    // Email на куриера
    };

    msgBox.innerText = "Обработване...";
    msgBox.style.color = "blue";

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
            alert("Пратката е създадена успешно!");
            window.location.href = 'all-packages.html'; 
        } else {
            const data = await response.json();
            msgBox.innerText = "Грешка: " + (data.message || "Неуспешно създаване");
            msgBox.style.color = "red";
        }

    } catch (error) {
        console.error(error);
        msgBox.innerText = "Възникна грешка при свързване със сървъра.";
        msgBox.style.color = "red";
    }
});