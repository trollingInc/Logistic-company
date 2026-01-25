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

async function test() {
    fetch("http://localhost:5000/api/users/test", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("jwt")}`
        },
        body: JSON.stringify({
            bob: "b"
        })
    }).then(r => r.json()).then(r => {
        console.log(r);
        if (r.token) {
            sessionStorage.setItem("jwt", r.token);
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
            sessionStorage.setItem("jwt", r.token);
            console.log(location.href);
            location.href = "../pages/index.html";
        }
    })

}