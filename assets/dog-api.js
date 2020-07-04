console.log("assets/dog-api.js");

export class DogAPI{
    static urlBase = 'https://dog.ceo/api';

    constructor(){
    }

    getBreeds($axios){
        return $axios.get(`${DogAPI.urlBase}/breeds/list/all`).then(
            json=>{
                var status = json.data.status;
                var message = json.data.message;
                if (status != "success"){
                    return Promise.reject(message);
                }
                var breeds = Object.keys(message);
                return breeds;//犬種配列を返す。サブ犬種を無視
            }
        );
    }

    getBreedImages($axios, breed){
        return $axios.get(`${DogAPI.urlBase}/breed/${breed}/images`).then(
            json=>{
                var status = json.data.status;
                var message = json.data.message;
                if (status != "success"){
                    return Promise.reject(message);
                }
                return message;//url配列を返す。
            }
        );       
    }
};

var instance = new DogAPI();

export default instance;