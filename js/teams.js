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
    // 加上8小时
    date.setHours(date.getHours() + 8);
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

// 掩码手机号中间四位
function maskPhoneNumber(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
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
                        <span>电话：${maskPhoneNumber(team.contact_phone)}</span>
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
    console.log('=== 开始加载战队列表 ===');
    const teamsContent = document.getElementById('teams-content');
    console.log('获取到teams-content元素:', teamsContent);
    
    // 显示加载状态
    teamsContent.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>正在加载队伍信息...</p>
            <small style="color: var(--text-secondary);">首次加载可能需要几秒钟</small>
        </div>
    `;
    
    try {
        console.log('准备调用 getAllTeams API...');
        const teams = await getAllTeams();
        console.log('API返回的原始数据:', teams);
        
        if (!teams || !Array.isArray(teams)) {
            console.error('API返回的数据格式不正确:', teams);
            teamsContent.innerHTML = showError(`
                数据格式不正确。<br>
                <small style="color: var(--text-secondary);">返回数据类型: ${typeof teams}</small><br>
                <small style="color: var(--text-secondary);">数据内容: ${JSON.stringify(teams)}</small><br>
                <a href="javascript:retryLoad()" class="nav-button pixel-corners" style="margin-top: 1rem; display: inline-block;">
                    <i class="fas fa-sync"></i> 重新加载
                </a>
            `);
            return;
        }

        if (teams.length === 0) {
            console.log('没有找到任何战队数据');
            teamsContent.innerHTML = `
                <div class="no-teams pixel-corners">
                    <h3><i class="fas fa-info-circle"></i> 暂无战队</h3>
                    <p>还没有战队报名，快来成为第一个报名的战队吧！</p>
                    <a href="index.html" class="nav-button pixel-corners" style="margin-top: 1rem; display: inline-block;">
                        <i class="fas fa-user-plus"></i> 立即报名
                    </a>
                </div>
            `;
            return;
        }

        console.log(`准备渲染 ${teams.length} 个战队卡片`);
        // 根据队伍数量添加不同的布局类
        const layoutClass = teams.length <= 3 ? 'few-teams' : '';
        console.log(`使用布局类: ${layoutClass}`);

        const cardsHtml = teams.map((team, index) => {
            console.log(`正在处理第 ${index + 1} 个战队:`, team);
            return createTeamCard(team);
        }).join('');

        console.log('生成的HTML长度:', cardsHtml.length);
        teamsContent.innerHTML = `
            <div class="teams-container ${layoutClass}">
                ${cardsHtml}
            </div>
        `;
        console.log('HTML已更新到页面');

    } catch (error) {
        console.error('加载战队列表失败:', error);
        console.error('错误堆栈:', error.stack);
        // 显示更详细的错误信息
        teamsContent.innerHTML = showError(`
            加载战队列表失败，请稍后重试<br>
            <small style="color: var(--text-secondary);">错误详情: ${error.message}</small><br>
            <small style="color: var(--text-secondary);">错误类型: ${error.name}</small><br>
            <a href="javascript:retryLoad()" class="nav-button pixel-corners" style="margin-top: 1rem; display: inline-block;">
                <i class="fas fa-sync"></i> 重新加载
            </a>
        `);
    }
}

// 重试加载函数
async function retryLoad() {
    const teamsContent = document.getElementById('teams-content');
    teamsContent.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>正在重新加载...</p>
        </div>
    `;
    await loadTeams();
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

// 立即执行的初始化函数
(function initializePage() {
    // 标记这是生产环境代码，不应被优化掉
    const PRODUCTION = true;
    
    // 获取当前路径
    const path = window.location.pathname;
    console.log('[PRODUCTION] 当前页面路径:', path);
    
    // 检查是否在teams页面
    const isTeamsPage = path === '/teams' || 
                       path === '/teams/' || 
                       path === '/teams.html' || 
                       path.endsWith('/teams') || 
                       path.endsWith('/teams/') ||
                       path.endsWith('/teams.html');
                       
    // 检查是否在team-detail页面
    const isDetailPage = path === '/team-detail' || 
                        path === '/team-detail/' || 
                        path === '/team-detail.html' || 
                        path.endsWith('/team-detail') || 
                        path.endsWith('/team-detail/') ||
                        path.endsWith('/team-detail.html');
    
    // 强制执行的函数
    function forceExecute(fn) {
        // 添加一个随机参数以防止缓存
        const timestamp = Date.now();
        if (PRODUCTION) {
            console.log(`[PRODUCTION] 强制执行函数 (${timestamp})`);
            return fn();
        }
        return fn();
    }
    
    // 初始化页面
    function initPage() {
        console.log('[PRODUCTION] 页面类型:', {
            isTeamsPage,
            isDetailPage,
            path
        });
        
        // 根据页面类型加载相应内容
        if (isTeamsPage) {
            console.log('[PRODUCTION] 加载战队列表页面');
            forceExecute(() => loadTeams().catch(error => {
                console.error('[PRODUCTION] 页面加载失败:', error);
                const teamsContent = document.getElementById('teams-content');
                if (teamsContent) {
                    teamsContent.innerHTML = showError(`
                        加载失败，请刷新重试<br>
                        <small style="color: var(--text-secondary);">错误信息: ${error.message}</small>
                    `);
                }
            }));
        } else if (isDetailPage) {
            console.log('[PRODUCTION] 加载战队详情页面');
            forceExecute(() => loadTeamDetail().catch(error => {
                console.error('[PRODUCTION] 页面加载失败:', error);
                const teamContent = document.getElementById('team-content');
                if (teamContent) {
                    teamContent.innerHTML = showError(`
                        加载失败，请刷新重试<br>
                        <small style="color: var(--text-secondary);">错误信息: ${error.message}</small>
                    `);
                }
            }));
        } else {
            console.log('[PRODUCTION] 未知页面类型:', path);
            // 如果在页面上找到相关容器，也尝试加载内容
            if (document.getElementById('teams-content')) {
                console.log('[PRODUCTION] 找到teams-content元素，尝试加载战队列表');
                forceExecute(() => loadTeams().catch(error => {
                    console.error('[PRODUCTION] 页面加载失败:', error);
                }));
            } else if (document.getElementById('team-content')) {
                console.log('[PRODUCTION] 找到team-content元素，尝试加载战队详情');
                forceExecute(() => loadTeamDetail().catch(error => {
                    console.error('[PRODUCTION] 页面加载失败:', error);
                }));
            }
        }
    }

    // 确保 DOM 加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => forceExecute(initPage));
    } else {
        forceExecute(initPage);
    }
})();