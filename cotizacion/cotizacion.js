require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');

let {bcliente} = require('../funciones/cotizacion/cliente_buscar.js')
let {idcliente} = require('../funciones/cotizacion/cliente_identificar.js')
let {bproducto} = require('../funciones/cotizacion/buscar_producto.js')
let {bproductos} = require('../funciones/cotizacion/buscar_productos.js');
let {rentabilidad} = require('../funciones/cotizacion/rentabilidad.js')
let {promocion} = require('../funciones/cotizacion/promociones.js')
let {crear} = require('../funciones/cotizacion/crear_cotizacion.js')
let {bcotizacion} = require('../funciones/cotizacion/buscar_cotizacion.js')

let {bcotizacion_limpia} = require('../funciones/cotizacion/modificar_cotizacion.js')
let {bproductoagregado} = require('../funciones/cotizacion/coti_modificada_agregar_producto.js')
let {crear_modificacion} = require('../funciones/cotizacion/crear_coti_modificada.js')

router.use(express.json());

router.post('/busqueda',bcliente)

router.post('/identificador',idcliente)

router.post('/productoid',bproducto)///////producto identificado
router.post('/producto',bproductos)
//router.post('/productopartnumber',)/////producto por partnumber


router.post('/rentabilidad',rentabilidad)

router.post('/opg',promocion)

router.post('/creacion',crear)

router.post('/buscar',bcotizacion)

router.post('/modificar',bcotizacion_limpia)
router.post('/idprdmodificadoagregado',bproductoagregado)
router.post('/crearmodificacion',crear_modificacion)

module.exports=router