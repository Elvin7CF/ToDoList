# To Do List 
`version 1.0`

>Udemy课程 [22章266节](https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/12384846#questions)

用EJS（一个嵌入式 JavaScript 模板引擎），制作了一个简易的待办事项清单。


`version 2.0`

>Udemy课程 [28章342节](https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/12385906#search)

加入了数据库保存列表与事件，主要通过`Node.js`运用`Mongoose`工具对本地的`MongoDB`数据库进行控制。

## 笔记

### Schema模块与关系

```js
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    }
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

```
这里创建了两个Schema模块，以及在`listSchema`中包含`itemSchema`，以此来创建每个列表包含一个事件集合的关系

### EJS渲染页面

```js
app.get("/",function(req,res){
    //查找数据库中的Item是否存在item数据
    Item.find( function(err,items){
        if(err){
            console.log(err);
        }else{
            if(items.length === 0){
                //Item集合为空，插入原始item
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
                //数据不为空
                //用EJS给HTMl页面渲染标题，并给HTMl页面发送数据库的items集合
                res.render('list',{listItem: "Today", addItems: items});
            }
        }
    });
});
```
运用Mongoose的函数，`Model.find()`方法查找本地数据库，看Item是否为空。

为空运用`Model.insertMany()`方法传入默认数组，即插入数据。

`res.redirect("/")`刷新页面后，运行`else{...}`语句，用EJS渲染传入数据

### 动态路由
```js
app.get("/:customListName", function(req,res){

    const customListName = _.capitalize(req.params.customListName);
    ...  
});
```
`req.params.customListName`可以从地址栏中获取用户自定义列表名。

`_.capitalize()`是`lodash`库的方法，可以让字符串统一格式化为首字母大写

### 删除文档，并渲染页面
```js
app.post("/delete",function(req,res){
    //从表单获取checkbox选中item的id
    const checkedItemId = req.body.checkbox;
    //这里不知道为什么req.body.list会返回一个包含重复列表名字的数组,因此用数组下标获取数组第一个元素
    const listName = req.body.list[0];

    if( listName === "Today"){
        //在默认页面中，直接在数据库中移除
        Item.findByIdAndRemove(checkedItemId,function(err){
          ...
        });
    }else{
        //找到当前列表，并用$pull方法，直接对列表中的数组作删除操作
        List.findOneAndUpdate({name: listName }, { $pull:{ items: {_id: checkedItemId}}},function(err,foundlist){
          ...
            }
        });
    }
});
```
`Model.findByIdAndRemove()`：通过_id删除文档

`Model.findOneAndUpdate()`：更新文档，这里显示通过`name`属性，搜索出列表文档，接着通过`$pull`方法，查找该文档的items数组，并删除所选中的item

### ejs页面

```html
<form action="/delete" method="POST">
        <!-- 凭借ejs让html可以简单运用js，遍历addItems的所以元素 -->
        <% addItems.forEach(function(eachItem){ %>
            <div class="item">
                <!-- onChange可以在checkbox勾选状态改变时提交数据 -->
                <input type="checkbox" name="checkbox" value="<%= eachItem._id %>" onChange="this.form.submit()">
                <p><%= eachItem.name %></p>
                <!-- hidden类型的input，可以在提交表单时，选定要发送的内容 -->
                <input type="hidden" name="list" value="<%= listItem  %>">
            </div>
        <% }); %>
    </form>
```
`<input type="hidden">`在[MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Input/hidden)上的解释:
`hidden`类型的 `<input>` 元素允许 Web 开发者存放一些用户不可见、不可改的数据，在用户提交表单时，这些数据会一并发送出。比如，正被请求或编辑的内容的 ID，或是一个唯一的安全令牌。这些隐藏的 <input>元素在渲染完成的页面中完全不可见，而且没有方法可以使它重新变为可见。


