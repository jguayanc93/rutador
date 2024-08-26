
const {config,Connection,Request,TYPES} = require('./cadena')

let bd_consulta = (res,spsql,mes) => {
    let consulta= new Request(spsql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            if(rows.length==0) res.status(401).send("sin resultados?");
            else{
                let respuesta=[];
                let respuesta2={};
                let contador=0;
                rows.forEach(fila => {
                    let tmp={};
                    fila.map(data=>{
                        if(contador>=fila.length) contador=0;
                        typeof data.value=='string' ? tmp[contador]==data.value.trim() : tmp[contador]=data.value;
                        contador++;
                    })
                    respuesta.push(tmp);
                });
                Object.assign(respuesta2,respuesta);
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('',TYPES.VarChar,mes);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={bd_consulta}