console.log("api/dog-db.js");

//import {dogImageDataDic, dogUserDataDic, dogCookieDic} from "../assets/dog-vars";
import express from "express";
import bodyParser from "body-parser";
//import cookieParser from "cookie-parser";

import mysql  from 'mysql';

import {genID} from "../assets/util";

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(cookieParser());

var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'dog_db',
});

/*var conn_prom = new Promise((resolve, reject)=>{
  console.log("connecting dog_db.");
  var timeout = 30000;
  var tid = setTimeout(()=>{
    if (tid != null){
      tid = null;
      reject("dog_db connection timeouted.");
    }
  }, timeout + 100);
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'dog_db',
    connectTimeout: timeout,
  });
  connection.connect((error, results, fields)=>{
    if (tid == null){
      return;
    }
    clearTimeout(tid);
    tid = null;
    if (error){
      console.log("dog_db connection failed.");
      console.log(error);
      reject(error);
    }
    else{
      console.log("dog_db connect successfully.");
      console.log(results);
      console.log(fields);
      resolve(connection);
    }
  });
});*/

function _sql(connection, sql, timeout=30000){
  return new Promise((resolve, reject) => {
    var tid = setTimeout(()=>{
      if (tid != null){
        tid = null;
        reject("dog_db query timeouted.");
      }
    }, timeout + 100);
    connection.query({
      sql: sql,
      timeout: timeout,
      //values: []
    }, (error, results, fields) => {
      if (tid == null){
        return;
      }
      clearTimeout(tid);
      tid = null;
      if (error){
        console.log("dog_db query failed.");
        console.log(`FAILD:${sql}`);
        console.log(error);
        reject(error);
      }
      else{
        // console.log("dog_db query successfully.");
        // console.log(fields);
        // console.log(results);
        resolve({results, fields});
      }  
    });
  });
}

export function dog_db(sql){
  return _sql(pool, sql);
  /*return conn_prom.then((connection)=>{
    return _sql(connection, sql).then((results_fields)=>{
      return results_fields;
    });
  });*/
}

app.get("/dog_db/user", (req, res)=>{
  var pid = req.query.pid;
  console.log(`on get /dog_db/user?pid=${pid}:`);
  dog_db(`
    SELECT userTable.uid, uidTable.pid, uidTable.expires
      FROM uidTable, userTable
      WHERE uidTable.pid="${pid}" AND uidTable.uid=userTable.uid
    `).then(({results, fields})=>{
    if (results.length > 0){
      res.json(results[0]);
    }
    else{
      res.status(404);
    }
    res.end();
  }, (error)=>{
    console.log(error);
    res.status(500).end();
  });
});

app.get("/dog_db/newuser", async (req, res)=>{
  console.log(`on get /dog_db/newuser:`);

  var pid;
  var uid;
  var expires = new Date();
  expires.setTime(expires.getTime() + 1000*60*60*24*365*10);//現在再割り当て未対応。適当に長い期間。10年。

  for (var cnt = 10; cnt > 0; --cnt){
    uid = genID();
    try{
      var {results, fields} = await dog_db(
        `INSERT INTO userTable (uid) VALUES("${uid}")`
      );
      console.log(results);
      console.log(fields);
      break;//作成成功
    }
    catch(error){
      console.log("failed making user, retry.");
      console.log(error);
      continue;//IDが被った
    }
  }
  if (cnt == 0){
    console.log("too crowded to make new user.");
    res.status(500).end();
    return;    
  }

  for (var cnt = 10; cnt > 0; --cnt){
    pid = genID();
    try{
      var {results, fields} = await dog_db(
        `INSERT INTO uidTable (pid, uid, expires) VALUES("${pid}", "${uid}", "${expires.toLocaleString()}")`
      );
      console.log(results);
      console.log(fields);
      break;//作成成功
    }
    catch(error){
      console.log("failed making key, retry.");
      console.log(error);
      continue;//IDが被った
    }
  }
  if (cnt == 0){//TODO:userTableにuidを追加済みなのでそれを削除
    console.log("too crowded to make new key.");
    res.status(500).end();
    return;    
  }

  try{
    var {results, fields} = await dog_db(`
      SELECT userTable.uid, uidTable.pid, uidTable.expires
        FROM uidTable, userTable 
        WHERE uidTable.pid="${pid}" AND uidTable.uid=userTable.uid
      `);
    if (results.length > 0){
      res.json(results[0]);
    }
    else{
      res.status(500);
    }
    res.end();
  }
  catch (error){
    console.log(error);
    res.status(500).end();
  }
});

app.get("/dog_db/userlist", (req, res)=>{
  console.log(`on get /dog_db/userlist:`);
  dog_db(`
    SELECT uidTable.pid, userTable.uid, uidTable.expires 
      FROM uidTable, userTable 
      WHERE uidTable.uid=pidTable.uid`).then((results)=>{
    res.json(results);
    res.end();    
  }, (error)=>{
    console.log(error);
    res.status(500).end();
  });
});

