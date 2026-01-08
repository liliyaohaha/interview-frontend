// ==================== 配置区域 ====================
// 如果你的Agent部署在某个平台，需要配置对应的API地址
// 示例：
// const AGENT_API_URL = 'https://your-agent-api.com/chat';
// const API_KEY = 'your-api-key';

// ==================== 状态管理 ====================
let currentQuestion = null;
let questionList = [];  // 题目列表，支持多道题目
let currentQuestionIndex = 0;  // 当前题目索引
let currentSettings = {
    module: 'all',
    difficulty: 'all',
    type: 'all',
    count: 1  // 题目数量，默认1道
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

    // 题目数量选择
    document.querySelectorAll('.count-selector .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.count-selector .tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentSettings.count = parseInt(this.dataset.count);
        });
    });
}

// ==================== 题目相关函数 ====================
function showQuickQuestion() {
    // 重置题目列表和索引
    questionList = [];
    currentQuestionIndex = 0;
    generateQuestionPrompt();
}

function generateQuestionPrompt() {
    // 构建题目请求
    let prompt = '请';
    
    // 根据题目数量调整提示语
    if (currentSettings.count > 1) {
        prompt += `随机出${currentSettings.count}道`;
    } else {
        prompt += '随机出一道';
    }
    
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
    
    // 如果是多道题目，要求返回JSON数组格式
    if (currentSettings.count > 1) {
        prompt += ' 请以JSON数组格式返回，每道题目包含：id、content、options（选择题）、module、type、difficulty字段。';
    } else {
        prompt += ' 请以JSON格式返回，包含：id、content、options（选择题）、module、type、difficulty字段。';
    }
    
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
    const API_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjMxOThhOThiLTZiNzEtNGNiZC04Mjc2LWIyMzJlZGYyZDY2NyJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIkc4RnVXdkMzT0tFelFvdGs4amdXYkl2RXhsZFhNSXdDIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzY3ODY1MDU3LCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NTkyNzk2OTc1MzQzMzM3NTE1Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NTkyOTIyNjA1MDY2MTI1MzQ3In0.FFHB131rNqSG52CN23wOCjuJBiueJNOgrAquAX4rBoj_mVEo8ptJ0_zrtiHCEgr_qG2rSRgFT6JiTpoqBrUqWi8EIqC2nySHNf3wj6z0Zu8-qxMo7zvSqPnf3ZnovkzEtvjgzH5SZwYxR95AQ-HKAc6zRycuUtswvh1YDzAhvhD--UaRzPbcSAkx1qfSf_LzYOPo0rUi0ktD6NrMlh9dln1FM4ENXIHHc44AYBEUZIN-swG-5m6fbaTrw0mmsTvF6y3hQFES9Cc6Lu5xr4lvOOJwnpH4TW3ZOBKZ8HYXZJy_lKAMzjpPsy8SFLhYnFfuvcEIJzV-gcQKetW5J6h-Xg';
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
    // 判断是单道题目还是多道题目
    if (Array.isArray(response) && response.length > 0) {
        // 多道题目
        questionList = response;
        currentQuestionIndex = 0;
        displayQuestion(questionList[0]);
        showToast(`已生成 ${response.length} 道题目`);
    } else if (response.type === 'question') {
        // 单道题目
        questionList = [response];
        currentQuestionIndex = 0;
        displayQuestion(response);
    } else {
        // 处理其他响应类型
        showStatsArea(response.content);
    }
}

// ==================== 显示题目 ====================
function displayQuestion(data) {
    currentQuestion = data;
    
    // 填充题目内容
    // 如果有多道题目，显示进度
    if (questionList.length > 1) {
        document.getElementById('questionId').textContent = 
            `题目 ${currentQuestionIndex + 1}/${questionList.length} | ID: ${data.id}`;
    } else {
        document.getElementById('questionId').textContent = `题目ID: ${data.id}`;
    }
    
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
    
    // 如果有多道题目，切换到下一题
    if (questionList.length > 1 && currentQuestionIndex < questionList.length - 1) {
        currentQuestionIndex++;
        displayQuestion(questionList[currentQuestionIndex]);
        showToast(`第 ${currentQuestionIndex + 1} 题`);
    } else if (questionList.length > 1) {
        // 已经是最后一题
        showToast('已经是最后一题了');
        // 可以重新生成题目
        questionList = [];
        currentQuestionIndex = 0;
    } else {
        // 单道题目，重新生成
        showQuickQuestion();
    }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initTagSelectors();
    
    console.log('前端刷题助手已加载');
    console.log('提示：如需连接真实Agent，请配置AGENT_API_URL和API_KEY');
});
