console.log("store/dog.js")

import dogAPI from "../assets/dog-api";
import {genID, deepCopy} from "../assets/util";

function newImageData(url){
    return {
        url,
        nice: 0, 
        bad: 0,
        favCnt: 0,
        comments: [],//{dateTime: number, uid: string, message: string}[]
    }
}
function copyImageData(dst, src){
    dst.url = src.url;
    dst.nice = src.nice;
    dst.bad = src.bad;
    dst.favCnt = src.favCnt;
    dst.comments = deepCopy(src.comments);
}

function newUserData(uid){
    return {
        uid: uid,
        evalDataDic: {},
        timeStamp: new Date().getTime(),
    };
}
function copyUserData(dst, src){
    dst.uid = src.uid;
    dst.evalDataDic = deepCopy(evalDataDic);
    dst.timeStamp = src.timeStamp;
}

function newEvalData(){
    return {
        favorite: false, 
        lastEval: 0,
    };
}
function copyEvalData(dst, src){
    dst.favorite = src.favorite;
    dst.lastEval = src.lastEval;
}

function newUserImageData(imageData, evalData){//userImageData=imageData&evalData
    return Object.assign({}, imageData, evalData);
}
function copyUserImageData(dst, src){
    copyImageData(dst, src);
    copyEvalData(dst, src);
}

export const state = () => {
    console.log("state:dog");
    return {//TODO:データベースとして利用しないこと。別で全データを管理しリクエストされたページに必要な情報だけロードする
        breedList: [],
        breedTrans: {},
        
        imageUrlList: [],
        //userImageDataDic: {},
        imageDataDic: {},

        userData: null,
    };
};
export const mutations = {
    setBreedList(state, payload){
        console.log("mutations:dog/setBreedList");
        console.log(payload);
        state.breedList = payload.breedList;
        state.breedTrans = payload.breedTrans;
    },
    setImageData(state, payload){
        console.log("mutations:dog/setImageData");
        console.log(payload);

        var imageData = payload.imageData;

        state.imageDataDic[imageData.url] = imageData;
        // if (!(data.url in state.userImageDataDic)){//未登録の画像。新たに追加
        //     state.imageUrlList.push(data.url);
        //     var evalData;
        //     console.log(state.userData);
        //     if (data.url in state.userData.evalDataDic){
        //         evalData = state.userData.evalDataDic[data.url];
        //     }
        //     else{
        //         evalData = newEvalData();
        //     }
        //     state.userImageDataDic[data.url] = newUserImageData(data, evalData);
        // }
        // else{
        //     Object.assign(state.userImageDataDic[data.url], data);
        // }
        // dogImageDataDic[data.url] = deepCopy(data);
    },
    setImageUrlList(state, payload){
        console.log("mutations:dog/setImageUrlList");
        console.log(payload);

        var imageUrlList = payload.imageUrlList;

        state.imageUrlList = imageUrlList;
    },
    setUserData(state, payload){
        console.log("mutations:dog/setUserData");
        console.log(payload);

        var userData = payload.userData;

        state.userData = userData;
        //dogUserDataDic[data.uid] = deepCopy(data);
    },
    // setEvalData(state, payload){
    //     console.log("mutations:dog/setUserEvalData");
    //     console.log(payload);

    //     var url = payload.url;
    //     var uid = payload.uid;
    //     var evalData = payload.data;

    //     var userData = state.userData;

    //     var userImageData = state.userImageDataDic[url];
    //     Object.assign(userImageData, evalData);
 
    //     var _evalData = userData.evalDataDic[url];
    //     if (_evalData){
    //         if (_evalData.lastEval > 0){//==+1:niceだった
    //             --userImageData.nice;//niceを解除
    //         }
    //         else if (_evalData.lastEval < 0){//==-1:badだった
    //             --userImageData.bad;//badを解除
    //         }

    //         if (_evalData.favorite){//お気に入り登録済みだった
    //             --userImageData.favCnt;//解除をカウント
    //         }
    //     }
    //     if (evalData.lastEval > 0){//==+1:niceにした
    //         ++userImageData.nice;//niceを適用
    //     }
    //     else if (evalData.lastEval < 0){//==-1:badにした
    //         ++userImageData.bad;//badを適用
    //     }
    //     if (evalData.favorite){//お気に入り登録した
    //         ++userImageData.favCnt;//登録をカウント
    //     }
 
    //     userData.evalDataDic[url] = evalData;
    //     userData.timeStamp = new Date().getTime();

    //     dogUserDataDic[uid] = deepCopy(userData);
    //     copyImageData(dogImageDataDic[url], userImageData);
    // },
};

