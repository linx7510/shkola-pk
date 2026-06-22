(function() {
  function initWysiwyg() {
    var textareas = document.querySelectorAll("textarea");
    var contentTextarea = null;
    for (var i = 0; i < textareas.length; i++) {
      var ta = textareas[i];
      var label = "";
      var parent = ta.parentElement;
      while (parent && !label) {
        var lbl = parent.querySelector("label");
        if (lbl) label = lbl.textContent || "";
        parent = parent.parentElement;
      }
      if (label.indexOf("\u0421\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u0435") !== -1 || label.indexOf("HTML") !== -1) {
        contentTextarea = ta;
        break;
      }
    }
    if (!contentTextarea) return;
    if (contentTextarea.getAttribute("data-wysiwyg") === "true") return;
    contentTextarea.setAttribute("data-wysiwyg", "true");
    contentTextarea.style.display = "none";

    var toolbar = document.createElement("div");
    toolbar.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border:1px solid #333;border-radius:8px 8px 0 0";

    var btns = [
      {c:"bold",h:"<b>B</b>",t:"\u0416\u0438\u0440\u043D\u044B\u0439"},
      {c:"italic",h:"<i>I</i>",t:"\u041A\u0443\u0440\u0441\u0438\u0432"},
      {c:"underline",h:"<u>U</u>",t:"\u041F\u043E\u0434\u0447\u0451\u0440\u043A\u043D\u0443\u0442\u044B\u0439"},
      {s:1},
      {c:"formatBlock",v:"<h2>",h:"H2",t:"\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A H2"},
      {c:"formatBlock",v:"<h3>",h:"H3",t:"\u041F\u043E\u0434\u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A H3"},
      {c:"formatBlock",v:"<p>",h:"P",t:"\u0410\u0431\u0437\u0430\u0446"},
      {s:1},
      {c:"insertUnorderedList",h:"\u2022 \u0421\u043F\u0438\u0441\u043E\u043A",t:"\u041C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439"},
      {c:"insertOrderedList",h:"1. \u0421\u043F\u0438\u0441\u043E\u043A",t:"\u041D\u0443\u043C\u0435\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439"},
      {s:1},
      {c:"formatBlock",v:"<blockquote>",h:"\u275D \u0426\u0438\u0442\u0430\u0442\u0430",t:"\u0426\u0438\u0442\u0430\u0442\u0430"},
      {c:"link",h:"\uD83D\uDD17",t:"\u0421\u0441\u044B\u043B\u043A\u0430"},
      {c:"image",h:"\uD83D\uDDBC",t:"\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435"},
      {s:1},
      {c:"undo",h:"\u21B6",t:"\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"},
      {c:"redo",h:"\u21B7",t:"\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"},
      {c:"removeFormat",h:"\u2715",t:"\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C"}
    ];

    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.s) {
        var d = document.createElement("div");
        d.style.cssText = "width:1px;background:#333;margin:0 4px";
        toolbar.appendChild(d);
        continue;
      }
      var btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = b.h;
      btn.title = b.t;
      btn.style.cssText = "padding:4px 8px;border-radius:4px;background:#2a2a2a;border:1px solid #444;color:#e7dccf;cursor:pointer;font-size:13px;font-weight:600;min-width:32px";
      btn.onmouseenter = function() { this.style.background = "#3a3a3a"; this.style.borderColor = "#C96E4D"; };
      btn.onmouseleave = function() { this.style.background = "#2a2a2a"; this.style.borderColor = "#444"; };
      (function(btn, b) {
        btn.onclick = function(e) {
          e.preventDefault();
          if (b.c === "link") {
            var u = prompt("URL:", "https://");
            if (u) document.execCommand("createLink", false, u);
          } else if (b.c === "image") {
            var im = prompt("URL:", "https://");
            if (im) document.execCommand("insertImage", false, im);
          } else if (b.v) {
            document.execCommand(b.c, false, b.v);
          } else {
            document.execCommand(b.c, false);
          }
          editor.focus();
          sync();
        };
      })(btn, b);
      toolbar.appendChild(btn);
    }

    var editor = document.createElement("div");
    editor.contentEditable = true;
    editor.style.cssText = "min-height:400px;padding:16px;background:#0d0c0a;border:1px solid #333;border-radius:0 0 8px 8px;color:#d6c6b2;font-size:15px;line-height:1.8;font-family:Inter,sans-serif;outline:none;overflow-y:auto";
    editor.innerHTML = contentTextarea.value || "";

    var st = document.createElement("style");
    st.textContent = '[contenteditable] h2{font-size:22px;font-weight:700;color:#e7dccf;margin:20px 0 10px;padding-bottom:5px;border-bottom:2px solid rgba(230,136,99,0.3)}[contenteditable] h3{font-size:18px;font-weight:600;color:#e68863;margin:15px 0 8px}[contenteditable] p{margin:0 0 12px}[contenteditable] ul,[contenteditable] ol{margin:0 0 12px 20px}[contenteditable] li{margin-bottom:6px}[contenteditable] blockquote{border-left:3px solid rgba(230,136,99,0.4);padding:8px 0 8px 16px;margin:15px 0;color:rgba(214,198,178,0.8);font-style:italic;background:rgba(230,136,99,0.05);border-radius:0 8px 8px 0}[contenteditable] a{color:#e68863;text-decoration:underline}[contenteditable] img{max-width:100%;border-radius:12px;margin:10px 0}[contenteditable] table{width:100%;border-collapse:collapse;margin:15px 0}[contenteditable] th,[contenteditable] td{padding:8px;border:1px solid #333;text-align:left}[contenteditable] th{background:rgba(201,110,77,0.15);color:#e68863}[contenteditable]:focus{border-color:rgba(230,136,99,0.4)!important}[contenteditable]:empty:before{content:"\\041D\\0430\\0447\\043D\\0438\\0442\\0435 \\043F\\0435\\0447\\0430\\0442\\0430\\0442\\044C...";color:rgba(214,198,178,0.3)}';
    document.head.appendChild(st);

    function sync() {
      contentTextarea.value = editor.innerHTML;
      var ev = new Event("input", {bubbles: true});
      contentTextarea.dispatchEvent(ev);
      var ce = new Event("change", {bubbles: true});
      contentTextarea.dispatchEvent(ce);
    }
    editor.oninput = sync;
    editor.onblur = sync;

    var wrapper = document.createElement("div");
    wrapper.style.cssText = "margin:10px 0";
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editor);
    contentTextarea.parentElement.appendChild(wrapper);

    var form = contentTextarea.closest("form");
    if (form) form.addEventListener("submit", function() { contentTextarea.value = editor.innerHTML; });

    setInterval(function() {
      var sbtns = document.querySelectorAll('button[type="submit"]');
      sbtns.forEach(function(b) { b.addEventListener("click", function() { contentTextarea.value = editor.innerHTML; }); });
    }, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWysiwyg);
  } else {
    initWysiwyg();
  }
  var obs = new MutationObserver(function() { initWysiwyg(); });
  document.addEventListener("DOMContentLoaded", function() { obs.observe(document.body, {childList: true, subtree: true}); });
  setInterval(initWysiwyg, 1500);
})();
