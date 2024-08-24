
let clean_cookie =(req,res)=>{
    res.clearCookie("cdk",{
        domain:"compudiskett.com.pe",
        path:"/",
        httpOnly:true,
        secure:true,
        sameSite:'None',
        signed:true
    })
    res.status(200).send("cookie eliminada")
}

module.exports={clean_cookie}