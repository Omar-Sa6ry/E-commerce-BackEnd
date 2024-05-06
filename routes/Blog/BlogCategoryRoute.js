const express = require('express')
const categoryCtrl = require('../../controller/Blog/blogCategoryCtrl')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

router.post(
  '/create-category',
  authMiddlewares,
  isAdmin,
  categoryCtrl.createCategory
)
router.get('/all-category', categoryCtrl.getAllCategories)
router.get('/:id', categoryCtrl.getSingleCategory)
router.put('/:id', authMiddlewares, isAdmin, categoryCtrl.updatedCategory)
router.delete('/:id', authMiddlewares, isAdmin, categoryCtrl.deletedCategory)

module.exports = router
