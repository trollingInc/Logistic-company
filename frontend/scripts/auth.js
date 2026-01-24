const registerEmail = document.getElementById("remail");
const registerPassword = document.getElementById("rpass");

async function register() {
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
            email: registerEmail.value,
            password: registerPassword.value
        })
    }).then(r => r.json()).then(r => {
        if (r.token) {
            sessionStorage.setItem("jwt", r.token);
        }
    })
}