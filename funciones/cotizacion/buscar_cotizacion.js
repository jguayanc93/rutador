require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let bcotizacion = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {ncoti} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,ncoti) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,ncoti)=>{
    const conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(conexion,res,ncoti); }
    });
}
/////SOLO DEBE PERMITIR BUSCAR COTIS EN FLAG 0
let bd_consulta = (conexion,res,ncoti)=>{
    // let sp_sql="select codf,marc,descr,cant,preu,totn,dsct,codalm from dtl01cot where ndocu=@coti order by item";
    let sp_sql="select a.codf,a.marc,a.descr,a.cant,a.preu,a.totn,a.dsct,a.codalm from dtl01cot a inner join mst01cot b on (b.ndocu=a.ndocu) where b.flag=0 AND a.ndocu=@coti order by item";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){
            conexion.close();
            res.status(401).send("error interno");
        }
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
                // console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('coti',TYPES.VarChar,ncoti);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={bcotizacion}