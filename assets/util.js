console.log("assets/util.js");
export function genID(n=8){
    const tbl="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(Array(n)).map(()=>tbl[Math.floor(Math.random()*tbl.length)]).join('');
}
export function genKey(keys, n = 8, f=null, max_itr=10){
    if (!f){
        if (keys instanceof Array){//string[]
            f = (id) => keys.includes(id);
        }
        else if (keys instanceof Function){// (id) => boolean;
            f = keys;
        }
        else if (keys instanceof Object){//{[key:string]: any}
            f = (id) => id in keys;
        }
        else{//不明。とりあえず返す
            return genID(n);
        }
    }
    for (var cnt = max_itr; cnt > 0; --cnt){
        var id = genID(n);
        if (!f(id)){
            return id;
        }
    }
    throw Error("genKey:exceeded max_itr");
}

export function deepCopy(src){
    return JSON.parse(JSON.stringify(src));
}
