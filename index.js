const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const e = require("express");
const port = 9000;

const jsonParser = express.json();
app.use(cors());

const tokenKey = "1a2b-3c4d-5e6f-7g8h";
let ID = function () {
  return Math.random().toString(36).substr(2, 9);
};

function Authorization(req, res, next) {
  if (req.headers.authorization) {
    console.log("req.headers.authorization", req.headers.authorization);
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      tokenKey,
      (err, payload) => {
        if (err) return res.status(404).json({ message: "Something goes wrong with your token!" });
        else if (("payload", payload)) {
          console.log(payload);
          fs.readFile("./data.json", "utf-8", (error, data) => {
            if (error) throw error;
            data = JSON.parse(data);
            let x = false;
            for (let elem of data) {
              if (elem.id === payload.id) {
                x = true;
              }
            }
            if (x) {
              next();
            } else {
              return res.status(404).json({ message: "Something goes wrong with your token!" });
            }
          });
        }
      }
    );
  }
}

app.get("/getAll", Authorization, (req, res) => {
  fs.readFile("./data.json", "utf-8", (error, data) => {
    if (error) throw error;
    res.send(data);
  });
});


app.post("/login", jsonParser, (req, res) => {
  const pass = req.body.pass;
  const login = req.body.login;
  fs.readFile("./data.json", "utf-8", (error, data) => {
    if (error) throw error;
    data = JSON.parse(data);
    for (let elem of data) {
      if (elem.login === login && elem.password === pass) {
        return res.status(200).json({
          id: elem.id,
          login: elem.login,
          token: jwt.sign({ id: elem.id }, tokenKey),
        });
      }
    }
    return res.status(404).json({ message: "User not found" });
  });
});


app.post("/register", jsonParser, Authorization, (req, res) => {
  console.log('next(5)')
  const pass = req.body.pass;
  const login = req.body.login;
  console.log(pass, login);
  fs.readFile("./data.json", "utf-8", (error, data) => {
    if (error) throw error;
    data = JSON.parse(data);
    let x = true;
    for (let elem of data) {
      if (elem.password === pass && elem.login === login) {
        x = false;
      }
    }
    if (x) {
      data[data.length] = {
        login: login,
        password: pass,
        id:ID()
      };
      fs.writeFile("./data.json", JSON.stringify(data), (error) => {
        if (error) {
          return res.status(404).json({ message: "Something goes wrong" });
        } else {
          res.send(true)
        }
      });
    } else {
      return res.status(404).json({ message: "User cant be created" });
    }
  });
});

app.post("/getById", jsonParser, Authorization, (req, res) => {
  const id = req.body.id;
  fs.readFile("./data.json", "utf-8", (error, data) => {
    if (error) throw error;
    data = JSON.parse(data);
    let response = "not found"
    for(let elem of data){
      if(elem.id == id){
        response = elem;
      }
    }
    res.send(response)
  })
})


app.post("/deleteUser",jsonParser,Authorization,(req,res)=>{
  const id = req.body.id;
  fs.readFile("./data.json", "utf-8", (error, data) => {
    if (error) throw error;
    data = JSON.parse(data);
    let new_data = []
    for(let i = 0;i<data.length;i++){
      if(data[i].id != id){
        new_data[new_data.length] = data[i];
      }
    }
    fs.writeFile("./data.json", JSON.stringify(new_data), (error) => {
      if (error) {
        return res.status(404).json({ message: "Something goes wrong" });
      } else {
        res.send(true)
      }
    });
  })
})





app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
