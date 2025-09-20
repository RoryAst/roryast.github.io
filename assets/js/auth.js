// ========================================
// SESSION MANAGEMENT
// ========================================

class SessionManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initSupabase();
        this.checkAuthState();
    }
    
    initSupabase() {
        try {
            if (window.SUPABASE_CONFIG) {
                this.supabase = supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
            }
        } catch (error) {
            console.error('Failed to initialize Supabase in session manager:', error);
        }
    }
    
    async checkAuthState() {
        if (!this.supabase) return;
        
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            this.currentUser = session?.user || null;
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.updateAuthUI();
            });
            
            this.updateAuthUI();
        } catch (error) {
            console.error('Auth state check failed:', error);
        }
    }
    
    updateAuthUI() {
        const authNav = document.querySelector('.auth-nav');
        const navLinks = document.querySelector('.nav-links');
        
        if (!authNav || !navLinks) return;
        
        if (this.currentUser) {
            // User is logged in, show dashboard link and logout
            navLinks.innerHTML = `
                <a href="dashboard/" class="nav-link">Dashboard</a>
                <button class="nav-link nav-logout" onclick="sessionManager.logout()">Sign Out</button>
            `;
        } else {
            // User is not logged in, show login/signup links
            navLinks.innerHTML = `
                <a href="auth/" class="nav-link">Sign In</a>
                <a href="auth/#signup" class="nav-link nav-signup">Get Started</a>
            `;
        }
    }
    
    async logout() {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
            }
            // Determine correct path to home based on current location
            const currentPath = window.location.pathname;
            if (currentPath.includes('/auth/') || currentPath.includes('/dashboard/')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            // Force redirect anyway
            const currentPath = window.location.pathname;
            if (currentPath.includes('/auth/') || currentPath.includes('/dashboard/')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = 'index.html';
            }
        }
    }
    
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    requireAuth() {
        if (!this.isAuthenticated()) {
            // Determine correct path to auth based on current location
            const currentPath = window.location.pathname;
            if (currentPath.includes('/dashboard/')) {
                window.location.href = '../auth/';
            } else {
                window.location.href = 'auth/';
            }
            return false;
        }
        return true;
    }
}

// Auth Page Manager
class AuthManager {
    constructor() {
        this.isLoginMode = true;
        this.supabase = null;
        
        // Initialize Supabase
        this.initSupabase();
        
        // Cache DOM elements
        this.initElements();
        
        // Bind events
        this.bindEvents();
        
        // Check for existing session
        this.checkSession();
        
        // Check for signup hash parameter
        this.checkForSignupMode();
    }

    initSupabase() {
        try {
            if (window.SUPABASE_CONFIG) {
                this.supabase = supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
            } else {
                throw new Error('Supabase configuration not found');
            }
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.showStatus('Authentication service unavailable. Please try again later.', 'error');
        }
    }

    initElements() {
        // Forms
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        
        // Toggle elements
        this.authTitle = document.getElementById('authTitle');
        this.authSubtitle = document.getElementById('authSubtitle');
        this.toggleText = document.getElementById('toggleText');
        this.toggleLink = document.getElementById('toggleLink');
        
        // Status
        this.authStatus = document.getElementById('authStatus');
        
        // Login inputs
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.loginButton = document.getElementById('loginButton');
        
        // Signup inputs
        this.signupFullName = document.getElementById('signupFullName');
        this.signupEmail = document.getElementById('signupEmail');
        this.signupPassword = document.getElementById('signupPassword');
        this.signupButton = document.getElementById('signupButton');
        this.passwordStrength = document.getElementById('passwordStrength');
        
        // Google Sign-In
        this.googleSignInButton = document.getElementById('googleSignInButton');
    }

    bindEvents() {
        if (!this.loginForm || !this.signupForm) return;
        
        // Form submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        
        // Toggle between login/signup
        if (this.toggleLink) {
            this.toggleLink.addEventListener('click', (e) => this.toggleMode(e));
        }
        
        // Password strength checker
        if (this.signupPassword) {
            this.signupPassword.addEventListener('input', () => this.checkPasswordStrength());
        }
        
        // Google Sign-In
        if (this.googleSignInButton) {
            this.googleSignInButton.addEventListener('click', () => this.handleGoogleSignIn());
        }
    }

