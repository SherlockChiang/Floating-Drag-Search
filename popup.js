document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('searchInput');
  
  // 自动聚焦输入框
  input.focus();

  // 定义搜索函数
  function search(engine) {
    const query = input.value;
    if (!query) return;
    
    let url = '';
    if (engine === 'google') url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    if (engine === 'bing') url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    if (engine === 'baidu') url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
    
    chrome.tabs.create({ url: url });
  }

  // 绑定按钮
  document.getElementById('btnGoogle').onclick = () => search('google');
  document.getElementById('btnBing').onclick = () => search('bing');
  document.getElementById('btnBaidu').onclick = () => search('baidu');

  // 支持回车默认 Google
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') search('google');
  });
});