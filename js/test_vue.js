(function(g, hui) { g.hui = hui; })(this, function(obj) {
    this.verson = '2.5.1';
    this.el = obj.el;
    this.data = {};
    this.nodes = {};
    var _self = this
    if (!obj.data) {
        obj.data = {};
    }
    Object.keys(obj.data).forEach(function(key) {
        defineReactive(_self.data, key, obj.data[key]);
    });

    function defineReactive(data, key, val) {
        Object.defineProperty(_self.data, key, {
            enumerable: true,
            configurable: false,
            get: function() { return val },
            set: function(newVal) {
                val = newVal;
                var cnode = _self.nodes[key];
                if (cnode) {
                    for (var i = 0; i < cnode.length; i++) {
                        cnode[i].textContent = newVal;
                    }
                }
            }
        })
    }

    //设置变量值
    this.setData = function(objs) { Object.keys(objs).forEach(function(k) { _self.data[k] = objs[k]; }); }
    this.isElementNode = function(node) { return node.nodeType == 1; }
    this.isTextNode = function(node) { return node.nodeType == 3; }
    this.compileText = function(node, varName) {
        var varName = varName.substring(2, varName.length - 2);
        console.log(varName);
        var value = _self.data[varName];
        node.textContent = typeof value == 'undefined' ? '' : value;
        if (!this.nodes[varName]) { this.nodes[varName] = []; }
        this.nodes[varName].push(node);
    }
    this.compileFor = function(node, varName) {
        var value = _self.data[varName];
        if (!value) {
            node.parentNode.removeChild(node);
            return false
        }
        var parentDom = node.parentNode;
        for (var i = 0; i < value.lenght; i++) {
            var newNode = node.cloneNode(true);
            newNode.removeAttribute('hui-for');
            var html = newNode.innerHtml;
            var newHtml = html.replace(/{{item}}/g, '{{' + varName + '[' + i + ']}}');
            console.log(newHtml)
            newNode.innerHtml = newHtml;
            parentDom.appendChild(newNode);
        }
        parentDom.removeChild(node);
        //编译列表

        this.compileSons(parentDom);
    }
    this.compileSons = function(el) {
        var childNodes = el.childNodes;
        [].slice.call(childNodes).forEach(function(node) {
            var reg = /{{.*?}}/g;
            if (_self.isElementNode(node)) {
                _self.compileSons(node);
            } else if (_self.isTextNode(node)) {
                var regs = node.textContent.match(reg);
                if (regs) {
                    if (regs.length == 1) { _self.compileText(node, regs[0]); } else {
                        var ortherText = node.textContent.split(reg),
                            newTextNodes = [];
                        for (var i = 0; i < ortherText.length; i++) {
                            node.parentNode.insertBefore(document.createTextNode(ortherText[i]), node);
                            if (regs[i]) {
                                var cnode = document.createTextNode(regs[i]);
                                node.parentNode.insertBefore(cnode, node);
                                _self.compileText(cnode, regs[i]);
                            }
                        }
                        node.parentNode.removeChild(node);
                    }
                }
            }
        });
    }

    this.compile = function() {
        this.els = document.querySelector(this.el);
        if (this.els == null) {
            return;
        }
        this.fragment = document.createDocumentFragment();
        var child;
        while (child = this.els.firstChild) { this.fragment.appendChild(child); }
        this.compileSons(this.fragment);
        this.els.appendChild(this.fragment)
    }
    this.compile();

})