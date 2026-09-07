/* =========================================
   AAHELI'S AAHAR
   JavaScript
========================================= */


document.addEventListener("DOMContentLoaded", function () {


    /* ==============================
       MOBILE MENU
    ============================== */

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("open");

    });


    /* Close mobile menu after clicking */

    const navItems = navLinks.querySelectorAll("a");

    navItems.forEach(function (item) {

        item.addEventListener("click", function () {

            navLinks.classList.remove("open");

        });

    });


    /* ==============================
       MENU TABS
    ============================== */

    const menuTabs = document.querySelectorAll(".menu-tab");
    const menuContents = document.querySelectorAll(".menu-content");


    menuTabs.forEach(function (tab) {

        tab.addEventListener("click", function () {

            const target = tab.dataset.menu;


            menuTabs.forEach(function (item) {

                item.classList.remove("active");

            });


            menuContents.forEach(function (content) {

                content.classList.remove("active");

            });


            tab.classList.add("active");

            document
                .getElementById(target)
                .classList.add("active");

        });

    });


    /* ==============================
       JEWELLERY COMING SOON
    ============================== */

    const jewelleryBtn = document.getElementById("jewelleryBtn");

    jewelleryBtn.addEventListener("click", function (event) {

        event.preventDefault();

        alert("Jewellery section coming soon! ✨");

    });


    /* ==============================
       FOOTER YEAR
    ============================== */

    document.getElementById("year").textContent =
        new Date().getFullYear();

});

/* =========================================
   DATABASE MENU INTEGRATION
========================================= */

const MENU_API_URL =
    `http://${window.location.hostname}:5000/api/menu`;


/* =========================================
   LOAD MENU FROM DATABASE
========================================= */

async function loadPublicMenu() {

    try {

        const response = await fetch(MENU_API_URL);

        if (!response.ok) {
            throw new Error("Could not load menu.");
        }

        const items = await response.json();

        renderPublicMenu(items);

    } catch (error) {

        console.error("PUBLIC MENU ERROR:", error);

    }

}


/* =========================================
   SHOPPING CART
========================================= */

let cart = [];


/* ADD ITEM TO CART */

function addToCart(id, name, price) {

    const existingItem = cart.find(function(item) {
        return item.id === id;
    });

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            id: id,
            name: name,
            price: Number(price),
            quantity: 1
        });

    }

    updateCart();

}


/* REMOVE ITEM */

function decreaseCartItem(id) {

    const item = cart.find(function(item) {
        return item.id === id;
    });

    if (!item) return;

    item.quantity -= 1;

    if (item.quantity <= 0) {

        cart = cart.filter(function(cartItem) {
            return cartItem.id !== id;
        });

    }

    updateCart();

}


/* INCREASE ITEM */

function increaseCartItem(id) {

    const item = cart.find(function(item) {
        return item.id === id;
    });

    if (!item) return;

    item.quantity += 1;

    updateCart();

}


/* REMOVE COMPLETELY */

function removeCartItem(id) {

    cart = cart.filter(function(item) {
        return item.id !== id;
    });

    updateCart();

}


/* UPDATE CART */

function updateCart() {

    const cartList =
        document.getElementById("cartItems");

    const cartCount =
        document.getElementById("cartCount");

    const cartTotal =
        document.getElementById("cartTotal");

    const hiddenItems =
        document.getElementById("orderItems");

    const hiddenTotal =
        document.getElementById("orderTotal");


    if (!cartList) return;


    if (cart.length === 0) {

        cartList.innerHTML = `
            <div class="empty-cart">
                🛒 Your cart is empty.
                <br>
                Add something delicious from the menu!
            </div>
        `;

    } else {

        cartList.innerHTML = cart.map(function(item) {

            const itemTotal =
                item.price * item.quantity;

            return `
                <div class="cart-item">

                    <div class="cart-item-info">

                        <strong>
                            ${escapePublicHTML(item.name)}
                        </strong>

                        <span>
                            ₹${item.price.toFixed(0)} each
                        </span>

                    </div>


                    <div class="cart-item-actions">

                        <button
                            type="button"
                            onclick="decreaseCartItem(${item.id})"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            onclick="increaseCartItem(${item.id})"
                        >
                            +
                        </button>

                        <strong class="cart-item-total">
                            ₹${itemTotal.toFixed(0)}
                        </strong>

                        <button
                            type="button"
                            class="cart-remove-btn"
                            onclick="removeCartItem(${item.id})"
                            title="Remove"
                        >
                            ×
                        </button>

                    </div>

                </div>
            `;

        }).join("");

    }


    /* TOTAL */

    let total = 0;
    let count = 0;

    cart.forEach(function(item) {

        total += item.price * item.quantity;

        count += item.quantity;

    });


    if (cartCount) {
        cartCount.textContent = count;
    }


    if (cartTotal) {
        cartTotal.textContent =
            `₹${total.toFixed(0)}`;
    }


    /* PREPARE ORDER DATA */

    const orderText = cart.map(function(item) {

        return `${item.name} x ${item.quantity}`;

    }).join(", ");


    if (hiddenItems) {
        hiddenItems.value = orderText;
    }


    if (hiddenTotal) {
        hiddenTotal.value = total;
    }

}