    async checkSession() {
        if (!this.supabase) return;
        
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session) {
                // User is already logged in, redirect to dashboard
                const currentPath = window.location.pathname;
                if (currentPath.includes('/auth/')) {
                    window.location.href = '../dashboard/';
                } else {
                    window.location.href = 'dashboard/';
                }
            } else {
                // Check for OAuth redirect (Google Sign-In callback)
                this.handleOAuthRedirect();
            }
        } catch (error) {
            console.error('Session check failed:', error);
        }
    }

    async handleOAuthRedirect() {
        try {
            // Check if we're returning from an OAuth provider
            const { data, error } = await this.supabase.auth.getSession();
            
            if (data.session) {
                // OAuth sign-in was successful
                this.showStatus('Successfully signed in with Google!', 'success');
                
                // Redirect to dashboard after brief delay
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('/auth/')) {
                        window.location.href = '../dashboard/';
                    } else {
                        window.location.href = 'dashboard/';
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('OAuth redirect handling failed:', error);
        }
    }

    checkForSignupMode() {
        // Check if URL contains #signup hash
        if (window.location.hash === '#signup') {
            this.isLoginMode = false;
            if (this.loginForm) this.loginForm.classList.remove('active');
            if (this.signupForm) this.signupForm.classList.add('active');
            
            // Hide title but show subtitle for signup form
            if (this.authTitle) {
                this.authTitle.style.display = 'none';
            }
            if (this.authSubtitle) {
                this.authSubtitle.style.display = 'block';
                this.authSubtitle.textContent = 'Join AstroCal and take control of your schedule';
            }
            
            // Show signup divider and hide login divider
            const loginDivider = document.querySelector('.login-divider');
            const signupDivider = document.querySelector('.signup-divider');
            if (loginDivider) {
                loginDivider.classList.remove('active');
            }
            if (signupDivider) {
                signupDivider.classList.add('active');
            }
            
            if (this.toggleText) {
                this.toggleText.innerHTML = 'Already have an account? <a href="#" class="auth-toggle-link" id="toggleLink">Sign in</a>';
                // Re-bind the toggle link event
                this.toggleLink = document.getElementById('toggleLink');
                if (this.toggleLink) this.toggleLink.addEventListener('click', (e) => this.toggleMode(e));
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (!this.supabase) {
            this.showStatus('Authentication service unavailable', 'error');
            return;
        }
        
        const email = this.loginEmail?.value.trim();
        const password = this.loginPassword?.value;
        
        if (!this.validateEmail(email)) {
            this.showStatus('Please enter a valid email address', 'error');
            return;
        }
        
        if (password?.length < 6) {
            this.showStatus('Password must be at least 6 characters', 'error');
            return;
        }
        
        this.setLoading(true, 'login');
        this.showStatus('Signing you in...', 'loading');
        
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                throw error;
            }
            
            this.showStatus('Successfully signed in!', 'success');
            
            // Redirect to dashboard after brief delay
            setTimeout(() => {
                const currentPath = window.location.pathname;
                if (currentPath.includes('/auth/')) {
                    window.location.href = '../dashboard/';
                } else {
                    window.location.href = 'dashboard/';
                }
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Sign in failed. Please try again.';
            
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Please check your email and click the confirmation link.';
            } else if (error.message.includes('Too many requests')) {
                errorMessage = 'Too many attempts. Please wait a moment before trying again.';
            }
            
            this.showStatus(errorMessage, 'error');
        } finally {
            this.setLoading(false, 'login');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        if (!this.supabase) {
            this.showStatus('Authentication service unavailable', 'error');
            return;
        }
        
        const fullName = this.signupFullName?.value.trim();
        const email = this.signupEmail?.value.trim();
        const password = this.signupPassword?.value;
        
        if (!fullName) {
            this.showStatus('Please enter your full name', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showStatus('Please enter a valid email address', 'error');
            return;
        }
        
        if (password?.length < 6) {
            this.showStatus('Password must be at least 6 characters', 'error');
            return;
        }
        
        this.setLoading(true, 'signup');
        this.showStatus('Creating your account...', 'loading');
        
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });
            
            if (error) {
                throw error;
            }
            
            if (data.user && !data.session) {
                // Email confirmation required
                this.showStatus('Account created! Please check your email for a confirmation link.', 'success');
                this.clearForm('signup');
            } else if (data.session) {
                // Auto-login successful
                this.showStatus('Account created successfully!', 'success');
                
                // Redirect to dashboard after brief delay
                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('/auth/')) {
                        window.location.href = '../dashboard/';
                    } else {
                        window.location.href = 'dashboard/';
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            
            let errorMessage = 'Account creation failed. Please try again.';
            
            if (error.message.includes('User already registered')) {
                errorMessage = 'An account with this email already exists. Try signing in instead.';
            } else if (error.message.includes('Password should be')) {
                errorMessage = 'Password does not meet requirements. Please choose a stronger password.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            }
            
            this.showStatus(errorMessage, 'error');
        } finally {
            this.setLoading(false, 'signup');
        }
    }

    async handleGoogleSignIn() {
        if (!this.supabase) {
            this.showStatus('Authentication service unavailable', 'error');
            return;
        }
        
        this.setGoogleButtonLoading(true);
        this.showStatus('Signing in with Google...', 'loading');
        
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            
            if (error) {
                throw error;
            }
            
            // The user will be redirected to Google for authentication
            // If they complete the flow, they'll be redirected back to our app
            
        } catch (error) {
            console.error('Google Sign-In error:', error);
            
            let errorMessage = 'Google Sign-In failed. Please try again.';
            
            if (error.message.includes('popup')) {
                errorMessage = 'Sign-In popup was blocked. Please allow popups and try again.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('cancelled')) {
                errorMessage = 'Sign-In was cancelled.';
                // Don't show error for user cancellation
                this.clearStatus();
                this.setGoogleButtonLoading(false);
                return;
            }
            
            this.showStatus(errorMessage, 'error');
            this.setGoogleButtonLoading(false);
        }
    }

    toggleMode(e) {
        e.preventDefault();
        
        this.isLoginMode = !this.isLoginMode;
        this.clearStatus();
        
        if (this.isLoginMode) {
            // Switch to login
            if (this.loginForm) this.loginForm.classList.add('active');
            if (this.signupForm) this.signupForm.classList.remove('active');
            
            // Hide title but show subtitle for login form
            if (this.authTitle) {
                this.authTitle.style.display = 'none';
            }
            if (this.authSubtitle) {
                this.authSubtitle.style.display = 'block';
                this.authSubtitle.textContent = 'Sign in to access your personalized schedule management';
            }
            
            // Show login divider and hide signup divider
            const loginDivider = document.querySelector('.login-divider');
            const signupDivider = document.querySelector('.signup-divider');
            if (loginDivider) {
                loginDivider.classList.add('active');
            }
            if (signupDivider) {
                signupDivider.classList.remove('active');
            }
            
            if (this.toggleText) this.toggleText.innerHTML = 'Don\'t have an account? <a href="#" class="auth-toggle-link" id="toggleLink">Sign up</a>';
        } else {
            // Switch to signup
            if (this.loginForm) this.loginForm.classList.remove('active');
            if (this.signupForm) this.signupForm.classList.add('active');
            
            // Hide title but show subtitle for signup form
            if (this.authTitle) {
                this.authTitle.style.display = 'none';
            }
            if (this.authSubtitle) {
                this.authSubtitle.style.display = 'block';
                this.authSubtitle.textContent = 'Join AstroCal and take control of your schedule';
            }
            
            // Show signup divider and hide login divider
            const loginDivider = document.querySelector('.login-divider');
            const signupDivider = document.querySelector('.signup-divider');
            if (loginDivider) {
                loginDivider.classList.remove('active');
            }
            if (signupDivider) {
                signupDivider.classList.add('active');
            }
            
            if (this.toggleText) this.toggleText.innerHTML = 'Already have an account? <a href="#" class="auth-toggle-link" id="toggleLink">Sign in</a>';
        }
        
        // Re-bind the toggle link event
        this.toggleLink = document.getElementById('toggleLink');
        if (this.toggleLink) this.toggleLink.addEventListener('click', (e) => this.toggleMode(e));
        
        // Clear forms
        this.clearForm('login');
        this.clearForm('signup');
    }

    checkPasswordStrength() {
        if (!this.signupPassword || !this.passwordStrength) return;
        
        const password = this.signupPassword.value;
        const strength = this.getPasswordStrength(password);
        
        if (password.length === 0) {
            this.passwordStrength.textContent = '';
            this.passwordStrength.className = 'password-strength';
            return;
        }
        
        this.passwordStrength.textContent = `Password strength: ${strength.text}`;
        this.passwordStrength.className = `password-strength ${strength.level}`;
    }

    getPasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        if (score < 3) {
            return { level: 'weak', text: 'Weak' };
        } else if (score < 5) {
            return { level: 'medium', text: 'Medium' };
        } else {
            return { level: 'strong', text: 'Strong' };
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setLoading(isLoading, formType) {
        const button = formType === 'login' ? this.loginButton : this.signupButton;
        const form = formType === 'login' ? this.loginForm : this.signupForm;
        
        if (!button || !form) return;
        
        if (isLoading) {
            button.disabled = true;
            button.textContent = formType === 'login' ? 'Signing In...' : 'Creating Account...';
            form.style.opacity = '0.7';
        } else {
            button.disabled = false;
            button.textContent = formType === 'login' ? 'Sign In' : 'Create Account';
            form.style.opacity = '1';
        }
    }

    setGoogleButtonLoading(isLoading) {
        if (!this.googleSignInButton) return;
        
        if (isLoading) {
            this.googleSignInButton.disabled = true;
            this.googleSignInButton.querySelector('span').textContent = 'Signing in...';
        } else {
            this.googleSignInButton.disabled = false;
            this.googleSignInButton.querySelector('span').textContent = 'Continue with Google';
        }
    }

    showStatus(message, type) {
        if (!this.authStatus) return;
        
        this.authStatus.textContent = message;
        this.authStatus.className = `auth-status ${type}`;
        
        // Auto-clear error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                this.clearStatus();
            }, 5000);
        }
    }

    clearStatus() {
        if (!this.authStatus) return;
        
        this.authStatus.textContent = '';
        this.authStatus.className = 'auth-status';
    }

    clearForm(formType) {
        if (formType === 'login') {
            if (this.loginEmail) this.loginEmail.value = '';
            if (this.loginPassword) this.loginPassword.value = '';
        } else if (formType === 'signup') {
            if (this.signupFullName) this.signupFullName.value = '';
            if (this.signupEmail) this.signupEmail.value = '';
            if (this.signupPassword) this.signupPassword.value = '';
            if (this.passwordStrength) {
                this.passwordStrength.textContent = '';
                this.passwordStrength.className = 'password-strength';
            }
        }
    }
}

