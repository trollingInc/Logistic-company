const pageReferral = document.getElementById("admin-panel");
if (sessionStorage.getItem("userRole") === "admin") {
    pageReferral.style.display = "";
}