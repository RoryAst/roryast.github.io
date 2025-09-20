// ========================================
// SCROLL FUNCTIONALITY
// ========================================

class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        // Add scroll functionality to dock button
        this.initDockScrolling();
        
        // Initialize bottom scroll detection for dock button fade out
        this.initScrollDetection();
    }

    initDockScrolling() {
        const dockButton = document.querySelector('.dock-button');
        const productOverview = document.getElementById('product-overview');
        const scrollContainer = document.querySelector('.scroll-container');
        
        console.log('Dock button found:', !!dockButton);
        console.log('Product overview found:', !!productOverview);
        console.log('Scroll container found:', !!scrollContainer);
        
        // Test scroll snap support
        if (scrollContainer) {
            console.log('Scroll snap type:', getComputedStyle(scrollContainer).scrollSnapType);
        }
        
        if (dockButton && productOverview) {
            dockButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Dock button clicked, scrolling to product overview');
                
                // Try modern scrollIntoView first
                if (productOverview.scrollIntoView) {
                    productOverview.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    // Fallback for older browsers
                    const offsetTop = productOverview.offsetTop;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
            console.log('Scroll event listener added successfully');
        } else {
            console.error('Missing elements for scroll functionality');
        }
    }

    initScrollDetection() {
        // Function to check scroll position and update dock button visibility
        const updateDockButtonVisibility = () => {
            const dockButton = document.getElementById('dockButton');
            if (!dockButton) return;
            
            const scrollContainerForBottomDetection = document.querySelector('.scroll-container');
            
            if (scrollContainerForBottomDetection) {
                // Calculate scroll position
                const scrollTop = scrollContainerForBottomDetection.scrollTop;
                const scrollHeight = scrollContainerForBottomDetection.scrollHeight;
                const clientHeight = scrollContainerForBottomDetection.clientHeight;
                
                // Check if we're near the bottom (within 100px)
                const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
                
                if (isNearBottom) {
                    // Fade out the dock button
                    dockButton.style.opacity = '0';
                    dockButton.style.transform = 'translateX(-50%) translateY(20px)';
                    dockButton.style.visibility = 'hidden';
                } else {
                    // Fade in the dock button
                    dockButton.style.opacity = '1';
                    dockButton.style.transform = 'translateX(-50%) translateY(0)';
                    dockButton.style.visibility = 'visible';
                }
            } else {
                // Fallback to window scroll if container not found
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = window.innerHeight;
                
                // Check if we're near the bottom (within 100px)
                const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
                
                if (isNearBottom) {
                    // Fade out the dock button
                    dockButton.style.opacity = '0';
                    dockButton.style.transform = 'translateX(-50%) translateY(20px)';
                    dockButton.style.visibility = 'hidden';
                } else {
                    // Fade in the dock button
                    dockButton.style.opacity = '1';
                    dockButton.style.transform = 'translateX(-50%) translateY(0)';
                    dockButton.style.visibility = 'visible';
                }
            }
        };
        
        // Check initial scroll position on page load
        updateDockButtonVisibility();
        
        // Add bottom scroll detection for dock button fade out
        const scrollContainerForBottomDetection = document.querySelector('.scroll-container');
        
        if (scrollContainerForBottomDetection) {
            scrollContainerForBottomDetection.addEventListener('scroll', updateDockButtonVisibility);
        } else {
            // Fallback to window scroll if container not found
            window.addEventListener('scroll', updateDockButtonVisibility);
        }
    }
}

// Global function for onclick handler
function scrollToProductOverview() {
    const productOverview = document.getElementById('product-overview');
    const scrollContainer = document.querySelector('.scroll-container');
    
    if (productOverview && scrollContainer) {
        // Use the scroll container for scrolling
        scrollContainer.scrollTo({
            top: productOverview.offsetTop,
            behavior: 'smooth'
        });
    } else if (productOverview) {
        // Fallback to scrollIntoView
        productOverview.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize scroll manager when DOM is loaded
if (typeof window !== 'undefined' && window.document) {
    document.addEventListener('DOMContentLoaded', function() {
        // Only initialize if dock button exists on the page
        if (document.querySelector('.dock-button') || document.querySelector('.scroll-container')) {
            new ScrollManager();
        }
    });

    // Alternative approach - try immediately without waiting for DOMContentLoaded
    (() => {
        const dockButton = document.querySelector('.dock-button');
        const productOverview = document.getElementById('product-overview');
        
        if (dockButton && productOverview) {
            dockButton.addEventListener('click', function(e) {
                e.preventDefault();
                productOverview.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }
    })();
}
