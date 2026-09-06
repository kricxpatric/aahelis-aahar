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

// ========================================
// ORDERS MANAGEMENT
// ========================================

const ORDERS_API_URL =
    `http://${window.location.hostname}:5000/api/orders`;

let allOrders = [];


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    const ordersList = document.getElementById("ordersList");

    if (!ordersList) {
        return;
    }

    ordersList.innerHTML = `
        <div class="orders-loading">
            Loading orders...
        </div>
    `;

    try {

        const response = await fetch(ORDERS_API_URL);

        if (!response.ok) {
            throw new Error("Could not load orders.");
        }

        allOrders = await response.json();

        renderOrders(allOrders);

    } catch (error) {

        console.error("ORDERS ERROR:", error);

        ordersList.innerHTML = `
            <div class="orders-empty">
                <h3>Unable to load orders</h3>
                <p>Make sure the Flask backend is running.</p>
            </div>
        `;

    }
}


// ========================================
// RENDER ORDERS
// ========================================

function renderOrders(orders) {

    const ordersList =
        document.getElementById("ordersList");

    if (!ordersList) {
        return;
    }


    if (orders.length === 0) {

        ordersList.innerHTML = `
            <div class="orders-empty">

                <div class="empty-icon">📦</div>

                <h3>No orders yet</h3>

                <p>
                    Customer orders will appear here.
                </p>

            </div>
        `;

        return;
    }


    ordersList.innerHTML = "";


    orders.forEach(function (order) {

        const card =
            document.createElement("div");

        card.className = "order-card";


        card.innerHTML = `

            <div class="order-card-top">

                <div>
                    <span class="order-number">
                        Order #${order.id}
                    </span>

                    <small>
                        ${formatOrderDate(order.created_at)}
                    </small>
                </div>

                <span class="order-status ${getStatusClass(order.status)}">
                    ${order.status}
                </span>

            </div>


            <div class="order-customer">

                <h3>${escapeHTML(order.customer_name)}</h3>

                <p>📞 ${escapeHTML(order.phone)}</p>

                ${
                    order.address
                    ? `<p>📍 ${escapeHTML(order.address)}</p>`
                    : ""
                }

            </div>


            <div class="order-items">

                <strong>Items</strong>

                <p>
                    ${escapeHTML(order.items)}
                </p>

            </div>


            <div class="order-card-bottom">

                <strong class="order-total">
                    ₹${Number(order.total).toFixed(2)}
                </strong>


                <div class="order-actions">

                    <button
                        type="button"
                        onclick="viewOrder(${order.id})">
                        View
                    </button>


                    <select
                        onchange="changeOrderStatus(${order.id}, this.value)">

                        ${getStatusOptions(order.status)}

                    </select>


                    <button
                        type="button"
                        class="delete-order-btn"
                        onclick="deleteOrder(${order.id})">
                        Delete
                    </button>

                </div>

            </div>

        `;


        ordersList.appendChild(card);

    });

}


// ========================================
// STATUS OPTIONS
// ========================================

function getStatusOptions(currentStatus) {

    const statuses = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Ready",
        "Out for Delivery",
        "Completed",
        "Cancelled"
    ];


    return statuses.map(function (status) {

        return `
            <option
                value="${status}"
                ${status === currentStatus ? "selected" : ""}>
                ${status}
            </option>
        `;

    }).join("");

}


// ========================================
// CHANGE STATUS
// ========================================

