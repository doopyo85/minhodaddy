const express = require('express');
const router = express.Router();
const template = require('./template.js');
const bcrypt = require('bcrypt');
const db = require('./db');

// 로그인 페이지 라우트
router.get('/login', (request, response) => {
    const title = '로그인';
    const html = template.HTML(title, `
        <h2>로그인</h2>
        <form id="loginForm">
            <p><input class="login" type="text" name="userID" placeholder="아이디"></p>
            <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>
            <p><input class="btn" type="submit" value="로그인"></p>
        </form>
        <p>계정이 없으신가요? <a href="/auth/register">회원가입</a></p>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
        $(document).ready(function() {
            $('#loginForm').on('submit', function(e) {
                e.preventDefault();
                $.ajax({
                    url: '/auth/login_process',
                    method: 'POST',
                    data: $(this).serialize(),
                    success: function(response) {
                        if (response.success) {
                            window.location.href = response.redirect;
                        }
                    },
                    error: function(xhr, status, error) {
                        const response = xhr.responseJSON;
                        if (response && response.error) {
                            alert(response.error);
                        } else {
                            alert("로그인 중 오류가 발생했습니다.");
                        }
                    }
                });
            });
        });
        </script>
    `, '');
    response.send(html);
});

// 회원가입 페이지 라우트
router.get('/register', async (req, res) => {
    const title = '회원가입';
    const html = template.HTML(title, `
        <h2>회원가입</h2>
        <form id="registerForm">
            <p><input class="login" type="text" name="userID" placeholder="아이디" required></p>
            <p><input class="login" type="password" name="password" placeholder="비밀번호" required></p>
            <p><input class="login" type="email" name="email" placeholder="이메일" required></p>
            <p><input class="login" type="text" name="name" placeholder="이름" required></p>
            <p><input class="login" type="tel" name="phone" placeholder="전화번호"></p>
            <p><input class="login" type="date" name="birthdate" placeholder="생년월일"></p>
            <p>
                <select class="login" name="role">
                    <option value="student">학생</option>
                    <option value="teacher">선생님</option>
                    <option value="principal">원장님</option>
                </select>
            </p>
            <p>
                <select class="login" name="centerID" required>
                    <option value="">센터를 선택하세요</option>
                    <!-- 센터 목록은 서버에서 동적으로 추가 -->
                </select>
            </p>
            <p><input class="btn" type="submit" value="가입하기"></p>
        </form>
        <p>이미 계정이 있으신가요? <a href="/auth/login">로그인</a></p>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script>
        $(document).ready(function() {
            $('#registerForm').on('submit', function(e) {
                e.preventDefault();
                $.ajax({
                    url: '/auth/register_process',
                    method: 'POST',
                    data: $(this).serialize(),
                    success: function(response) {
                        if (response.success) {
                            alert(response.message);
                            window.location.href = '/auth/login';
                        }
                    },
                    error: function(xhr, status, error) {
                        const response = xhr.responseJSON;
                        if (response && response.error) {
                            alert(response.error);
                        } else {
                            alert("회원가입 중 오류가 발생했습니다.");
                        }
                    }
                });
            });
        });
        </script>
    `, '');
    res.send(html);
});

// 로그인 처리 라우트
router.post('/login_process', async (req, res) => {
    try {
        const userID = req.body.userID;
        const password = req.body.pwd;

        console.log('로그인 시도:', { userID });

        if (!userID || !password) {
            return res.status(400).json({ error: '아이디와 비밀번호를 입력해 주세요.' });
        }

        const user = await getUserByUserID(userID);
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.is_logined = true;
                req.session.userID = user.userID;
                req.session.save(err => {
                    if (err) {
                        console.error('세션 저장 오류:', err);
                        return res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
                    }
                    console.log('로그인 성공:', user.userID);
                    res.json({ success: true, redirect: '/public' });
                });
            } else {
                console.log('로그인 실패: 비밀번호가 일치하지 않음');
                res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
            }
        } else {
            console.log('로그인 실패: 사용자 정보를 찾을 수 없음');
            res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
    } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 회원가입 처리 라우트
router.post('/register_process', async (req, res) => {
    try {
        const { userID, password, email, name, phone, birthdate, role, centerID } = req.body;

        if (!userID || !password || !email || !name || !centerID) {
            return res.status(400).json({ error: '필수 필드를 모두 입력해주세요.' });
        }

        const existingUser = await getUserByUserID(userID);
        if (existingUser) {
            return res.status(400).json({ error: '이미 존재하는 ID입니다. 다른 ID를 입력하세요.' });
        }

        await createUser(userID, password, email, name, phone, birthdate, role, centerID);

        res.json({ 
            success: true, 
            message: '회원가입이 완료되었습니다. 가입한 ID로 로그인 하세요.' 
        });
    } catch (error) {
        console.error('회원가입 처리 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류', details: error.message });
    }
});

// 사용자 ID로 사용자 가져오기
async function getUserByUserID(userID) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE userID = ?', [userID], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0 ? results[0] : null);
            }
        });
    });
}

// 사용자 생성 함수
async function createUser(userID, password, email, name, phone, birthdate, role, centerID) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return reject(err);
            }

            const query = 'INSERT INTO Users (userID, password, email, name, phone, birthdate, role, centerID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [userID, hashedPassword, email, name, phone, birthdate, role, centerID];

            db.query(query, values, (error, results) => {
                if (error) {
                    return reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    });
}

module.exports = router;