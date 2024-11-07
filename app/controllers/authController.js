const authModel = require('../models/authModel');

exports.login = async (req, res) => {
    const {email, password} = req.body;
    try {
        if (!email && !password) {
            return res.status(400).json({ message: 'invalid' });
        }

        const result = await authModel.login(
            email, password
        );
        if (result.success) {
            // NOTE : 로그인 성공 시 세션에 사용자 정보 저장
            req.session.user = {
                id: result.id,
                email: result.email
            };
            
        }

        res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'server error', data: {success:false}});
    }
};
