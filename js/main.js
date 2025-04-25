/**
 * Yusuf Akın - Portfolio
 * Main JavaScript File
 */

// DOM Elements
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('header');
const backToTopBtn = document.getElementById('backToTop');
const skillFilters = document.querySelectorAll('.skill-filter');
const skillCards = document.querySelectorAll('.skill-card');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const currentYearElement = document.getElementById('currentYear');
const aboutSection = document.getElementById('about');
const aboutContent = document.querySelector('.about-content');

// Ensure About section is visible
function showAboutSection() {
    if (aboutSection) {
        aboutSection.style.display = 'block';
        aboutSection.style.opacity = '1';
        aboutSection.style.visibility = 'visible';
    }
    
    if (aboutContent) {
        aboutContent.style.opacity = '1';
        aboutContent.style.visibility = 'visible';
        aboutContent.style.transform = 'translateY(0)';
        
        // Make sure all children are visible too
        const aboutChildren = aboutContent.querySelectorAll('*');
        aboutChildren.forEach(child => {
            child.style.opacity = '1';
            child.style.visibility = 'visible';
            child.style.transform = 'translateY(0)';
        });
    }
}

// Call immediately and also on DOMContentLoaded
showAboutSection();

// Force load all project images when page loads immediately
forceLoadProjectImages();

// Also try again when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    forceLoadProjectImages();
});

// Final attempt on full page load
window.addEventListener('load', () => {
    forceLoadProjectImages();
});

/**
 * Force load all project images to ensure they display without refresh
 */
function forceLoadProjectImages() {
    // Get all project card images
    const projectImages = document.querySelectorAll('.project-card .project-img img, .project-showcase img');
    
    // Force load each image with cache busting
    projectImages.forEach(img => {
        const imgSrc = img.getAttribute('src');
        if (imgSrc) {
            // Create a new image to force loading
            const tempImg = new Image();
            
            // Set onload handler to update the actual image
            tempImg.onload = function() {
                img.src = this.src;
                img.style.opacity = '1';
                
                // Fix potential image path issues
                if (this.src.includes('.png') && img.src.includes('.jpg')) {
                    img.src = img.src.replace('.jpg', '.png');
                }
                if (this.src.includes('.jpeg') && img.src.includes('.jpg')) {
                    img.src = img.src.replace('.jpg', '.jpeg');
                }
            };
            
            // Also set direct attributes to force browser to load
            img.style.opacity = '1';
            const newSrc = imgSrc.includes('?') ? imgSrc : imgSrc + '?t=' + new Date().getTime();
            img.setAttribute('src', newSrc);
            
            // Start loading the image with cache busting
            tempImg.src = newSrc;
            
            // Add error handler for fallback extension
            img.onerror = function() {
                // If .png fails, try .jpg
                if (this.src.includes('.png')) {
                    this.src = this.src.replace('.png', '.jpg');
                }
                // If .jpg fails, try .jpeg
                else if (this.src.includes('.jpg') && !this.src.includes('.jpeg')) {
                    this.src = this.src.replace('.jpg', '.jpeg');
                }
            };
        }
    });
}

// Set current year in footer
currentYearElement.textContent = new Date().getFullYear();

// Mobile Menu Toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        
        // If clicked on About link, ensure it's visible
        if (link.getAttribute('href') === '#about') {
            showAboutSection();
        }
    });
});

