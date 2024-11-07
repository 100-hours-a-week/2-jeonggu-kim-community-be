const path = require('path');
const { getJsonData } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
const userFilePath = path.join(__dirname, '../data/userData.json');

async function login(email, password){
    const jsonUserData = await getJsonData(userFilePath, "users"); 
    const filteredUsers = jsonUserData.users.filter(user => user["email"] === email && user["password"] === password);
    
    if (filteredUsers.length > 0) {
        // NOTE : 데이터가 존재할 경우 검증 성공 메시지 반환
        return {
            success: true,
            message: "로그인에 성공하였습니다.",
            id: filteredUsers[0].id,
            email: filteredUsers[0].email
        };
    } else {
        // NOTE : 데이터가 없을 경우: 검증 실패 메시지 반환
        return {
            success: false,
            message: "로그인에 실패하였습니다."
        };
    }
}

module.exports = {
    login
  };