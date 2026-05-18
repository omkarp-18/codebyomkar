// ==========================================================================
// OMKAR PATIL PORTFOLIO INTERACTIONS (VANILLA JS)
// Features: Sticky Nav, Mobile Menu, Active Section Tracker, Form Success transition,
//           and an Ultra-High-Fidelity Simulated Terminal CLI with Audio & Easter Eggs.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Sticky Glass Header & Active Section Tracker
    const header = document.querySelector('.glass-header');
    const navLinks = document.querySelectorAll('.nav-link, .drawer-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky header styling
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active section tracker
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // 3. Mobile Navigation Drawer Toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    const openDrawer = () => {
        mobileDrawer.classList.add('open');
    };

    const closeDrawer = () => {
        mobileDrawer.classList.remove('open');
    };

    if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

    // 4. Contact Form Transition Mockup
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const btnResetForm = document.getElementById('btn-reset-form');

    if (contactForm && formSuccess) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Show custom success screen with beautiful overlay transition
            formSuccess.classList.add('show');
            
            // Optional: reset form contents
            contactForm.reset();
        });
    }

    if (btnResetForm && formSuccess) {
        btnResetForm.addEventListener('click', () => {
            formSuccess.classList.remove('show');
        });
    }

    // 5. Interactive Simulated CLI Terminal
    const terminalInput = document.getElementById('terminal-input');
    const terminalHistory = document.getElementById('terminal-history');
    const terminalBody = document.getElementById('terminal-body');
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const btnClearTerminal = document.getElementById('btn-clear-terminal');
    const cmdPills = document.querySelectorAll('.cmd-pill');

    // Audio SFX Setup
    const sndClick = document.getElementById('sound-click');
    const sndEnter = document.getElementById('sound-enter');
    const sndError = document.getElementById('sound-error');
    let soundEnabled = true;

    // Shell History Stack (For Up/Down arrows)
    const commandHistoryStack = [];
    let historyPointer = -1;

    // Sound toggle state controller
    if (btnSoundToggle) {
        btnSoundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            const soundIcon = document.getElementById('sound-icon');
            if (soundIcon) {
                if (soundEnabled) {
                    soundIcon.setAttribute('data-lucide', 'volume-2');
                    btnSoundToggle.style.color = 'var(--accent-2)';
                } else {
                    soundIcon.setAttribute('data-lucide', 'volume-x');
                    btnSoundToggle.style.color = 'var(--text-muted)';
                }
                // Refresh Lucide icon rendering
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
            playSfx(sndClick);
        });
    }

    // Clear Terminal button
    if (btnClearTerminal) {
        btnClearTerminal.addEventListener('click', () => {
            if (terminalHistory) {
                terminalHistory.innerHTML = '';
            }
            playSfx(sndClick);
        });
    }

    // Quick Command Pills
    cmdPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const command = pill.getAttribute('data-cmd');
            if (terminalInput) {
                terminalInput.value = command;
                handleCommandSubmit(command);
                terminalInput.value = '';
                terminalInput.focus();
            }
        });
    });

    // Capture standard keyboard clicks
    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                handleCommandSubmit(command);
                terminalInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateHistory('down');
            } else {
                // Play subtle keyboard tap sound
                if (e.key.length === 1 && e.key !== ' ') {
                    playSfx(sndClick);
                }
            }
        });
    }

    function playSfx(audioElement) {
        if (soundEnabled && audioElement) {
            // Reset state in case fast typing overlap
            audioElement.currentTime = 0;
            audioElement.play().catch(() => {
                // Ignore audio playback exceptions caused by browser security policies
            });
        }
    }

    function navigateHistory(direction) {
        if (commandHistoryStack.length === 0) return;

        if (direction === 'up') {
            if (historyPointer === -1) {
                historyPointer = commandHistoryStack.length - 1;
            } else if (historyPointer > 0) {
                historyPointer--;
            }
        } else if (direction === 'down') {
            if (historyPointer !== -1) {
                if (historyPointer < commandHistoryStack.length - 1) {
                    historyPointer++;
                } else {
                    historyPointer = -1; // Reset to blank
                }
            }
        }

        if (terminalInput) {
            terminalInput.value = historyPointer !== -1 ? commandHistoryStack[historyPointer] : '';
        }
    }

    function handleCommandSubmit(commandString) {
        if (!commandString) return;

        // Add to history stack
        commandHistoryStack.push(commandString);
        historyPointer = -1; // reset pointer

        // Print command echo in terminal body
        const echoLine = document.createElement('div');
        echoLine.className = 'cli-command-echo';
        echoLine.innerHTML = `<span class="terminal-prompt">omkar@assistant:~$</span> ${escapeHTML(commandString)}`;
        terminalHistory.appendChild(echoLine);

        // Process Command
        const responseHTML = processCommand(commandString.toLowerCase().trim());
        
        if (responseHTML) {
            const responseContainer = document.createElement('div');
            responseContainer.className = 'cli-response';
            responseContainer.innerHTML = responseHTML;
            terminalHistory.appendChild(responseContainer);
        }

        // Scroll terminal to bottom
        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function processCommand(cmd) {
        let response = '';
        
        switch (cmd) {
            case 'help':
                playSfx(sndEnter);
                response = `
                    <div class="cli-output-heading">Available Assistant Commands:</div>
                    <div class="cli-output-line"><span class="terminal-cmd-highlight">about</span>      - Who is Omkar Patil? A detailed career and philosophy brief.</div>
                    <div class="cli-output-line"><span class="terminal-cmd-highlight">skills</span>     - View the complete developer skill-tree &amp; proficiency.</div>
                    <div class="cli-output-line"><span class="terminal-cmd-highlight">projects</span>   - Display premium featured project architectures.</div>
                    <div class="cli-output-line"><span class="terminal-cmd-highlight">contact</span>    - Show professional contact channels &amp; networking details.</div>
                    <div class="cli-output-line"><span class="terminal-cmd-highlight">clear</span>      - Clear terminal logs and histories.</div>
                    <div class="cli-output-line"><span class="terminal-cmd-highlight">secret</span>     - Access core Easter Eggs &amp; developer philosophies.</div>
                `;
                break;
                
            case 'about':
                playSfx(sndEnter);
                response = `
                    <div class="cli-output-heading">Omkar Patil Profile Info:</div>
                    <div class="cli-output-line">🎓 <span class="cli-output-highlight">BE Computer Science Engineering (CSE) Student</span> located in India.</div>
                    <div class="cli-output-line">💡 Passionate about building robust client integrations in Android, offline AI capabilities, and scalable databases.</div>
                    <div class="cli-output-line">⚡ Engineering Workflows: <span class="cli-output-highlight">Vibe Coding</span> &amp; <span class="cli-output-highlight">Agentic AI integration</span>. I design systems with high flexibility and velocity.</div>
                `;
                break;
                
            case 'skills':
                playSfx(sndEnter);
                response = `
                    <div class="cli-output-heading">Omkar's Developer Stack:</div>
                    <div class="cli-output-line"><span class="cli-output-highlight">[Languages]</span> Java, Kotlin, Python, SQL, C</div>
                    <div class="cli-output-line"><span class="cli-output-highlight">[Android]</span> Android Studio, Jetpack Nav/ViewModel, Material Design, Background Foreground Services</div>
                    <div class="cli-output-line"><span class="cli-output-highlight">[AI / Data Science]</span> ONNX Runtime, Machine Learning (Scikit), Pandas, Firebase Cloud Integration</div>
                    <div class="cli-output-line"><span class="cli-output-highlight">[Tools]</span> Git &amp; GitHub, VS Code, Linux, Agentic Copilots</div>
                `;
                break;
                
            case 'projects':
                playSfx(sndEnter);
                response = `
                    <div class="cli-output-heading">Featured Software Products:</div>
                    
                    <div class="cli-output-line"><span class="cli-output-bullet">❖</span> <span class="cli-output-highlight">Smart Command Assistant</span> [JavaScript MV3 + Java Backend]</div>
                    <div class="cli-output-line">  Chrome side panel voice assistant with robust multi-step local action routing.</div>
                    
                    <div class="cli-output-line"><span class="cli-output-bullet">❖</span> <span class="cli-output-highlight">AI Toxicity Detector</span> [Kotlin + ONNX MiniLM Model]</div>
                    <div class="cli-output-line">  Offline social media text scan tool running 15ms inference loops locally.</div>
                    
                    <div class="cli-output-line"><span class="cli-output-bullet">❖</span> <span class="cli-output-highlight">SheShield</span> [Kotlin + Firebase + Foreground Service]</div>
                    <div class="cli-output-line">  Women's safety background SOS trigger with location streams and voice filters.</div>
                    
                    <div class="cli-output-line"><span class="cli-output-bullet">❖</span> <span class="cli-output-highlight">BlinkToLive</span> [Kotlin + Gaze Tracking + Firebase]</div>
                    <div class="cli-output-line">  Assistive patient dashboard mapping eye-blink patterns to communication systems.</div>
                    
                    <div class="cli-output-line"><span class="cli-output-bullet">❖</span> <span class="cli-output-highlight">MECHMEETCAR</span> [PHP + MySQL Full-Stack Web App]</div>
                    <div class="cli-output-line">  Roadside recovery mechanic routing portal with geographical matchmaking.</div>
                `;
                break;
                
            case 'contact':
                playSfx(sndEnter);
                response = `
                    <div class="cli-output-heading">Let's Connect:</div>
                    <div class="cli-output-line">📧 Email: <a href="mailto:omkarpatil0118@gmail.com" class="cli-output-highlight">omkarpatil0118@gmail.com</a></div>
                    <div class="cli-output-line">💼 LinkedIn: <a href="https://linkedin.com/in/omkarpatil18" target="_blank" class="cli-output-highlight">linkedin.com/in/omkarpatil18</a></div>
                    <div class="cli-output-line">⭐ Pro tip: Star the repositories if you enjoy the architectures!</div>
                `;
                break;
                
            case 'clear':
                playSfx(sndEnter);
                // Clear command requires delayed visual purge, but we trigger a status output
                setTimeout(() => {
                    if (terminalHistory) terminalHistory.innerHTML = '';
                }, 50);
                response = '';
                break;
                
            case 'secret':
                playSfx(sndEnter);
                response = `
                    <div class="cli-output-heading">⚠️ [SYSTEM ENCRYPTED LOG: Easter Egg Found] ⚠️</div>
                    <div class="cli-output-line">🌌 <span class="cli-output-highlight">"Vibe Coding" Philosophy:</span></div>
                    <div class="cli-output-line">   1. Dream up a feature concept.</div>
                    <div class="cli-output-line">   2. Vibe with the creative design details.</div>
                    <div class="cli-output-line">   3. Summon agentic assistants to build the foundational architecture.</div>
                    <div class="cli-output-line">   4. Launch into production before the coffee cools down! ☕</div>
                    <div class="cli-output-line" style="color: var(--accent-3)">Status: 99.8% System Resonance. Agentic Sync Complete.</div>
                `;
                break;
                
            default:
                playSfx(sndError);
                response = `<div class="cli-error-line">Command '${escapeHTML(cmd)}' not recognized. Type <span class="terminal-cmd-highlight">help</span> to view all commands.</div>`;
                break;
        }
        
        return response;
    }
});
