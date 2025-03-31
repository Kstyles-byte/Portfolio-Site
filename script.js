document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    
    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const scrollArrow = document.querySelector('.scroll-arrow');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const contactForm = document.getElementById('contactForm');
    const formGroups = document.querySelectorAll('.form-group');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = successModal.querySelector('.close-modal')
    
    console.log("Scroll indicator found:", !!scrollIndicator);
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.2 });
    timelineItems.forEach(item => {
        // Set initial state
        item.style.opacity = '0';
        item.style.transform = item.classList.contains('right') ? 'translateX(-50px)' : 'translateX(50px)';
        item.style.transition = 'all 0.5s ease';
        // Observe the item
        timelineObserver.observe(item);
    });
    
    let lastScroll = 0;

   

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu when clicking a navigation link
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });

    // Add functionality to scroll arrow - making sure it works on all devices
    if (scrollIndicator) {
        scrollIndicator.style.cursor = 'pointer';
        
        scrollIndicator.addEventListener('click', function() {
            console.log("Scroll indicator clicked");
            // Get the call-to-action section
            const targetSection = document.getElementById('call-to-action');
            
            if (targetSection) {
                console.log("Scrolling to target section");
                targetSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.log("Target section not found, using fallback");
                // Fallback: scroll down 100vh
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            }
        });
        
        // Also add click event to the arrow specifically
        if (scrollArrow) {
            scrollArrow.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent double firing if both are clicked
                console.log("Scroll arrow clicked");
                const targetSection = document.getElementById('call-to-action');
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({
                        top: window.innerHeight,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // Hide/show header on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('hide');
        } else {
            header.classList.remove('hide');
        }
        lastScroll = currentScroll;
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Reset on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
    const patterns = {
        name: /^[a-zA-Z\s]{2,50}$/,
        email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        subject: /^.{2,100}$/,
        message: /^[\s\S]{10,1000}$/
    };
    const errorMessages = {
        name: 'Please enter a valid name (2-50 characters)',
        email: 'Please enter a valid email address',
        subject: 'Subject must be between 2 and 100 characters',
        message: 'Message must be between 10 and 1000 characters'
    };
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const errorSpan = group.querySelector('.error-message');

        input.addEventListener('input', () => {
            validateField(input, errorSpan);
        });

        input.addEventListener('blur', () => {
            validateField(input, errorSpan);
        });
    });
    function validateField(input, errorSpan) {
        const pattern = patterns[input.id];
        const isValid = pattern.test(input.value);

        if (!isValid && input.value !== '') {
            errorSpan.textContent = errorMessages[input.id];
            input.style.borderColor = 'var(--error-color)';
            return false;
        } else {
            errorSpan.textContent = '';
            input.style.borderColor = input.value === '' ? '#e0e0e0' : 'var(--success-color)';
            return true;
        }
    }

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        let isValid = true;
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            const errorSpan = group.querySelector('.error-message');
            if (!validateField(input, errorSpan)) {
                isValid = false;
            }
        });

        if (!isValid) return;
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        try {
            // Prepare form data
            const formData = {
                name: contactForm.querySelector('#name').value,
                email: contactForm.querySelector('#email').value,
                subject: contactForm.querySelector('#subject').value,
                message: contactForm.querySelector('#message').value
            };
            const response = await fetch('/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error submitting form');
            }
            successModal.style.display = 'flex';
            
            // Reset form
            contactForm.reset();
            formGroups.forEach(group => {
                const input = group.querySelector('input, textarea');
                input.style.borderColor = '#e0e0e0';
            });

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Please try again later.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.textContent = originalText;
        }
    });
    closeModalBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

});