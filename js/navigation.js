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
        link.addEventListener('click', function(e) {
          // Check if menu is expanded (visible on mobile)
          if (window.getComputedStyle(navbarToggler).display !== 'none') {
            // Only close if the menu is currently open
            if (navbarCollapse.classList.contains('show')) {
              // Use Bootstrap's collapse method if available
              if (typeof $ !== 'undefined' && $.fn.collapse) {
                $(navbarCollapse).collapse('hide');
              } else {
                // Fallback: trigger the toggler button
                navbarToggler.click();
              }
            }
          }
        });
      });
    }

    // Prevent menu from staying open when resizing from mobile to desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // If viewport is desktop size and menu is open, close it
        if (window.innerWidth >= 992 && navbarCollapse && navbarCollapse.classList.contains('show')) {
          if (typeof $ !== 'undefined' && $.fn.collapse) {
            $(navbarCollapse).collapse('hide');
          } else {
            navbarCollapse.classList.remove('show');
          }
        }
      }, 250);
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', function(event) {
      const navbar = document.getElementById('mainNav');
      const isClickInside = navbar && navbar.contains(event.target);
      
      if (!isClickInside && navbarCollapse && navbarCollapse.classList.contains('show')) {
        // Only close on mobile
        if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
          if (typeof $ !== 'undefined' && $.fn.collapse) {
            $(navbarCollapse).collapse('hide');
          } else {
            navbarToggler.click();
          }
        }
      }
    });
  });
})();
