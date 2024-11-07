const fs = require('fs').promises;
const path = require('path');
const commentFilePath = path.join(__dirname, '../data/commentData.json');
const boardFilePath = path.join(__dirname, '../data/boardData.json');
const userFilePath = path.join(__dirname, '../data/userData.json');
const { formatDate } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
const { getJsonData, saveJsonData } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기

// NOTE : JSON 파일에서 데이터 불러오기
// const getJsonCommentData = async () => {
//     let jsonData;

//     try {
//         // NOTE : 파일 읽기 시도
//         const data = await fs.readFile(commentFilePath, 'utf-8');
//         jsonData = JSON.parse(data);
//     } catch (error) {
//         // NOTE : 파일이 없거나 JSON 파싱 오류 시 초기화
//         console.error("파일을 읽거나 JSON을 파싱하는 중 오류가 발생했습니다:", error);
//         jsonData = { comments: [] }; // NOTE : 기본 구조 생성
//     }

//     if (!jsonData.comments) {
//         jsonData.comments = [];
//     }
//     return jsonData;
// };

// NOTE : JSON 파일에 데이터 저장하기
// const saveJsonCommentData = async (data) => {
//     try {
//         await fs.writeFile(commentFilePath, JSON.stringify(data, null, 2));
//     } catch (error) {
//         console.error("Error saving JSON data:", error);
//     }
// };


// NOTE : 댓글 추가하기
exports.addComment = async ({ boardNo, content, email, userId}) => {
    const jsonCommentData = await getJsonData(commentFilePath, "comments");
    const jsonUserData = await getJsonData(userFilePath, "users");
    
    const maxId = jsonCommentData.comments.reduce((max, comment) => Math.max(max, comment.id), 0);
    const newCommentId = maxId + 1;
    const commentCnt = jsonCommentData.comments.filter(comment => comment.boardNo === boardNo);
    const newComment = {
        id: newCommentId,
        boardNo,
        content,
        email,
        userNo: userId,
        commentCnt: commentCnt.length + 1,
        date: formatDate(new Date()),
    };

    jsonCommentData.comments.push(newComment);
    await saveJsonData(commentFilePath, jsonCommentData);

    const user = jsonUserData.users.find(user => user.id === userId);

    return {
        ...newComment,
        profileFile: user ? user.profile_url : null // 사용자가 없을 경우 null 처리
    };
};

// NOTE : 특정 게시글의 댓글 가져오기
exports.getCommentsByBoardNo = async (boardNo) => {
    const jsonCommentData = await getJsonData(commentFilePath, "comments");
    const jsonUserData = await getJsonData(userFilePath, "users");

    // NOTE : 해당 게시글의 댓글 필터링 및 사용자 정보 추가
    const commentsWithProfile = jsonCommentData.comments
        .filter(comment => comment.boardNo === boardNo)
        .map(comment => {
            // NOTE : 댓글의 userNo에 해당하는 사용자 찾기
            const user = jsonUserData.users.find(user => user.id === comment.userNo);
            // NOTE : profileFile 값 추가
            return {
                ...comment,
                profileFile: user ? user.profile_url : null // 사용자가 없을 경우 null 처리
            };
        });

    return commentsWithProfile;
};

// NOTE : 특정 댓글 삭제하기
exports.deleteComment = async (commentNo) => {
    const jsonData = await getJsonData(commentFilePath, "comments");
    const initialLength = jsonData.comments.length;
    jsonData.comments = jsonData.comments.filter(comment => comment.id !== commentNo);

    if (jsonData.comments.length < initialLength) {
        await saveJsonData(commentFilePath, jsonData);
        return true;
    }
    return false;
};

// NOTE : 특정 댓글 수정하기
exports.updateComment = async (commentNo, newContent) => {
    const jsonData = await getJsonData(commentFilePath, "comments");
    const commentIndex = jsonData.comments.findIndex(comment => comment.id === commentNo);
    if (commentIndex !== -1) {
        jsonData.comments[commentIndex].content = newContent;
        jsonData.comments[commentIndex].date = formatDate(new Date());
        await saveJsonData(commentFilePath, jsonData);
        return true;
    }
    return false;
};