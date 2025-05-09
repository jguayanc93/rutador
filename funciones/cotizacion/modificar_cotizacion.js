require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let bcotizacion_limpia = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {ncoti} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    let coticompleta="009-00"+ncoti;
    typeof vendedor_data=='string' ? bd_conexion(res,coticompleta) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,ncoti)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,ncoti); }
    });
}

let bd_consulta = (res,ncoti)=>{
    // let sp_sql="select CONVERT(varchar,a.fecha,111),a.ndocu,a.codi,a.descr,a.cant,a.preu,a.tota,a.dsct,a.codf,a.marc,b.tipocl from dtl01cot a inner join mst01cli b on (b.codcli=a.codcli) where a.ndocu=@coti AND a.flag='0' AND LEFT(a.codi,4)<>'0303' AND LEFT(a.descr,11)<>'GRATIS/PROM' order by a.item";
    // let sp_sql="select CONVERT(varchar,a.fecha,111),a.ndocu,a.codi,a.descr,a.cant,a.preu,a.tota,a.dsct,a.codf,a.marc,b.tipocl,a.fecha,a.cdocu,a.ndocu,a.codcli,a.tcam,a.mone,a.moneitm,a.aigv,'item',a.codi,a.codf,a.marc,a.umed,a.descr,a.cant,a.preu,a.tota,a.dsct,a.totn,a.codalm,a.cost,a.msto from dtl01cot a inner join mst01cli b on (b.codcli=a.codcli) where a.ndocu=@coti AND a.flag='0' AND LEFT(a.codi,4)<>'0303' AND LEFT(a.descr,11)<>'GRATIS/PROM' order by a.item";
    let sp_sql="select b.tipocl,a.fecha,a.cdocu,a.ndocu,a.codcli,a.tcam,a.mone,a.moneitm,a.aigv,'item',a.codi,a.codf,a.marc,a.umed,a.descr,a.cant,a.preu,a.tota,a.dsct,a.totn,a.codalm,a.cost,a.msto from dtl01cot a inner join mst01cli b on (b.codcli=a.codcli) inner join mst01cot c on (c.ndocu=a.ndocu) where a.ndocu=@coti AND c.flag='0' AND LEFT(a.codi,4)<>'0303' AND LEFT(a.descr,11)<>'GRATIS/PROM' order by a.item";
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
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('coti',TYPES.VarChar,ncoti);
    conexion.execSql(consulta);
}

module.exports={bcotizacion_limpia}