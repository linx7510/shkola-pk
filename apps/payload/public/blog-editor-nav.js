(function() {
  function addEditorButton() {
    if (document.getElementById('blog-editor-fab')) return;
    var btn = document.createElement('a');
    btn.id = 'blog-editor-fab';
    btn.href = '/admin/blog-editor';
    btn.innerHTML = '\uD83D\uDCDD<br>\u0420\u0435\u0434\u0430\u043A\u0442\u043E\u0440<br>\u0441\u0442\u0430\u0442\u0435\u0439';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;align-items:center;justify-content:center;text-align:center;width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#C96E4D,#E68863);color:#fff;text-decoration:none;font-size:0.7rem;font-weight:700;line-height:1.3;box-shadow:0 4px 20px rgba(201,110,77,0.4);cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;border:2px solid rgba(255,255,255,0.15)';
    btn.onmouseenter = function() { btn.style.transform = 'scale(1.1)'; btn.style.boxShadow = '0 6px 30px rgba(201,110,77,0.6)'; };
    btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 4px 20px rgba(201,110,77,0.4)'; };
    document.body.appendChild(btn);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addEditorButton);
  } else {
    addEditorButton();
  }
  setInterval(function() {
    if (!document.getElementById('blog-editor-fab')) addEditorButton();
  }, 2000);
})();
