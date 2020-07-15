<template>
    <div class="container">
        <div class="field is-horizontal">
            <div class="field-label">
                <label class="label">犬種を選ぶ：</label>
            </div>
            <div class="field-body">
                <div class="field has-addons">
                    <div class="control has-icons-left is-expanded">
                        <div class="select is-fullwidth">
                            <select v-model="selectedBreed" ref="breedSelect">
                                <option 
                                    v-for="breed of breedList" 
                                    v-bind:key="breed"
                                    v-bind:value="breed"
                                >{{transBreed(breed)}}</option>
                            </select>
                        </div>
                        <div class="icon is-left">
                            <i class="fas fa-paw"></i>
                        </div>
                    </div>
                    <div class="control">
                        <button class="button" v-on:click="jumpSelectedBreed">決定</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
console.log("components/dog-form.vue");

export default {
    props: {
        breed: { type: String, default: ""},
    },
    data(){
        return {
            selectedBreed: this.breed,
        };
    },
    methods:{
        transBreed(breed){
            var tr = this.breedTrans[breed];
            return tr == null ? breed : tr;
        },
        jumpSelectedBreed(){
            // console.log("components/dog-form.vue:jumpSelectedBreed()")
            // console.log(this.breed);
            // console.log(this.selectedBreed);
            // console.log(this.$refs.breedSelect.value);
            //GoogleChromeでブラウザバックを行うとvueプロパティ値が反映されずにフォームに値が残ってしまう
            //（mountedで取得、設定できなかった）ので読み込む。FireFoxでは戻るとフォーム値もクリアされた。
            if (!this.selectedBreed && this.$refs.breedSelect.value){
                this.selectedBreed = this.$refs.breedSelect.value;
            }
            if (this.selectedBreed){
                location.href = `/breed/${this.selectedBreed}`;
            }
        }
    },
    computed: {
        breedList(){
            return this.$store.state.dog.breedList;
        },
        breedTrans(){
            return this.$store.state.dog.breedTrans;
        },
    },
    // mounted(){
    //     console.log("components/dog-form.vue:mounted()")
    //     console.log(this.breed);
    //     console.log(this.selectedBreed);
    //     console.log(this.$refs.breedSelect.value);
    //     this.$nextTick(()=>{
    //         console.log("components/dog-form.vue:nextTick()")
    //         console.log(this.breed);
    //         console.log(this.selectedBreed);
    //         console.log(this.$refs.breedSelect.value);
    //     });
    // },
    // updated(){
    //     console.log("components/dog-form.vue:updated()")
    //     console.log(this.breed);
    //     console.log(this.selectedBreed);
    //     console.log(this.$refs.breedSelect.value);
    // },
}
</script>
