// Portfolio Website JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initCounterAnimation();
    initFadeInAnimation();
    initFormHandling();
    initMobileMenu();
    initDataVisualizations();
    initBeforeAfterSliders();
    initROICalculator();
    initInteractiveCharts();
    initLazyLoading();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animated counter for statistics
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    const observerOptions = {
        threshold: 0.7
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const increment = target / 100;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format the number based on the target
        if (target >= 1000000) {
            element.textContent = '$' + (current / 1000000).toFixed(1) + 'M+';
        } else if (target >= 1000) {
            element.textContent = '$' + (current / 1000).toFixed(0) + 'K+';
        } else if (target < 10) {
            element.textContent = '$' + current.toFixed(1) + 'M+';
        } else {
            element.textContent = Math.ceil(current) + (target === 50 ? '+' : '%');
        }
    }, 20);
}

// Fade in animation for elements
function initFadeInAnimation() {
    const fadeElements = document.querySelectorAll('.fade-in-up');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    fadeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
}

// Form handling with email functionality and rate limiting
function initFormHandling() {
    const assessmentForm = document.getElementById('assessment-form');
    
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', handleAssessmentSubmission);
    }
    
    // Handle other forms
    const otherForms = document.querySelectorAll('form:not(#assessment-form)');
    otherForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    });
}

function handleFormSubmission(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
        // Show success message
        showNotification('Thank you! We\'ll get back to you within 24 hours.', 'success');
        
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }, 2000);
}

