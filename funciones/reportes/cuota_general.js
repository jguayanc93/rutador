require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {decodificador} = require('../jwt/decodificador')
const {objevacio} = require('../objvacio/reqbody')
const XLSX = require('xlsx')

let verificar_cuota = (req,res,next) =>{
    // let safe_coki = req.signedCookie;
    let proto_coki = req.body;
    // objevacio(safe_coki) ? res.status(401).send("logeate") : next();
    objevacio(proto_coki) ? res.status(401).send("logeate") : next();
}

let cuota_general = (req,res,next) =>{
    // let valid_coki = req.signedCookie;
    // let vendedor_data = decodificador(valid_coki);
    // let mes = req.body.mes;
    let raw_data=req.body;
    console.log(req.body)
    let codven='V0172';
    // typeof vendedor_data=='object' ? bd_conexion(res,mes,vendedor_data.payload.vendedor) : res.status(401).send(vendedor_data);
    typeof codven=='string' ? bd_conexion(res,codven) : res.status(401).send('vacio el cuerpo');
}

let bd_conexion=(res,codven)=>{    
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,codven); }
    });
}

let bd_consulta = (res,codven) =>{
    // let sp_sql="select (SUM(b.cant)-SUM(b.cancon))as 'por llegar',b.codi,alm1.descr,alm1.stoc as 'stoc principal',(select stoc from prd0108 where codi=alm1.codi) as 'stoc mm' from mst01ocm a join dtl01ocm b on (b.ndocu=a.ndocu) join prd0101 alm1 on (alm1.codi=b.codi AND alm1.marc=@marca) where alm1.estado=1 group by b.codi,alm1.descr,alm1.stoc,alm1.codi order by [stoc principal]";
    let sp_sql="JC_CUOTA_GENERAL";
    //let sp_sql="select a.nomfam,a.nommar,a.Venta,a.Costo,a.Renta,a.Porcentaje,dbo.CUOTA_ALCANCE_API2('ven',b.abrmar,a.CodFam),dbo.CUOTA_ALCANCE_API2('cos',b.abrmar,a.CodFam),dbo.CUOTA_ALCANCE_API2('can',b.abrmar,a.CodFam),dbo.CUOTA_ALCANCE_API2('ren',b.abrmar,a.CodFam),dbo.CUOTA_ALCANCE_API2('por',b.abrmar,a.CodFam) from tbl01comisiones a inner join tbl01mar b on (b.Nommar=a.nommar) order by a.CodFam";
    let consulta = new Request(sp_sql,(err,rowCount,rows)=>{
        if(err){
            console.log(err);
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
                        typeof data.value=='string' ? tmp[contador]=data.value.trim() : tmp[contador]=data.value.toFixed(2);
                        contador++;
                    })
                    respuesta.push(tmp);
                });
                // console.log(respuesta);
                Object.assign(respuesta2,respuesta);
                // console.log(respuesta2);
                console.log("termine de ejecutar el query de cuota general")
                ////CREAR UN EXEL PARA MANDAR SU REPORTE A DESCARGAR
                let cadenitajson=JSON.stringify(respuesta2);
                ////////////////////////FORMATYO EXCEL
                // let archivo_data=[respuesta];
                const worksheet=XLSX.utils.json_to_sheet(respuesta);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook,worksheet,"cuota general");
                ///////cabesera
                XLSX.utils.sheet_add_aoa(worksheet,[["familia","marca","cuota venta","cuota costo","cuota renta","cuota porcentaje","alcance venta","alcance costo","alcance cantidad","alcance renta","alcance porcentaje","porcentual venta","porcentual renta"]],{origin:"A1"});
                ///columna anchura
                worksheet["!cols"]=[{wch:16}];
                /////empaketar data y contruir el exel
                // XLSX.writeFile(workbook,"usuario.xlsx");
                ///////////////////////
                ///////////BUFFER DE DATA CONVERTIDA                
                let buf = XLSX.write(workbook,{type:"buffer",bookType:"xlsx"});
                // res.status(200).json(cadenitajson);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition','attachment; filename="general.xlsx"');
                res.status(200).send(buf);
            }
        }
    })
    //conexion.execSql(consulta);
    // consulta.addParameter('marca',TYPES.Int,mes);
    conexion.callProcedure(consulta);
}

module.exports={verificar_cuota,cuota_general}