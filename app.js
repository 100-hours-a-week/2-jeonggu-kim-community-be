const express = require('express');
const path = require('path');
//const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql2');
const expressRoutes = require('./app/routes/expressRoutes/expressRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// NOTE : 미들웨어 설정
app.use(express.json());
app.use(express.static(path.join(__dirname, 'app', 'views')));
app.use(helmet()); // NOTE : Helmet을 사용하여 보안 설정
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 } //NOTE : 세션 유효 시간 : 30분
}));
app.use('/images', express.static(path.join(__dirname, 'images')));

// NOTE : 요청 속도 제한 설정
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// NOTE : Helmet을 사용한 Content Security Policy
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://trusted.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "https://images.com"],
    }
}));

// NOTE : 사용자 관련
//app.use('/api/users', expressRoutes);
app.use('/api', expressRoutes);
app.post('/login', expressRoutes);
app.get('/dashboard', expressRoutes);

// app.get('/helloworld', (req, res) => {
//     res.sendFile(path.join(__dirname, 'app/views/helloworld.html'));
// });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app/views/index.html'));
});

// NOTE : 데이터베이스 연결
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin!123',
    database: 'test'
});

db.connect(err => {
    if (err) {
        console.error('DB 연결 실패: ' + err.stack);
        return;
    }
    console.log('DB 연결 성공!');
});

// NOTE : 서버시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});