/* =========================================
   RENDER MENU
========================================= */

function renderPublicMenu(items) {

    const lunchItems = items.filter(function(item) {

        return item.category === "lunch" &&
               Number(item.available) === 1;

    });


    const canteenItems = items.filter(function(item) {

        return item.category === "canteen" &&
               Number(item.available) === 1;

    });


    const dinnerItems = items.filter(function(item) {

        return item.category === "dinner" &&
               Number(item.available) === 1;

    });


    const lunchList =
        document.getElementById("publicLunchList");

    const canteenList =
        document.getElementById("publicCanteenList");

    const dinnerList =
        document.getElementById("publicDinnerList");


    /* =========================
       LUNCH
    ========================= */

    if (lunchList) {

        if (!lunchItems.length) {

            lunchList.innerHTML = `
                <span>
                    Lunch menu currently unavailable.
                </span>
            `;

        } else {

            lunchList.innerHTML =
                lunchItems.map(function(item) {

                    return `
                        <div class="public-menu-item">

                            <div class="public-menu-info">

                                <strong>
                                    ${escapePublicHTML(item.name)}
                                </strong>

                                ${
                                    item.description
                                    ? `
                                        <small>
                                            ${escapePublicHTML(item.description)}
                                        </small>
                                      `
                                    : ""
                                }

                                <span class="menu-price">
                                    ₹${Number(item.price).toFixed(0)}
                                </span>

                            </div>


                            <button
                                type="button"
                                class="add-cart-btn"
                                onclick="addToCart(
                                    ${item.id},
                                    '${escapePublicHTML(item.name).replace(/'/g, "\\'")}',
                                    ${Number(item.price)}
                                )"
                            >
                                + Add to Cart
                            </button>

                        </div>
                    `;

                }).join("");

        }

    }


    /* =========================
       OFFICE CANTEEN
    ========================= */

    if (canteenList) {

        if (!canteenItems.length) {

            canteenList.innerHTML = `
                <p>
                    Office canteen menu currently unavailable.
                </p>
            `;

        } else {

            canteenList.innerHTML =
                canteenItems.map(function(item) {

                    return `
                        <div class="food-card">

                            <div class="food-info">

                                <h3>
                                    ${escapePublicHTML(item.name)}
                                </h3>

                                ${
                                    item.description
                                    ? `
                                        <p>
                                            ${escapePublicHTML(item.description)}
                                        </p>
                                      `
                                    : ""
                                }

                                <strong>
                                    ₹${Number(item.price).toFixed(0)}
                                </strong>

                                <button
                                    type="button"
                                    class="add-cart-btn"
                                    onclick="addToCart(
                                        ${item.id},
                                        '${escapePublicHTML(item.name).replace(/'/g, "\\'")}',
                                        ${Number(item.price)}
                                    )"
                                >
                                    + Add to Cart
                                </button>

                            </div>

                        </div>
                    `;

                }).join("");

        }

    }


    /* =========================
       DINNER
    ========================= */

    if (dinnerList) {

        if (!dinnerItems.length) {

            dinnerList.innerHTML = `
                <div class="food-item">
                    <span>
                        Dinner menu currently unavailable.
                    </span>
                </div>
            `;

        } else {

            dinnerList.innerHTML =
                dinnerItems.map(function(item) {

                    return `
                        <div class="food-item">

                            <div>

                                <span>
                                    ${escapePublicHTML(item.name)}
                                </span>

                                ${
                                    item.description
                                    ? `
                                        <small>
                                            ${escapePublicHTML(item.description)}
                                        </small>
                                      `
                                    : ""
                                }

                            </div>


                            <div class="dinner-order-area">

                                <strong>
                                    ₹${Number(item.price).toFixed(0)}
                                </strong>

                                <button
                                    type="button"
                                    class="add-cart-btn"
                                    onclick="addToCart(
                                        ${item.id},
                                        '${escapePublicHTML(item.name).replace(/'/g, "\\'")}',
                                        ${Number(item.price)}
                                    )"
                                >
                                    + Add
                                </button>

                            </div>

                        </div>
                    `;

                }).join("");

        }

    }


    /* INITIAL CART */

    updateCart();

}


/* =========================================
   SECURITY HELPER
========================================= */

function escapePublicHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


