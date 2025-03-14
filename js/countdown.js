// 倒计时目标时间（UTC+8）
const TARGET_DATE = new Date('2025-03-15T00:00:00+08:00');

// 本地时间与服务器时间的差值（毫秒）
let timeOffset = 0;

// 获取准确的世界时间
async function getWorldTime() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Shanghai');
        const data = await response.json();
        const serverTime = new Date(data.datetime);
        // 计算本地时间与服务器时间的差值
        timeOffset = serverTime.getTime() - Date.now();
        return serverTime;
    } catch (error) {
        console.warn('无法获取世界时间，使用本地时间', error);
        timeOffset = 0;
        return new Date();
    }
}

// 获取当前准确时间
function getCurrentTime() {
    return new Date(Date.now() + timeOffset);
}

// 更新倒计时显示
function updateCountdown() {
    const now = getCurrentTime();
    const timeLeft = TARGET_DATE - now;
    
    // 如果已经过了目标时间
    if (timeLeft < 0) {
        document.querySelector('.countdown-title').textContent = '报名已开始';
        document.querySelector('.countdown-timer').innerHTML = `
            <div class="countdown-item">
                <span class="countdown-number">00</span>
                <span class="countdown-label">天</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">00</span>
                <span class="countdown-label">时</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">00</span>
                <span class="countdown-label">分</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">00</span>
                <span class="countdown-label">秒</span>
            </div>
        `;
        
        // 更新状态显示
        document.querySelector('.status').innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--success);"></i>
            当前状态：报名进行中
        `;
        
        // 激活报名按钮
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.classList.add('active');
        }
        
        return;
    }

    // 计算剩余时间
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // 更新显示
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// 初始化倒计时
async function initCountdown() {
    const countdownTimer = document.querySelector('.countdown-timer');
    
    try {
        // 获取世界时间（只在初始化时获取一次）
        await getWorldTime();
        
        // 移除加载状态
        countdownTimer.classList.remove('loading');
        
        // 首次更新倒计时
        updateCountdown();
        
        // 设置定时器，每秒更新一次
        setInterval(updateCountdown, 1000);
        
        // 每10分钟同步一次时间，防止长时间误差
        setInterval(async () => {
            await getWorldTime();
        }, 10 * 60 * 1000);
        
    } catch (error) {
        console.error('初始化倒计时失败', error);
        countdownTimer.innerHTML = `
            <div style="color: var(--warning);">
                <i class="fas fa-exclamation-triangle"></i>
                加载失败，请刷新页面重试
            </div>
        `;
    }
}

// 页面加载完成后初始化倒计时
document.addEventListener('DOMContentLoaded', initCountdown); 