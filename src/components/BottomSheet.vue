<script setup>
import { ref, useId, onMounted, onUnmounted, nextTick } from 'vue'
defineProps({ title: { type: String, required: true }, description: { type: String, default: '选择后，点击页面上的确认训练才会保存' } })
const emit = defineEmits(['close'])
const dialog = ref(null), closeButton = ref(null), id = useId()
let previousFocus, scrollX, scrollY, previousStyles
const styleNames = ['position', 'top', 'left', 'right', 'overflow', 'paddingRight']
function trapFocus(event) {
  if (event.key !== 'Tab') return
  const targets = [...dialog.value.querySelectorAll('button:not(:disabled), [href], [tabindex="0"]')]
  if (!targets.length) return
  event.preventDefault()
  const index = targets.indexOf(document.activeElement)
  const next = index < 0 ? (event.shiftKey ? targets.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + targets.length) % targets.length
  targets[next].focus({ preventScroll: true })
}
function outsideClick(event) {
  if (event.target !== dialog.value) return
  const box = dialog.value.getBoundingClientRect()
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) emit('close')
}
onMounted(() => {
  previousFocus = document.activeElement; scrollX = window.scrollX; scrollY = window.scrollY
  previousStyles = Object.fromEntries(styleNames.map(name => [name, document.body.style[name]]))
  const scrollbar = innerWidth - document.documentElement.clientWidth
  const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0
  Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, left: `-${scrollX}px`, right: '0', overflow: 'hidden', paddingRight: `${padding + scrollbar}px` })
  dialog.value.showModal(); closeButton.value.focus({ preventScroll: true })
})
onUnmounted(async () => {
  dialog.value?.close()
  if (previousStyles) Object.assign(document.body.style, previousStyles)
  window.scrollTo({ left: scrollX ?? 0, top: scrollY ?? 0, behavior: 'instant' })
  await nextTick()
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
})
</script>
<template>
<Teleport to="body"><dialog ref="dialog" class="bottom-sheet" aria-modal="true" :aria-labelledby="`${id}-title`" @cancel.prevent="emit('close')" @keydown="trapFocus" @click="outsideClick">
  <div class="sheet-handle" aria-hidden="true" />
  <header class="sheet-header"><div><h2 :id="`${id}-title`">{{ title }}</h2><p v-if="description">{{ description }}</p></div><button ref="closeButton" type="button" class="sheet-close" aria-label="关闭选择" @click="emit('close')"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" /></svg></button></header>
  <div class="sheet-content"><slot /></div>
</dialog></Teleport>
</template>
<style scoped>
.bottom-sheet{box-sizing:border-box;position:fixed;inset:auto 0 0;margin:0 auto;width:min(100%,650px);max-width:100%;max-height:calc(85dvh - env(safe-area-inset-top));padding:0 0 env(safe-area-inset-bottom);border:0;border-radius:28px 28px 0 0;background:#fff;color:#202B3F;box-shadow:0 -8px 40px #202b3f16;overflow:hidden}.bottom-sheet[open]{display:flex;flex-direction:column}.bottom-sheet::backdrop{background:rgb(32 43 63 / 28%);backdrop-filter:blur(3px)}.sheet-handle{width:36px;height:5px;min-height:5px;border-radius:4px;margin:10px auto 17px;background:#DCE1EB}.sheet-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:0 22px 18px;border-bottom:1px solid #F0F2F7}.sheet-header h2{margin:0;font-size:21px;line-height:1.5;font-weight:700;letter-spacing:-.3px}.sheet-header p{margin:4px 0 0;color:#8390A4;font-size:11px;line-height:1.6}.sheet-close{display:grid;place-items:center;flex-shrink:0;width:36px;height:36px;margin-top:2px;padding:0;border:0;border-radius:50%;background:#F2F4F8;color:#748197}.sheet-close svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}.sheet-content{min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:16px 20px 24px}.sheet-close:focus-visible{outline:3px solid #B8ADF0;outline-offset:2px}@media(prefers-reduced-motion:no-preference){.bottom-sheet[open]{animation:sheet-in .18s ease-out}@keyframes sheet-in{from{transform:translateY(24px);opacity:.6}to{transform:translateY(0);opacity:1}}}
</style>
