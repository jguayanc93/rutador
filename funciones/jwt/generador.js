const jws = require('jws');

let jwtgenerator = (obj) => {
    let userpayloaddata = {
        "identificador":obj[0][0],
        "nombre":obj[0][1],
        "grupo":obj[0][2],
        "vendedor":obj[0][3],
        "modulos":obj[0][4],
        "acciones":{
            "create":false,
            "read":true,
            "update":true,
            "delete":false
        }
    }
    const firma = {
        header:{alg:'HS256',"typ":"JWT"},
        payload:userpayloaddata,
        secret:process.env.PALABRA_CLAVE
    }

    return jws.sign(firma);
}

module.exports={jwtgenerator}