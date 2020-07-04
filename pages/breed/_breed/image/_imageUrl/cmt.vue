<template>
    
</template>

<script>
console.log("cmt.vue");
export default {
    asyncData(context){
        console.log("cmt.vue: asyncData");

        var breed = context.params.breed;
        var imageUrl_enc = context.params.imageUrl;
        var imageUrl = decodeURIComponent(imageUrl_enc);
        var comment = context.req.body.comment;
        var $axios = context.app.$axios;

        var userData = context.store.state.dog.userData;
        var uid = userData.uid;

        return (()=>{
            if (typeof(comment) == "string" && comment != ""){
                return $axios.post("dog_db/comments", {
                    uid, img: imageUrl, comment
                });
            }
            else{
                return Promise.resolve();
            }
        })().then(()=>{
            context.redirect(`/breed/${breed}/image/${encodeURIComponent(imageUrl)}/page`);
        });
    }
}
</script>