export const actions = {
    initStore(context, payload){//TODO:リクエスト毎の各ページに対応する最小限のデータをロードすること
        console.log("actions:dog/initStore");
        //console.log(payload);
        var $axios = payload.$axios;
        var userData = payload.userData;
        var breed = payload.breed;
        var imageUrl = payload.imageUrl;

        context.commit("setUserData", {userData});//ユーザが指定されていればロードする

        // return Promise.all([
        // ]);
    },
    // getUserData(context, payload){
    //     console.log("actions:dog/getUserData");
    //     console.log(payload);

    //     var uid = payload.uid;
    //     var userData = newUserData(uid);

    //     userData = context.commit("setUserData", {data: userData});
    //     return Promise.resolve(context.state.userData);
    // },
    getBreedList(context, payload){
        console.log("actions:dog/getBreedList");
        //console.log(payload);
        var $axios = payload.$axios;
        return Promise.all([
            dogAPI.getBreeds($axios),
            $axios.get("/dog-breed-trans-ja.json").then(res=>res.data),
        ]).then((res_list)=>{
            context.commit("setBreedList", {
                breedList: res_list[0], 
                breedTrans: res_list[1]
            });
        });
    },
    getBreedImageDataList(context, payload){
        console.log("actions:dog/getBreedImageDataList");
        //console.log(payload);

        var $axios = payload.$axios;
        var breed = payload.breed;

        return dogAPI.getBreedImages($axios, breed).then((imageUrlList)=>{
            return context.dispatch("getImageDataList", {$axios, imageUrlList});
        });
    },
    getInBreedImageData(context, payload){
        console.log("actions:dog/getInBreedImageData");
        //console.log(payload);

        var $axios = payload.$axios;
        var breed = payload.breed;
        var imageUrl = payload.imageUrl;

        return dogAPI.getBreedImages($axios, breed).then((imageUrlList)=>{
            if (imageUrlList.includes(imageUrl)){
                return context.dispatch("getImageDataList", {$axios, imageUrlList: [imageUrl]});//.then((imageDataList)=>imageDataList[0]);
            }
            else{
                return Promise.reject(`${imageUrl} is not ${breed}.`);
            }
        });
    },
    getImageDataList(context, payload){
        console.log("actions:dog/getImageDataList");
        //console.log(payload);

        var $axios = payload.$axios;
        var imageUrlList = payload.imageUrlList;

        var url = `/dog_db/images`;
        var body = {
            uid: context.state.userData.uid,
            images: imageUrlList,
        };
        console.log(`post ${url}`);
        console.log(body);
        return Promise.all([
            $axios.post(`/dog_db/newimages`, {//DogAPIで取得した画像をデータベースに登録して評価できるようにしておく。登録済みは無視される
                images: imageUrlList,
            }),
            $axios.post(url, body).then((res)=>{//データベースにある評価情報をストアに保存する
                console.log(`res ${url}`);
                console.log(res.data);
                var imageDataList = res.data;
                for (var imageData of imageDataList){
                    context.commit("setImageData", {imageData});
                }
                context.commit("setImageUrlList", {imageUrlList});
            })
        ]).then((res)=>{
            //return context.state.imageUrlList.map((imageUrl)=>context.state.imageDataDic[imageUrl]);
            //return void;
        });
    },
    // getBreedImageData(context, payload){
    //     console.log("actions:dog/getBreedImageData");
    //     console.log(payload);

    //     var breed = payload.breed;
    //     var $axios = payload.$axios;

    //     return dogAPI.getBreedImages($axios, breed).then((urlList)=>{
    //         return Promise.all(urlList.map((url)=>context.dispatch("getImageData", {url}))).then((breedImageDataList)=>{
    //             return breedImageDataList;
    //         });
    //     });
    // },
    // postEvalData(context, payload){
    //     console.log("actions:dog/postEvalData");
    //     console.log(payload);

    //     var url = payload.url;
    //     var uid = payload.uid;
    //     var evalData = payload.data;

    //     try{
    //         context.commit("setEvalData", {url, uid, data: evalData});
    //     }
    //     catch(e){
    //         return Promise.reject(e);
    //     }
    //     return Promise.resolve();
    // }
};
