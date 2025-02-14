require('dotenv').config();
const express = require('express');
const router = express.Router();
const {config,Connection,Request,TYPES} = require('../conexion/cadena.js');
const jws = require('jws');

let {bprom} = require('../funciones/promocion/buscar.js')
let {analisarprom} = require('../funciones/promocion/analisar.js')
let {addprom} = require('../funciones/promocion/add.js')
let {pivot} = require('../funciones/promocion/pivot.js')

router.use(express.json());

router.post('/verificar',bprom,analisarprom)
// router.post('/verificar',bprom,pivot)

router.post('/add',addprom)

router.post('/pivot',pivot)

module.exports=router