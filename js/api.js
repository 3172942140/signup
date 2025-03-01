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
            'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
    };

    if (data) {
        options.body = JSON.stringify(data);
        console.log('请求数据:', data);
    }

    try {
        console.log('开始发送请求...');
        console.log('请求配置:', options);
        
        const response = await fetch(url, options);
        console.log('收到响应状态:', response.status, response.statusText);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('服务器错误响应:', errorText);
            throw new Error(`HTTP错误: ${response.status} ${response.statusText}\n响应内容: ${errorText}`);
        }

        const result = await response.json();
        console.log('响应数据:', result);
        return result;
        
    } catch (error) {
        console.error('API请求详细错误:', {
            message: error.message,
            stack: error.stack,
            type: error.name
        });
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('无法连接到服务器，请检查网络连接或稍后重试。如果问题持续存在，可能是CORS策略限制或服务器配置问题。');
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

// 获取单个战队详情
async function getTeamDetails(teamId) {
    return apiRequest(`/teams/${teamId}`);
}

// 更新战队状态
async function updateTeamStatus(teamId, status, reject_reason = '') {
    return apiRequest(`/teams/${teamId}/status`, 'PUT', { status, reject_reason });
}

// 删除战队
async function deleteTeam(teamId) {
    return apiRequest(`/teams/${teamId}`, 'DELETE');
}