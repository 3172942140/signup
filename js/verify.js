// 显示验证对话框
function showVerifyDialog() {
    document.querySelector('.verify-overlay').style.display = 'block';
    document.querySelector('.verify-dialog').style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 隐藏验证对话框
function hideVerifyDialog() {
    document.querySelector('.verify-overlay').style.display = 'none';
    document.querySelector('.verify-dialog').style.display = 'none';
    document.body.style.overflow = ''; // 恢复背景滚动
}

// 显示二维码
function showQRCode() {
    document.querySelector('.verify-form').style.display = 'none';
    document.querySelector('.verify-tip').style.display = 'none';
    document.querySelector('.qrcode-container').style.display = 'block';
}

// 验证手机号
async function verifyPhone() {
    const phoneInput = document.getElementById('verify-phone');
    const phone = phoneInput.value.trim();
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        alert('请输入正确的手机号格式');
        return;
    }

    try {
        // 获取所有战队信息
        const teams = await getAllTeams();
        
        // 查找是否有匹配的手机号
        const matchedTeam = teams.find(team => team.contact_phone === phone);

        if (matchedTeam) {
            // 如果找到匹配的手机号，显示二维码
            showQRCode();
        } else {
            alert('未找到该手机号关联的报名信息，请确认是否使用报名时填写的手机号');
        }
    } catch (error) {
        console.error('验证失败:', error);
        alert('验证失败，请稍后重试');
    }
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 点击遮罩层关闭对话框
    document.querySelector('.verify-overlay').addEventListener('click', hideVerifyDialog);
    
    // 阻止点击对话框本身时关闭
    document.querySelector('.verify-dialog').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 手机号输入框回车触发验证
    document.getElementById('verify-phone').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyPhone();
        }
    });
}); 