// Add active class to nav items on scroll
window.addEventListener('scroll', () => {
    // Header background on scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Back to Top button visibility
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('active');
    } else {
        backToTopBtn.classList.remove('active');
    }
    
    // Make sure About section is always visible when scrolled to
    const aboutTop = aboutSection ? aboutSection.offsetTop : 0;
    const aboutHeight = aboutSection ? aboutSection.clientHeight : 0;
    if (window.scrollY >= aboutTop - 300 && window.scrollY <= aboutTop + aboutHeight) {
        showAboutSection();
    }
    
    // Active nav link based on scroll position
    let scrollPosition = window.scrollY + 100;
    
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Back to Top Button
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Skills Filtering
skillFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        // Remove active class from all filters
        skillFilters.forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked filter
        filter.classList.add('active');
        
        // Get filter value
        const filterValue = filter.getAttribute('data-filter');
        
        // Filter skills
        skillCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                
                // Add animation
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Animate skill bars on scroll
const animateSkillBars = () => {
    const skillsSection = document.getElementById('skills');
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const sectionPosition = skillsSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    
    if (sectionPosition < screenPosition) {
        skillBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
        
        // Remove the event listener once the animation is triggered
        window.removeEventListener('scroll', animateSkillBars);
    }
};

window.addEventListener('scroll', animateSkillBars);

// Form Submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate form submission (replace with actual form submission)
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gönderiliyor...';
    
    setTimeout(() => {
        // Hide form and show success message
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        
        // Reset form
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        
        // Hide success message after 3 seconds and show form again
        setTimeout(() => {
            formSuccess.style.display = 'none';
            contactForm.style.display = 'block';
        }, 3000);
    }, 1500);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add .active class to the first navigation link
    navLinks[0].classList.add('active');
    
    // Ensure project links preload images when clicked
    initProjectLinks();
    
    // Check if we should show About section due to navigation from another page
    if (sessionStorage.getItem('showAboutSection') === 'true') {
        showAboutSection();
        
        // If the URL has #about hash, smooth scroll to it
        if (window.location.hash === '#about') {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                setTimeout(() => {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Set active nav link
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#about') {
                            link.classList.add('active');
                        }
                    });
                }, 100);
            }
        }
        
        // Clear the flag
        sessionStorage.removeItem('showAboutSection');
    }
    
    // Ensure about section is visible
    showAboutSection();

    // Animate elements when they come into view, except About section
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Skip about section elements
                if (entry.target.closest('#about')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                } else {
                    entry.target.classList.add('fade-in');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add observer to section headers and project cards, NOT about content
    document.querySelectorAll('.section-header, .project-card').forEach(element => {
        // Skip elements in the about section
        if (!element.closest('#about')) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(element);
        }
    });

    // Add class to observed elements for animation
    document.addEventListener('animationend', (e) => {
        if (e.target.classList.contains('fade-in')) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });

    // Parallax effect for floating elements
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        document.querySelectorAll('.floating-element').forEach(element => {
            const speed = element.getAttribute('data-speed') || 1;
            const x = mouseX * 30 * speed;
            const y = mouseY * 30 * speed;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
});

/**
 * Initialize project links to ensure images load properly when navigating to project pages
 */
function initProjectLinks() {
    const projectLinks = document.querySelectorAll('a.project-link.demo');
    
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const projectUrl = link.getAttribute('href');
            
            // Start preloading images for the project
            preloadProjectPage(projectUrl);
        });
    });
}

/**
 * Preload project page images before navigation
 */
function preloadProjectPage(url) {
    // Set a flag to indicate preloading
    sessionStorage.setItem('preloadingProject', 'true');
    
    // Extract project name from URL
    const projectName = url.split('/').pop().split('.')[0];
    
    // Try all common image paths with different extensions
    const possibleImagePaths = [
        `../images/projects/${projectName}/`,
        `images/projects/${projectName}/`
    ];
    
    const possibleImageNames = [
        'cover', 'dashboard', 'anasayfa', 'images', 'main', 
        'sayfa1', 'sayfa2', 'sayfa3', 'sayfa4', 'sayfa5',
        'screen1', 'screen2', 'screen3', 'screen4', 'screen5',
        'screenshot1', 'screenshot2', 'screenshot3',
        'login', 'profile', 'settings', 'details', 'feature'
    ];
    
    const extensions = ['.jpg', '.jpeg', '.png'];
    
    // Create all possible combinations of paths
    const imagesToPreload = [];
    
    possibleImagePaths.forEach(path => {
        possibleImageNames.forEach(name => {
            extensions.forEach(ext => {
                imagesToPreload.push(path + name + ext);
            });
        });
    });
    
    // Preload each image
    imagesToPreload.forEach(imgSrc => {
        const img = new Image();
        img.src = imgSrc;
        
        // Handle potential error by trying alternative extensions
        img.onerror = function() {
            if (this.src.includes('.png')) {
                this.src = this.src.replace('.png', '.jpg');
            } else if (this.src.includes('.jpg') && !this.src.includes('.jpeg')) {
                this.src = this.src.replace('.jpg', '.jpeg');
            }
        };
    });
    
    // Set up a flag to force reload images when the project page loads
    sessionStorage.setItem('forceReloadProjectImages', 'true');
} 