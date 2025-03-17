export function random( length : number){
    let options = "qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
    let len = options.length;
    let ans = "";
    for(let i=0;i< length ; i++){
        ans += options[Math.floor((Math.random() * len))];
    }
    return ans;
}