const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

// NOTE : multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../images/profile')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.patch('/', userController.updateUser);
router.post('/add', userController.addUser);
router.get('/check', userController.check);
router.get('/', userController.getUserInfo);
router.delete('/', userController.deleteUser);
router.post('/image', upload.single('profileImage'), userController.uploadImage);

module.exports = router;