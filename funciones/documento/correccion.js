require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let actualisar = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    // let {cli,sugerencia} = req.body;
    console.log(req.body)

    res.status(401).send("revisa la terminal");
    // let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    // typeof vendedor_data=='string' ? bd_conexion(res,sugerencia,cli) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,sugerencia,cli)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,sugerencia,cli); }
    });
}

let bd_consulta = (res,sugerencia,cli)=>{
    let sp_sql="update mst01fac set TipEnt=@tipoentrega,codtra=@codtransportista,Consig=@consignatario,dirent=@direntrega,codven_usu=@quienfacturo,observ=@observacion,orde=@orden where ndocu in ('01','03') and ndocu=@doc";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){ res.status(401).send("error interno"); }
        else{
            conexion.close();
            if(rows.length==0) res.status(401).send("sin resultados?");
            else{
                let respuesta=[];
                let respuesta2={};
                let contador=0;
                rows.forEach(fila=>{
                    let tmp={};
                    fila.map(data=>{
                        if(contador>=fila.length) contador=0;
                        typeof data.value=='string' ? tmp[contador]=data.value.trim() : tmp[contador]=data.value;
                        contador++;
                    })
                    respuesta.push(tmp);
                });
                console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                // console.log(respuesta2);
                // let cadenitajson=JSON.stringify(respuesta2);
                // res.status(200).json(cadenitajson);
                res.status(200).send("actualisado correctamente");
            }
        }
    })
    consulta.addParameter('tipoentrega',TYPES.VarChar,);
    consulta.addParameter('codtransportista',TYPES.VarChar,);
    consulta.addParameter('consignatario',TYPES.VarChar,);
    consulta.addParameter('direntrega',TYPES.VarChar,);
    consulta.addParameter('quienfacturo',TYPES.VarChar,);
    consulta.addParameter('observacion',TYPES.VarChar,);
    consulta.addParameter('orden',TYPES.VarChar,);
    consulta.addParameter('doc',TYPES.VarChar,);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={actualisar}