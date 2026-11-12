
// ==========================================
// ACADEMIC PLANNER
// ==========================================

// Get HTML elements
const courseSelect = document.getElementById("course-select");
const addCourseButton = document.getElementById("add-course-button");

const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

const taskFilter = document.getElementById("task-filter");
const emptyMessage = document.getElementById("empty-message");


// ==========================================
// RUN PLANNER CODE ONLY ON PLANNER PAGE
// ==========================================

if (taskForm) {

    // ==========================================
    // 1. LOAD SAVED COURSES
    // ==========================================

    let customCourses = [];

    const savedCourses = localStorage.getItem("customCourses");

    if (savedCourses) {
        try {
            customCourses = JSON.parse(savedCourses);
        } catch (error) {
            customCourses = [];
        }
    }


    // ==========================================
    // 2. ADD COURSE TO DROPDOWN
    // ==========================================

    function addCourseToDropdown(course) {

        const option = document.createElement("option");

        option.value = course.code;

        option.textContent = course.code + " - " + course.name;

        courseSelect.appendChild(option);
    }


    // ==========================================
    // 3. LOAD CUSTOM COURSES
    // ==========================================

    function loadCourses() {

        customCourses.forEach(function(course) {
            addCourseToDropdown(course);
        });

    }

    loadCourses();


    // ==========================================
    // 4. ADD NEW COURSE
    // ==========================================

    addCourseButton.addEventListener("click", function() {

        const courseCode = prompt("Enter the new course code:");

        if (courseCode === null || courseCode.trim() === "") {
            return;
        }

        const newCode = courseCode.trim().toUpperCase();

        // Check if course already exists
        const courseExists = customCourses.some(function(course) {
            return course.code.toUpperCase() === newCode;
        });

        const existingOption = Array.from(courseSelect.options).some(
            function(option) {
                return option.value.toUpperCase() === newCode;
            }
        );

        if (courseExists || existingOption) {
            alert("This course already exists.");
            return;
        }

        // Create new course
        const newCourse = {
            code: newCode,
            name: newCode
        };

        customCourses.push(newCourse);

        // Save course in Local Storage
        localStorage.setItem(
            "customCourses",
            JSON.stringify(customCourses)
        );

        addCourseToDropdown(newCourse);

        courseSelect.value = newCode;

        alert(newCode + " has been added successfully!");

    });


    // ==========================================
    // 5. LOAD SAVED TASKS
    // ==========================================

    let tasks = [];

    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            tasks = [];
        }
    }


    // ==========================================
    // 6. SAVE TASKS
    // ==========================================

    function saveTasks() {

        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks)
        );

    }


    // ==========================================
    // 7. ADD NEW TASK
    // ==========================================

    taskForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const description =
            document.getElementById("task-input").value.trim();

        const course = courseSelect.value;

        const priority =
            document.getElementById("priority-select").value;

        const dueDate =
            document.getElementById("due-date").value;

        if (
            description === "" ||
            course === "" ||
            priority === "" ||
            dueDate === ""
        ) {
            alert("Please complete all task fields.");
            return;
        }

        const task = {
            id: Date.now(),
            description: description,
            course: course,
            priority: priority,
            dueDate: dueDate,
            completed: false
        };

        tasks.push(task);

        saveTasks();

        taskForm.reset();

        renderTasks();

    });


    // ==========================================
    // 8. DISPLAY TASKS
    // ==========================================

    function renderTasks() {

        taskList.replaceChildren();

        const selectedFilter = taskFilter.value;

        const today = new Date().toISOString().split("T")[0];

        const filteredTasks = tasks.filter(function(task) {

            if (selectedFilter === "completed") {
                return task.completed;
            }

            if (selectedFilter === "pending") {
                return !task.completed;
            }

            if (selectedFilter === "overdue") {
                return !task.completed && task.dueDate < today;
            }

            return true;

        });

        if (filteredTasks.length === 0) {
            emptyMessage.style.display = "block";
        } else {
            emptyMessage.style.display = "none";
        }

        filteredTasks.forEach(function(task) {

            const taskItem = document.createElement("li");

            // Checkbox
            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.checked = task.completed;

            // Task description
            const taskText = document.createElement("span");

            taskText.textContent =
                task.description +
                " | " +
                task.course +
                " | Priority: " +
                task.priority +
                " | Due: " +
                task.dueDate;

            if (task.completed) {
                taskText.style.textDecoration = "line-through";
            }

            // Mark task as completed
            checkbox.addEventListener("change", function() {

                task.completed = checkbox.checked;

                saveTasks();

                renderTasks();

            });

            // Delete button
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.type = "button";

            deleteButton.addEventListener("click", function() {

                tasks = tasks.filter(function(item) {
                    return item.id !== task.id;
                });

                saveTasks();

                renderTasks();

            });

            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskText);
            taskItem.appendChild(deleteButton);

            taskList.appendChild(taskItem);

        });

        updateStatistics();

    }


    // ==========================================
    // 9. FILTER TASKS
    // ==========================================

    taskFilter.addEventListener("change", function() {

        renderTasks();

    });


    // ==========================================
    // 10. UPDATE DASHBOARD STATISTICS
    // ==========================================

    function updateStatistics() {

        const today = new Date().toISOString().split("T")[0];

        const total = tasks.length;

        const completed = tasks.filter(function(task) {
            return task.completed;
        }).length;

        const pending = tasks.filter(function(task) {
            return !task.completed;
        }).length;

        const overdue = tasks.filter(function(task) {
            return !task.completed && task.dueDate < today;
        }).length;

        document.getElementById("total-tasks").textContent = total;

        document.getElementById("completed-tasks").textContent = completed;

        document.getElementById("pending-tasks").textContent = pending;

        document.getElementById("overdue-tasks").textContent = overdue;

    }


    // ==========================================
    // 11. START THE PLANNER
    // ==========================================

    renderTasks();

}


// ==========================================
// CONTACT FORM VALIDATION
// ==========================================

const contactForm = document.getElementById("contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", function(event) {

        // Prevent page refresh
        event.preventDefault();

        // Get form values
        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email").value.trim();

        const phone = document.getElementById("phone").value.trim();

        const message = document.getElementById("message").value.trim();

        const feedback = document.getElementById("form-feedback");

        // Reset previous feedback
        feedback.style.color = "red";

        // Validate name
        const namePattern = /^[A-Za-z\s'-]+$/;

         if (name === "") {
          feedback.textContent = "Please enter your name.";
          return;
        }

         if (!namePattern.test(name)) {
          feedback.textContent = "Name must contain letters only.";
          return;
        }

        // Validate email
        if (email === "") {
            feedback.textContent = "Please enter your email.";
            return;
        }
        
        // Check email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

         if (!emailPattern.test(email)) {
          feedback.textContent = "Please enter a valid email address.";
          return;
}


        // Validate phone
        if (phone === "") {
         feedback.textContent = "Please enter your phone number.";
         return;
        }

        const phonePattern = /^0\d{10}$/;

        if (!phonePattern.test(phone)) {
         feedback.textContent = "Enter a valid 11-digit Nigerian phone number.";
         return;
        }

        // Validate message
        if (message === "") {
            feedback.textContent = "Please enter your message.";
            return;
        }

        // All validation checks passed
        feedback.textContent = "Your message has been submitted successfully!";

        feedback.style.color = "green";

        contactForm.reset();

    });

}
