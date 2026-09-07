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


    /* LUNCH */

    if (lunchList) {

        if (!lunchItems.length) {

            lunchList.innerHTML = `
                <span>Lunch menu currently unavailable.</span>
            `;

        } else {

            lunchList.innerHTML = lunchItems.map(function(item) {

                return `
                    <span>
                        ${escapePublicHTML(item.name)}

                        ${
                            item.description
                            ? `
                                <small>
                                    ${escapePublicHTML(item.description)}
                                </small>
                              `
                            : ""
                        }
                    </span>

                    <strong>
                        ₹${Number(item.price).toFixed(0)} / plate
                    </strong>
                `;

            }).join("");

        }

    }


    /* OFFICE CANTEEN */

    if (canteenList) {

        if (!canteenItems.length) {

            canteenList.innerHTML = `
                <p>Office canteen menu currently unavailable.</p>
            `;

        } else {

            canteenList.innerHTML = canteenItems.map(function(item) {

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

                        </div>

                    </div>
                `;

            }).join("");

        }

    }


    /* DINNER */

    if (dinnerList) {

        if (!dinnerItems.length) {

            dinnerList.innerHTML = `
                <div class="food-item">
                    <span>Dinner menu currently unavailable.</span>
                </div>
            `;

        } else {

            dinnerList.innerHTML = dinnerItems.map(function(item) {

                return `
                    <div class="food-item">

                        <span>
                            ${escapePublicHTML(item.name)}

                            ${
                                item.description
                                ? `
                                    <small>
                                        ${escapePublicHTML(item.description)}
                                    </small>
                                  `
                                : ""
                            }
                        </span>

                        <strong>
                            ₹${Number(item.price).toFixed(0)}
                        </strong>

                    </div>
                `;

            }).join("");

        }

    }

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

