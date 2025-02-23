import Vue, { createElementBlock, openBlock, normalizeStyle, Fragment, renderList, resolveComponent, withDirectives, createElementVNode, createVNode, vShow, normalizeClass, renderSlot, toDisplayString } from 'vue';

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

var getCursorPos = {
  /**
   * 获取输入光标在页面中的坐标
   * @param		{HTMLElement}	输入框元素        
   * @return		{Object}		返回left和top,bottom
   */
  getInputPositon: function getInputPositon(elem, startIndex) {
    if (document.selection) {
      //IE Support
      elem.focus();
      var Sel = document.selection.createRange();
      return {
        left: Sel.boundingLeft,
        top: Sel.boundingTop,
        bottom: Sel.boundingTop + Sel.boundingHeight
      };
    } else {
      var cloneDiv = '{$clone_div}',
        cloneLeft = '{$cloneLeft}',
        cloneFocus = '{$cloneFocus}';
      var none = '<span style="white-space:pre-wrap;"> </span>';
      var div = elem[cloneDiv] || document.createElement('div'),
        focus = elem[cloneFocus] || document.createElement('span');
      var text = elem[cloneLeft] || document.createElement('span');
      var offset = this._offset(elem),
        focusOffset = {
          left: 0,
          top: 0
        };
      if (!elem[cloneDiv]) {
        elem[cloneDiv] = div, elem[cloneFocus] = focus;
        elem[cloneLeft] = text;
        div.appendChild(text);
        div.appendChild(focus);
        document.body.appendChild(div);
        focus.innerHTML = '|';
        focus.style.cssText = 'display:inline-block;width:0px;overflow:hidden;z-index:-100;word-wrap:break-word;word-break:break-all;';
        div.className = this._cloneStyle(elem);
        div.style.cssText = 'visibility:hidden;display:inline-block;position:absolute;z-index:-100;word-wrap:break-word;word-break:break-all;overflow:hidden;';
      }
      div.style.left = offset.left + "px";
      div.style.top = offset.top + "px";
      var strTmp = elem.value.substring(0, startIndex).replace(/</g, '<').replace(/>/g, '>').replace(/\n/g, '<br/>').replace(/\s/g, none);
      text.innerHTML = strTmp;
      focus.style.display = 'inline-block';
      try {
        focusOffset = this._offset(focus);
      } catch (e) {}
      focus.style.display = 'none';
      return {
        left: focusOffset.left,
        top: focusOffset.top,
        bottom: focusOffset.bottom
      };
    }
  },
  // 克隆元素样式并返回类
  _cloneStyle: function _cloneStyle(elem, cache) {
    if (!cache && elem['${cloneName}']) return elem['${cloneName}'];
    var className,
      name,
      rstyle = /^(number|string)$/;
    var rname = /^(content|outline|outlineWidth)$/; //Opera: content; IE8:outline && outlineWidth
    var cssText = [],
      sStyle = elem.style;
    for (name in sStyle) {
      if (!rname.test(name)) {
        var val = this._getStyle(elem, name);
        if (val !== '' && rstyle.test(_typeof(val))) {
          // Firefox 4
          name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
          cssText.push(name);
          cssText.push(':');
          cssText.push(val);
          cssText.push(';');
        }
      }
    }
    cssText = cssText.join('');
    elem['${cloneName}'] = className = 'clone' + new Date().getTime();
    this._addHeadStyle('.' + className + '{' + cssText + '}');
    return className;
  },
  // 向页头插入样式
  _addHeadStyle: function _addHeadStyle(content) {
    var style = this._style[document];
    if (!style) {
      style = this._style[document] = document.createElement('style');
      document.getElementsByTagName('head')[0].appendChild(style);
    }
    style.styleSheet && (style.styleSheet.cssText += content) || style.appendChild(document.createTextNode(content));
  },
  _style: {},
  // 获取最终样式
  _getStyle: 'getComputedStyle' in window ? function (elem, name) {
    return getComputedStyle(elem, null)[name];
  } : function (elem, name) {
    return elem.currentStyle[name];
  },
  _getFocus: function _getFocus(elem) {
    var index = 0;
    if (document.selection) {
      // IE Support
      elem.focus();
      var Sel = document.selection.createRange();
      if (elem.nodeName === 'TEXTAREA') {
        //textarea
        var Sel2 = Sel.duplicate();
        Sel2.moveToElementText(elem);
        var index = -1;
        while (Sel2.inRange(Sel)) {
          Sel2.moveStart('character');
          index++;
        }
      } else if (elem.nodeName === 'INPUT') {
        // input
        Sel.moveStart('character', -elem.value.length);
        index = Sel.text.length;
      }
    } else if (elem.selectionStart || elem.selectionStart == '0') {
      // Firefox support
      index = elem.selectionStart;
    }
    return index;
  },
  // 获取元素在页面中位置
  _offset: function _offset(elem) {
    var box = elem.getBoundingClientRect(),
      doc = elem.ownerDocument,
      body = doc.body,
      docElem = doc.documentElement;
    var clientTop = docElem.clientTop || body.clientTop || 0,
      clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop,
      left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
    return {
      left: left,
      top: top,
      right: left + box.width,
      bottom: top + box.height
    };
  }
};