app.post("/dog_db/images", async (req, res)=>{
  console.log(`on post /dog_db/images:`);
  console.log(req.body);

  var uid = req.body.uid;
  var images = req.body.images;

  if (typeof(uid) != "string" || !(images instanceof Array) || 
    images.some((image_i) => typeof(image_i) != "string")){
    res.status(400).end();
    return;//bodyが不明な形式
  }
  try{
    var imageDataList = await Promise.all(images.map(
      (img_i)=>Promise.all([
        //res[0]:niceCnt
        dog_db(`SELECT COUNT(*) AS niceCnt FROM evlTable WHERE img="${img_i}" AND evl>0`).then(({results, fields})=>results[0]),
        //res[1]:badCnt
        dog_db(`SELECT COUNT(*) AS badCnt FROM evlTable WHERE img="${img_i}" AND evl<0`).then(({results, fields})=>results[0]),
        //res[2]:favCnt
        dog_db(`SELECT COUNT(*) AS favCnt FROM evlTable WHERE img="${img_i}" AND fav>0`).then(({results, fields})=>results[0]),
        //res[3]:cmtCnt
        dog_db(`SELECT COUNT(*) AS cmtCnt FROM commentTable WHERE img="${img_i}"`).then(({results, fields})=>results[0]),
        //res[4]:{evl, fav}//SELECT CASE WHEN evlTable.evl IS NULL THEN 0 ELSE evlTable.evl END AS evl, CASE WHEN evlTable.fav IS NULL THEN 0 ELSE evlTable.fav END AS fav FROM (SELECT "${img}" AS img, "${uid}" AS uid) AS empTbl LEFT JOIN evlTable ON empTbl.img=evlTable.img AND empTbl.uid=evlTable.uid;
        dog_db(`SELECT evl, fav FROM evlTable WHERE img="${img_i}" AND uid="${uid}"`).then(({results, fields})=>results[0]),
      ]).then((res)=>{
        var {niceCnt} = res[0];
        var {badCnt} = res[1];
        var {favCnt} = res[2];
        var {cmtCnt} = res[3];
        var {evl, fav} = res[4] ? res[4] : {evl:0, fav:0};
        var imageData = {url: img_i, niceCnt, badCnt, favCnt, cmtCnt, evl, fav};
        //console.log(imageData);
        return imageData;
      })
    ));
  }
  catch(error){
    console.log(error);
    res.status(500).end();
    return;
  }
  res.json(imageDataList);
  res.end();
});

app.post("/dog_db/newimages", async (req, res)=>{
  console.log(`on post /dog_db/newimages:`);
  console.log(req.body);

  var images = req.body.images;
  if (!(images instanceof Array) || 
    images.some((image_i) => typeof(image_i) != "string")){
    res.status(400).end();
    return;//bodyが不明な形式
  }
  try{
    await Promise.all(
      images.map((img_i)=>dog_db(`INSERT IGNORE INTO imageTable(img) VALUES ("${img_i}")`)));
  }
  catch(error){
    console.log(error);
    res.status(500).end();
    return;
  }
  res.status(200).end();
});

app.get("/dog_db/evl", (req, res)=>{
  var uid = req.query.uid;
  var img = decodeURIComponent(req.query.img);
  console.log(`on get /dog_db/evl?img=${img}&uid=${uid}:`);
  dog_db(`
    SELECT uid, img, evl, fav
      FROM evlTable
      WHERE img="${img}" AND uid="${uid}"`).then(({results, fields})=>{
    if (results.length > 0){
      res.json(results[0]);
    }
    else{
      res.status(404);
    }
    res.end();
  }, (error)=>{
    console.log(error);
    res.status(500).end();
  });
});

app.post("/dog_db/evl", async (req, res)=>{
  console.log(`on post /dog_db/evl:`);
  console.log(req.body);

  var uid = req.body.uid;
  var img = req.body.img;
  var evl = req.body.evl;
  var fav = req.body.fav;
  if (typeof(uid) != "string" || typeof(img) != "string" || 
    (evl != 0 && evl != +1 && evl != -1) || 
    (fav != 0 && fav != 1)){
    res.status(400).end();
    return;//bodyが不明な形式
  }
  try{
    if (evl == 0 && fav == 0){
      await dog_db(`DELETE FROM evlTable WHERE uid="${uid}" AND img="${img}"`);
    }
    else{
      await dog_db(`
        INSERT INTO evlTable(uid, img, evl, fav) 
          VALUES("${uid}", "${img}", ${evl}, ${fav})
          ON DUPLICATE KEY UPDATE
            evl="${evl}", fav="${fav}"
        `);
    }
  }
  catch(error){
    console.log(error);
    res.status(500).end();
    return;   
  }
  res.status(200).end();
});

app.get("/dog_db/comments", (req, res)=>{
  var img = decodeURIComponent(req.query.img);
  console.log(`on get /dog_db/comments?img=${img}:`);
  dog_db(`
    SELECT uid, date, comment
      FROM commentTable
      WHERE img="${img}"`).then(({results, fields})=>{
    res.json(results);
    res.end();
  }, (error)=>{
    console.log(error);
    res.status(500).end();
  });
});

app.post("/dog_db/comments", async (req, res)=>{
  console.log(`on post /dog_db/comments:`);
  console.log(req.body);

  var uid = req.body.uid;
  var img = req.body.img;
  var comment = req.body.comment;
  if (typeof(uid) != "string" || typeof(img) != "string" || typeof(comment) != "string"){
    res.status(400).end();
    return;//bodyが不明な形式
  }
  try{
    await dog_db(`
      INSERT INTO commentTable(uid, img, comment) 
        VALUES("${uid}", "${img}", "${comment}")
    `);
  }
  catch(error){
    console.log(error);
    res.status(500).end();
    return;   
  }
  res.status(200).end();
});

export default app;
