(function() {
  var savedRange = null;

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

    var reactPropsKey = Object.keys(contentTextarea).find(function(k) { return k.startsWith("__reactProps$"); });

    function setReactValue(value) {
      var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeInputValueSetter.call(contentTextarea, value);
      contentTextarea.dispatchEvent(new Event("input", { bubbles: true }));
      if (reactPropsKey && contentTextarea[reactPropsKey] && contentTextarea[reactPropsKey].onChange) {
        try { contentTextarea[reactPropsKey].onChange({ target: contentTextarea, currentTarget: contentTextarea, type: "change", bubbles: true, preventDefault: function() {}, stopPropagation: function() {} }); } catch(e) {}
      }
    }

    // === SAVE CURSOR POSITION ===
    function saveSelection() {
      var sel = window.getSelection();
      if (sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
          savedRange = range.cloneRange();
        }
      }
    }
    // Save on every interaction
    document.addEventListener("selectionchange", function() {
      var sel = window.getSelection();
      if (sel.rangeCount > 0 && editor && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        savedRange = sel.getRangeAt(0).cloneRange();
      }
    });

    function insertAtCursor(html) {
      editor.focus();
      var range;
      if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
        range = savedRange;
        range.deleteContents();
      } else {
        // No saved range — insert at end
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      var frag = range.createContextualFragment(html);
      var lastNode = frag.lastChild;
      range.insertNode(frag);
      // Move cursor after inserted content
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.setEndAfter(lastNode);
      }
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      savedRange = range.cloneRange();
      sync();
    }

    // === 18 BLOCKS ===
    var blocks = [
      {name:"\u275D \u0426\u0438\u0442\u0430\u0442\u0430",html:'<blockquote><p>\u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0442\u0435\u043A\u0441\u0442 \u0446\u0438\u0442\u0430\u0442\u044B</p></blockquote>'},
      {name:"\u2139\uFE0F \u0418\u043D\u0444\u043E-\u0431\u043B\u043E\u043A",html:'<div class="info-box"><p>\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0441\u044E\u0434\u0430</p></div>'},
      {name:"\u26A0\uFE0F \u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435",html:'<div class="warning-box"><p>\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435 \u0441\u044E\u0434\u0430</p></div>'},
      {name:"\u2705 \u0411\u043B\u043E\u043A \u0443\u0441\u043F\u0435\u0445\u0430",html:'<div class="success-box"><p>\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E\u0431 \u0443\u0441\u043F\u0435\u0445\u0435</p></div>'},
      {name:"\u{1F4DD} \u041F\u0440\u0438\u0437\u044B\u0432 (CTA)",html:'<div class="cta-block"><h3>\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043F\u0440\u0438\u0437\u044B\u0432\u0430</h3><p>\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435</p><a href="#" class="btn">\u041A\u043D\u043E\u043F\u043A\u0430</a></div>'},
      {name:"\u{1F4CA} \u0422\u0430\u0431\u043B\u0438\u0446\u0430",html:'<table><thead><tr><th>\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440</th><th>\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435</th></tr></thead><tbody><tr><td>\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 1</td><td>\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 1</td></tr><tr><td>\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440 2</td><td>\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 2</td></tr></tbody></table>'},
      {name:"\u{1F4CB} \u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0438",html:'<div class="cards-row"><div class="card-item"><h4>\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A 1</h4><p>\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 1</p></div><div class="card-item"><h4>\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A 2</h4><p>\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 2</p></div></div>'},
      {name:"\u2500 \u0420\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C",html:'<hr/>'},
      {name:"\u{1F4AC} \u041E\u0442\u0437\u044B\u0432",html:'<div class="testimonial-block"><blockquote><p>\u0422\u0435\u043A\u0441\u0442 \u043E\u0442\u0437\u044B\u0432\u0430</p></blockquote><cite>\u2014 \u0418\u043C\u044F \u0430\u0432\u0442\u043E\u0440\u0430</cite></div>'},
      {name:"\u{1F4C8} \u0426\u0438\u0444\u0440\u044B/\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430",html:'<div class="stats-row"><div class="stat-item"><div class="stat-num">100+</div><div class="stat-label">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435</div></div><div class="stat-item"><div class="stat-num">90%</div><div class="stat-label">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435</div></div></div>'},
      {name:"\u{1F539} \u042D\u0442\u0430\u043F\u044B/\u0428\u0430\u0433\u0438",html:'<div class="steps-block"><div class="step-item"><div class="step-num">1</div><div class="step-content"><h4>\u0428\u0430\u0433 1</h4><p>\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0448\u0430\u0433\u0430</p></div></div><div class="step-item"><div class="step-num">2</div><div class="step-content"><h4>\u0428\u0430\u0433 2</h4><p>\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0448\u0430\u0433\u0430</p></div></div></div>'},
      {name:"\u{1F4B0} \u0426\u0435\u043D\u0430/\u0422\u0430\u0440\u0438\u0444",html:'<div class="price-block"><div class="price-value">\u043E\u0442 15 000 \u20BD</div><div class="price-desc">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0442\u0430\u0440\u0438\u0444\u0430</div></div>'},
      {name:"\u{1F4F9} \u0412\u0438\u0434\u0435\u043E (YouTube)",html:'<div class="video-embed"><iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe></div>'},
      {name:"\u{1F5BC} \u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0441 \u043F\u043E\u0434\u043F\u0438\u0441\u044C\u044E",html:'<figure class="figure-block"><img src="https://2980738.ru/images/placeholder.jpg" alt="\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"><figcaption>\u041F\u043E\u0434\u043F\u0438\u0441\u044C \u043A \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044E</figcaption></figure>'},
      {name:"\u{1F4A1} \u0421\u043F\u0438\u0441\u043E\u043A \u0441 \u0438\u043A\u043E\u043D\u043A\u0430\u043C\u0438",html:'<ul class="icon-list"><li>\u2705 \u041F\u0435\u0440\u0432\u044B\u0439 \u043F\u0443\u043D\u043A\u0442</li><li>\u2705 \u0412\u0442\u043E\u0440\u043E\u0439 \u043F\u0443\u043D\u043A\u0442</li><li>\u2705 \u0422\u0440\u0435\u0442\u0438\u0439 \u043F\u0443\u043D\u043A\u0442</li></ul>'},
      {name:"\u{1F4DE} \u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u044B\u0439 \u0431\u043B\u043E\u043A",html:'<div class="contact-block"><h4>\u0421\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u043C\u0438</h4><p>\u{1F4DE} +7 (902) 472-07-38</p><p>\u{1F4E7} boss@2980738.ru</p><p>\u{1F4AC} Telegram: @Veles_ST</p></div>'},
      {name:"\u{1F4D6} \u0414\u0432\u0443\u0445\u043A\u043E\u043B\u043E\u043D\u043E\u0447\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442",html:'<div class="two-columns"><div><p>\u041B\u0435\u0432\u0430\u044F \u043A\u043E\u043B\u043E\u043D\u043A\u0430</p></div><div><p>\u041F\u0440\u0430\u0432\u0430\u044F \u043A\u043E\u043B\u043E\u043D\u043A\u0430</p></div></div>'},
      {name:"\u2753 FAQ \u0432\u043E\u043F\u0440\u043E\u0441-\u043E\u0442\u0432\u0435\u0442",html:'<div class="faq-inline"><div class="faq-q"><strong>\u0412\u043E\u043F\u0440\u043E\u0441?</strong></div><div class="faq-a"><p>\u041E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0432\u043E\u043F\u0440\u043E\u0441</p></div></div>'}
    ];

    var toolbar = document.createElement("div");
    toolbar.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;padding:8px;background:#1a1a1a;border:1px solid #333;border-radius:8px 8px 0 0;align-items:center";

    // BLOCKS DROPDOWN
    var blocksContainer = document.createElement("div");
    blocksContainer.style.cssText = "position:relative;display:inline-block";
    var blocksBtn = document.createElement("button");
    blocksBtn.type = "button";
    blocksBtn.innerHTML = "\u{1F4E6} \u0411\u043B\u043E\u043A\u0438";
    blocksBtn.style.cssText = "padding:4px 10px;border-radius:4px;background:#C96E4D;border:1px solid #E68863;color:#fff;cursor:pointer;font-size:13px;font-weight:600";
    blocksContainer.appendChild(blocksBtn);
    var dropdown = document.createElement("div");
    dropdown.style.cssText = "display:none;position:absolute;top:100%;left:0;background:#1a1a1a;border:1px solid #444;border-radius:8px;padding:4px;z-index:10000;min-width:220px;max-height:400px;overflow-y:auto;box-shadow:0 8px 30px rgba(0,0,0,0.5)";
    blocks.forEach(function(blk) {
      var item = document.createElement("div");
      item.innerHTML = blk.name;
      item.style.cssText = "padding:8px 12px;color:#e7dccf;cursor:pointer;border-radius:4px;font-size:13px;white-space:nowrap";
      item.onmouseenter = function() { item.style.background = "rgba(230,136,99,0.15)"; };
      item.onmouseleave = function() { item.style.background = "transparent"; };
      item.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        insertAtCursor(blk.html);
        dropdown.style.display = "none";
      };
      dropdown.appendChild(item);
    });
    blocksContainer.appendChild(dropdown);
    blocksBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      saveSelection();
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    };
    document.addEventListener("click", function(e) {
      if (!blocksContainer.contains(e.target)) dropdown.style.display = "none";
    }, false);
    toolbar.appendChild(blocksContainer);

    var sep0 = document.createElement("div");
    sep0.style.cssText = "width:1px;background:#333;margin:0 4px";
    toolbar.appendChild(sep0);

    var btns = [
      {c:"bold",h:"<b>B</b>",t:"\u0416\u0438\u0440\u043D\u044B\u0439"},
      {c:"italic",h:"<i>I</i>",t:"\u041A\u0443\u0440\u0441\u0438\u0432"},
      {c:"underline",h:"<u>U</u>",t:"\u041F\u043E\u0434\u0447\u0451\u0440\u043A\u043D\u0443\u0442\u044B\u0439"},
      {s:1},
      {c:"formatBlock",v:"<h2>",h:"H2",t:"H2"},
      {c:"formatBlock",v:"<h3>",h:"H3",t:"H3"},
      {c:"formatBlock",v:"<p>",h:"P",t:"\u0410\u0431\u0437\u0430\u0446"},
      {s:1},
      {c:"insertUnorderedList",h:"\u2022 \u0421\u043F\u0438\u0441\u043E\u043A",t:"\u041C\u0430\u0440\u043A\u0438\u0440."},
      {c:"insertOrderedList",h:"1. \u0421\u043F\u0438\u0441\u043E\u043A",t:"\u041D\u0443\u043C\u0435\u0440."},
      {s:1},
      {c:"link",h:"\uD83D\uDD17",t:"\u0421\u0441\u044B\u043B\u043A\u0430"},
      {c:"image",h:"\uD83D\uDDBC",t:"\u0418\u0437\u043E\u0431\u0440."},
      {s:1},
      {c:"undo",h:"\u21B6",t:"\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"},
      {c:"redo",h:"\u21B7",t:"\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"},
      {c:"removeFormat",h:"\u2715",t:"\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C"}
    ];

    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.s) { var d = document.createElement("div"); d.style.cssText = "width:1px;background:#333;margin:0 4px"; toolbar.appendChild(d); continue; }
      var btn = document.createElement("button");
      btn.type = "button"; btn.innerHTML = b.h; btn.title = b.t;
      btn.style.cssText = "padding:4px 8px;border-radius:4px;background:#2a2a2a;border:1px solid #444;color:#e7dccf;cursor:pointer;font-size:13px;font-weight:600;min-width:32px";
      btn.onmouseenter = function() { this.style.background = "#3a3a3a"; this.style.borderColor = "#C96E4D"; };
      btn.onmouseleave = function() { this.style.background = "#2a2a2a"; this.style.borderColor = "#444"; };
      (function(btn, b) {
        btn.onclick = function(e) {
          e.preventDefault();
          if (b.c === "link") { var u = prompt("URL:", "https://"); if (u) document.execCommand("createLink", false, u); }
          else if (b.c === "image") { var im = prompt("URL:", "https://"); if (im) document.execCommand("insertImage", false, im); }
          else if (b.v) { document.execCommand(b.c, false, b.v); }
          else { document.execCommand(b.c, false); }
          editor.focus(); sync();
        };
      })(btn, b);
      toolbar.appendChild(btn);
    }

    // SOURCE BUTTON
    var sep2 = document.createElement("div");
    sep2.style.cssText = "width:1px;background:#333;margin:0 4px";
    toolbar.appendChild(sep2);
    var sourceBtn = document.createElement("button");
    sourceBtn.type = "button";
    sourceBtn.innerHTML = "</> \u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A";
    sourceBtn.title = "\u0420\u0435\u0436\u0438\u043C HTML";
    sourceBtn.style.cssText = "padding:4px 10px;border-radius:4px;background:#2a2a2a;border:1px solid #444;color:#e7dccf;cursor:pointer;font-size:13px;font-weight:600";
    sourceBtn.onmouseenter = function() { this.style.background = "#3a3a3a"; this.style.borderColor = "#C96E4D"; };
    sourceBtn.onmouseleave = function() { this.style.background = "#2a2a2a"; this.style.borderColor = "#444"; };

    // FULLSCREEN BUTTON
    var fullscreenBtn = document.createElement("button");
    fullscreenBtn.type = "button";
    fullscreenBtn.innerHTML = "\u26F6 \u0412\u0435\u0441\u044C \u044D\u043A\u0440\u0430\u043D";
    fullscreenBtn.title = "\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440";
    fullscreenBtn.style.cssText = "padding:4px 10px;border-radius:4px;background:#2a2a2a;border:1px solid #444;color:#e7dccf;cursor:pointer;font-size:13px;font-weight:600";
    fullscreenBtn.onmouseenter = function() { this.style.background = "#3a3a3a"; this.style.borderColor = "#C96E4D"; };
    fullscreenBtn.onmouseleave = function() { this.style.background = "#2a2a2a"; this.style.borderColor = "#444"; };

    toolbar.appendChild(sourceBtn);
    toolbar.appendChild(fullscreenBtn);

    // EDITOR
    var editor = document.createElement("div");
    editor.contentEditable = true;
    editor.className = "article-content";
    editor.style.cssText = "min-height:400px;padding:16px;background:#0d0c0a;border:1px solid #333;border-radius:0 0 8px 8px;color:#d6c6b2;font-size:15px;line-height:1.8;font-family:Inter,sans-serif;outline:none;overflow-y:auto";
    editor.innerHTML = contentTextarea.value || "";

    // SOURCE VIEW
    var sourceView = document.createElement("textarea");
    sourceView.style.cssText = "display:none;min-height:400px;width:100%;padding:16px;background:#0d0c0a;border:1px solid #333;border-radius:0 0 8px 8px;color:#6DB89A;font-size:13px;line-height:1.5;font-family:monospace;outline:none;resize:vertical";
    sourceView.spellcheck = false;

    // STYLES — editor + all 18 block types
    var st = document.createElement("style");
    st.textContent = '.article-content{color:rgba(214,198,178,0.85);font-size:1.05rem;line-height:1.8}.article-content h2{font-size:1.6rem;font-weight:700;color:#E7DCCF;margin:2.5rem 0 1rem;padding-bottom:0.5rem;border-bottom:2px solid rgba(230,136,99,0.3)}.article-content h3{font-size:1.25rem;font-weight:600;color:#E68863;margin:2rem 0 0.75rem}.article-content p{margin:0 0 1.2rem}.article-content ul,.article-content ol{margin:0 0 1.2rem 1.5rem}.article-content li{margin-bottom:0.5rem}.article-content a{color:#E68863;text-decoration:underline}.article-content img{max-width:100%;border-radius:12px;margin:1.5rem 0}.article-content strong{color:#F5F0E8;font-weight:700}.article-content blockquote{border-left:4px solid #C96E4D;padding:1rem 0 1rem 1.5rem;margin:2rem 0;background:rgba(201,110,77,0.06);border-radius:0 12px 12px 0;font-style:italic;color:#E7DCCF;font-size:1.1rem}.article-content blockquote p{margin:0}.article-content table{width:100%;border-collapse:collapse;margin:1.5rem 0;font-size:0.95rem;overflow:hidden;border-radius:12px}.article-content th{padding:0.75rem 1rem;text-align:left;background:rgba(201,110,77,0.15);color:#E68863;font-weight:600;border-bottom:2px solid rgba(201,110,77,0.3)}.article-content td{padding:0.65rem 1rem;border-bottom:1px solid rgba(214,198,178,0.08);color:rgba(214,198,178,0.9)}.article-content .info-box{background:rgba(91,141,170,0.08);border:1px solid rgba(91,141,170,0.25);border-left:4px solid #5B8DAA;padding:1.25rem 1.5rem;border-radius:0 12px 12px 0;margin:1.5rem 0}.article-content .info-box p{margin:0}.article-content .warning-box{background:rgba(201,110,77,0.08);border:1px solid rgba(201,110,77,0.25);border-left:4px solid #C96E4D;padding:1.25rem 1.5rem;border-radius:0 12px 12px 0;margin:1.5rem 0}.article-content .warning-box p{margin:0}.article-content .success-box{background:rgba(109,184,154,0.08);border:1px solid rgba(109,184,154,0.25);border-left:4px solid #6DB89A;padding:1.25rem 1.5rem;border-radius:0 12px 12px 0;margin:1.5rem 0}.article-content .success-box p{margin:0}.article-content .cta-block{background:linear-gradient(135deg,rgba(201,110,77,0.12),rgba(214,198,178,0.04));border:1px solid rgba(201,110,77,0.25);border-radius:16px;padding:2rem;text-align:center;margin:2rem 0}.article-content .cta-block h3{margin-top:0;color:#E68863}.article-content .cta-block .btn{display:inline-block;padding:0.75rem 2rem;background:linear-gradient(135deg,#C96E4D,#E68863);color:#fff!important;border-radius:10px;text-decoration:none;font-weight:600;font-size:1rem;margin-top:1rem}.article-content .cards-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;margin:1.5rem 0}.article-content .card-item{background:rgba(214,198,178,0.04);border:1px solid rgba(214,198,178,0.1);border-radius:12px;padding:1.25rem}.article-content .card-item h4{color:#E68863;font-size:1rem;font-weight:600;margin:0 0 0.5rem}.article-content .card-item p{margin:0;font-size:0.9rem}.article-content hr{border:none;height:1px;background:linear-gradient(90deg,transparent,rgba(214,198,178,0.2),transparent);margin:2.5rem 0}.article-content .testimonial-block{background:rgba(214,198,178,0.04);border:1px solid rgba(214,198,178,0.12);border-radius:16px;padding:1.5rem;margin:2rem 0}.article-content .testimonial-block blockquote{border:none;background:none;padding:0;margin:0}.article-content .testimonial-block cite{display:block;margin-top:0.75rem;color:#E68863;font-style:normal;font-weight:600}.article-content .stats-row{display:flex;gap:2rem;flex-wrap:wrap;margin:2rem 0;text-align:center}.article-content .stat-item{flex:1;min-width:120px}.article-content .stat-num{font-size:2.5rem;font-weight:800;color:#E68863;line-height:1}.article-content .stat-label{font-size:0.85rem;color:rgba(214,198,178,0.6);margin-top:0.3rem}.article-content .steps-block{margin:2rem 0}.article-content .step-item{display:flex;gap:1rem;margin-bottom:1.5rem;align-items:flex-start}.article-content .step-num{min-width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#C96E4D,#E68863);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;flex-shrink:0}.article-content .step-content h4{margin:0 0 0.3rem;color:#E7DCCF;font-size:1rem}.article-content .step-content p{margin:0;font-size:0.9rem}.article-content .price-block{text-align:center;padding:1.5rem;background:linear-gradient(135deg,rgba(201,110,77,0.1),rgba(214,198,178,0.03));border:1px solid rgba(201,110,77,0.2);border-radius:16px;margin:2rem 0}.article-content .price-value{font-size:2rem;font-weight:800;color:#E68863}.article-content .price-desc{font-size:0.9rem;color:rgba(214,198,178,0.7);margin-top:0.5rem}.article-content .video-embed{border-radius:12px;overflow:hidden;margin:1.5rem 0;position:relative;padding-bottom:56.25%;height:0}.article-content .video-embed iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}.article-content .figure-block{margin:1.5rem 0;text-align:center}.article-content .figure-block img{max-width:100%;border-radius:12px}.article-content .figure-block figcaption{font-size:0.85rem;color:rgba(214,198,178,0.5);margin-top:0.5rem;font-style:italic}.article-content .icon-list{list-style:none;padding:0;margin:1.5rem 0}.article-content .icon-list li{padding:0.4rem 0;font-size:0.95rem}.article-content .contact-block{background:rgba(214,198,178,0.04);border:1px solid rgba(214,198,178,0.12);border-radius:16px;padding:1.5rem;margin:2rem 0}.article-content .contact-block h4{margin:0 0 0.75rem;color:#E7DCCF}.article-content .contact-block p{margin:0.3rem 0}.article-content .two-columns{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin:1.5rem 0}.article-content .two-columns p{margin:0}.article-content .faq-inline{background:rgba(214,198,178,0.04);border:1px solid rgba(214,198,178,0.1);border-radius:12px;padding:1rem 1.25rem;margin:1rem 0}.article-content .faq-q{font-weight:700;color:#E7DCCF;margin-bottom:0.5rem}.article-content .faq-a{color:rgba(214,198,178,0.8)}.article-content .faq-a p{margin:0}.article-content:focus{border-color:rgba(230,136,99,0.4)!important}.article-content:empty:before{content:"\\041D\\0430\\0447\\043D\\0438\\0442\\0435 \\043F\\0435\\0447\\0430\\0442\\0430\\0442\\044C...";color:rgba(214,198,178,0.3)}';
    document.head.appendChild(st);

    function sync() { setReactValue(editor.innerHTML); }
    editor.oninput = sync;
    editor.onblur = sync;
    editor.onmouseup = saveSelection;
    editor.onkeyup = saveSelection;

    var wrapper = document.createElement("div");
    wrapper.style.cssText = "margin:10px 0;position:relative";
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editor);
    wrapper.appendChild(sourceView);
    contentTextarea.parentElement.appendChild(wrapper);

    // SOURCE TOGGLE
    var sourceMode = false;
    sourceBtn.onclick = function(e) {
      e.preventDefault();
      if (!sourceMode) {
        sourceView.value = editor.innerHTML;
        editor.style.display = "none";
        sourceView.style.display = "block";
        sourceBtn.style.background = "#C96E4D";
        sourceBtn.style.borderColor = "#E68863";
        sourceBtn.style.color = "#fff";
        sourceView.focus();
      } else {
        editor.innerHTML = sourceView.value;
        editor.style.display = "block";
        sourceView.style.display = "none";
        sourceBtn.style.background = "#2a2a2a";
        sourceBtn.style.borderColor = "#444";
        sourceBtn.style.color = "#e7dccf";
        sync();
        editor.focus();
      }
      sourceMode = !sourceMode;
    };
    sourceView.oninput = function() { setReactValue(sourceView.value); };

    // FULLSCREEN TOGGLE
    var isFullscreen = false;
    var savedParent = null;
    var overlay = document.createElement("div");
    overlay.style.cssText = "display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:99998;background:rgba(0,0,0,0.9);padding:40px;overflow-y:auto";
    fullscreenBtn.onclick = function(e) {
      e.preventDefault();
      if (!isFullscreen) {
        savedParent = wrapper.parentElement;
        document.body.appendChild(overlay);
        overlay.appendChild(wrapper);
        overlay.style.display = "block";
        wrapper.style.zIndex = "99999";
        wrapper.style.maxWidth = "1000px";
        wrapper.style.margin = "0 auto";
        editor.style.minHeight = "calc(100vh - 200px)";
        fullscreenBtn.innerHTML = "\u26F6 \u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C";
        fullscreenBtn.style.background = "#C96E4D";
        fullscreenBtn.style.color = "#fff";
        isFullscreen = true;
      } else {
        savedParent.appendChild(wrapper);
        overlay.style.display = "none";
        document.body.removeChild(overlay);
        wrapper.style.zIndex = "";
        wrapper.style.maxWidth = "";
        editor.style.minHeight = "400px";
        fullscreenBtn.innerHTML = "\u26F6 \u0412\u0435\u0441\u044C \u044D\u043A\u0440\u0430\u043D";
        fullscreenBtn.style.background = "#2a2a2a";
        fullscreenBtn.style.color = "#e7dccf";
        isFullscreen = false;
      }
    };
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && isFullscreen) { fullscreenBtn.click(); }
    });

    // SAVE HOOKS
    function hookSaveButtons() {
      var allButtons = document.querySelectorAll("button");
      allButtons.forEach(function(btn) {
        var text = (btn.textContent || "").toLowerCase().trim();
        if ((text.indexOf("save") !== -1 || text.indexOf("\u0441\u043E\u0445\u0440\u0430\u043D") !== -1 || btn.type === "submit") && !btn.getAttribute("data-wysiwyg-hooked")) {
          btn.setAttribute("data-wysiwyg-hooked", "true");
          btn.addEventListener("click", function() {
            if (sourceMode) { editor.innerHTML = sourceView.value; }
            setReactValue(editor.innerHTML);
            setTimeout(function() { setReactValue(editor.innerHTML); }, 50);
            setTimeout(function() { setReactValue(editor.innerHTML); }, 200);
          }, true);
        }
      });
    }
    hookSaveButtons();
    setInterval(hookSaveButtons, 1500);
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initWysiwyg); } else { initWysiwyg(); }
  var obs = new MutationObserver(function() { initWysiwyg(); });
  document.addEventListener("DOMContentLoaded", function() { obs.observe(document.body, {childList: true, subtree: true}); });
  setInterval(initWysiwyg, 1500);
})();
