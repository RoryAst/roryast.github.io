// ========================================
// EMAIL INPUT FUNCTIONALITY
// ========================================

class EmailInputHandler {
    constructor() {
        this.emailForm = document.getElementById('emailForm');
        this.emailInput = document.getElementById('emailInput');
        this.emailStatus = document.getElementById('emailStatus');
        
        // Initialize Supabase client
        this.supabase = null;
        this.initSupabase();
        
        this.init();
    }
    
    initSupabase() {
        // Initialize Supabase client
        try {
            // Check if config is available
            if (window.SUPABASE_CONFIG) {
                this.supabase = supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
            } else {
                // Fallback to placeholder values (replace these with your actual credentials)
                this.supabase = supabase.createClient(
                    'YOUR_SUPABASE_URL', // Replace with your Supabase URL
                    'YOUR_SUPABASE_ANON_KEY' // Replace with your Supabase anon key
                );
            }
            console.log('Supabase client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            this.supabase = null;
        }
    }
    
    init() {
        if (this.emailForm) {
            this.emailForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Add click listener to button for debugging
        const button = document.querySelector('.join-waitlist-btn');
        if (button) {
            button.addEventListener('click', (e) => {
                console.log('Button clicked!', e);
                // Prevent default to let form handle submission
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
        
        if (this.emailInput) {
            this.emailInput.addEventListener('input', () => this.handleInput());
            this.emailInput.addEventListener('focus', () => this.handleFocus());
            this.emailInput.addEventListener('blur', () => this.handleBlur());
            this.emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSubmit(e);
                }
            });
        }
    }
    
    handleInput() {
        // Clear any existing status messages
        this.clearStatus();
    }
    
    handleFocus() {
        // No visual changes on focus
    }
    
    handleBlur() {
        // No visual changes on blur
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.emailInput) return;
        
        const email = this.emailInput.value.trim();
        
        if (!this.validateEmail(email)) {
            this.showStatus('Please enter a valid email address', 'error');
            return;
        }
        
        this.setLoadingState(true);
        this.showStatus('Joining waitlist...', 'loading');
        
        try {
            // Simulate API call - replace with actual endpoint
            await this.submitEmail(email);
            this.showStatus('Successfully joined the waitlist! 🎉', 'success');
            this.emailInput.value = '';
            this.animateSuccess();
        } catch (error) {
            this.showStatus('Something went wrong. Please try again.', 'error');
            console.error('Email submission error:', error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async submitEmail(email) {
        // Check if Supabase is initialized
        if (!this.supabase) {
            throw new Error('Database connection not available. Please try again later.');
        }

        try {
            // Insert email into Supabase waitlist_emails table
            const { data, error } = await this.supabase
                .from('waitlist_emails')
                .insert([
                    {
                        email: email,
                        subscribed_at: new Date().toISOString(),
                        source: 'website_landing'
                    }
                ]);

            if (error) {
                // Handle specific Supabase errors
                if (error.code === '23505') {
                    throw new Error('This email is already on our waitlist!');
                } else if (error.code === '23514') {
                    throw new Error('Please enter a valid email address');
                } else if (error.code === 'PGRST301') {
                    throw new Error('Database connection failed. Please try again.');
                } else {
                    console.error('Supabase error details:', error);
                    throw new Error('Failed to join waitlist. Please try again.');
                }
            }

            console.log('Email successfully added to waitlist:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Email submission error:', error);
            throw error;
        }
    }
    
    setLoadingState(isLoading) {
        if (!this.emailInput) return;
        
        if (isLoading) {
            this.emailInput.disabled = true;
            this.emailInput.style.opacity = '0.7';
            this.emailInput.placeholder = 'Joining waitlist...';
        } else {
            this.emailInput.disabled = false;
            this.emailInput.style.opacity = '1';
            this.emailInput.placeholder = 'Enter your email address';
        }
    }
    
    showStatus(message, type) {
        if (!this.emailStatus) return;
        
        this.emailStatus.textContent = message;
        this.emailStatus.className = `email-status ${type}`;
        
        // Auto-clear success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.clearStatus();
            }, 5000);
        }
    }
    
    clearStatus() {
        if (!this.emailStatus) return;
        
        this.emailStatus.textContent = '';
        this.emailStatus.className = 'email-status';
    }
    
    animateSuccess() {
        // No visual animations on success
    }
}

// Initialize email input handler when DOM is loaded
if (typeof window !== 'undefined' && window.document) {
    document.addEventListener('DOMContentLoaded', function() {
        // Only initialize if email form exists on the page
        if (document.getElementById('emailForm')) {
            new EmailInputHandler();
        }
    });
}
