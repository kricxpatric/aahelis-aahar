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

