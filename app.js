// ==================== 配置区域 ====================
// 如果你的Agent部署在某个平台，需要配置对应的API地址
// 示例：
// const AGENT_API_URL = 'https://your-agent-api.com/chat';
// const API_KEY = 'your-api-key';

// ==================== 状态管理 ====================
let currentQuestion = null;
let currentSettings = {
    module: 'all',
    difficulty: 'all',
    type: 'all'
};

// ==================== 工具函数 ====================
function showToast(message) {
    // 简单的提示框
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 9999;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ==================== 标签选择 ====================
function initTagSelectors() {
    // 模块选择
    document.querySelectorAll('.module-selector .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.module-selector .tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentSettings.module = this.dataset.module;
        });
    });

    // 难度选择
    document.querySelectorAll('.difficulty-selector .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.difficulty-selector .tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentSettings.difficulty = this.dataset.difficulty;
        });
    });

    // 类型选择
    document.querySelectorAll('.type-selector .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.type-selector .tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentSettings.type = this.dataset.type;
        });
    });
}

// ==================== 题目相关函数 ====================
function showQuickQuestion() {
    generateQuestionPrompt();
}

function generateQuestionPrompt() {
    // 构建题目请求
    let prompt = '请随机出一道';
    
    if (currentSettings.module !== 'all') {
        prompt += `${currentSettings.module}相关的`;
    }
    
    if (currentSettings.type !== 'all') {
        prompt += currentSettings.type === 'choice' ? '选择题' : '问答题';
    } else {
        prompt += '题目';
    }
    
    if (currentSettings.difficulty !== 'all') {
        const diffMap = { easy: '简单', medium: '中等', hard: '困难' };
        prompt += `，${diffMap[currentSettings.difficulty]}难度`;
    }
    
    prompt += '。';
    
    // 调用Agent获取题目
    callAgent(prompt, handleQuestionResponse);
}

function generateCustomQuestion() {
    const customPrompt = document.getElementById('customPrompt').value.trim();
    if (!customPrompt) {
        showToast('请输入题目要求');
        return;
    }
    
    callAgent(customPrompt, handleQuestionResponse);
}

// ==================== Agent调用 ====================
function callAgent(message, callback) {
    // 这里需要根据你的Agent部署方式来实现
    // 方式1：如果Agent在Coze上，使用Coze的API
    // 方式2：如果有自己的HTTP API，直接调用
    
    // 模拟调用（实际使用时替换为真实的API调用）
    showToast('正在获取题目...');
    
    // 示例：使用fetch调用API（需要替换为实际的API地址）
    const AGENT_API_URL = 'https://b9t6wd8hz9.coze.site/stream_run';
    const API_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjMxOThhOThiLTZiNzEtNGNiZC04Mjc2LWIyMzJlZGYyZDY2NyJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIkc4RnVXdkMzT0tFelFvdGs4amdXYkl2RXhsZFhNSXdDIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzY3ODQxNTEzLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NTkyNzk2OTc1MzQzMzM3NTE1Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NTkyODIxNDgzNTkyNzQ1MDAyIn0.ExaVg4laFQTmR69IHapvAoVVmH_9u6UgIHunGF6RywL8xSZa-LIfaWEDf83PZUSl0pvi3leLDYh32zJgBDxMAAymR6M44kB6p6f0q-lPk5xlfNwWIaJRrWUUfh3-tI4lkFf35oeeyRKgZoVzzuekU8w3fpYTrX5YmVyuQzYEPjgGTZ1UYwy15T1sPuyFs_zSXgHiNUggBu6XCoymaqiIBAZ0wn9nA_NkKBenQ227W_rAWZpJuZycvq9dT_Nz2F_Z1v5YIqQ7aRTdBFyB20mzCNYKnqaWKV8FxATFLykUMCBXdYZqTB_aNfsEb1ynkJmUz3yw3ZNYv6RxUY1lTfBgAQ';
    fetch(AGENT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        callback(data);
    })
    .catch(error => {
        showToast('请求失败，请重试');
        console.error(error);
    });
    
    
    
}

