
/* =========================================
   STUDENT PORTFOLIO - MAIN JAVASCRIPT
   ========================================= */


/* =========================================
   1. ACADEMIC PLANNER
   ========================================= */

function initialisePlanner() {
    const taskForm = document.getElementById("task-form");

    if (!taskForm) return;

    const taskInput = document.getElementById("task-input");
    const courseSelect = document.getElementById("course-select");
    const addCourseButton = document.getElementById("add-course-button");
    const prioritySelect = document.getElementById("priority-select");
    const dueDateInput = document.getElementById("due-date");
    const taskList = document.getElementById("task-list");
    const taskFilter = document.getElementById("task-filter");
    const emptyMessage = document.getElementById("empty-message");

    const totalTasks = document.getElementById("total-tasks");
    const completedTasks = document.getElementById("completed-tasks");
    const pendingTasks = document.getElementById("pending-tasks");
    const overdueTasks = document.getElementById("overdue-tasks");

    // Load saved data safely.
    function loadData(key, fallback) {
        try {
            const savedData = localStorage.getItem(key);
            return savedData ? JSON.parse(savedData) : fallback;
        } catch (error) {
            console.error(`Could not load ${key}:`, error);
            return fallback;
        }
    }

    let tasks = loadData("tasks", []);
    let customCourses = loadData("customCourses", []);

    if (!Array.isArray(tasks)) tasks = [];
    if (!Array.isArray(customCourses)) customCourses = [];

    // Save planner information.
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function saveCourses() {
        localStorage.setItem(
            "customCourses",
            JSON.stringify(customCourses)
        );
    }

    // Get today's local date.
    function getLocalDateString() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // Restore previously added courses.
    function loadCustomCourses() {
        customCourses.forEach(course => {
            const alreadyExists = Array.from(courseSelect.options)
                .some(option => option.value === course);

            if (!alreadyExists) {
                const option = document.createElement("option");
                option.value = course;
                option.textContent = course;
                courseSelect.appendChild(option);
            }
        });
    }

    // Add a custom course.
    if (addCourseButton && courseSelect) {
        addCourseButton.addEventListener("click", function () {
            const courseName = prompt("Enter the name of the new course:");

            if (!courseName || !courseName.trim()) return;

            const newCourse = courseName.trim();

            const existingCourse = Array.from(courseSelect.options)
                .some(option =>
                    option.value.toLowerCase() === newCourse.toLowerCase()
                );

            if (existingCourse) {
                alert("This course already exists.");
                return;
            }

            customCourses.push(newCourse);
            saveCourses();

            const option = document.createElement("option");
            option.value = newCourse;
            option.textContent = newCourse;

            courseSelect.appendChild(option);
            courseSelect.value = newCourse;
        });
    }

    // Check whether a task is overdue.
    function isOverdue(task) {
        return (
            task.dueDate &&
            task.dueDate < getLocalDateString() &&
            !task.completed
        );
    }

    // Update task statistics.
    function updateStatistics() {
        const total = tasks.length;

        const completed = tasks.filter(task => task.completed).length;

        const pending = tasks.filter(task => !task.completed).length;

        const overdue = tasks.filter(task => isOverdue(task)).length;

        if (totalTasks) totalTasks.textContent = total;
        if (completedTasks) completedTasks.textContent = completed;
        if (pendingTasks) pendingTasks.textContent = pending;
        if (overdueTasks) overdueTasks.textContent = overdue;
    }

    // Display tasks.
    function renderTasks() {
        if (!taskList) return;

        taskList.innerHTML = "";

        const selectedFilter = taskFilter ? taskFilter.value : "all";

        let filteredTasks = tasks;

        if (selectedFilter === "pending") {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (selectedFilter === "completed") {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (selectedFilter === "overdue") {
            filteredTasks = tasks.filter(task => isOverdue(task));
        }

        if (filteredTasks.length === 0) {
            if (emptyMessage) {
                emptyMessage.style.display = "block";
            }
        } else if (emptyMessage) {
            emptyMessage.style.display = "none";
        }

        filteredTasks.forEach(task => {
            const listItem = document.createElement("li");
            listItem.className = "task-item";

            // Checkbox.
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.setAttribute("aria-label", "Mark task as completed");

            // Task information.
            const taskInfo = document.createElement("div");
            taskInfo.className = "task-info";

            const description = document.createElement("span");
            description.className = "task-description";
            description.textContent = task.description;

            if (task.completed) {
                description.style.textDecoration = "line-through";
            }

            const details = document.createElement("small");
            details.className = "task-details";

            const dueText = task.dueDate
                ? `Due: ${task.dueDate}`
                : "No due date";

            details.textContent =
                `${task.course} | ${task.priority} priority | ${dueText}`;

            taskInfo.appendChild(description);
            taskInfo.appendChild(details);

            // Delete button.
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-task";
            deleteButton.textContent = "Delete";

            // Mark task as completed or pending.
            checkbox.addEventListener("change", function () {
                const taskToUpdate = tasks.find(
                    item => item.id === task.id
                );

                if (taskToUpdate) {
                    taskToUpdate.completed = checkbox.checked;
                    saveTasks();
                    renderTasks();
                }
            });

            // Delete task.
            deleteButton.addEventListener("click", function () {
                tasks = tasks.filter(item => item.id !== task.id);

                saveTasks();
                renderTasks();
            });

            listItem.appendChild(checkbox);
            listItem.appendChild(taskInfo);
            listItem.appendChild(deleteButton);

            taskList.appendChild(listItem);
        });

        updateStatistics();
    }

    // Add a new task.
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const description = taskInput.value.trim();
        const course = courseSelect.value;
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value;

        if (!description) {
            alert("Please enter a task.");
            return;
        }

        if (!course) {
            alert("Please select a course.");
            return;
        }

        const newTask = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            description: description,
            course: course,
            priority: priority,
            dueDate: dueDate,
            completed: false
        };

        tasks.push(newTask);

        saveTasks();
        taskForm.reset();
        renderTasks();
    });

    // Filter tasks.
    if (taskFilter) {
        taskFilter.addEventListener("change", renderTasks);
    }

    loadCustomCourses();
    renderTasks();
}