var isServer = Vue.prototype.$isServer;

// 用来绑定事件的方法，它是一个自执行的函数，会根据是否运行于服务器和是否支持addEventListener来返回一个function
var on = function () {
  if (!isServer && document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, function (e) {
          handler(e);
        }, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, function (e) {
          handler(e);
        });
      }
    };
  }
}();

// 解除绑定事件
var off = function () {
  if (!isServer && document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
}();
var debounce = function debounce(delay, atBegin, callback) {
  return callback === undefined ? throttle(delay, atBegin, false) : throttle(delay, callback, atBegin !== false);
};
var throttle = function throttle(delay, noTrailing, callback, debounceMode) {
  var timeoutID;
  var cancelled = false;
  var lastExec = 0;
  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  }

  // Function to cancel next exec
  function cancel() {
    clearExistingTimeout();
    cancelled = true;
  }

  // `noTrailing` defaults to falsy.
  if (typeof noTrailing !== 'boolean') {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = undefined;
  }
  function wrapper() {
    var self = this;
    var elapsed = Date.now() - lastExec;
    var args = arguments;
    if (cancelled) {
      return;
    }
    function exec() {
      lastExec = Date.now();
      callback.apply(self, args);
    }
    function clear() {
      timeoutID = undefined;
    }
    if (debounceMode && !timeoutID) {
      exec();
    }
    clearExistingTimeout();
    if (debounceMode === undefined && elapsed > delay) {
      exec();
    } else if (noTrailing !== true) {
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
    }
  }
  wrapper.cancel = cancel;
  return wrapper;
};

