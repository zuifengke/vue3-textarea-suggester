<template>
  <div
    class="suggester"
    ref="suggesterRef"
    :style="{'--minWidth': minWidth, 'display': matchedStr ? 'block' : 'none' }"
  >
    <ul class="suggester-list">
      <!--      <li v-show="remote && loading">-->
      <!--        <vue-loading/>-->
      <!--      </li>-->
      <li
        class="suggester-list-item"
        v-for="(d, i) in data"
        :key="i"
        :class="{active: i === activeIndex}"
        @click="enter(i)"
      >
        <!--        <slot :data="d">-->
        <!--          <strong>{{d.label}}</strong>-->
        <!--        </slot>-->
        <strong>{{ d.label }}</strong>
      </li>
    </ul>
  </div>

</template>
<script setup>
import {ref, watch, onMounted, onBeforeUnmount, getCurrentInstance, nextTick} from 'vue';
import {getCursorPos} from "./getCursorPos.js";
import {on, off, debounce} from "../../utils/dom.js";
import VueLoading from '../loading/index.js';

// 定义 props
const props = defineProps({
  value: {
    type: Array,
    default: () => []
  },
  rules: {
    type: Array,
    default: () => []
  },
  target: {
    type: HTMLTextAreaElement,
    required: true
  },
  minWidth: {
    type: String,
    default: "180px"
  },
  options: {
    type: Array,
    default: () => []
  },
  debounceTime: {
    type: Number,
    default: 300
  },
  loading: Boolean,
  remote: {
    type: Boolean,
    default: false
  }
});

// 定义 emits
const emits = defineEmits(['input', 'change', 'matched']);
// 定义响应式数据
// 创建一个 ref 来引用 .suggester 元素
const suggesterRef = ref(null);
const reftest = ref(null);
const data = ref([]);
const startIndex = ref(null);
const focusIndex = ref(null);
const activeIndex = ref(null);
const matchedRule = ref({});
const matchedStr = ref("1");
const menu = ref(null);
// 监听 options 变化
watch(() => props.options, async (val) => {
  await nextTick(); // 等待 DOM 更新
  console.log('options changed', props.options)
  if (props.remote) {
    data.value = val;
  }
}, {deep: true});

// 定义防抖函数
const debouncedChange = debounce(props.debounceTime, () => {
  change();
});

// 显示建议框位置
const showPosition = async () => {
  activeIndex.value = 0;
  console.log('suggesterRef', suggesterRef.value)
  if (suggesterRef.value) {
    const pos = getCursorPos.getInputPositon(props.target, startIndex.value);
    suggesterRef.value.style.top = pos.bottom + "px";
    suggesterRef.value.style.left = pos.left + "px";
  }
};

// 处理输入变化
const change = (count) => {
  if (!props.target) return;
  const value = props.target.value;
  focusIndex.value = getCursorPos._getFocus(props.target);
  if (count) {
    if (count === "-") {
      focusIndex.value = focusIndex.value > 0 ? focusIndex.value - 1 : 0;
    } else if (count === "+") {
      focusIndex.value = focusIndex.value < value.length ? focusIndex.value + 1 : value.length;
    }
  }
  // 确定起始点并截取字符串
  const fristBlank = value.lastIndexOf(" ", focusIndex.value - 1);
  const fristEnter = value.lastIndexOf("\n", focusIndex.value - 1);
  startIndex.value = fristBlank > fristEnter ? fristBlank + 1 : fristEnter + 1;
  const str = value.substring(startIndex.value, focusIndex.value);

  // 自下而上匹配规则
  matchedRule.value = props.rules.find(d => d.rule.exec(str));
  matchedStr.value = matchedRule.value && matchedRule.value.rule
    ? str.match(matchedRule.value.rule)[0]
    : null;
  if (matchedStr.value) {
    const query = str.substring(matchedStr.value.length);
    // 是否远程匹配
    if (props.remote) {
      data.value = [];
    } else {
      data.value = (matchedRule.value.data || []).filter(
        d => d.label && d.label.indexOf(query) > -1
      );
    }
    emits('matched', matchedStr.value, query, matchedRule.value);
    showPosition();
  }
};

// 处理按键事件
const keyDown = (e) => {
  switch (e.key) {
    case "ArrowLeft":
      change("-");
      break;
    case "ArrowRight":
      change("+");
      break;
    case "ArrowUp":
      if (matchedStr.value) {
        e.preventDefault();
        activeIndex.value = activeIndex.value > 0
          ? activeIndex.value - 1
          : data.value.length - 1;
      }
      break;
    case "ArrowDown":
      if (matchedStr.value) {
        e.preventDefault();
        activeIndex.value = activeIndex.value < data.value.length - 1
          ? activeIndex.value + 1
          : 0;
      }
      break;
    case "Enter":
      if (matchedStr.value) {
        e.preventDefault();
        enter();
      }
      break;
    default:
      break;
  }
};

// 处理选择项
const enter = (index) => {
  if (!matchedStr.value || !props.target) return;
  const value = props.target.value;
  const activeIndexValue = index !== undefined ? index : activeIndex.value;
  // 是否远程匹配
  const option = props.remote
    ? props.options[activeIndexValue]
    : data.value[activeIndexValue];
  const startStr = value.slice(0, startIndex.value);
  const endStr = value.slice(focusIndex.value);
  if (
    matchedRule.value.enterExtract !== false &&
    !props.value.find(
      d => d.rule === matchedStr.value && d.label === option.label
    )
  ) {
    const merge = [...props.value, {rule: matchedStr.value, label: option.label}];
    emits('input', merge);
    emits('change', merge);
  }
  // 拼接字符串
  props.target.value = `${startStr}${matchedStr.value}${option.label}${matchedRule.value.enterAdd || " "}${endStr}`;
  if (
    typeof props.target.selectionStart === "number" &&
    typeof props.target.selectionEnd === "number"
  ) {
    props.target.selectionStart = props.target.selectionEnd =
      startStr.length + matchedStr.value.length + option.label.length + 1;
  } else {
    alert("Error: Browser version is too low");
  }
  matchedStr.value = null;
  props.target.focus();
  change();
};

// 生命周期钩子
onMounted(async () => {
  await nextTick(); // 确保 DOM 更新
  if (suggesterRef.value) {
    console.log('suggesterRef 已挂载:', suggesterRef.value);
  }
  setTimeout(() => {
    on(props.target, "keydown", keyDown);
    on(props.target, "click", change);
  }, 100);
});

onBeforeUnmount(() => {
  off(props.target, "keydown", keyDown);
  off(props.target, "click", change);
});
// 暴露 change 方法，让父组件可以调用
defineExpose({
  change
});
</script>
<script>
export default {
  name: 'vue3-textarea-suggester',
}
</script>
