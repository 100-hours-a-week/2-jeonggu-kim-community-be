const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const multer = require('multer');
const path = require('path');

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../images/board')); // NOTE : 파일 저장 경로
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // NOTE : 파일 이름 설정
    }
});

const upload = multer({ storage: storage });

router.get('/list', boardController.getBoardList);
router.post('/', boardController.addBoard);

router.get('/:boardNo', boardController.getBoardInfo);
router.put('/:boardNo', boardController.editBoard);
router.delete('/:boardNo', boardController.deleteBoard);

// router.get('/boardInfo', boardController.getBoardInfo);
router.post('/like', boardController.likeBoard);
router.patch('/view/:boardNo', boardController.addViewCount);
router.post('/image', upload.single('boardImage'), boardController.uploadImage);

module.exports = router;