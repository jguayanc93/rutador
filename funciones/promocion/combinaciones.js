// COMBINACIONES PARA LOS MULTIPLES ESCENARIOS

const posibilidades={
    "tipo111":[1,1,1],
    "tipo113":[1,1,3],///ya esta
    "tipo131":[1,3,1],///ya esta
    "tipo133":[1,3,3],
    "tipo311":[3,1,1],
    "tipo313":[3,1,3],///ya esta
    "tipo331":[3,3,1],///ya esta
    "tipo333":[3,3,3]
}

//RECORDATORIO SOBRE METRICAS REVISAR SIEMPRE CON LAS COMBINACIONES 
//METRICA 1 VENTA VALORIZADO
//METRICA 2 VENTA EN UNIDADES
let metricas={}

let buscador_tipo=(respuesta2)=>{
    let buscar_tipo=[respuesta2[3],respuesta2[4],respuesta2[5]];
    // let buscar_tipo=[respuesta2[3],respuesta2[4],respuesta2[5],respuesta2[7]];
    let encontrado="no found";
    for(let i in posibilidades){
        // if(posibilidades[i].toString()==buscar_tipo.toString()){
        //     console.log("este es el tipo encontrado");
        //     console.log(posibilidades[i]);
        // }
        if(posibilidades[i].toString()==buscar_tipo.toString()) encontrado=posibilidades[i];
    }
    return encontrado;
}

let buscador_metrica=(respuesta2)=>{
    let tipo_metrica=respuesta2[6];
    return tipo_metrica;
}

let buscador_grupo=(respuesta2)=>{
    let tipo_grupo=respuesta2[9];
    return tipo_grupo;
}

module.exports={posibilidades,buscador_tipo,buscador_metrica,buscador_grupo};