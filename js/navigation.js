// Navigation Menu Functionality
(function() {
  'use strict';

  // Close mobile menu when a nav link is clicked
  document.addEventListener('DOMContentLoaded', function() {
    const navbarCollapse = document.getElementById('navbarResponsive');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');

    if (navLinks && navLinks.length > 0 && navbarCollapse && navbarToggler) {
      navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
          // Check if menu is expanded
          if (navbarCollapse.classList.contains('show')) {
            // Trigger Bootstrap's collapse to close the menu
            navbarToggler.click();
          }
        });
      });
    }
  });
})();
