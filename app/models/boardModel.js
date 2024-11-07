const path = require('path');
const { formatDate } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기
const { getJsonData, saveJsonData } = require('../utils/utils'); // NOTE : utils.js에서 formatDate 가져오기

const boardFilePath = path.join(__dirname, '../data/boardData.json');
const userFilePath = path.join(__dirname, '../data/userData.json');
const commentFilePath = path.join(__dirname, '../data/commentData.json');

// NOTE : 특정 게시글에 대한 정보
exports.getBoardById = async (boardNo, email) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const board = jsonBoardData.boards.find(board => board.id === boardNo);

    let jsonUserData =  await getJsonData(userFilePath, "users"); 
    jsonUserData.users = jsonUserData.users.filter(user => user.id == board.userNo); 

    if (board) {
        // NOTE : 좋아요 배열에 사용자의 이메일이 있는지 확인하고, isLike 값 설정
        const isLike = board.likes ? board.likes.includes(email) : false;
        return {
            ...board,
            likes: undefined, 
            isLike: isLike,
            profileUrl: jsonUserData.users[0].profile_url,
            nickname: jsonUserData.users[0].nickname
        };
    }

    return null;
};

// NOTE : 게시글 추가하기
exports.addBorad = async ({ title, content, email, imageFile, imageFileName, userNo}) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const reg_dt = formatDate(new Date());
    const maxId = jsonBoardData.boards.reduce((max, board) => Math.max(max, board.id), 0);
    const newPostId = maxId + 1;
    const newPost = {
        id: newPostId,
        title,
        content,
        date: reg_dt,
        email: email,
        userNo: userNo,
        imageFile: imageFile || null, // NOTE : imageFile이 없으면 null로 설정
        imageFileName: imageFileName || null
    };
    jsonBoardData.boards.push(newPost);
    await saveJsonData(boardFilePath, jsonBoardData);
    return newPost;
};

// NOTE: 게시글 목록 가져오기
exports.getBoardList = async (startPage = 1, endPage = 10) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const jsonUserData = await getJsonData(userFilePath, "users");
    const jsonCommentData = await getJsonData(commentFilePath, "comments");

    const startIndex = (startPage - 1) * 10;
    const endIndex = endPage * 10;
    const selectedPosts = jsonBoardData.boards.slice(startIndex, endIndex).map(board => {

        const user = jsonUserData.users.find(user => user.id === board.userNo);
        const comments = jsonCommentData.comments.filter(comment => comment.userNo === board.userNo);

        return {
            boardNo: board.id,
            title: board.title,
            likeCnt: board.likeCnt || 0,
            commentCnt: comments.length,
            viewCnt: board.viewCnt || 0,
            date: board.date || formatDate(new Date()),
            nickname: user ? user.nickname : 'Unknown', // NOTE : 사용자가 있으면 nickname, 없으면 'Unknown'
            profileUrl: user ? user.profile_url : '',
            email: board.email
        };
    });

    return selectedPosts;
};

// NOTE : 게시글 업데이트
exports.editBoard = async (boardNo, updatedData) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);

    if (boardIndex === -1) {
        throw new Error('board not found');
    }

    const board = jsonBoardData.boards[boardIndex];
    // NOTE : 좋아요 배열이 없는 경우 초기화
    if (!board.likes) {
        board.likes = [];
    }

    jsonBoardData.boards[boardIndex] = { 
        ...board
        , ...updatedData
        , imageFile: updatedData.imageFile || board.imageFile
        , imageFileName: updatedData.imageFileName || board.imageFileName
     };
    await saveJsonData(boardFilePath, jsonBoardData);
    return jsonBoardData.boards[boardIndex];
};

// NOTE : 게시글 삭제
exports.deleteBoard = async (boardNo) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const jsonCommentData = await getJsonData(commentFilePath, "comments");

    // NOTE : 삭제할 게시글을 찾기
    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);
    
    if (boardIndex !== -1) {
        // NOTE : 게시글 삭제
        jsonBoardData.boards.splice(boardIndex, 1); 
        await saveJsonData(boardFilePath, jsonBoardData);

        // NOTE : 해당 게시글과 관련된 댓글 삭제
        jsonCommentData.comments = jsonCommentData.comments.filter(comment => comment.boardNo !== boardNo);
        await saveJsonData(commentFilePath, jsonCommentData);
        
        return true;
    }
    return false; // 해당 게시글이 없을 경우
};

// NOTE : 조회수 증가하기
exports.addViewCount = async (boardNo) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 

    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);

    if (boardIndex !== -1) {
        jsonBoardData.boards[boardIndex].viewCnt = (jsonBoardData.boards[boardIndex].viewCnt || 0) + 1;
        await saveJsonData(boardFilePath, jsonBoardData);
        return jsonBoardData.boards[boardIndex];
    }
    return null; // NOTE : 게시글이 없을 경우 null 반환
};

// NOTE : 좋아요 누르기
exports.likeBoard = async (boardNo, email) => {
    const jsonBoardData = await getJsonData(boardFilePath, "boards"); 
    const boardIndex = jsonBoardData.boards.findIndex(board => board.id === boardNo);

    if (boardIndex !== -1) {
        const board = jsonBoardData.boards[boardIndex];
        
        // NOTE : 좋아요 누른 사용자 확인 (중복 방지)
        if (!board.likes) board.likes = []; // lNOTE : ikes 필드가 없으면 배열 초기화
        
        if (board.likes.includes(email)) {
            board.likes = board.likes.filter(email => email !== email);
            board.likeCnt = (board.likeCnt || 1) - 1;
        } else {
            // NOTE : 좋아요 추가
            board.likes.push(email);
            board.likeCnt = (board.likeCnt || 0) + 1;
        }

        await saveJsonData(boardFilePath, jsonBoardData);
        return { likeCnt: board.likeCnt };
    }
    return null; // NOTE : 게시글이 없을 경우 null 반환
};