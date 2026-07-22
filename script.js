/**
 * Mobile Navigation Toggle
 */
function toggleMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburgerIcon = document.getElementById("hamburger-icon");
  const closeIcon = document.getElementById("close-icon");
  const menuBtn = document.querySelector(".mobile-menu-btn");

  if (mobileMenu && hamburgerIcon && closeIcon) {
    const isOpen = mobileMenu.classList.toggle("active");
    hamburgerIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }
}

/**
 * Header Scroll Effect (theme-aware)
 */
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (header) {
    const style = getComputedStyle(document.documentElement);
    if (window.scrollY > 50) {
      header.style.boxShadow = style.getPropertyValue("--header-shadow").trim();
      header.style.background = style.getPropertyValue("--header-bg-scroll").trim();
    } else {
      header.style.boxShadow = "none";
      header.style.background = style.getPropertyValue("--header-bg").trim();
    }
  }
});

/**
 * Theme Toggle
 * Persists user choice in localStorage, respects system preference on first visit.
 */
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  // Reset inline header styles so CSS variables take effect immediately
  const header = document.querySelector(".header");
  if (header) {
    header.style.boxShadow = "";
    header.style.background = "";
  }
}

// Initialize theme on page load (before DOMContentLoaded to prevent flash)
(function () {
  const saved = localStorage.getItem("theme");
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    document.documentElement.setAttribute("data-theme", "light");
  }
  // else default is dark (no data-theme attribute needed)
})();

/**
 * Contact Form Submission Handler
 * (Add your custom backend fetch logic here when ready)
 */
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value,
      };

      fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (response.ok && data.success) {
            alert(data.message || "Thank you! Your message has been sent successfully.");
            contactForm.reset();
          } else {
            alert(data.message || "Failed to send email. Make sure server.js is running.");
          }
        })
        .catch((error) => {
          console.error("Error submitting form:", error);
          alert("Unable to reach backend server. Please make sure node server.js is running.");
        })
        .finally(() => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        });
    });
  }
});

/**
 * Profile Photo Lightbox
 */
function openProfileLightbox(event) {
  event.preventDefault();
  event.stopPropagation();
  const lightbox = document.getElementById("profileLightbox");
  if (lightbox) {
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeProfileLightbox() {
  const lightbox = document.getElementById("profileLightbox");
  if (lightbox) {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Close lightbox on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProfileLightbox();
  }
});

// Attach click handler to all logo images
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".logo-img").forEach((img) => {
    img.addEventListener("click", openProfileLightbox);
  });
});
