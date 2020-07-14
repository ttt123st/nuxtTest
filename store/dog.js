console.log("store/dog.js")

import dogAPI from "../assets/dog-api";

export const state = () => {
    console.log("state:dog");
    return {//TODO:データベースとして利用しないこと。別で全データを管理しリクエストされたページに必要な情報だけロードする
        breedList: [],
        breedTrans: {},
        
        imageUrlList: [],
        imageDataDic: {},

        favImageUrlList: [],
        popImageUrlList: [],

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

        if (imageData.url in state.imageDataDic){//すでに登録してあれば併合する
            imageData = {
                ...state.imageDataDic[imageData.url], 
                ...imageData,
            };
        }
        state.imageDataDic[imageData.url] = imageData;
    },
    setImageUrlList(state, payload){
        console.log("mutations:dog/setImageUrlList");
        console.log(payload);

        var images = payload.images;

        state.imageUrlList = images;
    },
    setFavImageUrlList(state, payload){
        console.log("mutations:dog/setFavImageUrlList");
        console.log(payload);

        var images = payload.images;

        state.favImageUrlList = images;
    },
    setPopImageUrlList(state, payload){
        console.log("mutations:dog/setPopImageUrlList");
        console.log(payload);

        var images = payload.images;

        state.popImageUrlList = images;
    },
    setUserData(state, payload){
        console.log("mutations:dog/setUserData");
        console.log(payload);

        var userData = payload.userData;

        state.userData = userData;
    },
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

        return dogAPI.getBreedImages($axios, breed).then((images)=>{
            return context.dispatch("getImageDataList", {$axios, images, breed});
        });
    },
    getInBreedImageData(context, payload){
        console.log("actions:dog/getInBreedImageData");
        //console.log(payload);

        var $axios = payload.$axios;
        var breed = payload.breed;
        var imageUrl = payload.imageUrl;

        return dogAPI.getBreedImages($axios, breed).then((images)=>{
            if (images.includes(imageUrl)){
                return context.dispatch("getImageDataList", {
                    $axios, 
                    images: [imageUrl], 
                    breed,
                });//.then((imageDataList)=>imageDataList[0]);
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
        var images = payload.images;
        var breed = payload.breed;

        return $axios.post(`/dog_db/newimages`, {//DogAPIで取得した画像をデータベースに登録して評価できるようにしておく。登録済みは無視される
            newImageDataList: images.map((imageUrl)=>({url:imageUrl, breed})),
        }).then(()=>{
            return context.dispatch("_getImageData", {
                $axios, 
                images,
            });
        }).then(()=>{
            context.commit("setImageUrlList", {images});
            //return context.state.imageUrlList.map((imageUrl)=>context.state.imageDataDic[imageUrl]);
            //return void;
        });
    },
    getPopImageDataList(context, payload){
        console.log("actions:dog/getPopImageDataList");
        //console.log(payload);

        var $axios = payload.$axios;
        var uid = context.state.userData.uid;

        return $axios.get(`/dog_db/popimages?uid=${uid}`).then((res)=>{
            console.log(`res /dog_db/popimages?uid=${uid}`);
            console.log(res.data);
            var images = res.data;
            return context.dispatch("_getImageData", {
                $axios, 
                images,
            }).then(()=>{
                context.commit("setPopImageUrlList", {images});
                //return context.state.popImageUrlList.map((imageUrl)=>context.state.imageDataDic[imageUrl]);
                //return void;
            });
        });
    },
    getFavImageDataList(context, payload){
        console.log("actions:dog/getFavImageDataList");
        //console.log(payload);

        var $axios = payload.$axios;
        var uid = context.state.userData.uid;

        return $axios.get(`/dog_db/favimages?uid=${uid}`).then((res)=>{
            console.log(`res /dog_db/favimages?uid=${uid}`);
            console.log(res.data);
            var images = res.data;
            return context.dispatch("_getImageData", {
                $axios, 
                images,
            }).then(()=>{
                context.commit("setFavImageUrlList", {images});
                //return context.state.favImageUrlList.map((imageUrl)=>context.state.imageDataDic[imageUrl]);
                //return void;
            });
        });
    },
    _getImageData(context, payload){
        console.log("actions:dog/_getImageData");
        //console.log(payload);

        var {$axios, images} = payload;

        var dogDb = "/dog_db/images";
        var body = {
            uid: context.state.userData.uid,
            images,
        };
        console.log(`post ${dogDb}`);
        console.log(body);
        return $axios.post(dogDb, body).then((res)=>{//データベースにある評価情報をストアに保存する
            console.log(`res ${dogDb}`);
            console.log(res.data);
            var imageDataList = res.data;
            for (var imageData of imageDataList){
                context.commit("setImageData", {imageData});
            }
        });
    },
};
