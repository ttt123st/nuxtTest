<template>
    <section class="section">
        <div class="container">
            <breed-form v-bind:breed="breed"></breed-form>

            <hr>

            <div class="content">
                <p>
                    {{imageDataList.length}}件の画像があります。<br>
                    画像を選ぶとコメントを投稿できます。画像下のボタンで評価したりお気に入りに登録したりできます。
                </p>
            </div>
            <div class="columns is-multiline">
                <div class="column is-3"
                    v-for="imageData of imageDataList" v-bind:key="imageData.url">
                    <div class="card">
                        <div class="card-image">
                            <a v-bind:href="`${getImageBaseUrl(imageData.url)}/page`">
                                <figure class="image">
                                    <img v-bind:src="imageData.url">
                                </figure>
                            </a>
                        </div>
                        <footer class="card-footer has-text-centered">
                            <div class="card-footer-item">
                                <a v-bind:onclick="`javascript:location.replace('${getImageBaseUrl(imageData.url)}/evl?nice=${Number(imageData.evl!=1)}&bad=0&fav=${imageData.fav}&from=breed')`">
                                    <span class="icon">
                                        <i class="fa-thumbs-up" v-bind:class="[
                                            imageData.evl > 0 ? 'fas has-text-info' : 'far has-text-dark'
                                        ]"></i>
                                    </span>
                                    <br>
                                    <span class="is-size-7 has-text-dark">
                                        {{getEvalContNumStr(imageData.niceCnt)}}
                                    </span>
                                </a>
                            </div>
                            <div class="card-footer-item">
                                <a v-bind:onclick="`javascript:location.replace('${getImageBaseUrl(imageData.url)}/evl?nice=0&bad=${Number(imageData.evl!=-1)}&fav=${imageData.fav}&from=breed')`">
                                    <span class="icon">
                                        <i class="fa-thumbs-down" v-bind:class="[
                                            imageData.evl < 0 ? 'fas has-text-danger' : 'far has-text-dark', 
                                        ]"></i>
                                    </span>
                                    <br>
                                    <span class="is-size-7 has-text-dark">
                                        {{getEvalContNumStr(imageData.badCnt)}}
                                    </span>
                                </a>
                            </div>
                            <div class="card-footer-item">
                                <a v-bind:onclick="`javascript:location.replace('${getImageBaseUrl(imageData.url)}/evl?nice=${Number(imageData.evl==1)}&bad=${Number(imageData.evl==-1)}&fav=${Number(!imageData.fav)}&from=breed')`">
                                    <span class="icon">
                                        <i class="fa-star" v-bind:class="[
                                            imageData.fav ? 'fas has-text-warning' : 'far has-text-dark'
                                        ]"></i>
                                    </span>
                                    <br>
                                    <span class="is-size-7 has-text-dark">
                                        {{getEvalContNumStr(imageData.favCnt)}}
                                    </span>
                                </a>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>

        <hr>

        <footer>
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <a v-bind:href="`/`">
                            <span class="icon is-left">
                                <i class="fas fa-home"></i>
                            </span>
                            トップに戻る
                        </a>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <!-- -->
                    </div>
                </div>
            </div>
        </footer>
    </section>
</template>

<script>
console.log("pages/breed/_breed/index.vue");

import breedForm from "@/components/dog-form.vue";

export default {
    components:{
        breedForm,
    },

    validate(context){
        //context.params.breed
        return true;
    },
    asyncData(context){
        var breed = context.params.breed;
        //var $cookies = context.app.$cookies;
        var $axios = context.app.$axios;
        //var userData = context.store.state.dog.userData;
        //console.log(context);
        return Promise.all([
            context.store.dispatch("dog/getBreedList", {$axios}),
            context.store.dispatch("dog/getBreedImageDataList", {
                breed, 
                $axios, 
            }),
        ]).then(()=>{
            return {
                breed,
            };
        });
    },
    methods:{
        getImageBaseUrl(url){
            return `/breed/${this.breed}/image/${encodeURIComponent(url)}`
        },
        getEvalContNumStr(num){
            if (num > 999){
                return "999+";
            }
            return String(num);
        },
    },
    computed: {
        imageDataList(){
            return this.$store.state.dog.imageUrlList.map(
                (imageUrl)=>this.$store.state.dog.imageDataDic[imageUrl]);
        },
    },
}
</script>