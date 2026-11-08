<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
const emit=defineEmits(['close'])
const closeButton=ref(null)
let previousFocus
onMounted(()=>{previousFocus=document.activeElement;closeButton.value?.focus()})
onUnmounted(()=>previousFocus?.isConnected && previousFocus.focus())
const colors=['#ff779e','#ffb65c','#ffe77a','#80e6a5','#75d8ff','#a796ff','#ee9dff']
const particles=Array.from({length:84},(_,i)=>{const angle=(i%21)/21*Math.PI*2;const radius=65+(i%5)*18;return {left:[23,72,38,78][Math.floor(i/21)]+'%',top:[27,24,65,61][Math.floor(i/21)]+'%', '--x':Math.cos(angle)*radius+'px','--y':Math.sin(angle)*radius+'px','--color':colors[i%7],'--delay':Math.floor(i/21)*.48+'s'}})
</script>
<template><Teleport to="body"><div class="celebration" @keydown.esc="emit('close')"><div class="fireworks" aria-hidden="true"><i v-for="(style,index) in particles" :key="index" :style="style" /></div><section class="congrats-card" role="dialog" aria-modal="true" aria-labelledby="congrats-title"><span class="congrats-star" aria-hidden="true">✦</span><p>今天的努力，值得庆祝</p><h2 id="congrats-title">恭喜完成今日挑战！</h2><p>又解开一道题，也让思路更清晰了一点。<br />认真坚持的你，正在慢慢变强。</p><button ref="closeButton" class="primary-button" @click="emit('close')" @keydown.tab.prevent="closeButton?.focus()">收下这份鼓励</button></section></div></Teleport></template>
<style scoped>
.celebration{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:24px;background:#0d0c10dd;backdrop-filter:blur(10px)}.fireworks{position:absolute;inset:0;overflow:hidden;pointer-events:none}.fireworks i{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--color);box-shadow:0 0 10px var(--color);opacity:0;animation:burst 1.6s ease-out var(--delay) 2}.congrats-card{position:relative;max-width:390px;width:100%;padding:32px 24px;text-align:center;border:1px solid #c294ec66;border-radius:28px;background:linear-gradient(150deg,#392447,#1f1927 70%);box-shadow:0 20px 90px #ae73ea22}.congrats-star{display:block;font-size:54px;color:#e2bbff;margin-bottom:18px}.congrats-card h2{font-size:24px;line-height:1.5;color:#f3f0fa}.congrats-card p{font-size:13px;line-height:1.9;color:#d0bddd}.congrats-card .primary-button{justify-content:center;margin-top:26px}@keyframes burst{0%{opacity:0;transform:translate(0,0) scale(.3)}12%{opacity:1}80%{opacity:.65}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(.2)}}@media(prefers-reduced-motion:reduce){.fireworks{display:none}.celebration{backdrop-filter:none}}
</style>
