const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// Sample student data
let students = [
    { id: 1, name: "Junaid", course: "MCA" },
    { id: 2, name: "Rahul", course: "BCA" }
];

// HOME PAGE
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Management API</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background: #f1f5f9;
            margin: 0;
            padding: 40px 15px;
        }

        .container {
            max-width: 700px;
            margin: auto;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px #0002;
        }

        h1, h3 {
            text-align: center;
        }

        .buttons {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin: 25px 0;
        }

        button {
            border: none;
            padding: 12px 18px;
            border-radius: 6px;
            color: white;
            font-size: 15px;
            cursor: pointer;
        }

        button:hover {
            opacity: 0.8;
        }

        .get { background: #2563eb; }
        .add { background: #16a34a; }
        .update { background: #d97706; }
        .delete { background: #dc2626; }

        pre {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            min-height: 80px;
        }

        .note {
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Student Management API</h1>
        <p class="note">
            Test four API operations using the buttons below.
        </p>

        <div class="buttons">
            <button class="get" onclick="getData()">
                Get Data
            </button>

            <button class="add" onclick="addData()">
                Add Data
            </button>

            <button class="update" onclick="updateData()">
                Update Data
            </button>

            <button class="delete" onclick="deleteData()">
                Delete Data
            </button>
        </div>

        <h3>API Response</h3>
        <pre id="output">Click a button to see the result.</pre>
    </div>

    <script>
        const output = document.getElementById("output");

        async function callAPI(url, method, body) {
            output.textContent = "Loading...";

            try {
                const options = { method };

                if (body !== undefined) {
                    options.headers = {
                        "Content-Type": "application/json"
                    };
                    options.body = JSON.stringify(body);
                }

                const response = await fetch(url, options);
                const data = await response.json();

                output.textContent = JSON.stringify({
                    status: response.status,
                    data: data
                }, null, 2);
            } catch (error) {
                output.textContent = "Error: " + error.message;
            }
        }

        // GET: Fetch all students
        function getData() {
            callAPI("/api/students", "GET");
        }

        // POST: Add a new student
        function addData() {
            callAPI("/api/students", "POST", {
                name: "Amit",
                course: "MCA"
            });
        }

        // PUT: Update student with ID 1
        function updateData() {
            callAPI("/api/students/1", "PUT", {
                name: "Junaid Updated",
                course: "MCA"
            });
        }

        // DELETE: Delete student with ID 1
        function deleteData() {
            callAPI("/api/students/1", "DELETE");
        }
    </script>
</body>
</html>
    `);
});

// GET API: Read all students
app.get("/api/students", (req, res) => {
    res.status(200).json({
        message: "Students retrieved successfully",
        students: students
    });
});

// POST API: Add a student
app.post("/api/students", (req, res) => {
    const { name, course } = req.body;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof course !== "string" ||
        !course.trim()
    ) {
        return res.status(400).json({
            message: "Valid name and course are required"
        });
    }

    const newStudent = {
        id: Math.max(0, ...students.map(s => s.id)) + 1,
        name: name.trim(),
        course: course.trim()
    };

    students.push(newStudent);

    res.status(201).json({
        message: "Student added successfully",
        student: newStudent
    });
});

// PUT API: Update a student
app.put("/api/students/:id", (req, res) => {
    const id = Number(req.params.id);
    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const { name, course } = req.body;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof course !== "string" ||
        !course.trim()
    ) {
        return res.status(400).json({
            message: "Valid name and course are required"
        });
    }

    student.name = name.trim();
    student.course = course.trim();

    res.status(200).json({
        message: "Student updated successfully",
        student: student
    });
});

// DELETE API: Delete a student
app.delete("/api/students/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const deletedStudent = students.splice(index, 1)[0];

    res.status(200).json({
        message: "Student deleted successfully",
        student: deletedStudent
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});