// API基础URL
const API_BASE_URL = 'https://signapi.zzulics.fun/api';

// API请求函数
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`发起API请求: ${method} ${url}`);
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
        console.log('请求数据:', data);
    }

    try {
        console.log('开始发送请求...');
        const response = await fetch(url, options);
        console.log('收到响应:', response.status, response.statusText);
        
        const result = await response.json();
        console.log('响应数据:', result);

        if (!response.ok) {
            throw new Error(result.error || `HTTP错误: ${response.status} ${response.statusText}`);
        }

        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('无法连接到服务器，请检查网络连接或稍后重试');
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