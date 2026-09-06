// ================================
// ADMIN LOGIN
// ================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Temporary development credentials
        const correctUsername = "admin";
        const correctPassword = "admin123";

        if (username === correctUsername && password === correctPassword) {

            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 500);

        } else {

            loginMessage.textContent = "Invalid username or password.";
            loginMessage.style.color = "#b45c32";

        }

    });
}


// ================================
// ADMIN LOGOUT
// ================================

function logout() {
    window.location.href = "index.html";
}

// ================================
// MENU TABS
// ================================

const menuTabs = document.querySelectorAll(".admin-menu-tab");
const menuSections = document.querySelectorAll(".admin-menu-section");

menuTabs.forEach(function (tab) {

    tab.addEventListener("click", function () {

        const target = tab.dataset.menu;

        menuTabs.forEach(function (item) {
            item.classList.remove("active");
        });

        menuSections.forEach(function (section) {
            section.classList.remove("active");
        });

        tab.classList.add("active");

        const targetSection = document.getElementById(target);

        if (targetSection) {
            targetSection.classList.add("active");
        }

    });

});