/* =========================================
   START
========================================= */

loadPublicMenu();

/* =========================================
   PUBLIC SPECIAL MENUS
========================================= */

const PUBLIC_SPECIAL_MENUS_API_URL =
    `http://${window.location.hostname}:5000/api/special-menus`;


async function loadPublicSpecialMenus() {

    const list =
        document.getElementById("publicSpecialMenusList");

    if (!list) return;

    try {

        const response =
            await fetch(PUBLIC_SPECIAL_MENUS_API_URL);

        if (!response.ok) {
            throw new Error("Could not load special menus.");
        }

        const menus =
            await response.json();

        renderPublicSpecialMenus(menus);

    } catch (error) {

        console.error(
            "PUBLIC SPECIAL MENU ERROR:",
            error
        );

        list.innerHTML = `
            <div class="occasion-card">
                <div class="occasion-content">
                    <h4 class="occasion-description">
                        Special menus are currently unavailable.
                    </h4>
                </div>
            </div>
        `;

    }

}


function renderPublicSpecialMenus(menus) {

    const list =
        document.getElementById("publicSpecialMenusList");

    if (!list) return;


    /* Show only Active menus */

    const activeMenus =
        menus.filter(function(menu) {

            return menu.status === "Active";

        });


    if (!activeMenus.length) {

        list.innerHTML = `
            <div class="occasion-card">

                <div class="occasion-content">

                    <h4 class="occasion-description">
                        No special menus available right now.
                    </h4>

                </div>

            </div>
        `;

        return;

    }


    list.innerHTML =
        activeMenus.map(function(menu) {

            return `
                <article class="occasion-card">

                    <div class="occasion-image">

                        <img
                            src="${menu.image_url}"
                            alt="${escapePublicHTML(menu.title)}"
                        >

                    </div>


                    <div class="occasion-content">

                        <h4 class="occasion-description">

                            ${escapePublicHTML(menu.title)}

                        </h4>


                        ${
                            menu.description
                            ? `
                                <p>
                                    ${escapePublicHTML(
                                        menu.description
                                    )}
                                </p>
                              `
                            : ""
                        }


                        <div class="preorder-box">

                            <strong>
                                Pre-order 1–2 days before
                            </strong>

                            <p>
                                Limited special-menu orders.
                            </p>

                        </div>


                        <div class="occasion-contact">

                            <a href="tel:+918902255928">
                                📞 8902255928
                            </a>

                            <span>/</span>

                            <a href="tel:+918284067220">
                                8284067220
                            </a>

                        </div>


                        <a
                            href="tel:+918902255928"
                            class="primary-button"
                        >
                            Order Now
                        </a>

                    </div>

                </article>
            `;

        }).join("");

}


/* =========================================
   START SPECIAL MENUS
========================================= */

loadPublicSpecialMenus();

/* =========================================
   CUSTOMER ORDER SUBMISSION
========================================= */

const CUSTOMER_ORDERS_API_URL =
    `http://${window.location.hostname}:5000/api/orders`;

const customerOrderForm =
    document.getElementById("customerOrderForm");


if (customerOrderForm) {

    customerOrderForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const message =
                document.getElementById("orderMessage");


            const customerName =
                document.getElementById("customerName")
                    .value
                    .trim();


            const customerPhone =
                document.getElementById("customerPhone")
                    .value
                    .trim();


            const customerAddress =
                document.getElementById("customerAddress")
                    .value
                    .trim();


            const orderItems =
                document.getElementById("orderItems")
                    .value
                    .trim();


            const orderTotal =
                Number(
                    document.getElementById("orderTotal")
                        .value
                );


            if (
                !customerName ||
                !customerPhone ||
                !customerAddress ||
                !orderItems ||
                !orderTotal
            ) {

                message.textContent =
                    "Please fill in all the order details.";

                message.style.color =
                    "#b45c32";

                return;

            }


            const submitButton =
                customerOrderForm.querySelector(
                    ".order-submit-btn"
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "Placing Order...";

            message.textContent = "";


            try {

                const response =
                    await fetch(
                        CUSTOMER_ORDERS_API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                customer_name:
                                    customerName,

                                phone:
                                    customerPhone,

                                address:
                                    customerAddress,

                                items:
                                    orderItems,

                                total:
                                    orderTotal

                            })
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Could not place order."
                    );

                }


                message.textContent =
                    "Order placed successfully! We will contact you shortly.";

                message.style.color =
                    "#386536";


                customerOrderForm.reset();


            } catch (error) {

                console.error(
                    "ORDER SUBMISSION ERROR:",
                    error
                );


                message.textContent =
                    error.message ||
                    "Could not connect to the backend.";

                message.style.color =
                    "#b45c32";


            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Place Order";

            }

        }
    );

}