/* =========================================
   2. CONTACT FORM VALIDATION
   ========================================= */

function initialiseContactForm() {
    const contactForm = document.getElementById("contact-form");

    if (!contactForm) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const feedback = document.getElementById("form-feedback");

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const message = messageInput.value.trim();

        // Validation patterns.
        const namePattern = /^[A-Za-z\s'-]+$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^0\d{10}$/;

        function showFeedback(messageText, isError) {
            if (!feedback) return;

            feedback.textContent = messageText;
            feedback.style.color = isError ? "#ff6b6b" : "#4ade80";
        }

        // Check required fields.
        if (!name || !email || !message) {
            showFeedback(
                "Please complete all required fields.",
                true
            );
            return;
        }

        // Validate name.
        if (!namePattern.test(name)) {
            showFeedback(
                "Please enter a valid name.",
                true
            );
            return;
        }

        // Validate email.
        if (!emailPattern.test(email)) {
            showFeedback(
                "Please enter a valid email address.",
                true
            );
            return;
        }

        // Validate phone only when the user enters one.
        if (phone && !phonePattern.test(phone)) {
            showFeedback(
                "Please enter a valid 11-digit Nigerian phone number.",
                true
            );
            return;
        }

        // Validate message.
        if (message.length < 5) {
            showFeedback(
                "Your message should contain at least 5 characters.",
                true
            );
            return;
        }

        // Demonstration form: no backend submission.
        showFeedback(
            "Your details passed validation. This demonstration form does not send messages to a server yet.",
            false
        );
    });
}


