// 获取URL参数
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}

// 显示成功信息
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.style.display = 'block';
    successDiv.scrollIntoView({ behavior: 'smooth' });
}

// 隐藏所有消息
function hideMessages() {
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
}

// 表单验证
function validateForm(formData) {
    const errors = [];

    // 验证战队名称
    if (!formData.team_name) errors.push('请输入战队名称');

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
        errors.push('请输入有效的邮箱地址');
    }

    // 验证QQ号格式
    const qqRegex = /^[1-9][0-9]{4,10}$/;
    if (!qqRegex.test(formData.contact_qq)) {
        errors.push('请输入有效的QQ号');
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.contact_phone)) {
        errors.push('请输入有效的手机号');
    }

    // 验证队员信息
    if (!formData.players || formData.players.length < 5) {
        errors.push('队伍至少需要5名队员');
        return errors;
    }

    // 检查队员角色分配
    let hasLeader = false;
    let hasSubstitute = false;
    let memberCount = 0;

    formData.players.forEach((player, index) => {
        if (!player.player_name) errors.push(`请输入第${index + 1}名队员的姓名`);
        if (!player.student_id) errors.push(`请输入第${index + 1}名队员的学号`);
        if (!player.game_id) errors.push(`请输入第${index + 1}名队员的游戏ID`);
        if (!player.rank) errors.push(`请选择第${index + 1}名队员的游戏段位`);

        if (player.role === 'leader') hasLeader = true;
        else if (player.role === 'substitute') hasSubstitute = true;
        else if (player.role === 'member') memberCount++;
    });

    if (!hasLeader) {
        errors.push('队伍必须有一名队长');
    }

    if (formData.players.length === 6 && !hasSubstitute) {
        errors.push('6人队伍必须包含1名替补队员');
    }

    return errors;
}

// 添加队员卡片
function addPlayerCard(player = null, index = null) {
    const playerContainer = document.getElementById('players-container');
    const playerCount = index === null ? playerContainer.children.length : index;
    
    if (playerCount >= 6) {
        showError('最多只能添加6名队员（包括1名替补）');
        return;
    }

    const playerCard = document.createElement('div');
    playerCard.className = 'player-card pixel-corners';
    
    // 根据位置确定角色
    let roleTitle = '';
    let roleValue = '';
    if (player) {
        roleTitle = player.role === 'leader' ? '队长' : 
                   player.role === 'substitute' ? '替补' : '队员';
        roleValue = player.role;
    } else {
        if (playerCount === 0) {
            roleTitle = '队长';
            roleValue = 'leader';
        } else if (playerCount === 5) {
            roleTitle = '替补';
            roleValue = 'substitute';
        } else {
            roleTitle = '队员';
            roleValue = 'member';
        }
    }

    playerCard.innerHTML = `
        <div class="player-title">
            <i class="fas fa-user"></i>
            ${roleTitle} ${playerCount + 1}
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="player_name_${playerCount}">姓名</label>
                <input type="text" id="player_name_${playerCount}" name="player_name" value="${player ? player.player_name : ''}" required>
            </div>
            <div class="form-group">
                <label for="student_id_${playerCount}">学号</label>
                <input type="text" id="student_id_${playerCount}" name="student_id" value="${player ? player.student_id : ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="game_id_${playerCount}">游戏ID</label>
                <input type="text" id="game_id_${playerCount}" name="game_id" value="${player ? player.game_id : ''}" required>
            </div>
            <div class="form-group">
                <label for="rank_${playerCount}">游戏段位</label>
                <select id="rank_${playerCount}" name="rank" required style="width: 100%; padding: 0.8rem; background: var(--secondary-light); border: 1px solid var(--accent); color: var(--text);">
                    ${['D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S10', 'S20', 'S50']
                        .map(rank => `<option value="${rank}" ${player && player.rank === rank ? 'selected' : ''}>${rank}</option>`)
                        .join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>角色</label>
                <div class="role-display" style="padding: 0.8rem; background: var(--secondary-light); border: 1px solid var(--accent); color: var(--text);">
                    ${roleTitle}
                </div>
                <input type="hidden" id="player_role_${playerCount}" name="player_role" value="${roleValue}">
            </div>
        </div>
    `;

    if (index === null) {
        playerContainer.appendChild(playerCard);
    } else {
        const existingCard = playerContainer.children[index];
        if (existingCard) {
            playerContainer.replaceChild(playerCard, existingCard);
        } else {
            playerContainer.appendChild(playerCard);
        }
    }
}

