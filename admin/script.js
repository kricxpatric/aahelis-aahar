// ========================================
// AAHELI'S AAHAR - ADMIN SCRIPT
// ========================================

// Automatically use the laptop's IP address
// when the website is opened through Live Server.
const API_URL = `http://${window.location.hostname}:5000/api/menu`;


// ========================================
// ADMIN LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (username === "admin" && password === "admin123") {

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


// ========================================
// LOGOUT
// ========================================

function logout() {
    window.location.href = "index.html";
}


// ========================================
// MENU TABS
// ========================================

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


// ========================================
// LOAD MENU
// ========================================

async function loadMenu() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load menu.");
        }

        const items = await response.json();

        renderMenu(items);

    } catch (error) {

        console.error("LOAD MENU ERROR:", error);

        document.querySelectorAll(".admin-food-list").forEach(function (list) {
            list.innerHTML =
                "<p class='empty-menu'>Unable to load menu.</p>";
        });

    }

}


// ========================================
// RENDER MENU
// ========================================

function renderMenu(items) {

    const lists = {
        lunch: document.getElementById("lunchList"),
        canteen: document.getElementById("canteenList"),
        dinner: document.getElementById("dinnerList")
    };

    // Clear all lists
    Object.values(lists).forEach(function (list) {

        if (list) {
            list.innerHTML = "";
        }

    });


    // Put each item in its category
    items.forEach(function (item) {

        const list = lists[item.category];

        if (!list) {
            return;
        }

        const card = document.createElement("div");

        card.className = "admin-food-card";

        if (!item.available) {
            card.classList.add("disabled-item");
        }


        card.innerHTML = `

            <div class="admin-food-info">

                <small>${item.day}</small>

                <h3>${item.name}</h3>

                <p>${item.description || ""}</p>

                <strong>₹${item.price}</strong>

                ${
                    item.available
                    ? ""
                    : "<span class='disabled-label'>Disabled</span>"
                }

            </div>

            <div class="food-actions">

                <button
                    type="button"
                    onclick="editItem(${item.id})">
                    Edit
                </button>

                <button
                    type="button"
                    onclick="toggleAvailability(${item.id}, ${item.available ? 1 : 0})">
                    ${item.available ? "Disable" : "Enable"}
                </button>

                <button
                    type="button"
                    onclick="deleteItem(${item.id})">
                    Delete
                </button>

            </div>

        `;

        list.appendChild(card);

    });


    // Empty category message
    Object.entries(lists).forEach(function ([category, list]) {

        if (list && list.children.length === 0) {

            list.innerHTML =
                "<p class='empty-menu'>No menu items yet.</p>";

        }

    });

}


// ========================================
// OPEN ADD FORM
// ========================================

function openAddForm(category) {

    const modal = document.getElementById("menuModal");
    const form = document.getElementById("menuForm");

    form.reset();

    document.getElementById("itemId").value = "";

    document.getElementById("formTitle").textContent =
        "Add Menu Item";

    document.getElementById("itemCategory").value =
        category;

    modal.classList.add("active");

}


// ========================================
// CLOSE FORM
// ========================================

function closeMenuForm() {

    const modal = document.getElementById("menuModal");

    modal.classList.remove("active");

}


// ========================================
// SAVE MENU ITEM
// ========================================

const menuForm = document.getElementById("menuForm");

if (menuForm) {

    menuForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const itemId =
            document.getElementById("itemId").value;

        const data = {

            day: document.getElementById("itemDay").value,

            name: document.getElementById("itemName").value.trim(),

            description:
                document.getElementById("itemDescription").value.trim(),

            price:
                Number(document.getElementById("itemPrice").value),

            category:
                document.getElementById("itemCategory").value

        };


        console.log("SAVING:", data);


        try {

            let response;

            // ====================================
            // EDIT
            // ====================================

            if (itemId) {

                response = await fetch(
                    `${API_URL}/${itemId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );

            }

            // ====================================
            // ADD
            // ====================================

            else {

                response = await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );

            }


            const result = await response.json();

            console.log("SERVER RESPONSE:", result);


            if (!response.ok) {

                alert(
                    result.error ||
                    "Something went wrong."
                );

                return;

            }


            closeMenuForm();

            await loadMenu();

            alert(
                itemId
                ? "Menu item updated successfully!"
                : "Menu item added successfully!"
            );


        } catch (error) {

            console.error("SAVE ERROR:", error);

            alert(
                "Could not connect to the backend.\n\n" +
                "Make sure Flask is running."
            );

        }

    });

}


// ========================================
// EDIT ITEM
// ========================================

async function editItem(id) {

    try {

        const response = await fetch(API_URL);

        const items = await response.json();

        const item = items.find(function (menuItem) {

            return Number(menuItem.id) === Number(id);

        });


        if (!item) {

            alert("Menu item not found.");

            return;

        }


        document.getElementById("itemId").value =
            item.id;

        document.getElementById("itemDay").value =
            item.day;

        document.getElementById("itemName").value =
            item.name;

        document.getElementById("itemDescription").value =
            item.description || "";

        document.getElementById("itemPrice").value =
            item.price;

        document.getElementById("itemCategory").value =
            item.category;


        document.getElementById("formTitle").textContent =
            "Edit Menu Item";


        document.getElementById("menuModal")
            .classList.add("active");


    } catch (error) {

        console.error("EDIT ERROR:", error);

        alert("Could not load this menu item.");

    }

}


// ========================================
// ENABLE / DISABLE
// ========================================

async function toggleAvailability(id, currentStatus) {

    const newStatus = currentStatus ? 0 : 1;

    try {

        const response = await fetch(
            `${API_URL}/${id}/availability`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    available: newStatus
                })
            }
        );


        const result = await response.json();

        console.log("AVAILABILITY RESPONSE:", result);


        if (!response.ok) {

            alert(
                result.error ||
                "Could not change availability."
            );

            return;

        }


        await loadMenu();


    } catch (error) {

        console.error(
            "AVAILABILITY ERROR:",
            error
        );

        alert(
            "Could not connect to the backend."
        );

    }

}


// ========================================
// DELETE ITEM
// ========================================

async function deleteItem(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();

        console.log("DELETE RESPONSE:", result);


        if (!response.ok) {

            alert(
                result.error ||
                "Could not delete item."
            );

            return;

        }


        await loadMenu();

        alert("Menu item deleted successfully!");


    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );

        alert(
            "Could not connect to the backend."
        );

    }

}


// ========================================
// INITIAL LOAD
// ========================================

if (document.querySelector(".admin-food-list")) {
    loadMenu();
}