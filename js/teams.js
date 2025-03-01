// 获取URL参数
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 获取状态显示文本
function getStatusText(status) {
    switch (status) {
        case 'pending': return '审核中';
        case 'approved': return '已通过';
        case 'rejected': return '未通过';
        default: return '未知状态';
    }
}

// 获取状态CSS类名
function getStatusClass(status) {
    switch (status) {
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        default: return '';
    }
}

// 获取角色显示文本
function getRoleText(role) {
    switch (role) {
        case 'leader': return '队长';
        case 'member': return '队员';
        case 'substitute': return '替补';
        default: return '未知';
    }
}

// 获取角色CSS类名
function getRoleClass(role) {
    switch (role) {
        case 'leader': return 'role-leader';
        case 'member': return 'role-member';
        case 'substitute': return 'role-substitute';
        default: return '';
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 解析players字符串
function parsePlayers(playersStr) {
    try {
        if (!playersStr) return [];
        
        // 如果已经是数组，直接返回
        if (Array.isArray(playersStr)) return playersStr;
        
        // 如果是字符串，需要处理
        if (typeof playersStr === 'string') {
            // 检查是否已经是JSON数组格式
            if (playersStr.trim().startsWith('[')) {
                return JSON.parse(playersStr);
            }
            
            // 处理非标准格式：将逗号分隔的对象字符串转换为数组
            const objectsStr = playersStr.split('},{').map((str, index, array) => {
                str = str.trim();
                // 第一个对象，添加右花括号
                if (index === 0) return str + '}';
                // 最后一个对象，添加左花括号
                if (index === array.length - 1) return '{' + str;
                // 中间的对象，添加两边的花括号
                return '{' + str + '}';
            });
            
            // 解析每个对象并返回数组
            return objectsStr.map(str => JSON.parse(str));
        }
        
        return [];
    } catch (error) {
        console.error('解析队员数据失败:', error);
        return [];
    }
}

// 创建战队卡片HTML
function createTeamCard(team) {
    let playerCount = 0;
    try {
        if (team.player_count !== undefined) {
            playerCount = team.player_count;
        } else if (team.players) {
            const players = parsePlayers(team.players);
            playerCount = players.length;
        }
    } catch (error) {
        console.error('解析队员数据失败:', error);
        playerCount = 0;
    }

    return `
        <a href="team-detail.html?id=${team.id}" class="team-card pixel-corners">
            <h3 class="team-name">${team.team_name}</h3>
            <div class="team-info">
                <div class="team-info-item">
                    <i class="fas fa-users"></i>
                    <span>${playerCount}名队员</span>
                </div>
                <div class="team-info-item">
                    <i class="fas fa-calendar"></i>
                    <span>报名时间：${formatDate(team.created_at)}</span>
                </div>
            </div>
            <div class="team-status ${getStatusClass(team.status)}">
                ${getStatusText(team.status)}
            </div>
        </a>
    `;
}

// 创建战队详情HTML
function createTeamDetail(team) {
    const allPlayers = parsePlayers(team.players);
    
    // 按角色排序：队长在前，替补在后，其他队员按原顺序排在中间
    const players = allPlayers.sort((a, b) => {
        if (a.role === 'leader') return -1;
        if (b.role === 'leader') return 1;
        if (a.role === 'substitute') return 1;
        if (b.role === 'substitute') return -1;
        return 0;
    });
    
    return `
        <div class="team-detail-container pixel-corners">
            <a href="teams.html" class="back-button pixel-corners">
                <i class="fas fa-arrow-left"></i> 返回队伍列表
            </a>

            <div class="team-header" style="margin-top: 4rem;">
                <h2 class="team-name-large">${team.team_name}</h2>
                <div class="team-status-badge ${getStatusClass(team.status)}">
                    ${getStatusText(team.status)}
                </div>
            </div>

            <div class="team-info-section">
                <h3 class="section-title">
                    <i class="fas fa-info-circle"></i> 战队信息
                </h3>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fab fa-qq"></i>
                        <span>QQ：${team.contact_qq}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>邮箱：${team.contact_email}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>电话：${team.contact_phone}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-clock"></i>
                        <span>报名时间：${formatDate(team.created_at)}</span>
                    </div>
                </div>
            </div>

            <div class="team-info-section">
                <h3 class="section-title">
                    <i class="fas fa-users"></i> 队员信息
                </h3>
                <div class="players-grid">
                    ${players.map(player => `
                        <div class="player-card">
                            <div class="player-role ${getRoleClass(player.role)}">
                                ${getRoleText(player.role)}
                            </div>
                            <h4 class="player-name">${player.game_id}</h4>
                            <div class="player-info-item">
                                <i class="fas fa-chart-line"></i>
                                <span>段位：${player.rank}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// 显示错误信息
function showError(message) {
    return `
        <div class="error-message pixel-corners">
            <h3><i class="fas fa-exclamation-triangle"></i> 出错了</h3>
            <p>${message}</p>
        </div>
    `;
}

// 加载战队列表
async function loadTeams() {
    const teamsContent = document.getElementById('teams-content');
    
    try {
        const teams = await getAllTeams();
        
        if (!teams || teams.length === 0) {
            teamsContent.innerHTML = `
                <div class="no-teams pixel-corners">
                    <h3><i class="fas fa-info-circle"></i> 暂无战队</h3>
                    <p>还没有战队报名，快来成为第一个报名的战队吧！</p>
                </div>
            `;
            return;
        }

        // 根据队伍数量添加不同的布局类
        const layoutClass = teams.length <= 3 ? 'few-teams' : '';

        teamsContent.innerHTML = `
            <div class="teams-container ${layoutClass}">
                ${teams.map(team => createTeamCard(team)).join('')}
            </div>
        `;
    } catch (error) {
        console.error('加载战队列表失败:', error);
        teamsContent.innerHTML = showError('加载战队列表失败，请稍后重试');
    }
}

// 加载战队详情
async function loadTeamDetail() {
    const teamContent = document.getElementById('team-content');
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('id');

    if (!teamId) {
        teamContent.innerHTML = showError('未指定战队ID');
        return;
    }

    try {
        const teams = await getAllTeams();
        const team = teams.find(t => t.id === parseInt(teamId));
        
        if (!team) {
            teamContent.innerHTML = showError('未找到指定战队');
            return;
        }

        teamContent.innerHTML = createTeamDetail(team);
    } catch (error) {
        console.error('加载战队详情失败:', error);
        teamContent.innerHTML = showError('加载战队详情失败，请稍后重试');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 根据当前页面决定加载哪个功能
    if (window.location.pathname.endsWith('teams.html')) {
        loadTeams();
    } else if (window.location.pathname.endsWith('team-detail.html')) {
        loadTeamDetail();
    }
});