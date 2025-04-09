require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');

let {verificar_marca,mostrar_marcas} = require('../funciones/reportes/marcas.js')
let {verificar_stoc,mostrar_stock} = require('../funciones/reportes/stoc.js')
let {verificar_tiempo,mostrar_tiempo} = require('../funciones/reportes/tiempo.js')
let {verificar_precios,mostrar_precios} = require('../funciones/reportes/precios.js')


router.use(express.json());

router.post('/marcas',verificar_marca,mostrar_marcas);

router.post('/stoc',verificar_stoc,mostrar_stock)

router.post('/precios',verificar_precios,mostrar_precios)

router.post('/tiempo',verificar_tiempo,mostrar_tiempo)

module.exports=router