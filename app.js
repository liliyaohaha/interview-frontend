// ==================== 配置区域 ====================
// 方式1：使用配置文件（推荐）
// 将 config.example.js 重命名为 config.js 并填写配置
let CONFIG = window.APP_CONFIG || null;

// 方式2：直接配置（快速测试）
const AGENT_API_URL = 'https://b9t6wd8hz9.coze.site/stream_run'; // 例如：'https://api.coze.com/v1/chat'
const API_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI1NDgzMTMwLWQxYzAtNGZlNS05ZjJlLWRmNjU3OTFkMDJlNSJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIkc4RnVXdkMzT0tFelFvdGs4amdXYkl2RXhsZFhNSXdDIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzY3OTQzMjg1LCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NTkyNzk2OTc1MzQzMzM3NTE1Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NTkzMjU4NTkxMTA1MDU2ODA4In0.wMwPiuRWd8GhPggBCJxOWqM9XCDS9PFfXLW0g8olvOkHSaUaaptPavR3FHr_7dXN74TesNVBslZHsbadIy4cncED68XKmhYeNbb-9bEkzgQ_VDzXEkc3eKQzrmo-6OXc42zBHO-pBa1uN1Gmi5_LDns4tOvN3ePtSLCm1uf9LNpZgDPshP35uqLahSA8DrQS1Q6eaDeDHOFNZ_pYLE0KiqGi_B6XeRtVMh4wEQx_-H2v0hFue1e-pCRdAGw5xMAniG_WzdUW6tuTSz154xE11VBZ9KfSiYqFBPaDk7evAXp6GyTrXSvxJSm3Pxz4AJYm1gS-zfzkFt-GymE4meTFsQ'; // 例如：'pat_xxxxxxxxxxxxxxxxxxxxx'

// 合并配置
if (!CONFIG) {
    CONFIG = {
        API: {
            BASE_URL: AGENT_API_URL,
            API_KEY: API_KEY,
            TIMEOUT: 30000,
            DEBUG: false
        },
        DEFAULTS: {
            MODULE: 'all',
            DIFFICULTY: 'all',
            TYPE: 'all',
            COUNT: 1
        },
        UI: {
            TITLE: '📚 前端刷题助手',
            SUBTITLE: '随时随地巩固前端知识'
        }
    };
}

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
    showToast('正在请求...');

    // 如果没有配置API，使用模拟数据
    if (!CONFIG.API.BASE_URL || !CONFIG.API.API_KEY) {
        console.log('未配置API，使用模拟数据');
        setTimeout(() => {
            // 模拟题目数据
            const mockQuestion = {
                type: 'question',
                content: `模拟题目：在${currentSettings.module === 'all' ? '前端' : currentSettings.module}中，关于以下描述，正确的是？`,
                options: [
                    { option: 'A', content: '选项A' },
                    { option: 'B', content: '选项B' },
                    { option: 'C', content: '选项C' },
                    { option: 'D', content: '选项D' }
                ],
                id: Date.now(),
                module: currentSettings.module === 'all' ? 'Vue' : currentSettings.module,
                type: currentSettings.type === 'all' ? 'choice' : currentSettings.type,
                difficulty: currentSettings.difficulty === 'all' ? 'medium' : currentSettings.difficulty
            };

            // 如果是多道题目
            if (currentSettings.count > 1) {
                const mockQuestions = [];
                for (let i = 0; i < currentSettings.count; i++) {
                    mockQuestions.push({
                        ...mockQuestion,
                        id: Date.now() + i,
                        content: `${mockQuestion.content}（第${i+1}题）`
                    });
                }
                callback(mockQuestions);
            } else {
                callback(mockQuestion);
            }
        }, 1000);
        return;
    }

    // 调用真实API
    const apiUrl = CONFIG.API.BASE_URL;
    const apiKey = CONFIG.API.API_KEY;

    // 使用CORS代理解决跨域问题
    const CORS_PROXY = 'https://corsproxy.io/?';
    const proxiedUrl = CORS_PROXY + encodeURIComponent(apiUrl);

    fetch(proxiedUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (CONFIG.API.DEBUG) {
            console.log('API响应:', data);
        }
        callback(data);
    })
    .catch(error => {
        console.error('API调用失败:', error);
        showToast('请求失败，使用模拟数据');

        // 降级：使用模拟数据
        const mockQuestion = {
            type: 'question',
            content: '模拟题目：API调用失败，显示此模拟数据',
            options: [
                { option: 'A', content: '选项A' },
                { option: 'B', content: '选项B' },
                { option: 'C', content: '选项C' },
                { option: 'D', content: '选项D' }
            ],
            id: Date.now(),
            module: 'Vue',
            type: 'choice',
            difficulty: 'medium'
        };
        callback(mockQuestion);
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