/* =========================================
   3. IMAGE LIGHTBOX
   ========================================= */

function initialiseLightbox() {
    const images = document.querySelectorAll("img");

    if (images.length === 0) return;

    const lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";

    lightbox.style.cssText = `
        display: none;
        position: fixed;
        z-index: 9999;
        inset: 0;
        background: rgba(0, 0, 0, 0.92);
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;

    const enlargedImage = document.createElement("img");

    enlargedImage.style.cssText = `
        max-width: 90%;
        max-height: 85vh;
        object-fit: contain;
        border-radius: 10px;
    `;

    const closeButton = document.createElement("button");

    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Close image");

    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        background: transparent;
        border: none;
        color: white;
        font-size: 40px;
        cursor: pointer;
    `;

    lightbox.appendChild(enlargedImage);
    lightbox.appendChild(closeButton);

    document.body.appendChild(lightbox);

    function closeLightbox() {
        lightbox.style.display = "none";
        enlargedImage.src = "";
    }

    // Open images when clicked.
    images.forEach(image => {
        image.style.cursor = "pointer";

        image.addEventListener("click", function () {
            if (!image.src) return;

            enlargedImage.src = image.src;
            enlargedImage.alt = image.alt;
            lightbox.style.display = "flex";
        });
    });

    closeButton.addEventListener("click", closeLightbox);

    // Close when the background is clicked.
    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Close using the Escape key.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeLightbox();
        }
    });
}


/* =========================================
   4. AUDIO INTRODUCTION PLAYER
   ========================================= */

function initialiseAudioPlayer() {
    const audio = document.getElementById("introAudio");
    const player = document.getElementById("voicePlayer");
    const playButton = document.getElementById("voicePlayBtn");
    const playIcon = document.getElementById("voicePlayIcon");
    const timeDisplay = document.getElementById("voiceTime");
    const progressBar = document.getElementById("voiceProgress");

    if (
        !audio ||
        !player ||
        !playButton ||
        !playIcon ||
        !timeDisplay ||
        !progressBar
    ) {
        return;
    }

    // Format seconds into minutes and seconds.
    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    // Update audio progress and time.
    function updateProgress() {
        const currentTime = audio.currentTime || 0;
        const duration = audio.duration || 0;

        timeDisplay.textContent =
            `${formatTime(currentTime)} / ${formatTime(duration)}`;

        progressBar.value = duration
            ? (currentTime / duration) * 100
            : 0;
    }

    // Update play/pause button.
    function updatePlayerState() {
        if (audio.paused) {
            playIcon.textContent = "▶";
            playButton.setAttribute("aria-label", "Play audio");
        } else {
            playIcon.textContent = "Ⅱ";
            playButton.setAttribute("aria-label", "Pause audio");
        }
    }

    // Play or pause audio.
    playButton.addEventListener("click", async function () {
        if (audio.paused) {
            try {
                await audio.play();
            } catch (error) {
                console.error("Audio playback failed:", error);
            }
        } else {
            audio.pause();
        }

        updatePlayerState();
    });

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("durationchange", updateProgress);
    audio.addEventListener("play", updatePlayerState);
    audio.addEventListener("pause", updatePlayerState);

    // Reset when audio finishes.
    audio.addEventListener("ended", function () {
        audio.currentTime = 0;
        updateProgress();
        updatePlayerState();
    });

    // Allow users to move through the audio.
    progressBar.addEventListener("input", function () {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime =
                (Number(progressBar.value) / 100) * audio.duration;
        }
    });

    updateProgress();
    updatePlayerState();
}


/* =========================================
   5. INITIALISE ALL WEBSITE FEATURES
   ========================================= */

function initialisePortfolio() {
    initialisePlanner();
    initialiseContactForm();
    initialiseLightbox();
    initialiseAudioPlayer();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisePortfolio);
} else {
    initialisePortfolio();
}
