require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let bproductoagregado = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {sugerencia,cctl,ccli} = req.body;
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,sugerencia,cctl,ccli) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,sugerencia,cctl,ccli)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,sugerencia,cctl,ccli); }
    });
}

let bd_consulta = (res,sugerencia,cctl,ccli)=>{
    // let caracter="%"+sugerencia+"%";
    let caracter=sugerencia;
    // let sp_sql="select top 2 a.codi,a.descr,CAST(a.stoc as int)as'stoc',a.pcus,a.vvus,b.dscto_maxven,a.codf,a.marc from prd0101 a join dtl_dscto_marca_tc b on (b.codmar=a.codmar) join mst01cli c on (c.tipocl=b.codtcl) where a.estado=1 and a.codi=@pista and c.tipocl=@alfabeto group by a.codi,a.descr,a.stoc,a.pcus,a.vvus,b.dscto_maxven,a.codf,a.marc";
    let sp_sql="select a.aigv,'item',a.codi,a.codf,a.marc,a.umed,a.descr,CAST(a.stoc as int)as'stoc',a.vvus,b.dscto_maxven,a.pcus,a.msto from prd0101 a join dtl_dscto_marca_tc b on (b.codmar=a.codmar) join mst01cli c on (c.tipocl=b.codtcl) where a.estado=1 and a.codi=@pista and b.codtcl=@alfabeto and c.codcli=@cliente";
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
                Object.assign(respuesta2,respuesta);
                let cadenitajson=JSON.stringify(respuesta2[0]);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('pista',TYPES.VarChar,caracter);
    consulta.addParameter('alfabeto',TYPES.VarChar,cctl);
    consulta.addParameter('cliente',TYPES.VarChar,ccli);
    conexion.execSql(consulta);
}

module.exports={bproductoagregado}