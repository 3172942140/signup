// 显示规则确认对话框
function showRulesDialog() {
    document.querySelector('.rules-overlay').style.display = 'block';
    document.querySelector('.rules-dialog').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 隐藏规则确认对话框
function hideRulesDialog() {
    document.querySelector('.rules-overlay').style.display = 'none';
    document.querySelector('.rules-dialog').style.display = 'none';
    document.body.style.overflow = ''; // 恢复背景滚动
}

// 处理规则接受
function handleAcceptRules() {
    hideRulesDialog();
    window.location.href = 'register.html';
}

// 处理规则拒绝
function handleDeclineRules() {
    hideRulesDialog();
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 获取所有报名按钮
    const registerButtons = document.querySelectorAll('[data-action="register"]');
    
    // 为每个报名按钮添加点击事件
    registerButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            showRulesDialog();
        });
    });

    // 绑定规则对话框按钮事件
    document.querySelector('.rules-accept').addEventListener('click', handleAcceptRules);
    document.querySelector('.rules-decline').addEventListener('click', handleDeclineRules);
    
    // 点击遮罩层关闭对话框
    document.querySelector('.rules-overlay').addEventListener('click', hideRulesDialog);
}); 