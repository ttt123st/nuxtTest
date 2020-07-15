console.log("api/dog-db.js");

//import {dogImageDataDic, dogUserDataDic, dogCookieDic} from "../assets/dog-vars";
import express from "express";
import bodyParser from "body-parser";
//import cookieParser from "cookie-parser";

//import mysql  from 'mysql';
import {Pool as pgPool} from "pg";

import {genID} from "../assets/util";

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(cookieParser());

var pool = new pgPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'postgres', 
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'dog_db',
  port: process.env.DATABASE_PORT || undefined,
});
// var pool = mysql.createPool({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'root',
//   database : 'dog_db',
// });

function _sql(sql, timeout=30000){
  var tid = null;
  function clear_query_timeout(){
    if (tid == null){
      return;
    }
    clearTimeout(tid);
    tid = null;
  }
  return new Promise((resolve, reject) => {
    tid = setTimeout(()=>{
      if (tid != null){
        tid = null;
        reject("dog_db query timeouted.");
      }
    }, timeout + 100);
    // pool.query({//!!mysql pool
    //   sql: sql,
    //   timeout: timeout,
    //   //values: []
    // }, (error, results, fields) => {
    //   if (error){
    //     reject(error);
    //   }
    //   else{
    //     resolve({results, fields});
    //   }  
    // }
    pool.query(//!!postgres pool
      sql, (err, res) => {
      if (err){
        reject(err);
      }
      else{
        //console.log(res);
        resolve({results: res.rows, fields: res.field});
      }  
    });
  }).then((ret)=>{
    clear_query_timeout();
    // console.log("dog_db query successfully.");
    // console.log(ret.fields);
    // console.log(ret.results);
    return ret;
  }, (err)=>{
    clear_query_timeout();
    console.log("dog_db query failed.");
    console.log(`FAILD:${sql}`);
    console.log(err);
    reject(err);
  });
}

export function dog_db(sql){
  return _sql(sql);
}

