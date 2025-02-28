// 表单验证函数
function validateForm(formData) {
    const errors = [];

    // 验证战队信息
    if (!formData.team_name) errors.push('请输入战队名称');
    if (!formData.contact_qq) errors.push('请输入联系人QQ');
    if (!formData.contact_email) errors.push('请输入联系人邮箱');
    if (!formData.contact_phone) errors.push('请输入联系电话');

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

    if (formData.players.length === 6 && formData.players[5].role !== 'substitute') {
        errors.push('第6名队员必须是替补队员');
    }

    return errors;
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        const div = document.createElement('div');
        div.id = 'error-message';
        div.style.backgroundColor = 'rgba(255, 70, 85, 0.2)';
        div.style.border = '2px solid var(--primary)';
        div.style.padding = '1rem';
        div.style.marginBottom = '1rem';
        div.style.borderRadius = '4px';
        div.style.color = 'var(--primary)';
        document.querySelector('.form-container').prepend(div);
    }
    errorDiv.textContent = message;
    errorDiv.scrollIntoView({ behavior: 'smooth' });
}

// 显示成功信息
function showSuccess(message) {
    const successDiv = document.querySelector('.success-message');
    successDiv.style.display = 'block';
    successDiv.innerHTML = `
        <h3>报名成功！</h3>
        <p>${message}</p>
    `;
    successDiv.scrollIntoView({ behavior: 'smooth' });
}

// 处理表单提交
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';

    try {
        // 收集战队基本信息
        const teamData = {
            team_name: form.querySelector('[name="team_name"]').value,
            contact_qq: form.querySelector('[name="contact_qq"]').value,
            contact_email: form.querySelector('[name="contact_email"]').value,
            contact_phone: form.querySelector('[name="contact_phone"]').value,
            players: []
        };

        // 收集队员信息
        const playerCards = form.querySelectorAll('.player-card');
        playerCards.forEach(card => {
            const player = {
                player_name: card.querySelector('[name="player_name"]').value,
                student_id: card.querySelector('[name="student_id"]').value,
                game_id: card.querySelector('[name="game_id"]').value,
                rank: card.querySelector('[name="rank"]').value,
                role: card.querySelector('[name="player_role"]').value
            };
            teamData.players.push(player);
        });

        // 表单验证
        const errors = validateForm(teamData);
        if (errors.length > 0) {
            showError(errors.join('\n'));
            return;
        }

        // 提交数据
        const result = await registerTeam(teamData);
        
        // 显示成功信息
        showSuccess(`
            你已报名成功！<br>
            我们会在7个工作日内将审核结果发送到你的邮箱中。<br>
            请注意查收邮件。
        `);

        // 清空表单
        form.reset();
        
        // 隐藏错误信息（如果有）
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }

        // 清空队员容器并添加5个基础队员
        const playersContainer = document.getElementById('players-container');
        playersContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            addPlayerCard();
        }
        
        // 更新按钮状态
        const actionButton = document.getElementById('add-player-btn');
        actionButton.innerHTML = '<i class="fas fa-plus"></i> 添加替补队员';
        actionButton.style.background = 'var(--accent)';

    } catch (error) {
        showError(error.message || '提交失败，请稍后重试');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '提交报名';
    }
}

// 添加队员卡片
function addPlayerCard() {
    const playerContainer = document.getElementById('players-container');
    const playerCount = playerContainer.children.length;
    
    if (playerCount >= 6) {
        showError('最多只能添加6名队员（包括1名替补）');
        return;
    }

    const playerCard = document.createElement('div');
    playerCard.className = 'player-card pixel-corners';
    
    // 根据位置确定角色
    let roleTitle = '';
    let roleValue = '';
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

    playerCard.innerHTML = `
        <div class="player-title">
            <i class="fas fa-user"></i>
            ${roleTitle} ${playerCount + 1}
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="player_name_${playerCount}">姓名</label>
                <input type="text" id="player_name_${playerCount}" name="player_name" required>
            </div>
            <div class="form-group">
                <label for="student_id_${playerCount}">学号</label>
                <input type="text" id="student_id_${playerCount}" name="student_id" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="game_id_${playerCount}">游戏ID</label>
                <input type="text" id="game_id_${playerCount}" name="game_id" required>
            </div>
            <div class="form-group">
                <label for="rank_${playerCount}">游戏段位</label>
                <select id="rank_${playerCount}" name="rank" required style="width: 100%; padding: 0.8rem; background: var(--secondary-light); border: 1px solid var(--accent); color: var(--text);">
                    <option value="D">D</option>
                    <option value="D+">D+</option>
                    <option value="C">C</option>
                    <option value="C+">C+</option>
                    <option value="B">B</option>
                    <option value="B+">B+</option>
                    <option value="A">A</option>
                    <option value="A+">A+</option>
                    <option value="S">S</option>
                    <option value="S10">S10</option>
                    <option value="S20">S20</option>
                    <option value="S50">S50</option>
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

    playerContainer.appendChild(playerCard);
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 自动添加5个必需的队员卡片
    for (let i = 0; i < 5; i++) {
        addPlayerCard();
    }

    const actionButton = document.getElementById('add-player-btn');
    
    // 更新按钮状态
    function updateButton() {
        const playerCount = document.getElementById('players-container').children.length;
        if (playerCount === 6) {
            actionButton.innerHTML = '<i class="fas fa-minus"></i> 移除替补队员';
            actionButton.style.background = 'var(--primary)';
        } else {
            actionButton.innerHTML = '<i class="fas fa-plus"></i> 添加替补队员';
            actionButton.style.background = 'var(--accent)';
        }
    }

    // 移除替补队员
    function removeSubstitute() {
        const playerContainer = document.getElementById('players-container');
        if (playerContainer.children.length === 6) {
            playerContainer.removeChild(playerContainer.lastElementChild);
            updateButton();
        }
    }
    
    // 绑定表单提交事件
    document.getElementById('registration-form').addEventListener('submit', handleSubmit);

    // 绑定按钮事件（添加/移除替补队员）
    actionButton.addEventListener('click', () => {
        const playerCount = document.getElementById('players-container').children.length;
        if (playerCount === 6) {
            removeSubstitute();
        } else {
            addPlayerCard();
            updateButton();
        }
    });

    // 初始化按钮状态
    updateButton();
}); 