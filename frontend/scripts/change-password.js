
const email = document.getElementById('email');
const oldPassword = document.getElementById('oldPass');
const newPassword = document.getElementById('newPass')


async function changePassword() {
    fetch("http://localhost:5000/api/users/changePassword", {
        method: "PATCH",
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                email: email.value,
                oldPass: oldPassword.value,
                newPass: newPassword.value
            }
        )
    }).then(r => r.json()).then(r => {
            if (r.token) {
                
                location.href = "../pages/login.html";
            }
            else{
                alert(r.message)
            }

        })

}