const path = require('path');
const { getJsonData, saveJsonData } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기

/*
// NOTE : 회원가입 처리 함수 -> DB 연결
// const dbPath = path.join(__dirname, '../config/db');
// const db = require(dbPath);
const addUser = async (email, password, nickname, profile_url) => {
    console.log(${email}, ${password}, ${nickname}, ${profile_url});
    const query = INSERT INTO test.users (email, password, nickname, profile_url) VALUES (?, ?, ?, ?);
    const [result] = await db.execute(query, [email, password, nickname, profile_url]);
    return result;
};
*/
const fs = require('fs').promises;
const commentFilePath = path.join(__dirname, '../data/commentData.json');
const boardFilePath = path.join(__dirname, '../data/boardData.json');
const userFilePath = path.join(__dirname, '../data/userData.json');

// NOTE : email, nickname에 따라 조회
exports.getUser = async(key, value) =>{
    const jsonData =  await getJsonData(userFilePath, "users");
    const filteredUsers = jsonData.users.filter(user => user[key] === value);
    if (filteredUsers.length > 0) {
        // NOTE : 데이터가 존재할 경우 검증 실패 메시지 반환
        return {
            success: false,
            message: "검증에 실패하였습니다.",
            id: filteredUsers[0].id,
            nickname: filteredUsers[0].nickname,
            email: filteredUsers[0].email,
            profile_url: filteredUsers[0].profile_url
        };
    } else {
        // NOTE : 데이터가 없을 경우: 검증 성공 메시지 반환
        return {
            success: true,
            message: "검증에 성공하였습니다."
        };
    }

};

exports.addUser = async (email, password, nickname, profile_url) => {
    let jsonData =  await getJsonData(userFilePath, "users"); 
    // NOTE : 사용자 객체 생성
    const newUser = {
        id: jsonData.users.length + 1, // NOTE : 새로운 ID 설정
        email,
        password,
        nickname,
        profile_url
    };

    // NOTE : 새 사용자 추가
    jsonData.users.push(newUser);

    try {
        // NOTE : 파일에 업데이트된 데이터 저장
        await fs.writeFile(userFilePath, JSON.stringify(jsonData, null, 2));
    } catch (error) {
        console.error("Error writing file:", error);
    }
    return newUser;
};
  
exports.updateUser = async (userId, updateData) => {
    const jsonData =  await getJsonData(userFilePath, "users");

    const userIndex = jsonData.users.findIndex(user => user.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    jsonData.users[userIndex] = { ...jsonData.users[userIndex], ...updateData };
    await fs.writeFile(userFilePath, JSON.stringify(jsonData, null, 2));
    return jsonData.users[userIndex];
}

// NOTE : 사용자 정보 삭제 및 관련 정보 삭제
exports.deleteUser = async (userNo, email) => {
    const jsonUserData = await getJsonData(userFilePath, 'users');
    jsonUserData.users = jsonUserData.users.filter(user => user.id !== userNo); 
    await saveJsonData(userFilePath, jsonUserData);
    
    const jsonBoardData = await getJsonData(boardFilePath, 'boards');
    jsonBoardData.boards = jsonBoardData.boards.filter(board => board.userNo !== userNo);
    await saveJsonData(boardFilePath, jsonBoardData);

    const jsonCommentData = await getJsonData(commentFilePath, 'comments');
    jsonCommentData.comments = jsonCommentData.comments.filter(comment => comment.userNo !== userNo); 
    await saveJsonData(commentFilePath, jsonCommentData);
    return true;
};