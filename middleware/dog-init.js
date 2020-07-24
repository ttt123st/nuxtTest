console.log("middleware/dog-init.js");

import {genID} from "../assets/util";

export default async (context) => {
    console.log("middleware/dog-init.js:default");
    console.log(context);
    var $axios = context.app.$axios;
    var $cookies = context.app.$cookies;

    var cookie_pid = $cookies.get("pid");
    var userData = null;

    if (cookie_pid){
        var url = `/dog_db/user?pid=${cookie_pid}`;
        console.log(`get ${url}`);
        try{
            userData = await $axios.get(url).then((res)=>{
                console.log(`res ${url}`);
                console.log(res.data);
                //res.data
                return res.data;
            });
        }
        catch (error){
            //送られてきたpidが無効
            console.log(`err ${url}`);
            console.log(error);
        }
        //TODO:userData.expires
    }

    if (!userData){
        var url = `/dog_db/newuser`;
        console.log(`get ${url}`);
        try{
            userData = await $axios.get(url).then((res)=>{
                console.log(`res ${url}`);
                console.log(res.data);
                //res.data
                return res.data;
            });
        }
        catch(error){
            console.log(`err ${url}`);
            console.log(error);
            context.error({statusCode: 500, message: "couldn't create new user."})
            return;
        }

        var expiresDate = new Date(userData.expires);
        $cookies.set("pid", userData.pid, {
            path: "/",
            expires: expiresDate
        });
        console.log(`assign pid: ${userData.pid}`);
    }

    // console.log("req /dog_db/userlist");
    // await $axios.get("/dog_db/userlist").then((res)=>{
    //     console.log("res /dog_db/userlist");
    //     console.log(res);
    //     //res.data
    // }, (error)=>{
    //     console.log("err /dog_db/userlist");
    //     console.log(error);
    // });

    // if (cid && cid in dogCookieDic){
    //     var {expiresTime, uid} = dogCookieDic[cid];
    // }
    // else{
    //     cid = null;//CIDが割り当てられていないか、保存されていないCIDが送られてきた
    // }
    // console.log(`requested by (cid, uid):(${cid}, ${uid})`);

    // if (expiresTime != null && ((expiresTime - new Date().getTime()) < cCookieExpires)){
    //     console.log(`expires cid:${cid}`);
    //     cid = null;
    //     delete dogCookieDic[cid];
    // }
    // if (!uid){
    //     uid = genID(8, dogUserDataDic);
    // }
    // if (!cid){//CIDを割り当てる
    //     cid = genID(8, dogCookieDic);
    //     var expiresDate = new Date();
    //     expiresDate.setTime(expiresDate.getTime() + cCookieMaxAge);
    //     $cookies.set("cid", cid, {
    //         path: "/",
    //         expires: expiresDate
    //     });
    //     console.log(`assign (cid, uid):(${cid}, ${uid})`);
    //     dogCookieDic[cid] = {uid, expiresTime: expiresDate.getTime()};
    // }

    var breed = context.params.breed;
    var imageUrl = context.params.imageUrl && decodeURIComponent(context.params.imageUrl);
    return Promise.all([
        context.store.dispatch("dog/initStore", {$axios, userData, breed, imageUrl}),
    ]);
}