// ==================== 处理题目响应 ====================
function handleQuestionResponse(response) {
    if (response.type === 'question') {
        displayQuestion(response);
    } else {
        // 处理其他响应类型
        showStatsArea(response.content);
    }
}

function displayQuestion(data) {
    currentQuestion = data;
    
    // 填充题目内容
    document.getElementById('questionId').textContent = `题目ID: ${data.id}`;
    
    // 构建标签
    const tagsHtml = `
        <span class="question-tag">${data.module || '前端'}</span>
        <span class="question-tag">${data.difficulty || '未知'}</span>
    `;
    document.getElementById('questionTags').innerHTML = tagsHtml;
    
    // 题目内容
    document.getElementById('questionText').textContent = data.content;
    
    // 选项（如果是选择题）
    const optionsContainer = document.getElementById('questionOptions');
    if (data.options && data.options.length > 0) {
        optionsContainer.innerHTML = data.options.map(opt => 
            `<div class="option-item">${opt.option}. ${opt.content}</div>`
        ).join('');
    } else {
        optionsContainer.innerHTML = '';
    }
    
    // 显示题目区
    document.getElementById('questionArea').classList.remove('hidden');
    
    // 清空答案输入
    document.getElementById('answerInput').value = '';
    
    // 滚动到题目区
    document.getElementById('questionArea').scrollIntoView({ behavior: 'smooth' });
}

// ==================== 提交答案 ====================
function submitAnswer() {
    const answer = document.getElementById('answerInput').value.trim();
    if (!answer) {
        showToast('请输入答案');
        return;
    }
    
    if (!currentQuestion) {
        showToast('请先获取题目');
        return;
    }
    
    // 构建判题请求
    const prompt = `题目ID是${currentQuestion.id}，我的答案是：${answer}`;
    
    showToast('正在判题...');
    
    // 调用Agent判题
    callAgent(prompt, handleResultResponse);
}

function handleResultResponse(response) {
    // 隐藏题目区
    document.getElementById('questionArea').classList.add('hidden');
    
    // 显示结果区
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const resultDetails = document.getElementById('resultDetails');
    
    // 解析响应（根据实际返回格式调整）
    if (response.content.includes('正确')) {
        resultIcon.textContent = '✅';
        resultText.textContent = '回答正确！';
        resultText.style.color = '#4caf50';
    } else if (response.content.includes('错误')) {
        resultIcon.textContent = '❌';
        resultText.textContent = '回答错误';
        resultText.style.color = '#f44336';
    } else {
        resultIcon.textContent = '📝';
        resultText.textContent = '答案已记录';
        resultText.style.color = '#ff9800';
    }
    
    resultDetails.textContent = response.content;
    
    document.getElementById('resultArea').classList.remove('hidden');
    
    // 滚动到结果区
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
}

// ==================== 统计和错题 ====================
function showStats() {
    showToast('正在获取统计数据...');
    
    // 调用Agent获取统计
    callAgent('请查看我的答题统计', handleStatsResponse);
}

function showWrongQuestions() {
    showToast('正在获取错题...');
    
    // 调用Agent获取错题
    callAgent('请查看我的错题列表', handleStatsResponse);
}

function handleStatsResponse(response) {
    showStatsArea(response.content);
}

function showStatsArea(content) {
    document.getElementById('statsContent').innerHTML = content.replace(/\n/g, '<br>');
    document.getElementById('statsArea').classList.remove('hidden');
    document.getElementById('statsArea').scrollIntoView({ behavior: 'smooth' });
}

// ==================== 关闭和导航 ====================
function closeQuestion() {
    document.getElementById('questionArea').classList.add('hidden');
    currentQuestion = null;
}

function closeResult() {
    document.getElementById('resultArea').classList.add('hidden');
}

function closeStats() {
    document.getElementById('statsArea').classList.add('hidden');
}

function showNextQuestion() {
    closeResult();
    showQuickQuestion();
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initTagSelectors();
    
    console.log('前端刷题助手已加载');
    console.log('提示：如需连接真实Agent，请配置AGENT_API_URL和API_KEY');
});