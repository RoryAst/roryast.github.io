/**
 * iCalendar Event Generator
 * 
 * A comprehensive calendar management system that allows users to:
 * - Create and manage calendar events
 * - Set up recurring events with custom patterns
 * - Add exclusions to recurring events
 * - Export events as iCalendar (.ics) files
 * - Visualize events in a calendar interface
 * 
 * @class iCalendarGenerator
 */
class iCalendarGenerator {
    /**
     * Initialize the iCalendar Generator
     * Sets up the application state and binds event listeners
     */
    constructor() {
        // Core data structures
        this.events = [];           // Array of all created events
        this.exclusions = [];       // Array of exclusion dates for recurring events
        this.selectedDate = new Date(); // Currently selected date in calendar
        
        // Initialize the application
        this.initializeElements();
        this.bindEvents();
        this.setDefaultDates();
    }

    /**
     * Initialize DOM element references and date objects
     * Caches all necessary DOM elements for efficient access
     * Sets up initial date states for calendar navigation
     */
    initializeElements() {
        // Form elements (check if they exist)
        this.form = document.getElementById('eventForm');
        this.recurrenceSelect = document.getElementById('recurrence');
        this.recurrenceOptions = document.getElementById('recurrenceOptions');
        this.addExclusionBtn = document.getElementById('addExclusion');
        this.exclusionDate = document.getElementById('exclusionDate');
        this.exclusionList = document.getElementById('exclusionList');
        this.clearAllBtn = document.getElementById('clearAll');
        
        // Display elements (check if they exist)
        this.dayView = document.getElementById('dayView');
        this.dayViewTitle = document.getElementById('dayViewTitle');
        this.dayViewDate = document.getElementById('dayViewDate');
        this.eventsCount = document.querySelector('.events-count');
        
        // Download elements (check if they exist)
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadSection = document.getElementById('downloadSection');
        
        // Calendar elements (check if they exist)
        this.calendarDays = document.getElementById('calendarDays');
        this.currentMonthSpan = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        
        // Date state management
        this.currentDate = new Date();
        this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate());
        this.viewDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    }

    /**
     * Bind all event listeners to DOM elements
     * Sets up form submission, button clicks, and calendar navigation
     * Initializes the calendar display
     */
    bindEvents() {
        // Form event listeners (only if elements exist)
        if (this.form) this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (this.recurrenceSelect) this.recurrenceSelect.addEventListener('change', () => this.toggleRecurrenceOptions());
        if (this.addExclusionBtn) this.addExclusionBtn.addEventListener('click', () => this.addExclusion());
        
        // Action button listeners (only if elements exist)
        if (this.downloadBtn) this.downloadBtn.addEventListener('click', () => this.downloadICS());
        if (this.clearAllBtn) this.clearAllBtn.addEventListener('click', () => this.clearAllEvents());
        
        // Calendar navigation listeners (only if elements exist)
        if (this.prevMonthBtn) this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        if (this.nextMonthBtn) this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
        
        // Initialize calendar display (only if calendar elements exist)
        if (this.calendarDays) this.renderCalendar();
    }

    /**
     * Set default date and time values for new events
     * Pre-fills form with today's date and a default 1-hour time slot (9:00-10:00 AM)
     */
    setDefaultDates() {
        const now = new Date();
        const start = new Date(now);
        start.setHours(9, 0, 0, 0);  // Default start time: 9:00 AM
        const end = new Date(start);
        end.setHours(10, 0, 0, 0);   // Default end time: 10:00 AM (1 hour duration)

        // Set form field values (only if elements exist)
        const startDateEl = document.getElementById('startDate');
        const startTimeEl = document.getElementById('startTime');
        const endDateEl = document.getElementById('endDate');
        const endTimeEl = document.getElementById('endTime');
        
        if (startDateEl) startDateEl.value = this.formatDate(start);
        if (startTimeEl) startTimeEl.value = this.formatTime(start);
        if (endDateEl) endDateEl.value = this.formatDate(end);
        if (endTimeEl) endTimeEl.value = this.formatTime(end);
    }

    /**
     * Format a Date object to YYYY-MM-DD string format
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Format a Date object to HH:MM string format
     * @param {Date} date - The date to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        return date.toTimeString().slice(0, 5);
    }

    toggleRecurrenceOptions() {
        if (this.recurrenceSelect.value === 'none') {
            this.recurrenceOptions.classList.add('hidden');
        } else {
            this.recurrenceOptions.classList.remove('hidden');
        }
    }

    addExclusion() {
        const dateValue = this.exclusionDate.value;
        if (!dateValue || this.exclusions.includes(dateValue)) return;

        this.exclusions.push(dateValue);
        this.renderExclusions();
        this.exclusionDate.value = '';
    }

    removeExclusion(dateValue) {
        this.exclusions = this.exclusions.filter(date => date !== dateValue);
        this.renderExclusions();
    }

    renderExclusions() {
        this.exclusionList.innerHTML = this.exclusions.map(date => `
            <div class="exclusion-tag">
                ${new Date(date).toLocaleDateString()}
                <button type="button" onclick="app.removeExclusion('${date}')">×</button>
            </div>
        `).join('');
    }

    validateForm() {
        const title = document.getElementById('eventTitle').value.trim();
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        const endDate = document.getElementById('endDate').value;
        const endTime = document.getElementById('endTime').value;

        if (!title) {
            alert('Event title is required');
            return false;
        }

        if (!startDate || !startTime || !endDate || !endTime) {
            alert('Start and end date/time are required');
            return false;
        }

        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);

        if (endDateTime <= startDateTime) {
            alert('End time must be after start time');
            return false;
        }

        return true;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) return;

        const eventData = {
            title: document.getElementById('eventTitle').value.trim(),
            startDate: document.getElementById('startDate').value,
            startTime: document.getElementById('startTime').value,
            endDate: document.getElementById('endDate').value,
            endTime: document.getElementById('endTime').value,
            recurrence: document.getElementById('recurrence').value,
            recurrenceCount: document.getElementById('recurrenceCount').value,
            description: document.getElementById('description').value.trim(),
            exclusions: [...this.exclusions],
            id: Date.now().toString()
        };

        this.events.push(eventData);
        this.renderDayView();
        this.updateEventsCount();
        this.showDownloadSection();
        this.resetForm();
        this.renderCalendar();
    }

    resetForm() {
        this.form.reset();
        this.exclusions = [];
        this.renderExclusions();
        this.setDefaultDates();
        this.toggleRecurrenceOptions();
    }

    renderDayView() {
        const selectedDateStr = this.formatDate(this.selectedDate);
        const dayEvents = this.getEventsForDate(this.selectedDate);
        
        // Update header
        const isToday = this.isSameDay(this.selectedDate, new Date());
        this.dayViewTitle.textContent = isToday ? "Today's Events" : "Events";
        this.dayViewDate.textContent = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (this.events.length === 0) {
            this.dayView.innerHTML = `
                <div class="no-events">
                    <p>No events added yet. Fill out the form above to add your first event.</p>
                </div>
            `;
            return;
        }
        
        if (dayEvents.length === 0) {
            this.dayView.innerHTML = `
                <div class="no-events">
                    <p>No events scheduled for this day.</p>
                </div>
            `;
            return;
        }

        this.dayView.innerHTML = dayEvents.map(dayEvent => {
            return `
                <div class="day-event-item ${dayEvent.isRecurring ? 'recurring' : ''} ${dayEvent.isExcluded ? 'excluded' : ''}">
                    <div class="day-event-details">
                        <h3>${dayEvent.title}</h3>
                        <div class="day-event-time">
                            ${dayEvent.timeRange}
                        </div>
                        <div class="day-event-type ${dayEvent.isRecurring ? 'recurring' : 'one-time'} ${dayEvent.isExcluded ? 'excluded' : ''}">
                            ${dayEvent.isExcluded ? 'Excluded' : (dayEvent.isRecurring ? 'Recurring' : 'One-time')}
                        </div>
                        ${dayEvent.description ? `<div class="day-event-time">${dayEvent.description}</div>` : ''}
                    </div>
                    <div class="day-event-actions">
                        <button class="btn-danger btn-small" onclick="app.removeEvent('${dayEvent.eventId}')">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    removeEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
        this.renderDayView();
        this.updateEventsCount();
        this.renderCalendar();
        
        if (this.events.length === 0) {
            this.hideDownloadSection();
        }
    }

    clearAllEvents() {
        if (confirm('Are you sure you want to clear all events?')) {
            this.events = [];
            this.renderDayView();
            this.updateEventsCount();
            this.hideDownloadSection();
            this.renderCalendar();
        }
    }

    updateEventsCount() {
        this.eventsCount.textContent = `${this.events.length} event${this.events.length !== 1 ? 's' : ''} total`;
    }

    showDownloadSection() {
        this.downloadSection.classList.remove('hidden');
    }

    hideDownloadSection() {
        this.downloadSection.classList.add('hidden');
    }

    navigateMonth(direction) {
        this.viewDate.setMonth(this.viewDate.getMonth() + direction);
        this.renderCalendar();
    }

    renderCalendar() {
        this.updateMonthDisplay();
        this.renderCalendarDays();
    }

    selectDate(date) {
        // Parse the date string properly to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        this.selectedDate = new Date(year, month - 1, day);
        
        // If the selected date is from a different month, navigate to that month
        const selectedMonth = this.selectedDate.getMonth();
        const currentViewMonth = this.viewDate.getMonth();
        const selectedYear = this.selectedDate.getFullYear();
        const currentViewYear = this.viewDate.getFullYear();
        
        if (selectedMonth !== currentViewMonth || selectedYear !== currentViewYear) {
            this.viewDate = new Date(selectedYear, selectedMonth, 1);
        }
        
        this.renderDayView();
        this.renderCalendar(); // Re-render to update selected state and month view
    }

    updateMonthDisplay() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.currentMonthSpan.textContent = `${monthNames[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
    }

    renderCalendarDays() {
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDate = new Date(startDate);
        
        for (let i = 0; i < 35; i++) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        this.calendarDays.innerHTML = days.map(date => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = this.isSameDay(date, this.currentDate);
            const isSelected = this.isSameDay(date, this.selectedDate);
            const dayEvents = this.getEventsForDate(date);
            
            return `
                <div class="calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                     onclick="app.selectDate('${this.formatDate(date)}')">
                    <div class="day-number">${date.getDate()}</div>
                    <div class="day-events">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="event-indicator ${event.isRecurring ? 'recurring' : ''} ${event.isExcluded ? 'excluded' : ''}" 
                                 title="${event.title} - ${event.time}">
                                ${event.title}
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div class="more-events">+${dayEvents.length - 3} more</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    isSameDay(date1, date2) {
        if (!date1 || !date2) return false;
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    getEventsForDate(date) {
        const dayEvents = [];
        const dateStr = this.formatDate(date);
        
        this.events.forEach(event => {
            const eventStart = new Date(`${event.startDate}T${event.startTime}`);
            const eventEnd = new Date(`${event.endDate}T${event.endTime}`);
            const eventDate = this.formatDate(eventStart);
            
            // Check if this is the original event date
            if (eventDate === dateStr) {
                const isExcluded = event.exclusions.includes(dateStr);
                dayEvents.push({
                    title: event.title,
                    time: event.startTime,
                    timeRange: `${eventStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${eventEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
                    isRecurring: event.recurrence !== 'none',
                    isExcluded: isExcluded,
                    eventId: event.id,
                    description: event.description
                });
            }
            
            // Check for recurring events
            if (event.recurrence !== 'none' && !event.exclusions.includes(dateStr)) {
                const occurrences = this.getRecurringOccurrences(event, date);
                occurrences.forEach(occurrence => {
                    if (this.isSameDay(occurrence, date)) {
                        const occurrenceStart = new Date(occurrence);
                        occurrenceStart.setHours(eventStart.getHours(), eventStart.getMinutes());
                        const occurrenceEnd = new Date(occurrence);
                        occurrenceEnd.setHours(eventEnd.getHours(), eventEnd.getMinutes());
                        
                        dayEvents.push({
                            title: event.title,
                            time: event.startTime,
                            timeRange: `${occurrenceStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${occurrenceEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
                            isRecurring: true,
                            isExcluded: false,
                            eventId: event.id,
                            description: event.description
                        });
                    }
                });
            }
        });
        
        return dayEvents;
    }

    getRecurringOccurrences(event, targetDate) {
        const occurrences = [];
        const startDate = new Date(`${event.startDate}T${event.startTime}`);
        const count = parseInt(event.recurrenceCount) || 10;
        
        for (let i = 1; i < count; i++) {
            const occurrence = new Date(startDate);
            
            switch (event.recurrence) {
                case 'daily':
                    occurrence.setDate(startDate.getDate() + i);
                    break;
                case 'weekly':
                    occurrence.setDate(startDate.getDate() + (i * 7));
                    break;
                case 'monthly':
                    occurrence.setMonth(startDate.getMonth() + i);
                    break;
            }
            
            // Only include occurrences within a reasonable range of the target date
            const timeDiff = Math.abs(occurrence.getTime() - targetDate.getTime());
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            
            if (daysDiff <= 365) { // Within a year
                occurrences.push(occurrence);
            }
        }
        
        return occurrences;
    }

    formatICalDate(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    formatICalLocalDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.getFullYear().toString() +
               (date.getMonth() + 1).toString().padStart(2, '0') +
               date.getDate().toString().padStart(2, '0');
    }

    generateRRule(recurrence, count) {
        if (recurrence === 'none') return '';
        
        const freqMap = {
            'daily': 'DAILY',
            'weekly': 'WEEKLY',
            'monthly': 'MONTHLY'
        };
        
        return `RRULE:FREQ=${freqMap[recurrence]};COUNT=${count}`;
    }

    generateExDates(exclusions, startDateTime) {
        if (exclusions.length === 0) return '';
        
        const exdates = exclusions.map(exclusionDate => {
            const exDate = new Date(exclusionDate + 'T' + 
                startDateTime.toTimeString().split(' ')[0]);
            return this.formatICalDate(exDate);
        }).join(',');
        
        return `EXDATE:${exdates}`;
    }

    generateICS() {
        const now = new Date();
        const created = this.formatICalDate(now);
        
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//iCalendar Event Generator//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];

        this.events.forEach(event => {
            const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
            const endDateTime = new Date(`${event.endDate}T${event.endTime}`);
            const uid = `${event.id}@icalendar-generator.local`;

            icsContent.push(
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTAMP:${created}`,
                `DTSTART:${this.formatICalDate(startDateTime)}`,
                `DTEND:${this.formatICalDate(endDateTime)}`,
                `SUMMARY:${event.title}`,
                `CREATED:${created}`
            );

            if (event.description) {
                icsContent.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
            }

            const rrule = this.generateRRule(event.recurrence, event.recurrenceCount);
            if (rrule) {
                icsContent.push(rrule);
            }

            const exdates = this.generateExDates(event.exclusions, startDateTime);
            if (exdates) {
                icsContent.push(exdates);
            }

            icsContent.push('END:VEVENT');
        });

        icsContent.push('END:VCALENDAR');
        return icsContent.join('\r\n');
    }

    downloadICS() {
        if (this.events.length === 0) {
            alert('No events to download');
            return;
        }

        const icsContent = this.generateICS();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `calendar-events-${new Date().toISOString().split('T')[0]}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}

// Initialize the application
const app = new iCalendarGenerator();

// Add scroll functionality to dock button
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Function to check scroll position and update dock button visibility
    function updateDockButtonVisibility() {
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
    }
    
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
    
});

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
        this.emailStatus.textContent = '';
        this.emailStatus.className = 'email-status';
    }
    
    animateSuccess() {
        // No visual animations on success
    }
}

// Initialize email input handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new EmailInputHandler();
});



// Alternative approach - try immediately without waiting for DOMContentLoaded
(function() {
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