async function changeOrderStatus(id, status) {

    try {

        const response = await fetch(
            `${ORDERS_API_URL}/${id}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Could not update order status."
            );

            return;

        }


        await loadOrders();


    } catch (error) {

        console.error(
            "STATUS ERROR:",
            error
        );

        alert(
            "Could not connect to the backend."
        );

    }

}


// ========================================
// VIEW ORDER
// ========================================

async function viewOrder(id) {

    try {

        const response = await fetch(
            `${ORDERS_API_URL}/${id}`
        );


        if (!response.ok) {
            throw new Error("Order not found.");
        }


        const order =
            await response.json();


        const details =
            document.getElementById("orderDetails");


        details.innerHTML = `

            <div class="order-detail-row">
                <span>Order ID</span>
                <strong>#${order.id}</strong>
            </div>

            <div class="order-detail-row">
                <span>Customer</span>
                <strong>
                    ${escapeHTML(order.customer_name)}
                </strong>
            </div>

            <div class="order-detail-row">
                <span>Phone</span>
                <strong>
                    ${escapeHTML(order.phone)}
                </strong>
            </div>

            <div class="order-detail-row">
                <span>Address</span>
                <strong>
                    ${escapeHTML(order.address || "Not provided")}
                </strong>
            </div>

            <div class="order-detail-items">
                <span>Items</span>

                <p>
                    ${escapeHTML(order.items)}
                </p>
            </div>

            <div class="order-detail-row">
                <span>Total</span>
                <strong class="detail-total">
                    ₹${Number(order.total).toFixed(2)}
                </strong>
            </div>

            <div class="order-detail-row">
                <span>Status</span>
                <strong>
                    ${escapeHTML(order.status)}
                </strong>
            </div>

            <div class="order-detail-row">
                <span>Placed</span>
                <strong>
                    ${formatOrderDate(order.created_at)}
                </strong>
            </div>

        `;


        document
            .getElementById("orderModal")
            .classList.add("active");


    } catch (error) {

        console.error(
            "VIEW ORDER ERROR:",
            error
        );

        alert("Could not load order details.");

    }

}


// ========================================
// CLOSE ORDER MODAL
// ========================================

function closeOrderModal() {

    const modal =
        document.getElementById("orderModal");

    if (modal) {
        modal.classList.remove("active");
    }

}


// ========================================
// DELETE ORDER
// ========================================

async function deleteOrder(id) {

    const confirmed = confirm(
        `Delete Order #${id}?`
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${ORDERS_API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Could not delete order."
            );

            return;

        }


        await loadOrders();


    } catch (error) {

        console.error(
            "DELETE ORDER ERROR:",
            error
        );

        alert(
            "Could not connect to the backend."
        );

    }

}


// ========================================
// ORDER FILTERS
// ========================================

const orderFilterButtons =
    document.querySelectorAll(".order-filter-btn");


orderFilterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        orderFilterButtons.forEach(function (item) {
            item.classList.remove("active");
        });


        button.classList.add("active");


        const status =
            button.dataset.status;


        if (status === "all") {

            renderOrders(allOrders);

        } else {

            const filtered =
                allOrders.filter(function (order) {
                    return order.status === status;
                });

            renderOrders(filtered);

        }

    });

});


// ========================================
// ORDER HELPERS
// ========================================

function getStatusClass(status) {

    return status
        .toLowerCase()
        .replaceAll(" ", "-");

}


function formatOrderDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString.replace(" ", "T") + "Z"
        );


    if (isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ========================================
// LOAD ORDERS WHEN ORDERS PAGE OPENS
// ========================================

if (document.getElementById("ordersList")) {
    loadOrders();
}

// ========================================
// DASHBOARD MANAGEMENT
// ========================================

const DASHBOARD_API_URL =
    `http://${window.location.hostname}:5000/api/dashboard`;


// ========================================
// LOAD DASHBOARD
// ========================================

async function loadDashboard() {

    const totalOrders = document.getElementById("totalOrders");

    // Only run on dashboard.html
    if (!totalOrders) {
        return;
    }

    try {

        const response = await fetch(DASHBOARD_API_URL);

        if (!response.ok) {
            throw new Error("Could not load dashboard.");
        }

        const data = await response.json();

        console.log("DASHBOARD DATA:", data);


        // Statistics

        document.getElementById("totalOrders").textContent =
            data.total_orders;

        document.getElementById("todaySales").textContent =
            `₹${Number(data.today_sales).toFixed(0)}`;

        document.getElementById("pendingOrders").textContent =
            data.pending_orders;

        document.getElementById("completedOrders").textContent =
            data.completed_orders;


        // Recent Orders

        renderRecentOrders(data.recent_orders);


    } catch (error) {

        console.error("DASHBOARD ERROR:", error);

        const recentOrders =
            document.getElementById("recentOrdersList");

        if (recentOrders) {

            recentOrders.innerHTML = `
                <div class="orders-empty">
                    <div class="empty-icon">⚠️</div>
                    <h3>Unable to load dashboard</h3>
                    <p>Make sure the Flask backend is running.</p>
                </div>
            `;

        }

    }

}


// ========================================
// RENDER RECENT ORDERS
// ========================================

function renderRecentOrders(orders) {

    const container =
        document.getElementById("recentOrdersList");

    if (!container) {
        return;
    }


    if (!orders || orders.length === 0) {

        container.innerHTML = `
            <div class="orders-empty">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Customer orders will appear here.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    orders.forEach(function (order) {

        const card =
            document.createElement("div");

        card.className = "recent-order-item";


        card.innerHTML = `

            <div class="recent-order-info">

                <strong>
                    Order #${order.id}
                </strong>

                <span>
                    ${escapeHTML(order.customer_name)}
                </span>

                <small>
                    ${formatOrderDate(order.created_at)}
                </small>

            </div>


            <div class="recent-order-right">

                <strong class="recent-order-total">
                    ₹${Number(order.total).toFixed(0)}
                </strong>

                <span class="order-status ${getStatusClass(order.status)}">
                    ${escapeHTML(order.status)}
                </span>

            </div>

        `;


        container.appendChild(card);

    });

}


// ========================================
// INITIAL DASHBOARD LOAD
// ========================================

if (document.getElementById("totalOrders")) {

    loadDashboard();

}

const SPECIAL_MENUS_API_URL =
    `http://${window.location.hostname}:5000/api/special-menus`;

let specialMenus = [];


// ================================
// LOAD SPECIAL MENUS
// ================================

async function loadSpecialMenus() {

    const list = document.getElementById("specialMenusList");

    if (!list) return;

    list.innerHTML = `
        <div class="orders-loading">
            Loading special menus...
        </div>
    `;

    try {

        const response = await fetch(SPECIAL_MENUS_API_URL);

        if (!response.ok) {
            throw new Error("Could not load special menus.");
        }

        specialMenus = await response.json();

        renderSpecialMenus(specialMenus);

    } catch (error) {

        console.error(error);

        list.innerHTML = `
            <div class="orders-empty">
                Could not load special menus.
            </div>
        `;
    }
}


// ================================
// RENDER SPECIAL MENUS
// ================================

function renderSpecialMenus(menus) {

    const list = document.getElementById("specialMenusList");

    if (!list) return;

    if (!menus.length) {

        list.innerHTML = `
            <div class="orders-empty">
                <h3>No Special Menus Yet</h3>
                <p>
                    Add your first special menu using the button above.
                </p>
            </div>
        `;

        return;
    }


    list.innerHTML = menus.map(function(menu) {

        const statusClass =
            menu.status === "Active"
                ? "active"
                : "hidden";


        return `

            <div class="special-menu-card">

                <div class="special-menu-image">

                    <img
                        src="${menu.image_url}"
                        alt="${escapeHTML(menu.title)}"
                    >

                </div>


                <div class="special-menu-info">

                    <div class="special-menu-header">

                        <div>

                            <h3>
                                ${escapeHTML(menu.title)}
                            </h3>

                            ${
                                menu.description
                                ? `<p>
                                    ${escapeHTML(menu.description)}
                                   </p>`
                                : ""
                            }

                        </div>


                        <span class="special-menu-status ${statusClass}">
                            ${escapeHTML(menu.status)}
                        </span>

                    </div>


                    <div class="special-menu-actions">

                        <button
                            class="edit-btn"
                            onclick="editSpecialMenu(${menu.id})">
                            Edit
                        </button>


                        <button
                            class="toggle-btn"
                            onclick="toggleSpecialMenu(${menu.id})">
                            ${
                                menu.status === "Active"
                                ? "Hide"
                                : "Show"
                            }
                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteSpecialMenu(${menu.id})">
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        `;

    }).join("");
}


// ================================
// OPEN ADD MODAL
// ================================

function openSpecialMenuModal() {

    const modal =
        document.getElementById("specialMenuModal");

    const form =
        document.getElementById("specialMenuForm");

    document.getElementById(
        "specialMenuModalTitle"
    ).textContent = "Add Special Menu";

    form.reset();

    document.getElementById(
        "specialMenuId"
    ).value = "";

    modal.classList.add("active");
}


// ================================
// CLOSE MODAL
// ================================

function closeSpecialMenuModal() {

    const modal =
        document.getElementById("specialMenuModal");

    modal.classList.remove("active");
}


// ================================
// SAVE SPECIAL MENU
// ================================

const specialMenuForm =
    document.getElementById("specialMenuForm");


if (specialMenuForm) {

    specialMenuForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "specialMenuId"
                ).value;


            const title =
                document.getElementById(
                    "specialMenuTitle"
                ).value.trim();


            const description =
                document.getElementById(
                    "specialMenuDescription"
                ).value.trim();


            const status =
                document.getElementById(
                    "specialMenuStatus"
                ).value;


            const imageInput =
                document.getElementById(
                    "specialMenuImage"
                );


            if (!title) {

                alert("Please enter a menu title.");

                return;
            }


            // Create form data
            const formData = new FormData();

            formData.append("title", title);
            formData.append(
                "description",
                description
            );
            formData.append("status", status);


            // Add image only if selected
            if (imageInput.files.length > 0) {

                formData.append(
                    "image",
                    imageInput.files[0]
                );
            }


            try {

                let response;


                if (id) {

                    // EDIT
                    response = await fetch(
                        `${SPECIAL_MENUS_API_URL}/${id}`,
                        {
                            method: "PUT",
                            body: formData
                        }
                    );

                } else {

                    // ADD
                    if (imageInput.files.length === 0) {

                        alert(
                            "Please select a menu image."
                        );

                        return;
                    }


                    response = await fetch(
                        SPECIAL_MENUS_API_URL,
                        {
                            method: "POST",
                            body: formData
                        }
                    );
                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Could not save special menu."
                    );
                }


                alert(
                    id
                        ? "Special menu updated successfully!"
                        : "Special menu added successfully!"
                );


                closeSpecialMenuModal();

                loadSpecialMenus();

            } catch (error) {

                console.error(error);

                alert(error.message);
            }

        }
    );

}


