// Advanced JavaScript Timer Application
document.addEventListener('DOMContentLoaded', () => {
    // Timer class using ES6+ features
    class Timer {
        constructor() {
            // Timer state
            this.timeLeft = 0;
            this.timerId = null;
            this.isPaused = false;
            
            // Initialize DOM elements
            this.elements = {
                display: document.getElementById('timerDisplay'),
                input: document.getElementById('timerInput'),
                startBtn: document.getElementById('startTimer'),
                pauseBtn: document.getElementById('pauseTimer'),
                resetBtn: document.getElementById('resetTimer')
            };

            // Initialize notification manager
            this.notificationManager = new NotificationManager();

            // Bind methods to maintain context
            this.start = this.start.bind(this);
            this.pause = this.pause.bind(this);
            this.reset = this.reset.bind(this);
            this.updateDisplay = this.updateDisplay.bind(this);

            this.init();
        }

        // Initialize event listeners
        init() {
            // Set up event listeners
            this.elements.startBtn.addEventListener('click', this.start);
            this.elements.pauseBtn.addEventListener('click', this.pause);
            this.elements.resetBtn.addEventListener('click', this.reset);
        }

        // Start timer
        start() {
            if (!this.timerId && !this.isPaused) {
                const inputTime = parseInt(this.elements.input.value);
                if (isNaN(inputTime) || inputTime <= 0) {
                    alert('Please enter a valid number greater than 0.');
                    return;
                }
                this.timeLeft = inputTime;
                this.updateDisplay();
                this.timerId = setInterval(() => {
                    if (this.timeLeft > 0) {
                        this.timeLeft--;
                        this.updateDisplay();
                    } else {
                        this.handleTimerComplete();
                    }
                }, 1000);
                this.elements.startBtn.classList.add('active'); // Add active class for visual feedback
            }
        }

        // Pause timer
        pause() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
                this.isPaused = true;
                this.elements.startBtn.classList.remove('active'); // Remove active class
            }
        }

        // Reset timer
        reset() {
            clearInterval(this.timerId);
            this.timerId = null;
            this.isPaused = false;
            this.timeLeft = 0;
            this.updateDisplay();
            this.elements.startBtn.classList.remove('active'); // Remove active class
        }

        // Update display
        updateDisplay() {
            this.elements.display.textContent = this.timeLeft > 0 ? this.timeLeft : 'Time is up!';
            if (this.timeLeft <= 10) {
                this.elements.display.classList.add('ending'); // Add class for visual feedback when time is running out
            } else {
                this.elements.display.classList.remove('ending');
            }
        }

        // Handle timer completion
        handleTimerComplete() {
            clearInterval(this.timerId);
            this.timerId = null;
            this.isPaused = false;
            this.notificationManager.show('Timer completed!');
            this.updateDisplay();
            this.elements.display.classList.add('completed'); // Add completed class for visual feedback
        }

        // Play alarm sound using Web Audio API
        playAlarm() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }

    // Notification Manager class using the Observer pattern
    class NotificationManager {
        constructor() {
            this.container = document.getElementById('notifications');
            this.observers = new Set();
        }

        // Add notification observer
        subscribe(observer) {
            this.observers.add(observer);
        }

        // Remove notification observer
        unsubscribe(observer) {
            this.observers.delete(observer);
        }

        // Show notification
        show(message) {
            const notification = this.createNotification(message);
            this.container.insertBefore(notification, this.container.firstChild);
            
            // Notify observers
            this.observers.forEach(observer => observer(message));

            // Auto-remove notification
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }

        // Create notification element using template literals
        createNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <span>${message}</span>
                <button onclick="this.parentElement.remove()">Dismiss</button>
            `;
            return notification;
        }
    }

    // Initialize the application
    const notificationManager = new NotificationManager();
    const timer = new Timer();

    // Add notification observer for logging
    notificationManager.subscribe(message => {
        console.log('Notification:', message);
    });

    // Expose timer instance for debugging
    window.timerApp = timer;
});