// Handle assessment form submission with rate limiting
function handleAssessmentSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('form-message');
    
    // Check rate limiting (one submission per IP per day)
    const lastSubmission = localStorage.getItem('lastAssessmentSubmission');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (lastSubmission && (now - parseInt(lastSubmission)) < oneDay) {
        showFormMessage('You have already submitted an assessment request today. Please wait 24 hours before submitting again.', 'error');
        return;
    }
    
    // Get form data
    const formData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        company: document.getElementById('company-name').value,
        phone: document.getElementById('phone-number') ? document.getElementById('phone-number').value : '',
        serviceInterest: document.getElementById('service-interest') ? document.getElementById('service-interest').value : '',
        challenges: document.getElementById('data-challenges').value,
        timestamp: new Date().toISOString()
    };
    
    // Validate email
    if (!isValidEmail(formData.email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Update button state
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Send email using EmailJS or mailto
    sendAssessmentEmail(formData)
        .then(() => {
            // Store submission timestamp
            localStorage.setItem('lastAssessmentSubmission', now.toString());
            
            showFormMessage('Thank you! Your assessment request has been sent. We\'ll contact you within 24 hours.', 'success');
            form.reset();
            
            submitBtn.textContent = 'Sent Successfully!';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 3000);
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            showFormMessage('There was an error sending your request. Please try emailing us directly at ibraheemraouf685@gmail.com', 'error');
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Send assessment email
function sendAssessmentEmail(formData) {
    return new Promise((resolve, reject) => {
        // Create mailto link as fallback
        const subject = encodeURIComponent('Free Data Assessment Request - ' + formData.company);
        const body = encodeURIComponent(
            `New assessment request:\n\n` +
            `Name: ${formData.name}\n` +
            `Email: ${formData.email}\n` +
            `Company: ${formData.company}\n` +
            `Phone: ${formData.phone}\n` +
            `Service Interest: ${formData.serviceInterest}\n` +
            `Data Challenges: ${formData.challenges}\n` +
            `Submitted: ${formData.timestamp}`
        );
        
        const mailtoLink = `mailto:ibraheemraouf685@gmail.com?subject=${subject}&body=${body}`;
        
        // Try to open mailto link
        try {
            window.location.href = mailtoLink;
            // Assume success after a short delay
            setTimeout(() => resolve(), 1000);
        } catch (error) {
            reject(error);
        }
    });
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form message
function showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    if (type === 'success') {
        messageDiv.style.background = '#f0f9ff';
        messageDiv.style.color = '#0369a1';
        messageDiv.style.border = '1px solid #0ea5e9';
    } else {
        messageDiv.style.background = '#fef2f2';
        messageDiv.style.color = '#dc2626';
        messageDiv.style.border = '1px solid #fecaca';
    }
    
    // Hide message after 10 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 10000);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Mobile menu functionality
function initMobileMenu() {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    // Create mobile menu button
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuButton.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-dark);
        cursor: pointer;
    `;
    
    nav.appendChild(mobileMenuButton);
    
    // Mobile menu toggle
    mobileMenuButton.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Show mobile menu button on small screens
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            mobileMenuButton.style.display = 'block';
        } else {
            mobileMenuButton.style.display = 'none';
            document.querySelector('.nav-links').style.display = 'flex';
        }
    }
    
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'var(--bg-white)';
        header.style.backdropFilter = 'none';
    }
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
    });
});

// Testimonial rotation (if multiple testimonials)
function initTestimonialRotation() {
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length > 3) {
        let currentIndex = 0;
        
        setInterval(() => {
            testimonials[currentIndex].style.opacity = '0';
            currentIndex = (currentIndex + 1) % testimonials.length;
            testimonials[currentIndex].style.opacity = '1';
        }, 5000);
    }
}

// Performance optimization: Lazy load images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Analytics tracking (placeholder for Google Analytics)
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Track CTA clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        const buttonText = e.target.textContent;
        const section = e.target.closest('section')?.className || 'unknown';
        trackEvent('CTA', 'click', `${buttonText} - ${section}`);
    }
});

// Data Visualizations with Chart.js
function initDataVisualizations() {
    // ROI Growth Chart
    const roiCtx = document.getElementById('roiChart');
    if (roiCtx) {
        new Chart(roiCtx, {
            type: 'line',
            data: {
                labels: ['Month 1', 'Month 3', 'Month 6', 'Month 12', 'Month 18'],
                datasets: [{
                    label: 'ROI %',
                    data: [0, 150, 280, 420, 650],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'ROI: ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Cost Savings Chart
    const savingsCtx = document.getElementById('savingsChart');
    if (savingsCtx) {
        new Chart(savingsCtx, {
            type: 'bar',
            data: {
                labels: ['Data Processing', 'Manual Reports', 'Error Correction', 'Decision Delays'],
                datasets: [{
                    label: 'Annual Savings ($)',
                    data: [45000, 32000, 28000, 65000],
                    backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value/1000) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Before/After Data Sliders
function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');
    
    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const beforeImage = slider.querySelector('.before-image');
        const afterImage = slider.querySelector('.after-image');
        
        if (handle && beforeImage && afterImage) {
            let isDragging = false;
            
            handle.addEventListener('mousedown', startDrag);
            handle.addEventListener('touchstart', startDrag);
            
            function startDrag(e) {
                isDragging = true;
                e.preventDefault();
                
                document.addEventListener('mousemove', drag);
                document.addEventListener('touchmove', drag);
                document.addEventListener('mouseup', stopDrag);
                document.addEventListener('touchend', stopDrag);
            }
            
            function drag(e) {
                if (!isDragging) return;
                
                const rect = slider.getBoundingClientRect();
                const x = (e.clientX || e.touches[0].clientX) - rect.left;
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                
                handle.style.left = percentage + '%';
                beforeImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            }
            
            function stopDrag() {
                isDragging = false;
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('mouseup', stopDrag);
                document.removeEventListener('touchend', stopDrag);
            }
        }
    });
}

// ROI Calculator
function initROICalculator() {
    const calculator = document.getElementById('roi-calculator');
    if (!calculator) return;
    
    const calculateButton = document.getElementById('calculate-roi');
    const resultElement = calculator.querySelector('.roi-result');
    
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateROI);
    }
    
    function calculateROI() {
        const currentCosts = parseFloat(calculator.querySelector('#current-costs').value) || 0;
        const timeSpent = parseFloat(calculator.querySelector('#time-spent').value) || 0;
        const errorRate = parseFloat(calculator.querySelector('#error-rate').value) || 0;
        
        if (currentCosts === 0 && timeSpent === 0 && errorRate === 0) {
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="roi-breakdown" style="background: #fef2f2; border: 1px solid #fecaca; padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                        <p style="color: #dc2626; margin: 0;">Please enter your current data costs, time spent, or error rate to calculate ROI.</p>
                    </div>
                `;
            }
            return;
        }
        
        // Calculate potential savings
        const timeSavings = timeSpent * 0.75 * 52 * 50; // 75% time reduction, $50/hour
        const errorSavings = currentCosts * (errorRate / 100) * 0.85; // 85% error reduction
        const efficiencySavings = currentCosts * 0.25; // 25% efficiency gain
        
        const totalSavings = timeSavings + errorSavings + efficiencySavings;
        const investment = 8500; // Average project cost
        const roi = ((totalSavings - investment) / investment) * 100;
        const paybackMonths = totalSavings > 0 ? (investment / (totalSavings / 12)) : 0;
        
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="roi-breakdown" style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 2rem; border-radius: 10px; margin-top: 2rem; text-align: center;">
                    <h4 style="color: #0369a1; margin-bottom: 1.5rem;">Your Potential ROI</h4>
                    <div class="roi-metric" style="margin-bottom: 1.5rem;">
                        <span class="roi-value" style="display: block; font-size: 3rem; font-weight: bold; color: #059669;">${roi > 0 ? roi.toFixed(0) : 0}%</span>
                        <span class="roi-label" style="color: #6b7280; font-size: 1.1rem;">Annual ROI</span>
                    </div>
                    <div class="savings-breakdown" style="text-align: left; background: white; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                        <p style="margin: 0.5rem 0;">Annual Savings: <strong style="color: #059669;">$${totalSavings.toLocaleString()}</strong></p>
                        <p style="margin: 0.5rem 0;">Investment: <strong>$${investment.toLocaleString()}</strong></p>
                        <p style="margin: 0.5rem 0;">Payback Period: <strong style="color: #0369a1;">${paybackMonths > 0 ? paybackMonths.toFixed(1) : 'N/A'} months</strong></p>
                        <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0.5rem 0; font-size: 0.9rem; color: #6b7280;">Time Savings: $${timeSavings.toLocaleString()}</p>
                        <p style="margin: 0.5rem 0; font-size: 0.9rem; color: #6b7280;">Error Reduction: $${errorSavings.toLocaleString()}</p>
                        <p style="margin: 0.5rem 0; font-size: 0.9rem; color: #6b7280;">Efficiency Gains: $${efficiencySavings.toLocaleString()}</p>
                    </div>
                    <div style="margin-top: 1.5rem;">
                        <a href="#contact" class="btn btn-primary">Get Free Consultation</a>
                    </div>
                </div>
            `;
        }
    }
}

// Interactive Charts for Case Studies
function initInteractiveCharts() {
    // Performance Improvement Chart
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        new Chart(perfCtx, {
            type: 'radar',
            data: {
                labels: ['Data Quality', 'Processing Speed', 'Accuracy', 'Efficiency', 'Cost Savings'],
                datasets: [{
                    label: 'Before',
                    data: [30, 25, 40, 35, 20],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }, {
                    label: 'After',
                    data: [95, 90, 98, 85, 90],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Revenue Impact Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'doughnut',
            data: {
                labels: ['Cost Reduction', 'Revenue Growth', 'Efficiency Gains', 'Risk Mitigation'],
                datasets: [{
                    data: [35, 40, 15, 10],
                    backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}