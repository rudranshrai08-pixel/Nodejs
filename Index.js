
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Create files folder
const filesDir = path.join(__dirname, "files");
fs.mkdirSync(filesDir, { recursive: true });

// Middleware 1: Logger
const logger = (req, res, next) => {
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    next();
};

// Middleware 2: Authentication
const authMiddleware = (req, res, next) => {
    const token = req.header("token");

    if (token === "abc123") {
        return next();
    }

    return res.status(401).json({
        message: "Unauthorized! Invalid token."
    });
};

// Middleware 3: Request time
const timeMiddleware = (req, res, next) => {
    req.requestTime = new Date().toLocaleString();
    console.log("Request time:", req.requestTime);
    next();
};

// Apply logger and time middleware globally
app.use(logger);
app.use(timeMiddleware);

// Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Protected route
app.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Welcome to your profile!",
        requestTime: req.requestTime
    });
});

// Validate filename
function getFilePath(filename) {
    if (
        typeof filename !== "string" ||
        !filename.trim() ||
        filename !== path.basename(filename) ||
        filename.includes("/") ||
        filename.includes("\\")
    ) {
        return null;
    }

    return path.join(filesDir, filename);
}

// WRITE FILE: POST /write?fname=abc.txt
app.post("/write", (req, res) => {
    const filepath = getFilePath(req.query.fname);
    const content = req.body.content ?? req.query.content;

    if (!filepath) {
        return res.status(400).send("Please provide a valid filename.");
    }

    if (typeof content !== "string" || content.length === 0) {
        return res.status(400).send("Please provide file content.");
    }

    fs.writeFile(
        filepath,
        content,
        { encoding: "utf8", flag: "wx" },
        (error) => {
            if (error) {
                if (error.code === "EEXIST") {
                    return res.status(409).send("File already exists!");
                }

                return res.status(500).send("Unable to write file.");
            }

            res.status(201).send("File written successfully!");
        }
    );
});

// READ FILE: GET /read?fname=abc.txt
app.get("/read", (req, res) => {
    const filepath = getFilePath(req.query.fname);

    if (!filepath) {
        return res.status(400).send("Please provide a valid filename.");
    }

    fs.readFile(filepath, "utf8", (error, data) => {
        if (error) {
            if (error.code === "ENOENT") {
                return res.status(404).send("File not found!");
            }

            return res.status(500).send("Unable to read file.");
        }

        res.type("text/plain").send(data);
    });
});

// APPEND FILE: PUT /append?fname=abc.txt
app.put("/append", (req, res) => {
    const filepath = getFilePath(req.query.fname);
    const content = req.body.content ?? req.query.content;

    if (!filepath) {
        return res.status(400).send("Please provide a valid filename.");
    }

    if (typeof content !== "string" || content.length === 0) {
        return res.status(400).send("Please provide content to append.");
    }

    fs.appendFile(filepath, content, "utf8", (error) => {
        if (error) {
            if (error.code === "ENOENT") {
                return res.status(404).send("File not found!");
            }

            return res.status(500).send("Unable to append file.");
        }

        res.send("File updated successfully!");
    });
});

// DELETE FILE: DELETE /delete?fname=abc.txt
app.delete("/delete", (req, res) => {
    const filepath = getFilePath(req.query.fname);

    if (!filepath) {
        return res.status(400).send("Please provide a valid filename.");
    }

    fs.unlink(filepath, (error) => {
        if (error) {
            if (error.code === "ENOENT") {
                return res.status(404).send("File not found!");
            }

            return res.status(500).send("File not deleted.");
        }

        res.send("File deleted successfully!");
    });
});

// Unknown route
app.use((req, res) => {
    res.status(404).send("404 - Route not found.");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
