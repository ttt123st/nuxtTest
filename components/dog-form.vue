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
                            <select v-model="selectedBreed">
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
                        <button class="button" v-on:click="jumpSelectedBreed">移動</button>
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
}
</script>
