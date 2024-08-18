const express = require('express');
const router = express.Router();
const template = require('./template.js');
const db = require('./db');
const bcrypt = require('bcrypt');

// 로그인 페이지 라우팅
router.get('/login', (req, res) => {
    const title = '로그인';
    const html = template.HTML(title, `
        <form id="loginForm">
            <p><input class="login" type="text" name="username" placeholder="아이디"></p>
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
                        } else {
                            alert('로그인 실패: ' + response.error);
                        }
                    },
                    error: function(xhr, status, error) {
                        alert('오류: ' + xhr.responseJSON.error);
                    }
                });
            });
        });
        </script>
    `, '');
    res.send(html);
});

// 로그인 처리 라우팅
router.post('/login_process', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.pwd;

        console.log('로그인 시도:', { username, password });

        if (!username || !password) {
            return res.status(400).json({ error: '아이디와 비밀번호를 입력해 주세요.' });
        }

        const user = await getUserByUsernameAndPassword(username, password);
        
        if (user) {
            req.session.is_logined = true;
            req.session.nickname = user.nickname;
            req.session.save(err => {
                if (err) {
                    console.error('세션 저장 오류:', err);
                    return res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
                }
                console.log('로그인 성공:', user.nickname);
                res.json({ success: true, redirect: '/public' });
            });
        } else {
            console.log('로그인 실패: 사용자 정보를 찾을 수 없음');
            res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
    } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 사용자 정보를 데이터베이스에서 가져오는 함수
async function getUserByUsernameAndPassword(username, password) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Users WHERE username = ?';
        
        console.log(`Executing query: ${query}`);
        console.log(`With values: username = ${username}`);

        db.query(query, [username], (error, results) => {
            if (error) {
                console.error('DB Query Error:', error);
                reject(error);
            } else if (results.length > 0) {
                const user = results[0];
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        reject(err);
                    } else if (isMatch) {
                        resolve(user);
                    } else {
                        resolve(null);
                    }
                });
            } else {
                resolve(null);
            }
        });
    });
}

module.exports = router;
