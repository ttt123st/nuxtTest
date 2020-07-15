<template>
  <div>
    <section class="hero is-medium is-light is-bold">
      <div class="hero-body">
          <div class="container">
              <h1 class="title is-spaced">
                <span class="icon">
                  <i class="fas fa-paw"></i>
                </span>
                DogAPI一覧サービス
                <span class="icon">
                  <i class="fas fa-paw"></i>
                </span>
              </h1>
              <h2 class="subtitle">ここでは<a class="has-text-link" href="https://dog.ceo/dog-api/">Dog API</a>に投稿されている画像を一覧したり、コメントを付けたりできます。</h2>
          </div>
      </div>
    </section>

    <section class="section">
      <div class="content">
        <p>
          <span class="icon">
            <i class="fas fa-search"></i>
          </span>
          犬種を指定して画像を検索できます。
        </p>
      </div>
      <dog-form />
    </section>

    <hr>

    <section class="section">
      <div class="content">
        <p>
          <span class="icon">
            <i class="fas fa-star"></i>
          </span>
          あなたのお気に入り
        </p>
      </div>
      <div class="columns is-multiline">
        <div v-if="favImageDataList.length == 0" class="column content has-text-centered">
          <p>お気に入りの画像はありません。</p>
        </div>
        <div v-else class="column is-2"
          v-for="imageData of favImageDataList" v-bind:key="imageData.url">
          <div class="card">
              <div class="card-image">
                  <a v-bind:href="`${getImageBaseUrl(imageData)}/page`">
                      <figure class="image">
                          <img v-bind:src="imageData.url">
                      </figure>
                  </a>
              </div>
          </div>
        </div>
      </div>
    </section>

    <hr>

    <section class="section">
      <div class="content">
        <p>
          <span class="icon">
            <i class="fas fa-thumbs-up"></i>
          </span>
          人気の画像
        </p>
      </div>
      <div class="columns is-multiline">
        <div v-if="popImageDataList.length == 0" class="column content has-text-centered">
          <p>人気の画像はありません。</p>
        </div>
        <div v-else class="column is-2"
          v-for="imageData of popImageDataList" v-bind:key="imageData.url">
          <div class="card">
            <div class="card-image">
              <a v-bind:href="`${getImageBaseUrl(imageData)}/page`">
                <figure class="image">
                  <img v-bind:src="imageData.url">
                </figure>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr>

    <section class="section">
      <div class="content">
        <p>
          <span class="icon">
            <i class="fas fa-comments"></i>
          </span>
          新着コメントのある画像
        </p>
      </div>
      <div class="columns is-multiline">
        <div v-if="cmtImageDataList.length == 0" class="column content has-text-centered">
          <p>コメントのある画像はありません。</p>
        </div>
        <div v-else class="column is-2"
          v-for="imageData of cmtImageDataList" v-bind:key="imageData.url">
          <div class="card">
            <div class="card-image">
              <a v-bind:href="`${getImageBaseUrl(imageData)}/page`">
                <figure class="image">
                  <img v-bind:src="imageData.url">
                </figure>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="level">
        <div class="level-item">
          <div class="content">
            <a v-bind:href="`https://github.com/ttt123st/nuxtTest`">
              <span class="icon">
                <i class="fab fa-github"></i>
              </span>
              githubリポジトリ
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>

</template>

<script>
console.log("pages/index.vue");

import dogForm from "@/components/dog-form.vue";

export default {
  components:{
    dogForm,
  },
  asyncData(context){
    var $axios = context.app.$axios;
    return Promise.all([
      context.store.dispatch("dog/getBreedList", {$axios}),
      context.store.dispatch("dog/getPopImageDataList", {$axios}),
      context.store.dispatch("dog/getFavImageDataList", {$axios}),
      context.store.dispatch("dog/getCmtImageDataList", {$axios}),
    ]);
  },
  computed: {
    favImageDataList(){
      return this.$store.state.dog.favImageUrlList.map(
        (imageUrl)=>this.$store.state.dog.imageDataDic[imageUrl]);
    },
    popImageDataList(){
      return this.$store.state.dog.popImageUrlList.map(
        (imageUrl)=>this.$store.state.dog.imageDataDic[imageUrl]);
    },
    cmtImageDataList(){
      return this.$store.state.dog.cmtImageUrlList.map(
        (imageUrl)=>this.$store.state.dog.imageDataDic[imageUrl]);
    },
  },
  methods:{
    getImageBaseUrl(imageData){
      return `/breed/${imageData.breed}/image/${encodeURIComponent(imageData.url)}`
    },
  },
}
</script>