// API基础URL
const API_BASE_URL = 'https://signapi.zzulics.fun/api';

// API请求函数
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '请求失败');
        }

        return result;
    } catch (error) {
        console.error('API请求错误:', error);
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