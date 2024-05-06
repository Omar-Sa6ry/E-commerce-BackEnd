const express = require('express')
const colorCtrl = require('../../controller/Products/colorCtrl')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

router.post('/create-color', authMiddlewares, isAdmin, colorCtrl.createColor)
router.get('/all-color', colorCtrl.getAllColors)
router.get('/:id', colorCtrl.getSingleColor)
router.put('/:id', authMiddlewares, isAdmin, colorCtrl.updatedColor)
router.delete('/:id', authMiddlewares, isAdmin, colorCtrl.deletedColor)

module.exports = router