var script$1 = {
  props: {
    number: {
      type: Number,
      default: 6
    },
    size: {
      type: Number,
      default: 20
    },
    dotWidth: {
      type: Number,
      default: 6
    },
    dotHeight: {
      type: Number,
      default: 6
    },
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  computed: {
    style() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`
      };
    },
    avd() {
      return 360 / this.number;
    },
    ahd() {
      return this.avd * Math.PI / 180;
    },
    radius() {
      return this.size / 2;
    }
  },
  methods: {
    dotStyle(index) {
      var style = {
        width: `${this.dotWidth}px`,
        height: `${this.dotHeight}px`,
        left: this.getLeft(index),
        top: this.getTop(index),
        animationDelay: `-${index * 0.1}s`,
        backgroundColor: this.color
      };
      return style;
    },
    getLeft(index) {
      return Math.sin(this.ahd * index) * this.radius + (this.size - this.dotWidth) / 2 + "px";
    },
    getTop(index) {
      return Math.cos(this.ahd * index) * this.radius + (this.size - this.dotHeight) / 2 + "px";
    }
  },
  mounted() {}
};

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", {
    class: "vue-loading vue-loading-spin",
    style: normalizeStyle($options.style)
  }, [(openBlock(true), createElementBlock(Fragment, null, renderList($props.number, function (d, i) {
    return openBlock(), createElementBlock("i", {
      key: i,
      style: normalizeStyle($options.dotStyle(i))
    }, null, 4 /* STYLE */);
  }), 128 /* KEYED_FRAGMENT */))], 4 /* STYLE */);
}

script$1.render = render$1;
script$1.__file = "src/components/loading/loading.vue";

var script = {
  name: "vue-textarea-suggester",
  components: {
    VueLoading: script$1
  },
  props: {
    value: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    rules: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    target: HTMLTextAreaElement,
    minWidth: {
      type: String,
      default: "180px"
    },
    options: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    debounce: {
      type: Number,
      default: 300
    },
    loading: Boolean,
    remote: Boolean
  },
  data() {
    return {
      data: [],
      startIndex: null,
      focusIndex: null,
      activeIndex: null,
      matchedRule: {},
      matchedStr: null
    };
  },
  watch: {
    options(val) {
      this.remote && (this.data = val);
    }
  },
  created() {
    this.debouncedChange = debounce(this.debounce, this.change);
  },
  methods: {
    showPosition() {
      // !document.body.contains(this.$el) && document.body.appendChild(this.$el);
      this.activeIndex = 0;
      var pos = getCursorPos.getInputPositon(this.target, this.startIndex);
      this.$el.style.top = pos.bottom + "px";
      this.$el.style.left = pos.left + "px";
    },
    change(count) {
      if (!this.target) return;
      var value = this.target.value;
      this.focusIndex = getCursorPos._getFocus(this.target);
      if (count) {
        if (count === "-") {
          this.focusIndex = this.focusIndex > 0 ? this.focusIndex - 1 : 0;
        } else if (count === "+") {
          this.focusIndex = this.focusIndex < value.length ? this.focusIndex + 1 : value.length;
        }
      }
      // 确定起始点并截取字符串
      var fristBlank = value.lastIndexOf(" ", this.focusIndex - 1);
      var fristEnter = value.lastIndexOf("\n", this.focusIndex - 1);
      this.startIndex = fristBlank > fristEnter ? fristBlank + 1 : fristEnter + 1;
      var str = value.substring(this.startIndex, this.focusIndex);

      // 自下而上匹配规则
      this.matchedRule = this.rules.find(function (d) {
        return d.rule.exec(str);
      });
      this.matchedStr = this.matchedRule && this.matchedRule.rule ? str.match(this.matchedRule.rule)[0] : null;
      if (this.matchedStr) {
        var query = str.substring(this.matchedStr.length);
        // 是否远程匹配
        if (this.remote) {
          this.data = [];
        } else {
          this.data = (this.matchedRule.data || []).filter(function (d) {
            return d.label && d.label.indexOf(query) > -1;
          });
        }
        this.$emit("matched", this.matchedStr, query, this.matchedRule);
        this.showPosition();
      }
    },
    keyDown(e) {
      switch (e.key) {
        case "ArrowLeft":
          this.change("-");
          break;
        case "ArrowRight":
          this.change("+");
          break;
        case "ArrowUp":
          if (this.matchedStr) {
            e.preventDefault();
            this.activeIndex = this.activeIndex > 0 ? this.activeIndex - 1 : this.data.length - 1;
          }
          break;
        case "ArrowDown":
          if (this.matchedStr) {
            e.preventDefault();
            this.activeIndex = this.activeIndex < this.data.length - 1 ? this.activeIndex + 1 : 0;
          }
          break;
        case "Enter":
          if (this.matchedStr) {
            e.preventDefault();
            this.enter();
          }
          break;
      }
    },
    enter(index) {
      var _this = this;
      if (!this.matchedStr || !this.target) return;
      var value = this.target.value;
      var activeIndex = index !== undefined ? index : this.activeIndex;
      // 是否远程匹配
      var option = this.remote ? this.options[activeIndex] : this.data[activeIndex];
      var startStr = value.slice(0, this.startIndex);
      var endStr = value.slice(this.focusIndex);
      if (this.matchedRule.enterExtract !== false && !this.value.find(function (d) {
        return d.rule === _this.matchedStr && d.label === option.label;
      })) {
        var merge = this.value.concat([{
          rule: this.matchedStr,
          label: option.label
        }]);
        this.$emit("input", merge);
        this.$emit("change", merge);
      }
      // 拼接字符串
      this.target.value = `${startStr}${this.matchedStr}${option.label}${this.matchedRule.enterAdd || " "}${endStr}`;
      if (typeof this.target.selectionStart === "number" && typeof this.target.selectionEnd === "number") {
        this.target.selectionStart = this.target.selectionEnd = startStr.length + this.matchedStr.length + option.label.length + 1;
      } else {
        alert("Error: Browser version is too low");
      }
      this.matchedStr = null;
      this.target.focus();
      this.change();
    }
  },
  mounted() {
    var _this2 = this;
    this.$nextTick(function () {
      setTimeout(function () {
        on(_this2.target, "keydown", _this2.keyDown);
        on(_this2.target, "click", _this2.change);
      }, 100);
    });
  },
  beforeDestroy() {
    off(this.target, "keydown", this.keyDown);
    off(this.target, "click", this.change);
  }
};

var _hoisted_1 = {
  class: "suggester-list"
};
var _hoisted_2 = ["onClick"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_vue_loading = resolveComponent("vue-loading");
  return openBlock(), createElementBlock("div", {
    class: "suggester",
    style: normalizeStyle({
      '--minWidth': $props.minWidth,
      'display': $data.matchedStr ? 'block' : 'none'
    })
  }, [withDirectives(createElementVNode("ul", _hoisted_1, [withDirectives(createElementVNode("li", null, [createVNode(_component_vue_loading)], 512 /* NEED_PATCH */), [[vShow, $props.remote && $props.loading]]), (openBlock(true), createElementBlock(Fragment, null, renderList($data.data, function (d, i) {
    return openBlock(), createElementBlock("li", {
      class: normalizeClass(["suggester-list-item", {
        active: i === $data.activeIndex
      }]),
      key: i,
      onClick: function onClick($event) {
        return $options.enter(i);
      }
    }, [renderSlot(_ctx.$slots, "default", {
      data: d
    }, function () {
      return [createElementVNode("strong", null, toDisplayString(d.label), 1 /* TEXT */)];
    })], 10 /* CLASS, PROPS */, _hoisted_2);
  }), 128 /* KEYED_FRAGMENT */))], 512 /* NEED_PATCH */), [[vShow, $data.matchedStr]])], 4 /* STYLE */);
}

script.render = render;
script.__file = "src/components/suggester/suggester.vue";

var components = [script];
var plugin = {
  install(Vue) {
    components.forEach(function (component) {
      Vue.component(component.name, component);
    });
  }
};
// Auto-install
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export { plugin as default };
