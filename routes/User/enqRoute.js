const express = require('express')
const enquiryCtrl = require('../../controller/Users/enqCtrl')
const {
  authMiddlewares,
  isAdmin
} = require('../../middlewares/authMiddlewares')

const router = express.Router()

router.post('/create-enquiry', enquiryCtrl.createEnquiry)
router.delete('/:id', authMiddlewares, isAdmin, enquiryCtrl.deletedEnquiry)
router.put('/:id', authMiddlewares, isAdmin, enquiryCtrl.updateEnquiry)
router.get('/:id', enquiryCtrl.getEnquiry)
router.get('/', enquiryCtrl.getallEnquiry)

module.exports = router
