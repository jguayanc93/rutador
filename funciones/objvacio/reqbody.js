const objevacio=(objecuerpo)=>{
    for(let propiedad in objecuerpo){
        if(Object.hasOwn(objecuerpo,propiedad)){ return false; }
    }
    return true;
}

module.exports={objevacio}