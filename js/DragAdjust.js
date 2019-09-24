!function (w) {
    var getbyid = function (id) {
        return document.getElementById(id);
    }
	var getbyClass = function(className) {
		return $('.' + className)[0];
	}
    
 
    //公共方法
    var Common = {
        //生成guid
        creatidstr: function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(8).substring(1);
            };
            return 'guid' + new Date().valueOf() + S4().toString() + '' + S4().toString();
        },
        each: function (arrydom, fn) {
            var len = arrydom.length;
            for (var i = 0; i < len; i++) {
                if (typeof fn == 'function') {
                    fn.call(arrydom[i]);
                }
            }
        },
        //绑定事件
        on: function (dom, even, fn) {
            dom.attachEvent ? dom.attachEvent('on' + even, function (e) {
                e = e || window.event;
                e.cancelBubble = true;
                fn.call(dom, e);
            }) : dom.addEventListener(even, function (e) {
                e = e || window.event;
                e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
                fn.call(dom, e);
            }, false);
        },
        on2: function (dom, even, fn) {
            dom.attachEvent ? dom.attachEvent('on' + even, function (e) {
                e = e || window.event;
                fn.call(dom, e);
            }) : dom.addEventListener(even, function (e) {
                e = e || window.event;
                fn.call(dom, e);
            }, false);
        },
        Once: function (dom, even, fn) {
            dom.attachEvent ? dom.attachEvent('on' + even, function (e) {
                e = e || window.event;
                fn.call(dom, e, arguments.callee);
            }) : dom.addEventListener(even, function (e) {
                e = e || window.event;
                fn.call(dom, e, arguments.callee);
            }, false);
        },
        removeHandler: function (element, type, handler) {
            if (element.addEventListener) {
                element.removeEventListener(type, handler, false)
            }
            else if (element.attachEvent) {
                element.detachEvent('on' + type, handler)
            }
            else {
                element["on" + type] = null;
            }
        },
        //获得属性
        attr: function (dom, attr, val) {
            var str = '', s;
            if (val) {
                dom.setAttribute(this.trim(attr), val);
                attr.toLowerCase() == 'class' && (dom.className = val);
                attr.toLowerCase() == 'style' && (dom.style.cssText = val);
            }
            else {
                s = dom.getAttribute(attr);
                str = s;
                attr.toLowerCase() == 'class' && (str = dom.className);
                attr.toLowerCase() == 'style' && (str = dom.style.cssText);
                return this.trim(str);
            }
        },
        //删除属性
        removeattr: function (dom, attr) {
            dom.removeAttribute(attr);
        },
        //判断是否存在class
        hasClass: function (dom, str) {
            return new RegExp('\\b' + str + '\\b').test(dom.className);
        },
        //添加class
        addClass: function (dom, cls) {
            this.hasClass(dom, cls) || (dom.className += ' ' + cls);
            dom.className = this.trim(dom.className);
        },
        //删除class
        removeClass: function (dom, cls) {
            var c = this.trim(cls), reg = new RegExp('\\b' + c + '\\b');
 
            if (this.hasClass(dom, c)) {
                dom.className = this.trim(dom.className.replace(reg, ''));
            }
        },
        //去除前后空格
        trim: function (s) {//去除多于空格
            s = s.toString() || '';
            return s.replace(/^\s*|\s*$/g, '');
        },
        mouseenter: function (dom, fn) {
            var f = true;
            if (dom.attachEvent) {
                this.on(dom, "mouseenter", fn);
            }
            else {
                this.on(dom, "mouseover", function (e) {
                    if (f) {
                        var mya = (e.srcElement ? e.srcElement : e.target);
                        var parent = e.relatedTarget || e.fromElement;
                        while (parent && parent != dom) {
                            try { parent = parent.parentNode; }
                            catch (e) { break; }
                        }
                        if (parent != dom) {
                            f = (function () { fn.call(dom, e); return true; })();
                        }
                    }
                });
            }
 
        },
        mouseleave: function (dom, fn) {
            if (dom.attachEvent) {
                this.on(dom, "mouseleave", fn);
            }
            else {
                this.on(dom, "mouseout", function (e) {
                    var mya = (e.srcElement ? e.srcElement : e.target);
                    var parent = e.relatedTarget || e.toElement;
                    while (parent && parent != dom) {
                        try { parent = parent.parentNode; }
                        catch (e) { break; }
                    }
                    if (parent != this) { fn.call(dom, e); }
                });
            }
        },
        loadcss: function (url) {
            var s = document.createElement("link");
            s.href = url;
            s.rel = "stylesheet";
            s.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(s);
        },
        //动态添加外部js
        loadscript: function (url, callback) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            if (script.readyState) {//IE浏览专属
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        if (typeof callback === "function") { callback(); }
                    }
                }
            } else {//其他浏览器
                script.onload = function () {
                    if (typeof callback === "function") { callback(); }
                }
            }
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    };
	
	var config = {
        // drag_box: getbyid('drag-box'),
        // container_tar: getbyid('drag-all')
		drag_box: getbyClass('drag-box'),
		container_tar: getbyClass('drag-all')
    }
	
 
    var Drag = {
        config: {
            w: 200,
            h: 200,
            w_start: 0,
            h_start: 0,
            w_end: 0,
            h_end: 0,
            x: 0,
            y: 0,
            x_start: 0,
            y_start: 0,
            x_end: 0,
            y_end: 0,
            container_w: 400,
            container_h: 300,
            fnmove: null,
            fnback: null
        },
        Init: function (opt) {
            var _cur = this, _config = _cur.config;
            if (opt) {
                for (var o in opt) {
                    if (opt.hasOwnProperty(o)) {
                        _config[o] = opt[o];
                    }
                }
            }
            config.container_tar.style.width = _config.container_w + 'px';
            config.container_tar.style.height = _config.container_h + 'px';
            _config.w_end = _config.w;
            _config.h_end = _config.h;
            //_config.x = _config.container_w / 2 - _config.w / 2;
            //_config.y = _config.container_h / 2 - _config.h / 2;
            _config.x_end = _config.x;
            _config.y_end = _config.y;
            config.drag_box.style.width = _config.w + 'px';
            config.drag_box.style.height = _config.h + 'px';
            config.drag_box.style.left = _config.x + 'px';
            config.drag_box.style.top = _config.y + 'px';
            this.Binding();
        },
        Start: function () { },
        Binding: function () {
            var _cur = this;
            var _fn =
            Common.on2(config.drag_box, 'mousedown', function (e) {
                var _target = e.target || e.srcElement, _type = true, _tar_arr = null;
                //记录鼠标点击时的位置，用于判断移动方向
                _cur.x_start = e.clientX;
                _cur.y_start = e.clientY;
 
                //点击8个调整框其中一个事件
                if (_target.tagName.toLowerCase() == 's') {
                    _type = false;
                }
                else {//移动事件
                    _type = true;
                }
                //设置捕获范围
                if (this.setCapture) {
                    this.setCapture();
                }
                else {
                    if (window.captureEvents) {
                        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP)
                    }
                }
                document.body.style.MozUserSelect = "none";
                document.onselectstart = function () { return false; };
                document.onmousemove = function (event) {
                    event = event || window.event;
                    _cur.MoveIng(event.clientX, event.clientY, _cur, _type, _target);
                };
                document.onmouseup = function (e) {
                    if (config.drag_box.setCapture) {
                        config.drag_box.releaseCapture();
                    }
                    else {
                        if (window.captureEvents) {
                            window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP)
                        }
                    }
                    document.onselectstart = function () { return true; };
                    document.body.style.MozUserSelect = "";
                    _cur.MoveEnd();
                    this.onmousemove = null;
                    this.onmouseup = null;
                };
                if (navigator.userAgent.indexOf('Firefox') >= 0) { return false; }
            });
        },
        MoveIng: function (x, y, cur, t, target) {
            var _x = x - cur.x_start,
                _y = y - cur.y_start,
                x_or_w, y_or_h;
            if (t) {
                x_or_w = (cur.config.x + _x);
                y_or_h = (cur.config.y + _y);
                //范围取值
                x_or_w = x_or_w <= 0 ? 0 : x_or_w;
                y_or_h = y_or_h <= 0 ? 0 : y_or_h;
                if (x_or_w >= (cur.config.container_w - cur.config.w)) {
                    x_or_w = (cur.config.container_w - cur.config.w);
                }
                if (y_or_h >= (cur.config.container_h - cur.config.h)) {
                    y_or_h = (cur.config.container_h - cur.config.h);
                }
                config.drag_box.style.left = x_or_w + 'px';
                config.drag_box.style.top = y_or_h + 'px';
                cur.config.x_end = x_or_w;
                cur.config.y_end = y_or_h;
            }
            else {
                cur.SetStyle(Common.attr(target, 'class'), _x, _y);
                if (cur.config.fnmove) cur.config.fnmove.call(cur, cur.config.x_end, cur.config.y_end, cur.config.w_end, cur.config.h_end);
            }
        },
        SetStyle: function (t, x, y) {
            //e: 东;
            //s: 南;
            //w：西;
            //n：北;
            var _cur = this,
                nw = _cur.config.w,
                nh = _cur.config.h,
                nx = _cur.config.x,
                ny = _cur.config.y;
 
            function _x(x, x_w) {
                x = x >= x_w ? x_w : (x <= 0 ? 0 : x);
                config.drag_box.style.left = x + 'px';
                _cur.config.x_end = x;
            }
            function _y(y, y_h) {
                y = y >= y_h ? y_h : (y <= 0 ? 0 : y);
                config.drag_box.style.top = y + 'px';
                _cur.config.y_end = y;
            }
            function min_w(nw) {
                if (_cur.config.x_end == 0) {
                    return (_cur.config.w + _cur.config.x);
                }
                return nw;
            }
            function min_h(nh) {
                if (_cur.config.y_end == 0) {
                    return (_cur.config.h + _cur.config.y);
                }
                return nh;
            }
            function max_w(nw) {
                return nw >= (_cur.config.container_w - _cur.config.x) ? (_cur.config.container_w - _cur.config.x) : nw;
            }
            function max_h(nh) {
                return nh >= (_cur.config.container_h - _cur.config.y) ? (_cur.config.container_h - _cur.config.y) : nh;
            }
 
            if (t == 'wn') {
                nx = nx + x;
                ny = ny + y;
                _x(nx, (_cur.config.w + _cur.config.x));
                _y(ny, (_cur.config.h + _cur.config.y));
                nw = min_w(nw - x);
                nh = min_h(nh - y);
            }
            else if (t == 'sn') {
                ny = ny + y;
                _y(ny, (_cur.config.h + _cur.config.y));
                nh = min_h(nh - y);
            }
            else if (t == 'en') {
                nw = max_w(nw + x);
                ny = ny + y;
                _y(ny, (_cur.config.h + _cur.config.y));
                nw = max_w(nw + x);
                nh = min_h(nh - y);
            }
            else if (t == 'ew') {
                nx = nx + x;
                _x(nx, (_cur.config.w + _cur.config.x));
                nw = min_w(nw - x);
            }
            else if (t == 'we') {
                nw = max_w(nw + x);
            }
            else if (t == 'ws') {
                nx = nx + x;
                _x(nx, (_cur.config.w + _cur.config.x));
                nw = min_w(nw - x);
                nh = max_h(nh + y);
            }
            else if (t == 'ns') {
                nh = max_h(nh + y);
            }
            else if (t == 'es') {
                nw = max_w(nw + x);
                nh = max_h(nh + y);
            }
            nw = nw <= 0 ? 0 : nw;
            nh = nh <= 0 ? 0 : nh;
            config.drag_box.style.width = nw + 'px';
            config.drag_box.style.height = nh + 'px';
            _cur.config.w_end = nw;
            _cur.config.h_end = nh;
        },
        MoveEnd: function () {
            var _cur = this;
            _cur.config.x = _cur.config.x_end;
            _cur.config.y = _cur.config.y_end;
            _cur.config.w = _cur.config.w_end;
            _cur.config.h = _cur.config.h_end;
            if (_cur.config.fnback) _cur.config.fnback.call(_cur, _cur.config.x, _cur.config.y, _cur.config.w, _cur.config.h);
        }
    }
	
	$(document).on('mouseenter', '.freepanel-widget', function(e){
		var _this = $(this);
		var _this_w = $(_this).width(), _this_h = $(_this).height(), _this_x = $(_this).position().left, _this_y = $(_this).position().top;
		$('.freepanel-widget').removeClass('drag-box');
		$(this).addClass('drag-box');
		config.drag_box = $(this)[0];
		config.container_tar = $(this).parent()[0];
		
		// init
		Drag.Init({
        w: _this_w,
        h: _this_h,
		x: _this_x,
		y: _this_y,
        fnmove: function (x, y, w, h) {
            //var domimg = getbyid('img');
            //domimg.style.width = w + 'px';
            //domimg.style.height = h + 'px';
            //console.log('x:' + x + '\n' + 'y:' + y + '\n' + 'w:' + w + '\n' + 'h:' + h + '\n');
        },
        fnback: function (x, y, w, h) {
            console.log('x:' + x + '\n' + 'y:' + y + '\n' + 'w:' + w + '\n' + 'h:' + h + '\n');
        }
        });
	});
	
	$(document).on('mouseleave', '.freepanel-widget', function(e){
		$('.freepanel-widget').removeClass('drag-box');
	});
	
	
    
}(window);
