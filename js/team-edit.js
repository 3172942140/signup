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

    return errors;
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
        const tokenData = JSON.parse(atob(token));
        const teamId = tokenData.teamId;

        // 验证令牌
        const verifyResult = await fetch(`${API_BASE_URL}/teams/${teamId}/verify-token?token=${token}`);
        const verifyData = await verifyResult.json();

        if (!verifyData.isValid) {
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

        // 存储teamId和token供提交时使用
        document.getElementById('edit-form').dataset.teamId = teamId;
        document.getElementById('edit-form').dataset.token = token;

    } catch (error) {
        console.error('加载战队信息失败:', error);
        showError('加载战队信息失败，请刷新页面重试');
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
        const teamId = form.dataset.teamId;
        const token = form.dataset.token;

        if (!teamId || !token) {
            throw new Error('无效的修改链接');
        }

        // 收集表单数据
        const formData = {
            team_name: form.querySelector('[name="team_name"]').value,
            contact_qq: form.querySelector('[name="contact_qq"]').value,
            contact_email: form.querySelector('[name="contact_email"]').value,
            contact_phone: form.querySelector('[name="contact_phone"]').value
        };

        // 表单验证
        const errors = validateForm(formData);
        if (errors.length > 0) {
            showError(errors.join('\n'));
            return;
        }

        // 发送更新请求
        const response = await fetch(`${API_BASE_URL}/teams/${teamId}?token=${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '更新失败');
        }

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
}); 