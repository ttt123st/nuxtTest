<template>
    <section class="section">
        <div class="container">

            <breed-form v-bind:breed="breed"></breed-form>

            <hr>

            <div class="columns">
                <div class="column is-10 is-offset-1">
                    <figure class="image">
                        <img v-bind:src="imageUrl">
                    </figure>
                </div>
            </div>
            <div class="">
                <nav class="level">
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">
                                高い評価
                            </p>
                            <p class="title">
                                <a v-bind:href="`${getImageBaseUrl(imageData.url)}/evl?nice=${Number(imageData.evl!=1)}&bad=0&fav=${imageData.fav}&from=page`">
                                    <span class="icon">
                                        <i class="fa-thumbs-up" v-bind:class="[
                                            imageData.evl > 0 ? 'fas has-text-info' : 'far has-text-dark'
                                        ]"></i>
                                    </span>
                                    <span class="has-text-dark">
                                        {{imageData.niceCnt}}
                                    </span>
                                </a>
                            </p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">
                                低い評価
                            </p>
                            <p class="title">
                                <a v-bind:href="`${getImageBaseUrl(imageData.url)}/evl?nice=0&bad=${Number(imageData.evl!=-1)}&fav=${imageData.fav}&from=page`">
                                    <span class="icon">
                                        <i class="fa-thumbs-down" v-bind:class="[
                                            imageData.evl < 0 ? 'fas has-text-danger' : 'far has-text-dark'
                                        ]"></i>
                                    </span>
                                    <span class="has-text-dark">
                                        {{imageData.badCnt}}
                                    </span>
                                </a>
                            </p>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">
                                お気に入り
                            </p>
                            <p class="title">
                                <a v-bind:href="`${getImageBaseUrl(imageData.url)}/evl?nice=${Number(imageData.evl==1)}&bad=${Number(imageData.evl==-1)}&fav=${Number(!imageData.fav)}&from=page`">
                                    <span class="icon">
                                        <i class="fa-star" v-bind:class="[
                                            imageData.fav > 0 ? 'fas has-text-warning' : 'far has-text-dark'
                                        ]"></i>
                                    </span>
                                    <span class="has-text-dark">
                                        {{imageData.favCnt}}
                                    </span>
                                </a>
                            </p>
                        </div>
                    </div>
                </nav>
            </div>

            <hr>

            <div class="columns is-vcentered">
                <div class="column is-3 has-text-centered">
                    <div>
                        <p class="heading">
                            コメント
                        </p>
                        <p class="title">
                            <span class="icon">
                                <i class="far fa-comment"></i>
                            </span>
                            {{imageData.cmtCnt}}
                        </p>
                    </div>
                </div>

                <div class="column is-9">
                    <form v-bind:action="`${getImageBaseUrl(imageData.url)}/cmt`" method="post">
                        <div class="field has-addons">
                            <p class="control is-expanded">
                                <input class="input" type="text" name="comment" placeholder="コメントを入力"
                                    v-model="inputComment">
                            </p>
                            <p class="control">
                                <input type=submit class="button" value="投稿">
                            </p>
                        </div>
                        <!-- 
                        <input type="hidden" name="uid" v-bind:value="$store.state.dog.userData.uid">
                        <input type="hidden" name="img" v-bind:value="imageUrl">
                        -->
                    </form>
                </div>
            </div>

            <div>
                <span v-if="imageComments.length == 0">
                    コメントはまだありません。
                </span>
                <div v-else class="media" v-for="(imageComment, imageComment_i) of imageComments" v-bind:key="imageComment_i">
                    <div class="media-content">
                        <div class="content">
                            <div>
                                {{imageComment.comment}} - {{imageComment.uid}} - {{imageComment.date}}
                            </div>
                            <!-- <div>
                                {{imageComment.date}}
                            </div> -->
                        </div>
                    </div>
                </div>
            </div>

            <hr>

            <footer>
                <div class="level">
                    <div class="level-left">
                        <div class="level-item">
                            <a v-bind:href="`/breed/${breed}`">
                                <span class="icon is-left">
                                    <i class="fas fa-paw"></i>
                                </span>
                                {{transBreed(breed)}}に戻る
                            </a>
                        </div>
                    </div>
                    <div class="level-right">
                        <div class="level-item">
                            <a v-bind:href="`/`">
                                <span class="icon is-left">
                                    <i class="fas fa-home"></i>
                                </span>
                                トップに戻る
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </section>
</template>

<script>
console.log("pages/breed/_breed/image/_imageUrl/page.vue");

import breedForm from "@/components/dog-form.vue";

export default {
    components:{
        breedForm,
    },

    validate(context){
        //TODO:
        return true;
    },
    asyncData(context){
        var breed = context.params.breed;
        var imageUrl_enc = context.params.imageUrl;
        var imageUrl = decodeURIComponent(imageUrl_enc);
        //var $cookies = context.app.$cookies;
        var $axios = context.app.$axios;

        console.log(`pages/breed/_breed/image/_imageUrl/page.vue: asyncData`);
        console.log(`_breed=${breed}`);
        console.log(`_imageUrl=${imageUrl}`);

        return Promise.all([
            context.store.dispatch("dog/getBreedList", {$axios}),
            context.store.dispatch("dog/getInBreedImageData", {
                breed, 
                imageUrl,
                $axios, 
            }),
            $axios.get(`/dog_db/comments?img=${imageUrl_enc}`).then((res)=>res.data),
        ]).then((res)=>{
            var imageComments = res[2];
            for (var i = 0; i < imageComments.length; ++i){
                var imageComment =  imageComments[i];
                var date = new Date(imageComment.date);
                imageComment.date = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDay()}日${date.getHours()}:${`0${date.getMinutes()}`.slice(-2)}`;
            }
            return {
                breed,
                imageUrl,
                imageComments,
            };
        }, (error)=>{
            context.error({statusCode: 404, message: String(error)});
        });
    },
    data(){
        return {
            inputComment: "",
            postResMessage: "",
        };
    },
    methods:{
        transBreed(breed){
            var tr = this.$store.state.dog.breedTrans[breed];
            return tr == null ? breed : tr;
        },

        getImageBaseUrl(url){
            return `/breed/${this.breed}/image/${encodeURIComponent(url)}`
        },

        postInputComment(){
            if (this.inputComment){

            }
        },
    },
    computed: {
        imageData(){
            return this.$store.state.dog.imageDataDic[this.imageUrl];
        },
    }
}
</script>
