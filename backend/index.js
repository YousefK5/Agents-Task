import express from "express"
import mysql from "mysql"
import bcrypt from "bcrypt"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

app.listen(8800, ()=>{
    console.log("Connected");
})

const db =mysql.createConnection({
    host : "localhost" ,
    user: "root" , 
    password : "root" ,
    database: "agent-task"
})

app.get("/" , (req , res)=>{
    res.json("hello this is")
})

 app.post("/signup" ,async (req , res)=>{
    // return res.json(req.body);
    const q = "INSERT INTO `users` (`name`, `email`, `password`) VALUES (?);";
    const values = [req.body.name , req.body.email];
    const hash = await bcrypt.hash(req.body.password , 10);
    values[2] = hash;
    // return res.json(values)
    db.query(q , [values] , (err,data)=>{
        if(err) return res.json(err)
        let resp = {
            status : 200 ,
            user : {
                id : data.insertId,
                name : values[0],
                email : values[1],
            } ,
            message : "Successfully Sign up"
        }
        return res.json(resp);
    })

})

app.post("/login" , (req , res)=>{
    // return res.json(req.body);
    const q = "SELECT * from users WHERE email=?;";
    const email = req.body.email
    db.query(q , [email] ,async (err,data)=>{
        if(err) return res.json(err)
        let respErr= {
            status : 400 ,
            message : "Invalid Email Or Password"
        }
        if (data.length==0) return res.json(respErr)
        // return res.json(data)
        const match = await bcrypt.compare(req.body.password, data[0].password);
        if (!match) return res.json(respErr)
        let resp= {
            status : 200 ,
            message : "Successfully Login",
            user : {
                "id":data[0].id,
                "name":data[0].name,
                "email":data[0].email
            }
        }
        return res.json(resp)
    })

})

app.post("/addProduct" , (req , res)=>{
    const q = "INSERT INTO `products` (`title`,`desc`,`user_id`,`image`,`price`) VALUES (?);"
    const values = [req.body.title , req.body.desc , req.body.user_id , req.body.image , req.body.price];
    db.query(q , [values] , (err,data)=>{
        if(err) return res.json(err)
        let resp = {
            status : 200 ,
            product : {
                id : data.insertId,
                title : values[0],
                desc : values[1],
                user_id : values[2],
                image : values[3],
                price : values[4]
            } ,
            message : "Successfully Added Product"
        }
        return res.json(resp);
    })

})

app.post("/editProduct/:id" , (req , res)=>{
    const q = "UPDATE `products` SET `title` = ?, `desc` = ?, `image` = ?, `price` = ? WHERE `products`.`id` = ?;"
    const values = [req.body.title , req.body.desc, req.body.image , req.body.price , req.params.id];
    db.query(q , [...values] , (err,data)=>{
        if(err) return res.json(err)
        let resp = {
            status : 200 ,
            product : {
                title : values[0],
                desc : values[1],
                image : values[2],
                price : values[3]
            } ,
            message : "Successfully Edit Product"
        }
        return res.json(resp);
    })
})

app.post("/deleteProduct/:id" , (req , res)=>{
    const q = "DELETE FROM `products` WHERE `id` = ?"
    const id = req.params.id;
    // return res.json(id)
    db.query(q , id, (err,data)=>{
        if(err) return res.json(err)
        let resp = {
            status : 200 ,
            
            message : "Successfully Deleted Product"
        }
        return res.json(resp);
    })
})

app.get("/products" , (req ,res)=>{
    const q = "SELECT * FROM products ORDER BY id DESC;"
    db.query(q , (err , data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

app.get("/products/:id" , (req ,res)=>{
    const id = req.params.id
    const q = "SELECT * FROM products WHERE id = ?;"
    db.query(q ,id, (err , data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
})