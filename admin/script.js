// ================================
// ADMIN LOGIN
// ================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;

        const correctUsername = "admin";
        const correctPassword = "admin123";

        if (
            username === correctUsername &&
            password === correctPassword
        ) {

            loginMessage.textContent =
                "Login successful!";

            loginMessage.style.color = "green";

            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 500);

        } else {

            loginMessage.textContent =
                "Invalid username or password.";

            loginMessage.style.color =
                "#b45c32";

        }

    });

}


// ================================
// LOGOUT
// ================================

function logout() {

    window.location.href = "index.html";

}


// ================================
// API
// ================================

const API_URL = "http://127.0.0.1:5000/api/menu";


// ================================
// MENU TABS
// ================================

const menuTabs =
    document.querySelectorAll(".admin-menu-tab");

const menuSections =
    document.querySelectorAll(".admin-menu-section");


menuTabs.forEach(function (tab) {

    tab.addEventListener("click", function () {

        const target =
            tab.dataset.menu;

        menuTabs.forEach(function (item) {

            item.classList.remove("active");

        });

        menuSections.forEach(function (section) {

            section.classList.remove("active");

        });

        tab.classList.add("active");

        const targetSection =
            document.getElementById(target);

        if (targetSection) {

            targetSection.classList.add("active");

        }

    });

});


// ================================
// LOAD MENU
// ================================

async function loadMenu() {

    try {

        const response =
            await fetch(API_URL);

        const items =
            await response.json();

        renderMenu(items);

    } catch (error) {

        console.error(error);

        document.querySelectorAll(".admin-food-list")
            .forEach(function (list) {

                list.innerHTML =
                    "<p>Unable to connect to server.</p>";

            });

    }

}


// ================================
// RENDER MENU
// ================================

function renderMenu(items) {

    const lists = {

        lunch:
            document.getElementById("lunchList"),

        canteen:
            document.getElementById("canteenList"),

        dinner:
            document.getElementById("dinnerList")

    };


    Object.values(lists).forEach(function (list) {

        if (list) {

            list.innerHTML = "";

        }

    });


    items.forEach(function (item) {

        const list =
            lists[item.category];

        if (!list) return;


        const card =
            document.createElement("div");

        card.className =
            "admin-food-card";


        if (!item.available) {

            card.classList.add("disabled");

        }


        card.innerHTML = `

            <div class="food-info">

                <small>${item.day}</small>

                <h3>${item.name}</h3>

                <p>${item.description || ""}</p>

                <strong>₹${item.price}</strong>

            </div>

            <div class="food-actions">

                <button
                    onclick="editItem(${item.id})"
                >
                    Edit
                </button>

                <button
                    onclick="toggleAvailability(
                        ${item.id},
                        ${item.available}
                    )"
                >
                    ${item.available ? "Disable" : "Enable"}
                </button>

                <button
                    onclick="deleteItem(${item.id})"
                    class="delete-btn"
                >
                    Delete
                </button>

            </div>

        `;


        list.appendChild(card);

    });


    Object.entries(lists).forEach(function ([category, list]) {

        if (
            list &&
            list.children.length === 0
        ) {

            list.innerHTML =
                "<p class='empty-menu'>No menu items yet.</p>";

        }

    });

}


// ================================
// OPEN ADD FORM
// ================================

function openAddForm(category) {

    document.getElementById("menuForm").reset();

    document.getElementById("itemId").value = "";

    document.getElementById("itemCategory").value =
        category;

    document.getElementById("formTitle").textContent =
        "Add Menu Item";

    document.getElementById("menuModal")
        .classList.add("active");

}


// ================================
// CLOSE FORM
// ================================

function closeMenuForm() {

    document.getElementById("menuModal")
        .classList.remove("active");

}


// ================================
// ADD / EDIT ITEM
// ================================

const menuForm =
    document.getElementById("menuForm");


if (menuForm) {

    menuForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const itemId =
                document.getElementById("itemId").value;


            const item = {

                day:
                    document.getElementById("itemDay").value,

                name:
                    document.getElementById("itemName").value,

                description:
                    document.getElementById("itemDescription").value,

                price:
                    Number(
                        document.getElementById("itemPrice").value
                    ),

                category:
                    document.getElementById("itemCategory").value

            };


            try {

                let response;


                if (itemId) {

                    response = await fetch(
                        `${API_URL}/${itemId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(item)
                        }
                    );

                } else {

                    response = await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(item)
                        }
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        "Failed to save item"
                    );

                }


                closeMenuForm();

                loadMenu();

            } catch (error) {

                console.error(error);

                alert(
                    "Could not save menu item."
                );

            }

        }
    );

}


// ================================
// EDIT ITEM
// ================================

async function editItem(id) {

    try {

        const response =
            await fetch(API_URL);

        const items =
            await response.json();

        const item =
            items.find(function (item) {

                return item.id === id;

            });


        if (!item) return;


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

        console.error(error);

        alert(
            "Could not load menu item."
        );

    }

}


// ================================
// ENABLE / DISABLE
// ================================

async function toggleAvailability(
    id,
    currentStatus
) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}/availability`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        available:
                            currentStatus ? 0 : 1

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to change availability"
            );

        }


        loadMenu();

    } catch (error) {

        console.error(error);

        alert(
            "Could not change availability."
        );

    }

}


// ================================
// DELETE ITEM
// ================================

async function deleteItem(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this menu item?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete item"
            );

        }


        loadMenu();

    } catch (error) {

        console.error(error);

        alert(
            "Could not delete menu item."
        );

    }

}


// ================================
// LOAD MENU ON PAGE OPEN
// ================================

if (
    document.getElementById("canteenList")
) {

    loadMenu();

}