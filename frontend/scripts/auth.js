const registerEmail = document.getElementById("remail");
const registerPassword = document.getElementById("rpass");
const loginEmail = document.getElementById("lemail");
const loginPassword = document.getElementById("lpass");
const confirmPassword = document.getElementById("confirmPassword")

function checkPasswords() {
    return registerPassword.value === confirmPassword.value
}

async function register() {
    if (!checkPasswords()) {
        alert("Passwords do not match! Please try again.")
        return;
    }
    fetch("http://localhost:5000/api/users/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: registerEmail.value,
            password: registerPassword.value
        })
    }).then(r => r.json()).then(r => {
        console.log(r);
        if (r.token) {
            sessionStorage.setItem("jwt", r.token);
            console.log(location.href);
            location.href = "../pages/login.html";
        }
    })
}

async function login() {
    fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: loginEmail.value,
            password: loginPassword.value
        })
    }).then(r => r.json()).then(r => {
        if (r.token) {
            const payload = JSON.parse(atob(r.token.split('.')[1]));
            const role = payload.role;
            sessionStorage.setItem("jwt", r.token);
            sessionStorage.setItem("userEmail", loginEmail.value);
            sessionStorage.setItem("userRole", role);
            console.log("Login successful, redirecting...");
            console.log(location.href);
            location.href = "../pages/index.html";
        }
    })

}

function logout() {
    sessionStorage.removeItem('jwt');
    window.location.href = 'login.html';
}
function checkEmployeeAccess() {
            const role = sessionStorage.getItem('userRole');


            const allowedRoles = ['office', 'admin', 'courier'];

            if (allowedRoles.includes(role)) {

                window.location.href = "employee-packages.html";
            } else {

                alert("You don't have access! This panel is only for employees.");
            }
        }