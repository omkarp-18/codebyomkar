// ==========================================================================
// BENTO PORTFOLIO INTERACTIONS (VANILLA JS)
// Features: Project Accordion, Compact CLI Terminal with audio feedback,
//           and mini contact form notifications.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Project List Accordion Controller
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach(item => {
        item.addEventListener('click', () => {
            // If already active, keep active (or toggle off if desired). Let's toggle off other active ones
            const isActive = item.classList.contains('active');
            
            projectItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 3. Mini Contact Form Dispatch
    const miniForm = document.getElementById('mini-contact');
    const successNotif = document.getElementById('success-notif');

    if (miniForm && successNotif) {
        miniForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Trigger success overlay
            successNotif.classList.add('show');
            
            // Auto hide after 3 seconds and reset form
            setTimeout(() => {
                successNotif.classList.remove('show');
                miniForm.reset();
            }, 3000);
            
            // Play click sound
            playSfx(document.getElementById('sound-enter'));
        });
    }

    // 4. Interactive Bento CLI Terminal
    const termInput = document.getElementById('terminal-input');
    const termLog = document.getElementById('terminal-log');
    const termBody = document.getElementById('terminal-body');
    const btnSound = document.getElementById('btn-sound');
    const btnClear = document.getElementById('btn-clear');
    const hotkeys = document.querySelectorAll('.hotkey-pill');

    // SFX triggers
    const sndClick = document.getElementById('sound-click');
    const sndEnter = document.getElementById('sound-enter');
    const sndError = document.getElementById('sound-error');
    let audioSync = true;

    // Shell History Navigation
    const shellHistory = [];
    let shellPtr = -1;

    // Volume button sync
    if (btnSound) {
        btnSound.addEventListener('click', () => {
            audioSync = !audioSync;
            btnSound.innerHTML = audioSync ? '<i data-lucide="volume-2"></i>' : '<i data-lucide="volume-x"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            playSfx(sndClick);
        });
    }

    // Clear Terminal button
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (termLog) termLog.innerHTML = '';
            playSfx(sndClick);
        });
    }

    // Hotkey Click execution
    hotkeys.forEach(key => {
        key.addEventListener('click', () => {
            const cmd = key.getAttribute('data-cmd');
            if (termInput) {
                termInput.value = cmd;
                submitTermCommand(cmd);
                termInput.value = '';
                termInput.focus();
            }
        });
    });

    // Stdin capture
    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmdVal = termInput.value.trim();
                submitTermCommand(cmdVal);
                termInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateHistory('down');
            } else {
                if (e.key.length === 1 && e.key !== ' ') {
                    playSfx(sndClick);
                }
            }
        });
    }

    function playSfx(audioElement) {
        if (audioSync && audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(() => {});
        }
    }

    function navigateHistory(dir) {
        if (shellHistory.length === 0) return;

        if (dir === 'up') {
            if (shellPtr === -1) {
                shellPtr = shellHistory.length - 1;
            } else if (shellPtr > 0) {
                shellPtr--;
            }
        } else if (dir === 'down') {
            if (shellPtr !== -1) {
                if (shellPtr < shellHistory.length - 1) {
                    shellPtr++;
                } else {
                    shellPtr = -1;
                }
            }
        }

        if (termInput) {
            termInput.value = shellPtr !== -1 ? shellHistory[shellPtr] : '';
        }
    }

    function submitTermCommand(command) {
        if (!command) return;

        shellHistory.push(command);
        shellPtr = -1;

        // Visual Echo
        const echoDiv = document.createElement('div');
        echoDiv.className = 'cli-echo';
        echoDiv.innerHTML = `<span class="terminal-prompt">omkar@dev:~$</span> ${escapeHTML(command)}`;
        termLog.appendChild(echoDiv);

        // Core Command Routing
        const outHTML = routeCommand(command.toLowerCase().trim());
        if (outHTML) {
            const outDiv = document.createElement('div');
            outDiv.className = 'cli-out-block';
            outDiv.innerHTML = outHTML;
            termLog.appendChild(outDiv);
        }

        // Scroll
        if (termBody) {
            termBody.scrollTop = termBody.scrollHeight;
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

    function routeCommand(cmd) {
        let response = '';

        switch (cmd) {
            case 'help':
                playSfx(sndEnter);
                response = `
                    <div class="cli-heading">Command Index:</div>
                    <div>• <span class="cmd-text">about</span>    - Career timeline &amp; focus</div>
                    <div>• <span class="cmd-text">skills</span>   - List language and framework badges</div>
                    <div>• <span class="cmd-text">projects</span> - View all 5 featured project details</div>
                    <div>• <span class="cmd-text">secret</span>   - Interactive "Vibe Coding" easter egg</div>
                    <div>• <span class="cmd-text">clear</span>    - Clear shell output logs</div>
                `;
                break;

            case 'about':
                playSfx(sndEnter);
                response = `
                    <div class="cli-heading">Profile Summary:</div>
                    <div>🎓 BE Computer Science Engineering student located in India.</div>
                    <div>🚀 Aspiring Android Developer &amp; Data Science Enthusiast.</div>
                    <div>💡 Workflows: <span class="cli-highlight">Vibe Coding</span> &amp; <span class="cli-highlight">Agentic workflows</span>.</div>
                `;
                break;

            case 'skills':
                playSfx(sndEnter);
                response = `
                    <div class="cli-heading">Tech Stack Inventory:</div>
                    <div><span class="cli-bullet">✔</span> Languages: Java, Kotlin, Python, SQL, C</div>
                    <div><span class="cli-bullet">✔</span> Mobile Development: Jetpack Navigation, VM, Material Design</div>
                    <div><span class="cli-bullet">✔</span> Intelligent Inference: ONNX, Machine Learning, Data Analytics</div>
                `;
                break;

            case 'projects':
                playSfx(sndEnter);
                response = `
                    <div class="cli-heading">Featured Architectures:</div>
                    <div>1. <span class="cli-highlight">Smart Command Assistant</span> - Chrome side panel speech shell</div>
                    <div>2. <span class="cli-highlight">AI Toxicity Detector</span> - Offline local ONNX screen NLP scanner</div>
                    <div>3. <span class="cli-highlight">SheShield</span> - Foreground triggers &amp; telemetry safe app</div>
                    <div>4. <span class="cli-highlight">BlinkToLive</span> - Eye-blink communicator with gaze mapping</div>
                    <div>5. <span class="cli-highlight">MECHMEETCAR</span> - PHP Web location mechanicalRecovery portal</div>
                `;
                break;

            case 'secret':
                playSfx(sndEnter);
                response = `
                    <div class="cli-heading">🌌 [VIBE &amp; AGENTIC CODE RATIO] 🌌</div>
                    <div>☕ Coffee Ingestion: 85%</div>
                    <div>🎹 Creative Visionary (Vibe): 99%</div>
                    <div>🤖 AI Agent Synthesis: 100%</div>
                    <div>🐛 Compiler warnings ignored: Infinite</div>
                    <div style="color: var(--accent-teal)">Sync Status: System resonance optimized. Ready to ship.</div>
                `;
                break;

            case 'clear':
                playSfx(sndEnter);
                setTimeout(() => {
                    if (termLog) termLog.innerHTML = '';
                }, 50);
                response = '';
                break;

            default:
                playSfx(sndError);
                response = `<span class="cli-err">Shell error: Command '${escapeHTML(cmd)}' not found. Type 'help' to review index.</span>`;
                break;
        }

        return response;
    }
});
