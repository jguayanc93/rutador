require('dotenv').config();
const {config,Connection,Request,TYPES} = require('../../conexion/cadena')
const {decodificador} = require('../jwt/decodificador')
const {objevacio} = require('../objvacio/reqbody')
const XLSX = require('xlsx')

let verificar_precios = (req,res,next) =>{
    // let safe_coki = req.signedCookie;
    let proto_coki = req.body;
    // objevacio(safe_coki) ? res.status(401).send("logeate") : next();
    objevacio(proto_coki) ? res.status(401).send("logeate") : next();
}

let mostrar_precios = (req,res,next) =>{
    // let valid_coki = req.signedCookie;
    // let vendedor_data = decodificador(valid_coki);
    let {marca}=req.body;
    console.log(marca)
    let codven='V0172';
    // typeof vendedor_data=='object' ? bd_conexion(res,mes,vendedor_data.payload.vendedor) : res.status(401).send(vendedor_data);
    typeof codven=='string' ? bd_conexion(res,marca) : res.status(401).send('vacio el cuerpo');
}

let bd_conexion=(res,marca)=>{    
    conexion = new Connection(config);
    conexion.connect();
    conexion.on('connect',(err)=>{
        if(err){console.log("ERROR: ",err);}
        else{ bd_consulta(res,marca); }
    });
}

let bd_consulta = (res,marca) =>{
    let sp_sql="select b.codf,b.descr,a.nomfam,b.Usr_001,b.pcus,b.vvus,ISNULL(c.pcus,0),ISNULL(c.vvus,0) from tbl01fam a inner join prd0101 b on (LEFT(b.codi,2)=a.codfam) left join prd0108 c on (c.codi=b.codi) where b.estado=1 AND b.marc=@marca";
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
                Object.assign(respuesta2,respuesta);
                // console.log(respuesta2);
                ////CREAR UN EXEL PARA MANDAR SU REPORTE A DESCARGAR
                let cadenitajson=JSON.stringify(respuesta2);
                // res.status(200).json(cadenitajson);
                ////////////////////////FORMATYO EXCEL
                const worksheet=XLSX.utils.json_to_sheet(respuesta);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook,worksheet,"stocc");
                ///////cabesera
                XLSX.utils.sheet_add_aoa(worksheet,[["CODF","DESCRIPCION","FAMILIA","PART NUMBER","COSTO PRINCIPAL","VENTA PRINCIPAL","COSTO MYM","VENTA MYM"]],{origin:"A1"});
                ///columna anchura
                worksheet["!cols"]=[{wch:16}];
                ///////////BUFFER DE DATA CONVERTIDA                
                let buf = XLSX.write(workbook,{type:"buffer",bookType:"xlsx"});
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition','attachment; filename="precios.xlsx"');
                res.status(200).send(buf);
            }
        }
    })
    consulta.addParameter('marca',TYPES.VarChar,marca);
    conexion.execSql(consulta);
}

module.exports={verificar_precios,mostrar_precios}