// Dashboard Manager
class DashboardManager {
    constructor() {
        this.supabase = null;
        this.user = null;
        
        // Initialize Supabase
        this.initSupabase();
        
        // Cache DOM elements
        this.initElements();
        
        // Check authentication and load user data
        this.init();
    }

    initSupabase() {
        try {
            if (window.SUPABASE_CONFIG) {
                this.supabase = supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
            } else {
                throw new Error('Supabase configuration not found');
            }
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.redirectToAuth();
        }
    }

    initElements() {
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.userName = document.getElementById('userName');
        this.userEmail = document.getElementById('userEmail');
        this.logoutButton = document.getElementById('logoutButton');
        
        // Bind logout event
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', () => this.handleLogout());
        }
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Check if user is authenticated
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                throw error;
            }
            
            if (!session) {
                // No active session, redirect to auth
                this.redirectToAuth();
                return;
            }
            
            this.user = session.user;
            await this.loadUserProfile();
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT' || !session) {
                    this.redirectToAuth();
                } else if (event === 'SIGNED_IN' && session) {
                    this.user = session.user;
                    this.loadUserProfile();
                }
            });
            
        } catch (error) {
            console.error('Authentication check failed:', error);
            this.redirectToAuth();
        } finally {
            this.showLoading(false);
        }
    }

    async loadUserProfile() {
        try {
            // Try to get profile from user metadata first
            const fullName = this.user.user_metadata?.full_name || '';
            const email = this.user.email || '';
            
            // Update UI with user information
            if (this.userName) this.userName.textContent = fullName || 'User';
            if (this.userEmail) this.userEmail.textContent = email;
            
            // Try to fetch additional profile data from profiles table
            const { data: profile, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();
            
            if (profile && !error) {
                // Update with database profile info if available
                if (this.userName) this.userName.textContent = profile.full_name || fullName || 'User';
            } else if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create one
                await this.createUserProfile();
            }
            
        } catch (error) {
            console.error('Failed to load user profile:', error);
            // Continue with basic user info from auth
        }
    }

    async createUserProfile() {
        try {
            const { error } = await this.supabase
                .from('profiles')
                .insert([
                    {
                        id: this.user.id,
                        email: this.user.email,
                        full_name: this.user.user_metadata?.full_name || '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);
            
            if (error) {
                console.error('Failed to create user profile:', error);
            }
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    async handleLogout() {
        try {
            this.showLoading(true);
            
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                throw error;
            }
            
            // Redirect will happen via auth state change listener
            
        } catch (error) {
            console.error('Logout failed:', error);
            this.showLoading(false);
            // Still try to redirect on error
            this.redirectToAuth();
        }
    }

    redirectToAuth() {
        // Determine correct path to auth based on current location
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard/')) {
            window.location.href = '../auth/';
        } else {
            window.location.href = 'auth/';
        }
    }

    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }
}

// Initialize appropriate manager based on the page
if (typeof window !== 'undefined' && window.document) {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize session manager for all pages
        if (typeof window.sessionManager === 'undefined') {
            window.sessionManager = new SessionManager();
        }
        
        // Initialize auth manager for auth page
        if (document.querySelector('.auth-container')) {
            new AuthManager();
        }
        
        // Initialize dashboard manager for dashboard page
        if (document.querySelector('.dashboard-container')) {
            new DashboardManager();
        }
    });
}
