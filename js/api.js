// API基础URL
const API_BASE_URL = 'https://signapi.zzulics.fun/api';

// 重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// API请求函数
async function apiRequest(endpoint, method = 'GET', data = null, retryCount = 0) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] 发起请求: ${method} ${url} (第${retryCount + 1}次尝试)`);
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',  // 明确指定CORS模式
        credentials: 'omit' // 不发送cookies
    };

    if (data) {
        options.body = JSON.stringify(data);
        console.log('[API] 请求数据:', data);
    }

    try {
        console.log('[API] 开始fetch请求...');
        const response = await fetch(url, options);
        console.log('[API] 收到响应:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        // 检查响应类型
        const contentType = response.headers.get('content-type');
        console.log('[API] 响应Content-Type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`非JSON响应: ${contentType}`);
        }

        const result = await response.json();
        console.log('[API] 解析的响应数据:', result);

        if (!response.ok) {
            throw new Error(result.error || `HTTP错误: ${response.status} ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('[API] 请求错误:', error);
        console.error('[API] 错误堆栈:', error.stack);
        
        // 如果是网络错误且还有重试次数，则重试
        if (retryCount < MAX_RETRIES && 
            (error instanceof TypeError || error.message.includes('Failed to fetch'))) {
            console.log(`[API] 将在 ${RETRY_DELAY}ms 后进行第 ${retryCount + 2} 次重试`);
            await delay(RETRY_DELAY);
            return apiRequest(endpoint, method, data, retryCount + 1);
        }
        
        if (error instanceof TypeError) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error(`无法连接到服务器 (${API_BASE_URL})，请检查网络连接或稍后重试`);
            }
            throw new Error(`网络错误: ${error.message}`);
        }
        throw error;
    }
}

// 注册战队
async function registerTeam(teamData) {
    return apiRequest('/register', 'POST', teamData);
}

// 获取所有战队
async function getAllTeams() {
    return apiRequest('/teams');
}

// 更新战队状态
async function updateTeamStatus(teamId, status, reject_reason = '') {
    return apiRequest(`/teams/${teamId}/status`, 'PUT', { status, reject_reason });
}

// 删除战队
async function deleteTeam(teamId) {
    return apiRequest(`/teams/${teamId}`, 'DELETE');
}

// 生成修改链接
async function generateEditLink(teamId) {
    try {
        const response = await apiRequest(`/teams/${teamId}/edit-token`, 'POST');
        if (response.success && response.token) {
            // 返回完整的响应，包含token和editUrl
            return response;
        }
        throw new Error(response.error || '生成修改链接失败');
    } catch (error) {
        console.error('生成修改链接失败:', error);
        throw error;
    }
}

// 更新战队信息
async function updateTeam(teamId, token, updateData) {
    try {
        // 确保token已经正确编码
        const encodedToken = encodeURIComponent(token);
        return await apiRequest(`/teams/${teamId}?token=${encodedToken}`, 'PUT', updateData);
    } catch (error) {
        console.error('更新战队信息失败:', error);
        throw error;
    }
}

// 验证修改令牌
async function verifyEditToken(teamId, token) {
    try {
        // 确保token已经正确编码
        const encodedToken = encodeURIComponent(token);
        return await apiRequest(`/teams/${teamId}/verify-token?token=${encodedToken}`, 'GET');
    } catch (error) {
        console.error('验证修改令牌失败:', error);
        throw error;
    }
} 