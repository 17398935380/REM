var http = require("http"),
    url = require("url"),
    fs = require("fs");
var server1 = http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;//存储的是url中问号传参后面的信息，并且是以键值对的方式存储的。
    //静态资源文件获取
    var reg = /\.(HTML|CSS|JS|ICO)/i;
    if (reg.test(pathname)) {
        var suffix = reg.exec(pathname)[1].toUpperCase();
        var suffixMIME = "text/html";
        switch (suffix) {
            case "CSS":
                suffixMIME = "text/css";
                break;
            case "JS":
                suffixMIME = "text/javascript";
                break;
        }
        try {
            var conFile = fs.readFileSync("." + pathname, "utf-8");
            res.writeHead(200, {'content-type': suffixMIME + ';charset=utf-8'});
            res.end(conFile);

        } catch (e) {
            res.writeHead(404, {'content-type': 'text/plain;charset=utf-8'});
            res.end("file is not found~");
        }
        return
    }
    //api数据接口处理
    var con = null, result = null,customId=null,
        customPath = "./json/tt.json";
    // 获取所有的客户信息(api接口)
    con = fs.readFileSync(customPath, "utf-8");
    con.length === 0 ? con = '[]' : null;
    con=JSON.parse(con);
    if (pathname === "/getList") {
        result = {
            code: 1,
            msg: "没有任何的客户信息",
            data: null
        };
        if (con.length > 0) {
            result = {
                code: 0,
                msg: "成功",
                data: con
            };
        }
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;

    }

    //获取某一个具体的客户信息
    if(pathname==="/getInfo"){
        //把客户端传递的id得到
      customId=query["id"];
            result = {
                code: 1,
                msg: "客户不存在",
                data: null
            };
        for (var i = 0; i < con.length; i++) {
           if(con[i]["id"]===customId){
               result = {
                   code: 0,
                   msg: "成功",
                   data: con[i]
               };
               break
           }
        }
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;
    }
    //根据传进来的客户ID删除这个客户
    if(pathname==="/removeInfo"){
       customId=query["id"];
       var flag=false;
        for (var i = 0; i < con.length; i++) {
            if(con[i]["id"]==customId){
                con.splice(i,1);
                flag=true;
                break;
            }
        }
        result={
            code:1,
            msg:"删除失败"
        };
        if(flag){
            fs.writeFileSync(customPath,JSON.stringify(con),"utf-8");
            result={
                code:0,
                msg:"删除成功"
            }
        }
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;
    }
    //增加客户信息
    if(pathname==="/addInfo"){
        var str='';
        req.on("data",function (chunk) {
            str+=chunk;
        });
        req.on("end",function () {
            if(str.length===0){
                res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
                res.end(JSON.stringify({
                    code:1,
                    msg:"增加失败"
                }));
                return;
            }
          var data=JSON.parse(str);
            data["id"]=con.length===0?1:parseFloat(con|con[length-1]["id"])+1;
            con.push(data);
            fs.writeFileSync(customPath,JSON.stringify(con),"utf-8");
            res.end(JSON.stringify({
                code:0,
                msg:"增加成功"
            }))
        });
return;
    }
    //修改客户信息
    if(pathname==="/updateInfo"){
        str='';
        req.on("data",function (chunk) {
            str+=chunk;
        });
        req.on("end",function () {
            if(str.length===0){
                res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
                res.end(JSON.stringify({
                    code:1,
                    msg:"修改失败"
                }));
                return;
            }
            var flag=false,data=JSON.parse(str);
            for (var i = 0; i < con.length; i++) {
               if(con[i]["id"]===data["id"]){
                   con[i]=data;
                   flag=true;
                   break
                }
                
            }
            result.msg="修改失败，需要修改的客户不存在";
            if(flag){
                fs.writeFileSync(customPath,JSON.stringify(con),"utf-8");
                result={code:0,msg:"修改成功"}
            }
        });
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;
    }
    //如何请求的地址不存在
    res.writeHead(404, {'content-type': 'text/plain;charset=utf-8;'});
    res.end("请求的数据接口不存在");
});

server1.listen(8282, function () {
    console.log(123);
});