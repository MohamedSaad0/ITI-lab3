const express = require('express')
const fs = require('fs')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const userRouter = require('./routers/usersRouter')
const {logRequest} = require('./generalHelpers')
const { v4: uuidv4 } = require("uuid");
const { validateUser } = require("./userHelpers");
const { json } = require('body-parser')

app.use(bodyParser.json())


// Users Add
app.post("/users", validateUser, async (req, res, next) => {
  try {
      const { username, age, password } = req.body;
      const data = await fs.promises
          .readFile("./user.json", { encoding: "utf8" })
          .then((data) => JSON.parse(data));
      const id = uuidv4();
      data.push({ id, username, age, password });
      await fs.promises.writeFile("./user.json", JSON.stringify(data), {
          encoding: "utf8",
      });
      res.send({ id, message: " User Added sucessfully" });
  } catch (error) {
      next({ status: 500, internalMessage: error.message });
  }
});
//  Users Edit by user id
app.patch("/users/:userId", validateUser, async (req, res, next) => {
  try {
    
    const {username,password,age}=req.body;
    const users =await fs.promises.readFile("./user.json",{encoding:"utf8"})
    .then((data) => JSON.parse(data));
    const newUsers =users.map((user)=>{
      if (user.id !== req.params.userId) return user;
      return {
        username,
        password,
        age,
        id:req.params.userId,
      };
    });
    await fs.promises.writeFile("./user.json",JSON.stringify(newUsers),{
      encoding:"utf8"}
      
      );
    res.status(200).send({message:"User Is  Edited Succesfully"});
  } catch (error){
    next({status:500,internalMessage:error.message});
  }
});

//  User get with age and get all if no age specified

app.get('/users', async (req,res,next)=>{
  try {
  if(typeof req.query.age == 'undefined')
  {
    const users = await fs.promises
    .readFile("./user.json", { encoding: "utf8" })
    .then((data) => JSON.parse(data));
    res.send(users)
  }else
  {
    const age = Number(req.query.age)
    const users = await fs.promises
    .readFile("./user.json", { encoding: "utf8" })
    .then((data) => JSON.parse(data));
    const filteredUsers = users.filter(user=>user.age===age)
    res.send(filteredUsers)
  }
  
  } catch (error) {
  next({ status: 500, internalMessage: error.message });
  }

})

  // User Loggin
  app.post("/loginin",async (req, res, next) => {
    const { username, password } = req.body;
    if(!username) return next({status:422, message:"username is requird"})
    if(!password) return next({status:422, message:"password is requird"})
    try {
      const users = await fs.promises
      .readFile("./user.json", { encoding: "utf8" })
      .then((data) => JSON.parse(data));
      const isUser = users.some(user=>user.username===username && user.password ===password)
      if(isUser)
      {
        res.status(200).send({message: "Succesfully Signned In"});
      }else
      {
        next({status:403, message:"Please Register"})
      }
      } catch (error) {
      next({ status: 500, internalMessage: error.message });
      }
  });
// Handling Error
app.use((err,req,res,next)=>{
  if(err.status>=500){
    console.log(err.internalMessage)
    return res.status(500).send({error :"internal server error"})
  }
  res.status(err.status).send(err.message)

})
// User Delete by id
app.delete("/users/:id", async (req, res, next) => {
  try {
      const id = req.params.id
      console.log(id);
      const users = await fs.promises.readFile('./user.json', { encoding: "utf8" })
          .then((data) => JSON.parse(data))

      const newUsers = users.filter(user => {
          return user.id != id
      })
      await fs.promises.writeFile("./user.json", JSON.stringify(newUsers), (err) => {
          if (!err) return res.status(200).send({ message: "success" })
          res.status(500).send("server error")
      })
      res.status(200).send({ message: "user deleted" })

  }
  catch (error) {
      next({ status: 500, internalMessage: error.message });
  }
})

// User show by id

app.get("/users/:id", async (req, res, next) => {
  try {
      const id = req.params.id
      console.log(id);
      const users = await fs.promises.readFile('./user.json', { encoding: "utf8" })
          .then((data) => JSON.parse(data))

      const newUser = users.filter(user => {
          return user.id == id
      })
      res.status(200).send(newUser)
  }
  catch (error) {
      next({ status: 500, internalMessage: error.message });
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})