<template>
    
</template>

<script>
console.log("pages/breed/_breed/image/_imageUrl/evl.vue");

import {deepCopy} from "@/assets/util";

export default {
    validate(context){
        //TODO:
        return true;
    },
    asyncData(context){
        var breed = context.params.breed;
        var imageUrl = decodeURIComponent(context.params.imageUrl);
        var nice = Number(context.query.nice);
        var bad = Number(context.query.bad);
        var fav = Number(context.query.fav);
        var from = context.query.from;//"breed" | undefined
        //var $cookies = context.app.$cookies;
        var $axios = context.app.$axios;
        var userData = context.store.state.dog.userData;
        var uid = userData.uid;
        var evl = nice > 0 ? +1 : bad > 0 ? -1 : 0;
        fav = fav > 0 ? 1 : 0;
        console.log(`evl?nice=${nice}&bad=${bad}&breed=${breed}: asyncData`);
        return $axios.post("/dog_db/evl", {uid, img: imageUrl, evl, fav}).then(()=>{
            if (from == "breed"){
                context.redirect(`/breed/${breed}`);
            }
            else{//from=="page"
                context.redirect(`/breed/${breed}/image/${encodeURIComponent(imageUrl)}/page`);
            }
        });
    }
}
</script>
