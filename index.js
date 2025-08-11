const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require('method-override');

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true })); // Middleware for form data
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_ap',
    password:"mummy@12345count"
});

let getRandomUser=()=> {
    return [
        faker.string.uuid(),
        faker.internet.username(), // before version 9.1.0, use userName()
        faker.internet.email(),
        faker.internet.password(),
    ];
}
// //inserting data
// let q="INSERT INTO user(id,username,email,password) VALUES ?";

// let data = [];
// for(let i=0;i<=100;i++){
//     data.push(getRandomUser());
// }


//Home Route
app.get("/",(req,res)=>{
    let q = `SELECT count(*) FROM user`;
    try{
        connection.query(q,(err,result)=>{
        if(err)throw err;
        let count = (result[0]["count(*)"]);
        res.render("home.ejs",{count});
        });
    }catch(err){
        console.log(err);
        res.send("Some errors in DB");
    }
});


//Show Route
app.get("/user",(req,res)=>{
     let q = `SELECT * FROM user`;
    try{
    connection.query(q,(err,users)=>{
        if(err)throw err;
       // console.log(result);
        // res.send(result);
        res.render("showusers.ejs",{users});
    });
    }catch(err){
        res.send("Some errors in DB");
    }
});


//Edit route
app.get("/user/:id/edit",(req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;

        if (result.length === 0) {
            return res.send("No user found.");
        }

            let user = result[0];
            res.render("edit.ejs",{user});
        });
    }catch(err){
        console.log(err);
        res.send("some errors in DB");
    }
});

//Update route
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    connection.query(q, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Some error in DB while fetching user.");
        }
        if (result.length === 0) {
            return res.send("No user found.");
        }
        let user = result[0];
        if (formPass != user.password) {
            return res.send("Wrong Password");
        } else {
            let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`; // fixed the quote here
            connection.query(q2, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("Some error in DB while updating user.");
                }
                res.redirect("/user");
            });
        }
    });
});


//Add new user
app.post("/user",(req,res)=>{
    let{username,email,password} = req.body;
    let q=`INSERT INTO user (id,username,email,password) VALUES (uuid(),?,?,?)`;

    try{
        connection.query(q,[username,email,password],(err,result)=>{
            if(err)throw err;
            res.redirect("/user"); //show updated list
        });
    }catch(err){
        console.log(err);
        res.send("Some error in DB");
    }
});

// Form dikhane ka route
app.get("/adduser", (req, res) => {
    res.render("addUser.ejs");  // views/addUser.ejs file render karega
});


app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let q = `DELETE FROM user WHERE id = ?`;

    connection.query(q,[id],(err, result) => {
        if (err) {
            console.log(err);
            return res.send("Some error in DB while deleting user.");
        }
        res.redirect("/user"); // Show updated user list
    });
});



app.listen(port,(req,res)=>{
    console.log(`App is listening on port ${port}`);
    
})


// try{
//     connection.query(q,[data],(err,result)=>{
//     if(err)throw err;
//     console.log(result);
//     console.log(result.length);
    
// });
// }catch(err){
//     console.log(err);
// }

// connection.end();

