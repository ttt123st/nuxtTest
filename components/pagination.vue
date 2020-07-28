<template>
<nav v-if="page>=0" class="pagination is-centered" role="navigation" aria-label="pagination">
    <nuxt-link class="pagination-previous" v-bind:to="`${baseUrl}?${pageName}=${page-1}`" v-bind:disabled="page-1<0" v-bind:event="page-1<0 ? '': 'click'">前へ</nuxt-link>
    <nuxt-link class="pagination-next" v-bind:to="`${baseUrl}?${pageName}=${page+1}`" v-bind:disabled="page+1>=pageNum" v-bind:event="page+1>=pageNum ? '': 'click'">次へ</nuxt-link>
    <ul class="pagination-list">
        <li v-if="page-2>=0"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${0}`" class="pagination-link" aria-label="Goto page 1">1</nuxt-link></li>
        <li v-if="page-1>=2"><span class="pagination-ellipsis">&hellip;</span></li>

        <li v-if="page-3>=0&&page+1>=pageNum"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${page-3}`" class="pagination-link" v-bind:aria-label="`Goto page ${page-2}`">{{page-2}}</nuxt-link></li>
        <li v-if="page-2>=0&&page+2>=pageNum"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${page-2}`" class="pagination-link" v-bind:aria-label="`Goto page ${page-1}`">{{page-1}}</nuxt-link></li>

        <li v-if="page-1>=0"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${page-1}`" class="pagination-link" v-bind:aria-label="`Goto page ${page}`">{{page}}</nuxt-link></li>
        <li><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${page}`" class="pagination-link is-current" v-bind:aria-label="`Goto page ${page+1}`" aria-current="page">{{page+1}}</nuxt-link></li>
        <li v-if="page+1<pageNum"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${page+1}`" class="pagination-link" v-bind:aria-label="`Goto page ${page+2}`">{{page+2}}</nuxt-link></li>

        <li v-if="page+2<pageNum&&page<2"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${page+2}`" class="pagination-link" v-bind:aria-label="`Goto page ${page+3}`">{{page+3}}</nuxt-link></li>
        <li v-if="page+3<pageNum&&page<1"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${page+3}`" class="pagination-link" v-bind:aria-label="`Goto page ${page+4}`">{{page+4}}</nuxt-link></li>

        <li v-if="page+2<pageNum-1"><span class="pagination-ellipsis">&hellip;</span></li>
        <li v-if="page+2<pageNum"><nuxt-link v-bind:to="`${baseUrl}?${pageName}=${pageNum-1}`" class="pagination-link" v-bind:aria-label="`Goto page ${pageNum}`">{{pageNum}}</nuxt-link></li>
    </ul>
</nav>

</template>

<script>
console.log("components/pagination.vue");

export default {
    props:{
        pageName: {
            type: String,
            default: "page",
        },
        pageNum: {
            type: Number,
            validator(value){
                return Number.isInteger(value);
            },
        }
    },
    data(){
        var baseUrl = this.$route.path;
        var page = Number(this.$route.query[this.pageName] || 0);

        //console.log("components/pagination.vue:data()");

        if (!(page < this.pageNum)){//不正なページ。エラーページに誘導されるべき
            page = -1;//非表示
        }
        return {
            baseUrl,
            page,
        };
    },
    watch: {
        $route(to, from){
            var page = Number(to.query[this.pageName] || 0);
            if (!(page < this.pageNum)){//不正なページ。エラーページに誘導されるべき
                page = -1;//非表示
            }
            this.page = page;
        },
    },
}
</script>