// 加载战队信息
async function loadTeamInfo() {
    const token = getUrlParam('token');
    if (!token) {
        showError('无效的访问链接');
        document.getElementById('edit-form').style.display = 'none';
        return;
    }

    try {
        // 从token中解析teamId
        // 1. 先进行URL解码
        const urlDecodedToken = decodeURIComponent(token);
        // 2. 再进行Base64解码
        const base64DecodedStr = atob(urlDecodedToken);
        // 3. 最后解析JSON
        const tokenData = JSON.parse(base64DecodedStr);
        
        console.log('Token解析过程:', {
            originalToken: token,
            urlDecoded: urlDecodedToken,
            base64Decoded: base64DecodedStr,
            parsedData: tokenData
        });

        const teamId = tokenData.teamId;
        if (!teamId) {
            throw new Error('无效的令牌格式');
        }

        // 验证令牌
        const verifyResult = await verifyEditToken(teamId, token);
        if (!verifyResult.isValid) {
            showError('链接已过期或无效，请重新获取修改链接');
            document.getElementById('edit-form').style.display = 'none';
            return;
        }

        // 获取战队信息
        const teams = await getAllTeams();
        const team = teams.find(t => t.id === teamId);

        if (!team) {
            showError('未找到战队信息');
            return;
        }

        // 填充表单
        document.getElementById('team_name').value = team.team_name;
        document.getElementById('contact_qq').value = team.contact_qq;
        document.getElementById('contact_email').value = team.contact_email;
        document.getElementById('contact_phone').value = team.contact_phone;

        // 清空并填充队员信息
        const playersContainer = document.getElementById('players-container');
        playersContainer.innerHTML = '';
        
        try {
            // 尝试解析队员信息
            console.log('原始队员数据:', team.players);
            let players = [];
            
            if (typeof team.players === 'string') {
                // 处理逗号分隔的JSON对象
                try {
                    // 先尝试直接解析（以防后端已修复格式）
                    players = JSON.parse(team.players);
                } catch (e) {
                    // 如果直接解析失败，尝试修复格式
                    const fixedJson = `[${team.players}]`;
                    console.log('修复后的JSON:', fixedJson);
                    players = JSON.parse(fixedJson);
                }
            } else if (Array.isArray(team.players)) {
                players = team.players;
            } else {
                console.error('无效的队员数据格式:', team.players);
                throw new Error('队员数据格式无效');
            }

            console.log('解析后的队员数据:', players);

            // 确保players是数组
            if (!Array.isArray(players)) {
                throw new Error('队员数据不是数组格式');
            }

            // 排序队员信息
            players.sort((a, b) => {
                if (a.role === 'leader') return -1;
                if (b.role === 'leader') return 1;
                if (a.role === 'substitute') return 1;
                if (b.role === 'substitute') return -1;
                return 0;
            });

            // 添加队员卡片
            players.forEach((player, index) => {
                addPlayerCard(player, index);
            });
        } catch (error) {
            console.error('解析队员信息失败:', error);
            console.error('队员数据:', team.players);
            showError('加载队员信息失败：' + error.message);
            return;
        }

        // 更新添加替补按钮状态
        updateAddPlayerButton();

        // 存储teamId和token供提交时使用
        document.getElementById('edit-form').dataset.teamId = teamId;
        document.getElementById('edit-form').dataset.token = token;

    } catch (error) {
        console.error('加载战队信息失败:', error);
        showError('加载战队信息失败，请刷新页面重试');
    }
}

// 更新添加替补按钮状态
function updateAddPlayerButton() {
    const actionButton = document.getElementById('add-player-btn');
    const playerCount = document.getElementById('players-container').children.length;
    
    if (playerCount === 6) {
        actionButton.innerHTML = '<i class="fas fa-minus"></i> 移除替补队员';
        actionButton.style.background = 'var(--primary)';
    } else {
        actionButton.innerHTML = '<i class="fas fa-plus"></i> 添加替补队员';
        actionButton.style.background = 'var(--accent)';
    }
}

// 处理表单提交
async function handleSubmit(event) {
    event.preventDefault();
    hideMessages();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '保存中...';

    try {
        const teamId = parseInt(form.dataset.teamId);
        const token = form.dataset.token;

        if (!teamId || isNaN(teamId) || !token) {
            throw new Error('无效的修改链接');
        }

        // 收集表单数据
        const formData = {
            team_name: form.querySelector('[name="team_name"]').value,
            contact_qq: form.querySelector('[name="contact_qq"]').value,
            contact_email: form.querySelector('[name="contact_email"]').value,
            contact_phone: form.querySelector('[name="contact_phone"]').value,
            players: []
        };

        // 收集队员信息
        const playerCards = form.querySelectorAll('.player-card');
        playerCards.forEach((card, index) => {
            const player = {
                player_name: card.querySelector('[name="player_name"]').value,
                student_id: card.querySelector('[name="student_id"]').value,
                game_id: card.querySelector('[name="game_id"]').value,
                rank: card.querySelector('[name="rank"]').value,
                role: card.querySelector('[name="player_role"]').value
            };
            formData.players.push(player);
        });

        // 表单验证
        const errors = validateForm(formData);
        if (errors.length > 0) {
            showError(errors.join('\n'));
            return;
        }

        console.log('发送更新请求:', {
            teamId,
            token,
            formData
        });

        // 使用updateTeam函数发送更新请求
        const result = await updateTeam(teamId, token, formData);

        showSuccess('战队信息已成功更新');
        
        // 3秒后返回战队列表页面
        setTimeout(() => {
            window.location.href = 'teams.html';
        }, 3000);

    } catch (error) {
        console.error('更新失败:', error);
        showError(error.message || '更新失败，请稍后重试');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '保存修改';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载战队信息
    loadTeamInfo();

    // 绑定表单提交事件
    document.getElementById('edit-form').addEventListener('submit', handleSubmit);

    // 绑定添加/移除替补队员按钮事件
    document.getElementById('add-player-btn').addEventListener('click', () => {
        const playerContainer = document.getElementById('players-container');
        if (playerContainer.children.length === 6) {
            playerContainer.removeChild(playerContainer.lastElementChild);
        } else {
            addPlayerCard();
        }
        updateAddPlayerButton();
    });
}); 