// ================================
// EDIT SPECIAL MENU
// ================================

function editSpecialMenu(id) {

    const menu =
        specialMenus.find(
            function(item) {
                return item.id === id;
            }
        );


    if (!menu) return;


    document.getElementById(
        "specialMenuModalTitle"
    ).textContent = "Edit Special Menu";


    document.getElementById(
        "specialMenuId"
    ).value = menu.id;


    document.getElementById(
        "specialMenuTitle"
    ).value = menu.title;


    document.getElementById(
        "specialMenuDescription"
    ).value = menu.description || "";


    document.getElementById(
        "specialMenuStatus"
    ).value = menu.status;


    document.getElementById(
        "specialMenuImage"
    ).value = "";


    document.getElementById(
        "specialMenuModal"
    ).classList.add("active");
}


// ================================
// TOGGLE ACTIVE / HIDDEN
// ================================

async function toggleSpecialMenu(id) {

    const menu =
        specialMenus.find(
            function(item) {
                return item.id === id;
            }
        );


    if (!menu) return;


    const newStatus =
        menu.status === "Active"
            ? "Hidden"
            : "Active";


    try {

        const response = await fetch(
            `${SPECIAL_MENUS_API_URL}/${id}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );


        if (!response.ok) {

            throw new Error(
                "Could not update status."
            );
        }


        loadSpecialMenus();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}


// ================================
// DELETE SPECIAL MENU
// ================================

async function deleteSpecialMenu(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this special menu?"
        );


    if (!confirmed) return;


    try {

        const response = await fetch(
            `${SPECIAL_MENUS_API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Could not delete special menu."
            );
        }


        alert(
            "Special menu deleted successfully!"
        );


        loadSpecialMenus();

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}


// ================================
// INITIAL LOAD
// ================================

if (
    document.getElementById(
        "specialMenusList"
    )
) {

    loadSpecialMenus();
}