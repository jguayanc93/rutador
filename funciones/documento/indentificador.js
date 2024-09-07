let consultas_almacenadas={
    1:"update mst01fac set TipEnt=@update where ndocu=@doc",
    2:"update mst01fac set codtra=@update where ndocu=@doc",
    3:"update mst01fac set Consig=@update where ndocu=@doc",
    4:"update mst01fac set dirent=@update where ndocu=@doc",
    5:"update mst01fac set codven_usu=@update where ndocu=@doc",
    6:"update mst01fac set observ=@update where ndocu=@doc",
    7:"update mst01fac set orde=@update where ndocu=@doc"
}

let consultas_almacenadas2={
    1:["update mst01fac set TipEnt=@update where ndocu=@doc",['update','doc']],
    2:["update mst01fac set codtra=@update where ndocu=@doc",['update','doc']],
    3:["update mst01fac set Consig=@update where ndocu=@doc",['update','doc']],
    4:["update mst01fac set dirent=@update where ndocu=@doc",['update','doc']],
    5:["update mst01fac set codven_usu=@update where ndocu=@doc",['update','doc']],
    6:["update mst01fac set observ=@update where ndocu=@doc",['update','doc']],
    7:["update mst01fac set orde=@update where ndocu=@doc",['update','doc']]
}

module.exports={consultas_almacenadas}