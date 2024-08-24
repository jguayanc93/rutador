
let mostrar= (req,res)=>{
    let cifrado=req.signedCookies;
    res.status(200).json(cifrado);
}

module.exports={mostrar}