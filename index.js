import dotenv from "dotenv";
dotenv.config();
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const path = require("path");
const methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// MySQL connection
const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

connection.connect(err => {
    if (err) {
        console.error("❌ Error connecting to DB:", err);
        process.exit(1);
    }
    console.log("✅ Connected to MySQL database");
});

// Utility function for random user
const getRandomUser = () => [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
];

// Routes
app.get("/", (req, res) => {
    const q = `SELECT count(*) AS count FROM user`;
    connection.query(q, (err, result) => {
        if (err) return res.send("DB Error");
        res.render("home.ejs", { count: result[0].count });
    });
});

app.get("/user", (req, res) => {
    connection.query(`SELECT * FROM user`, (err, users) => {
        if (err) return res.send("DB Error");
        res.render("showusers.ejs", { users });
    });
});

app.get("/user/:id/edit", (req, res) => {
    const { id } = req.params;
    connection.query(`SELECT * FROM user WHERE id = ?`, [id], (err, result) => {
        if (err) return res.send("DB Error");
        if (result.length === 0) return res.send("No user found.");
        res.render("edit.ejs", { user: result[0] });
    });
});

app.patch("/user/:id", (req, res) => {
    const { id } = req.params;
    const { password: formPass, username: newUsername } = req.body;

    connection.query(`SELECT * FROM user WHERE id = ?`, [id], (err, result) => {
        if (err) return res.send("DB Error");
        if (result.length === 0) return res.send("No user found.");
        if (formPass !== result[0].password) return res.send("Wrong Password");

        connection.query(`UPDATE user SET username = ? WHERE id = ?`, [newUsername, id], (err) => {
            if (err) return res.send("DB Error");
            res.redirect("/user");
        });
    });
});

app.post("/user", (req, res) => {
    const { username, email, password } = req.body;
    const q = `INSERT INTO user (id, username, email, password) VALUES (uuid(), ?, ?, ?)`;
    connection.query(q, [username, email, password], (err) => {
        if (err) return res.send("DB Error");
        res.redirect("/user");
    });
});

app.get("/adduser", (req, res) => {
    res.render("addUser.ejs");
});

app.delete("/user/:id", (req, res) => {
    connection.query(`DELETE FROM user WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.send("DB Error");
        res.redirect("/user");
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
