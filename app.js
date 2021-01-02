//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const date=require(__dirname+"/date.js");

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//js奇怪的地方，常量定义数组或对象，你不可以让他重新分配内容，但可以修改数组或对象的内容，如
// const a=[1,2];
// a=[3] 是错的
//但你可以a.push(3)
const items=["Buy Food","Cook Food"];
const workItems=[];

app.get("/",function(req,res){
    const day=date.getDate();
    res.render('list',{listItem: day ,addItems: items});
})

app.get("/work",function(req,res){
    res.render("list",{listItem: "Work List", addItems: workItems})
})

app.get("/about",function(req,res){
    res.render("about");
})

app.post("/",function(req,res){

    const item=req.body.newItem;
    if(req.body.list === "Work"){
        workItems.push(item);
        res.redirect("/work");
    }else{
        items.push(item);
        res.redirect("/");
    }
})



app.listen(3000,function(){
    console.log("Server started on port 3000.");
})



