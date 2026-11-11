<script setup>
import { ref, useId, onMounted, onUnmounted, nextTick } from 'vue'
const props = defineProps({
  title: { type: String, required: true }, description: { type: String, required: true },
  confirmLabel: { type: String, default: '确定' }, cancelLabel: { type: String, default: '取消' },
  danger: { type: Boolean, default: false }, error: String, busy: Boolean, fallbackFocus: Function,
})
const emit = defineEmits(['cancel', 'confirm'])
const dialog = ref(null), cancelButton = ref(null)
const id = useId()
let previousFocus, scrollX, scrollY, previousStyles
const styleNames = ['position', 'top', 'left', 'right', 'overflow', 'paddingRight']
function cancel() { if (!props.busy) emit('cancel') }
function trapFocus(event) {
  if (event.key !== 'Tab') return
  event.preventDefault()
  const buttons = [...dialog.value.querySelectorAll('button:not(:disabled)')]
  if (!buttons.length) { dialog.value.focus({ preventScroll: true }); return }
  const index = buttons.indexOf(document.activeElement)
  const next = index < 0 ? (event.shiftKey ? buttons.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length
  buttons[next].focus({ preventScroll: true })
}
onMounted(() => {
  previousFocus = document.activeElement
  scrollX = window.scrollX; scrollY = window.scrollY
  previousStyles = Object.fromEntries(styleNames.map(name => [name, document.body.style[name]]))
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0
  Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, left: `-${scrollX}px`, right: '0', overflow: 'hidden', paddingRight: `${padding + scrollbar}px` })
  dialog.value.showModal()
  cancelButton.value.focus({ preventScroll: true })
})
onUnmounted(async () => {
  dialog.value?.close()
  if (previousStyles) Object.assign(document.body.style, previousStyles)
  window.scrollTo({ left: scrollX ?? 0, top: scrollY ?? 0, behavior: 'instant' })
  await nextTick()
  const target = previousFocus?.isConnected && !previousFocus.disabled ? previousFocus : props.fallbackFocus?.()
  target?.focus({ preventScroll: true })
})
</script>
<template>
<Teleport to="body"><dialog ref="dialog" class="confirm-dialog" tabindex="-1" role="alertdialog" aria-modal="true" :aria-labelledby="`${id}-title`" :aria-describedby="`${id}-description`" :aria-busy="busy" @cancel.prevent="cancel" @keydown="trapFocus">
  <div class="confirm-copy"><h2 :id="`${id}-title`">{{ title }}</h2><p :id="`${id}-description`">{{ description }}</p><p v-if="error" class="confirm-error" role="alert">{{ error }}</p></div>
  <div class="confirm-actions"><button ref="cancelButton" type="button" autofocus :disabled="busy" @click="cancel">{{ cancelLabel }}</button><button type="button" :class="{ dangerous: danger }" :disabled="busy" @click="emit('confirm')">{{ busy ? '处理中…' : confirmLabel }}</button></div>
</dialog></Teleport>
</template>
<style scoped>
.confirm-dialog{position:fixed;inset:0;margin:auto;box-sizing:border-box;width:320px;max-width:calc(100vw - 40px);max-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 40px);padding:0;border:0;border-radius:22px;background:#fff;color:#242429;box-shadow:0 8px 28px #00000017;overflow:auto;overscroll-behavior:contain}.confirm-dialog::backdrop{background:rgb(0 0 0 / 35%)}.confirm-copy{box-sizing:border-box;min-height:113.5px;padding:23px 20px 24px;text-align:center}.confirm-copy h2{margin:0 0 8px;font-size:17.5px;line-height:26px;font-weight:700;color:#242429}.confirm-copy p{margin:0;color:#7A7A80;font-size:13px;line-height:20px;overflow-wrap:anywhere}.confirm-copy .confirm-error{margin-top:12px;color:#A32C35}.confirm-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:.5px solid #E5E5EA}.confirm-actions button{min-width:0;min-height:52px;padding:12px 8px;background:#fff;color:#6658DB;border:0;border-radius:0;font:inherit;font-size:17px;line-height:20px}.confirm-actions button+button{border-left:.5px solid #E5E5EA}.confirm-actions .dangerous{color:#E5484D;font-weight:700}.confirm-actions button:active:not(:disabled){background:#F7F5FF}.confirm-actions button:focus-visible{outline:2px solid #9C8EED;outline-offset:-4px}.confirm-actions button:disabled{opacity:.5;cursor:wait}
</style>