app.get("/dog_db/user", (req, res)=>{
  var pid = req.query.pid;
  console.log(`on get /dog_db/user?pid=${pid}:`);
  dog_db(`
    SELECT userTable.uid, uidTable.pid, uidTable.expires
      FROM uidTable, userTable
      WHERE uidTable.pid='${pid}' AND uidTable.uid=userTable.uid
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
        `INSERT INTO userTable (uid) VALUES('${uid}')`
      );
      // console.log(results);
      // console.log(fields);
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
        `INSERT INTO uidTable (pid, uid, expires) VALUES('${pid}', '${uid}', '${expires.toLocaleString()}')`
      );
      // console.log(results);
      // console.log(fields);
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
        WHERE uidTable.pid='${pid}' AND uidTable.uid=userTable.uid
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
    console.log("invalid body format.")
    res.status(400).end();
    return;//bodyが不明な形式
  }
  try{
    var imageDataList = await Promise.all(images.map(
      (img_i)=>Promise.all([//postgresは大文字を小文字に変換するのでフィールド名を二重引用符で括る必要がある
        //res[0]:niceCnt
        dog_db(`SELECT COUNT(*) AS "niceCnt" FROM evlTable WHERE img='${img_i}' AND evl>0`).then(({results, fields})=>results[0]),
        //res[1]:badCnt
        dog_db(`SELECT COUNT(*) AS "badCnt" FROM evlTable WHERE img='${img_i}' AND evl<0`).then(({results, fields})=>results[0]),
        //res[2]:favCnt
        dog_db(`SELECT COUNT(*) AS "favCnt" FROM evlTable WHERE img='${img_i}' AND fav>0`).then(({results, fields})=>results[0]),
        //res[3]:cmtCnt
        dog_db(`SELECT COUNT(*) AS "cmtCnt" FROM commentTable WHERE img='${img_i}'`).then(({results, fields})=>results[0]),
        //res[4]:{evl, fav}//SELECT CASE WHEN evlTable.evl IS NULL THEN 0 ELSE evlTable.evl END AS evl, CASE WHEN evlTable.fav IS NULL THEN 0 ELSE evlTable.fav END AS fav FROM (SELECT '${img}' AS img, '${uid}' AS uid) AS empTbl LEFT JOIN evlTable ON empTbl.img=evlTable.img AND empTbl.uid=evlTable.uid;
        dog_db(`SELECT evl, fav FROM evlTable WHERE img='${img_i}' AND uid='${uid}'`).then(({results, fields})=>results[0]),
        //res[5]:{breed}
        dog_db(`SELECT breed FROM imageTable WHERE img='${img_i}'`).then(({results, fields})=>results[0]),
      ]).then((res)=>{
        //console.log(res);
        var {niceCnt} = res[0];
        var {badCnt} = res[1];
        var {favCnt} = res[2];
        var {cmtCnt} = res[3];
        var {evl, fav} = res[4] ? res[4] : {evl:0, fav:0};
        var {breed} = res[5] ? res[5] : "";//空でないはず
        var imageData = {//postgresは数字が文字列で返るので数値に変換する
          url: img_i, 
          breed,
          niceCnt: Number(niceCnt), 
          badCnt: Number(badCnt), 
          favCnt: Number(favCnt), 
          cmtCnt: Number(cmtCnt), 
          evl: Number(evl), 
          fav: Number(fav),
        };
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

  var newImageDataList = req.body.newImageDataList;
  if (!(newImageDataList instanceof Array) || 
    newImageDataList.some((newImageData) => 
      typeof(newImageData) != "object" ||
      typeof(newImageData.url) != "string" || 
      typeof(newImageData.breed) != "string")){
    res.status(400).end();
    return;//bodyが不明な形式
  }
  try{//TODO:画像ごとにDogAPIへnewImageData.breedの画像リストを問い合わせ、newImageData.urlが登録されているか調べるべき
    await Promise.all(
      newImageDataList.map((newImageData)=>dog_db(
        //!!mysql
        //`INSERT IGNORE INTO imageTable(img, breed) VALUES ('${newImageData.url}', '${newImageData.breed}')`

        //!!postgres
        `INSERT INTO imageTable(img, breed) VALUES ('${newImageData.url}', '${newImageData.breed}') ON CONFLICT DO NOTHING`
      )));
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
      WHERE img='${img}' AND uid='${uid}'`).then(({results, fields})=>{
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
      await dog_db(`DELETE FROM evlTable WHERE uid='${uid}' AND img='${img}'`);
    }
    else{
      await dog_db(
        //!!mysql
        // `INSERT INTO evlTable(uid, img, evl, fav) 
        //   VALUES('${uid}', '${img}', ${evl}, ${fav})
        //   ON DUPLICATE KEY UPDATE
        //     evl=${evl}, fav=${fav}, date=CURRENT_TIMESTAMP`

        //!!postgres
        `INSERT INTO evlTable(uid, img, evl, fav) 
          VALUES('${uid}', '${img}', ${evl}, ${fav})
          ON CONFLICT (uid, img) DO UPDATE SET
            evl=${evl}, fav=${fav}, date=CURRENT_TIMESTAMP`
        
        );
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
      WHERE img='${img}'`).then(({results, fields})=>{
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
        VALUES('${uid}', '${img}', '${comment}')
    `);
  }
  catch(error){
    console.log(error);
    res.status(500).end();
    return;   
  }
  res.status(200).end();
});

app.get("/dog_db/favimages", (req, res)=>{
  var uid = req.query.uid;
  console.log(`on get /dog_db/favimages?uid=${uid}:`);
  dog_db(`SELECT img FROM evlTable WHERE uid='${uid}' AND fav=1 ORDER BY date DESC`).then(({results, fields})=>{
    res.json(results.map((res_i)=>res_i.img));
    res.end();
  }, (error)=>{
    console.log(error);
    res.status(500).end();
  });

});

app.get("/dog_db/popimages", (req, res)=>{
  console.log(`on get /dog_db/popimages:`);
  dog_db(`SELECT img FROM evlTable WHERE fav=1 OR evl=1 GROUP BY img ORDER BY COUNT(img) DESC LIMIT 12`).then(({results, fields})=>{
    res.json(results.map((res_i)=>res_i.img));
    res.end();
  }, (error)=>{
    console.log(error);
    res.status(500).end();
  });

});

app.get("/dog_db/cmtimages", (req, res)=>{
  console.log(`on get /dog_db/cmtimages:`);
  dog_db(`SELECT img FROM commentTable GROUP BY img ORDER BY MAX(date) DESC LIMIT 12`).then(({results, fields})=>{
    res.json(results.map((res_i)=>res_i.img));
    res.end();
  }, (error)=>{
    console.log(error);
    res.status(500).end();
  });

});

export default app;
