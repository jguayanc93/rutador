
// let decodificador = (req,res) =>{
//     let data = req.signedCookie;
//     let captura = jws.verify(data.cdk,'HS256',process.env.PALABRA_CLAVE);
//     if(captura){
//         let descifrado=jws.decode(data.cdk);
//         res.status(200).json(descifrado.payload);
//     }
//     else{ res.status(401).send("token invalido"); }
// }

let decodificador = (galleta) => {
    try{
        let captura = jws.verify(galleta.cdk,process.env.ALG_ENCRYPT,process.env.PALABRA_CLAVE)
        if(captura){
            let descifrado=jws.decode(data.cdk);
            return descifrado.payload;
        }
        else{ return "token invalido"; }
    }
    catch(error){
        return "fallo validacion de galleta";
    }
}

module.exports={decodificador}