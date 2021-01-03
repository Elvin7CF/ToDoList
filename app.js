//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const date=require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false});

//创建数据库模块
//Item模块
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    }
});

//List模块
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});


//创建Item集合
const Item = mongoose.model("Item", itemSchema);
//创建List集合
const List = mongoose.model("List", listSchema);

//无数据库方法
// //js奇怪的地方，常量定义数组或对象，你不可以让他重新分配内容，但可以修改数组或对象的内容，如
// // const a=[1,2];
// // a=[3] 是错的
// //但你可以a.push(3)
// const items=["Buy Food","Cook Food"];
// const workItems=[];

const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item."});
const item3 = new Item({name: "<-- Hit this to delete an item."})

const defaultItems = [item1,item2,item3];

//获取日期
const day=date.getDate();

app.get("/",function(req,res){
    
    Item.find( function(err,items){
        if(err){
            console.log(err);
        }else{
            if(items.length === 0){
                //Items集合为空，插入原始item
                Item.insertMany(defaultItems, function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Successfully inserted all document.");
                    }
                });
                //刷新页面
                res.redirect("/");
            }else{
                //获取数据库的items集合的每个document
                res.render('list',{listItem: "Today" ,addItems: items});
            }
        }
    });

    
});

//动态路由
app.get("/:customListName", function(req,res){

    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName }, function(err,list){
        if(!err){
            if(list){
                //列表已存在于数据库，跳转到该页面
                res.render("list", {listItem: list.name ,addItems: list.items})
            }else{
                //不存在，创建新的列表加入到数据库
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });
                newList.save();
                // 跳转到新列表页面
                res.redirect("/" + customListName);
            }
        }
    });
});


app.post("/",function(req,res){

    //从post表单获取输入的item
    const itemName = req.body.newItem;
    //获取表名
    const listName = req.body.list;

    //创建document
    const item = new Item({
        name: itemName
    });

    if( listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne( {name: listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        })
    }

});

//当点击checkbox，删除item
app.post("/delete",function(req,res){
    //从表单获取checkbox选中item的id
    const checkedItemId = req.body.checkbox;
    //不知道为什么req.body.list返回一个包含重复列表名字的数组,因此改为获取数组第一个元素
    const listName = req.body.list[0];

    if( listName === "Today"){
        //在主页中，从数据库中移除
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listName }, { $pull:{ items: {_id: checkedItemId}}},function(err,foundlist){
            if(!err){
                res.redirect("/"+ listName );
            }
        });
    }

})



app.listen(3000,function(){
    console.log("Server started on port 3000.");
})



