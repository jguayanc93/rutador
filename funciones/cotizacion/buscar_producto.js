require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {objevacio} = require('../objvacio/reqbody')
const {decodificador} = require('../jwt/decodificador');

let observador = (req,res,next) => objevacio(req.signedCookies) ? res.status(401).send("logeate") : next();

let bproducto = (req,res,next) => {
    // let valid_coki = req.signedCookies;
    let {sugerencia,cctl} = req.body;
    console.log(req.body)
    // let vendedor_data = decodificador(valid_coki.cdk);
    let vendedor_data='cadena';
    // typeof vendedor_data=='string' ? bd_conexion(res,mes,vendedor_data.vendedor) : res.status(401).send(vendedor_data);
    typeof vendedor_data=='string' ? bd_conexion(res,sugerencia,cctl) : res.status(401).send(vendedor_data);
}

let bd_conexion=(res,sugerencia,cctl)=>{
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,sugerencia,cctl); }
    });
}

let bd_consulta = (res,sugerencia,cctl)=>{
    // let caracter="'"+"%"+sugerencia+"%"+"'";///no usar porqe sobre escribe las comillas simples
    let caracter="%"+sugerencia+"%";
    // let sp_sql="select top 10 codi,descr,CAST(stoc as int) as 'stoc'  from prd0101 where estado=1 and cast(stoc as int)>0 and descr like @pista";
    // let sp_sql="select top 9 codi,descr,CAST(stoc as int)as'stoc',pcus,vvus from prd0101 where estado=1 and cast(stoc as int)>0 and descr like @pista";
    let sp_sql="select top 10 a.codi,a.descr,CAST(a.stoc as int)as'stoc',a.pcus,a.vvus,b.dscto_maxven from prd0101 a join dtl_dscto_marca_tc b on b.codmar=a.codmar join mst01cli c on c.tipocl=b.codtcl where a.estado=1 and cast(a.stoc as int)>0 and a.descr like '%tinta hp%' and c.tipocl=@alfabeto"
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
                // console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                let cadenitajson=JSON.stringify(respuesta2);
                res.status(200).json(cadenitajson);
            }
        }
    })
    consulta.addParameter('pista',TYPES.VarChar,caracter);
    consulta.addParameter('alfabeto',TYPES.VarChar,cctl);
    conexion.execSql(consulta);
    // conexion.callProcedure(consulta);
}

module.exports={bproducto}