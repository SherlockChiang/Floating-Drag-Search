// 1. 创建悬浮框
const box = document.createElement('div');
box.id = 'my-floating-box';

box.innerHTML = `
  <div class="engine-selector">
    <label class="engine-label"><input type="radio" name="search-engine" value="google" checked> Google</label>
    <label class="engine-label"><input type="radio" name="search-engine" value="baidu"> Baidu</label>
    <label class="engine-label"><input type="radio" name="search-engine" value="bing"> Bing</label>
  </div>
`;

// 先隐藏，避免位置跳动（闪烁），等读取到坐标后再显示
box.style.display = 'none'; 
document.body.appendChild(box);

// ==========================================
// 新增：位置记忆与同步功能 (Position Sync)
// ==========================================

// 从存储中恢复位置
function restorePosition() {
  chrome.storage.local.get(['boxLeft', 'boxTop'], (result) => {
    if (result.boxLeft && result.boxTop) {
      // 如果有存档，使用存档位置
      box.style.left = result.boxLeft;
      box.style.top = result.boxTop;
      // 必须重置 transform，否则会和 left/top 冲突导致位置不对
      box.style.transform = 'none'; 
    }
    // 无论有没有存档，处理完后显示盒子
    box.style.display = 'flex';
  });
}

// 立即执行恢复
restorePosition();

// ==========================================
// 核心逻辑
// ==========================================
let currentEngine = 'google'; 

// 监听引擎切换
const radios = box.querySelectorAll('input[name="search-engine"]');
radios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentEngine = e.target.value;
  });
});

// 拖拽移动悬浮框逻辑
let isDraggingBox = false;
let startX, startY, initialLeft, initialTop;

box.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
    return;
  }
  
  isDraggingBox = true;
  box.classList.add('is-dragging');

  startX = e.clientX;
  startY = e.clientY;

  const rect = box.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop = rect.top;

  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDraggingBox) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  // 更新位置
  box.style.left = `${initialLeft + dx}px`;
  box.style.top = `${initialTop + dy}px`;
  // 移除 CSS 里的 transform 居中影响，改用绝对坐标
  box.style.transform = 'none';
});

document.addEventListener('mouseup', () => {
  if (isDraggingBox) {
    isDraggingBox = false;
    box.classList.remove('is-dragging');

    // --- 新增：拖拽结束时，保存当前位置 ---
    chrome.storage.local.set({
      boxLeft: box.style.left,
      boxTop: box.style.top
    });
  }
});

// 拖拽文字搜索逻辑
box.addEventListener('dragover', (e) => {
  e.preventDefault();
  box.classList.add('drag-over');
});

box.addEventListener('dragleave', (e) => {
  if (e.relatedTarget && !box.contains(e.relatedTarget)) {
    box.classList.remove('drag-over');
  }
});

box.addEventListener('drop', (e) => {
  e.preventDefault();
  box.classList.remove('drag-over');

  const text = e.dataTransfer.getData('text');
  
  if (text) {
    let url = '';
    if (currentEngine === 'google') url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    if (currentEngine === 'baidu') url = `https://www.baidu.com/s?wd=${encodeURIComponent(text)}`;
    if (currentEngine === 'bing') url = `https://www.bing.com/search?q=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');
  }
});