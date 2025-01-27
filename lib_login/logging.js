// lib_login/logging.js
const { queryDatabase } = require('./db');

// 사용자 활동 로깅
async function logUserActivity(req, res, next) {
    if (!req.session?.is_logined) {
        return next();
    }

    try {
        const sql = `SELECT id, centerID FROM Users WHERE userID = ?`;
        const [user] = await queryDatabase(sql, [req.session.userID]);
        
        if (user) {
            await queryDatabase(
                `INSERT INTO UserActivityLogs 
                (user_id, center_id, action_type, url, ip_address, user_agent, action_detail) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    user.centerID,
                    req.method,
                    req.originalUrl,
                    req.ip,
                    req.headers['user-agent'],
                    `${req.method} ${req.originalUrl}`
                ]
            );
        }
    } catch (error) {
        console.error('Activity logging error:', error);
    }
    next();
}

// 메뉴 접근 로깅
let menuAccessStartTimes = new Map();

function logMenuAccess(req, res, next) {
    if (!req.session?.is_logined) {
        return next();
    }

    const startTime = new Date();
    const url = req.originalUrl;
    menuAccessStartTimes.set(`${req.session.userID}-${url}`, startTime);

    // 응답이 완료될 때 로그 기록
    res.on('finish', async () => {
        try {
            const sql = `SELECT id, centerID FROM Users WHERE userID = ?`;
            const [user] = await queryDatabase(sql, [req.session.userID]);
            
            if (user) {
                const startTime = menuAccessStartTimes.get(`${req.session.userID}-${url}`);
                const duration = Math.round((new Date() - startTime) / 1000); // 초 단위

                await queryDatabase(
                    `INSERT INTO MenuAccessLogs 
                    (user_id, menu_name, duration, center_id) 
                    VALUES (?, ?, ?, ?)`,
                    [user.id, url.split('/')[1] || 'home', duration, user.centerID]
                );
                
                menuAccessStartTimes.delete(`${req.session.userID}-${url}`);
            }
        } catch (error) {
            console.error('Menu access logging error:', error);
        }
    });

    next();
}

// 학습 활동 로깅
async function logLearningActivity(req, res, next) {
    if (!req.session?.is_logined) {
        return next();
    }

    try {
        const sql = `SELECT id, centerID FROM Users WHERE userID = ?`;
        const [user] = await queryDatabase(sql, [req.session.userID]);
        
        if (user && (req.originalUrl.includes('/scratch') || 
                    req.originalUrl.includes('/entry') || 
                    req.originalUrl.includes('/python'))) {
            
            const contentType = req.originalUrl.split('/')[1];
            await queryDatabase(
                `INSERT INTO LearningLogs 
                (user_id, content_type, content_name, start_time, center_id) 
                VALUES (?, ?, ?, NOW(), ?)`,
                [user.id, contentType, req.originalUrl, user.centerID]
            );
        }
    } catch (error) {
        console.error('Learning activity logging error:', error);
    }
    next();
}

module.exports = {
    logUserActivity,
    logMenuAccess,
    logLearningActivity
};