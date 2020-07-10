<template>
  <div>
    <section class="hero is-medium is-light is-bold">
      <div class="hero-body">
          <div class="container">
              <h1 class="title is-spaced">
                <span class="icon is-left">
                    <i class="fas fa-paw"></i>
                </span>
                DogAPI一覧サービス
                <span class="icon is-left">
                    <i class="fas fa-paw"></i>
                </span>
              </h1>
              <h2 class="subtitle">ここでは<a class="has-text-link" href="https://dog.ceo/dog-api/">Dog API</a>に投稿されている画像を一覧したり、コメントを付けたりできます。</h2>
          </div>
      </div>
    </section>

    <section class="section">
      <div class="content">
        <p>犬種を指定して画像を検索できます。</p>
      </div>
      <dog-form />
    </section>

    <hr>

    <section class="section">
      <div class="content">
      </div>
    </section>

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
    ]);
  }
}
</script>