const express = require('express')
const blogCtrl = require('../../controller/Blog/blogCtrl')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

router.get('/all-blogs', blogCtrl.getAllBlogs)
router.put('/:id', authMiddlewares, isAdmin, blogCtrl.updatedBlog)
router.delete('/:id', authMiddlewares, isAdmin, blogCtrl.deletedBlog)
router.post('/create-blog', authMiddlewares, isAdmin, blogCtrl.createBlog)
router.get('/:id', blogCtrl.getSingleBlog)

module.exports = router
