// Navigation Menu Functionality
(function() {
  'use strict';

  // Close mobile menu when a nav link is clicked
  document.addEventListener('DOMContentLoaded', function() {
    const navbarCollapse = document.getElementById('navbarResponsive');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const mainNav = document.getElementById('mainNav');

    function getOffsetTop(el) {
      const navHeight = mainNav ? mainNav.offsetHeight : 80;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Add a small cushion for spacing below navbar
      return rect.top + scrollTop - (navHeight + 12);
    }

    if (navLinks && navLinks.length > 0 && navbarCollapse && navbarToggler) {
      navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
          // Smooth-scroll for in-page anchors with offset
          const href = link.getAttribute('href') || '';
          if (href.startsWith('#') && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
              e.preventDefault();
              window.scrollTo({ top: getOffsetTop(target), behavior: 'smooth' });
            }
          }
          // Check if menu is expanded
          if (navbarCollapse.classList.contains('show')) {
            // Trigger Bootstrap's collapse to close the menu
            navbarToggler.click();
          }
        });
      });
    }

    // If landing on a hash (direct link), adjust initial position
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        // Delay to ensure layout is settled before scrolling
        setTimeout(function() {
          window.scrollTo({ top: getOffsetTop(target), behavior: 'auto' });
        }, 50);
      }
    }

    document.querySelectorAll('.copyright-year').forEach(function(el) {
      el.textContent = new Date().getFullYear();
    });
  });
})();
