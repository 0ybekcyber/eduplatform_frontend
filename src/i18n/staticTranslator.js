import { useLanguageStore, translateStaticText } from '../stores/language'

const textOriginals = new WeakMap()
const attrOriginals = new WeakMap()
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'])
const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label']

const canTranslateNode = (node) => {
  const parent = node.parentElement
  if (!parent || SKIP_TAGS.has(parent.tagName) || parent.isContentEditable) return false
  return Boolean(node.nodeValue?.trim())
}

const getOriginalAttr = (element, attr) => {
  let map = attrOriginals.get(element)
  if (!map) {
    map = new Map()
    attrOriginals.set(element, map)
  }
  if (!map.has(attr)) map.set(attr, element.getAttribute(attr) || '')
  return map.get(attr)
}

const translateElementAttributes = (element, locale) => {
  TRANSLATABLE_ATTRS.forEach((attr) => {
    if (!element.hasAttribute(attr)) return
    const original = getOriginalAttr(element, attr)
    element.setAttribute(attr, translateStaticText(original, locale))
  })
}

const translateTextNode = (node, locale) => {
  if (!canTranslateNode(node)) return
  if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue)
  let original = textOriginals.get(node)
  const expectedCurrent = translateStaticText(original, locale)
  if (node.nodeValue !== original && node.nodeValue !== expectedCurrent) {
    original = node.nodeValue
    textOriginals.set(node, original)
  }
  const translated = translateStaticText(original, locale)
  if (node.nodeValue !== translated) node.nodeValue = translated
}

const walkAndTranslate = (root, locale) => {
  if (!root) return

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, locale)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE) return
  if (SKIP_TAGS.has(root.tagName) || root.isContentEditable) return

  translateElementAttributes(root, locale)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)

  let node = walker.currentNode
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node, locale)
    else if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node, locale)
    node = walker.nextNode()
  }
}

export const installStaticTranslator = (app) => {
  app.config.globalProperties.$tStatic = (text) => {
    const languageStore = useLanguageStore()
    return translateStaticText(text, languageStore.locale)
  }

  if (typeof window === 'undefined') return

  let observer = null
  let scheduled = false

  const apply = () => {
    const languageStore = useLanguageStore()
    document.documentElement.lang = languageStore.locale
    walkAndTranslate(document.getElementById('app'), languageStore.locale)
  }

  const scheduleApply = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      apply()
    })
  }

  window.addEventListener('portal-language-change', scheduleApply)

  app.mixin({
    mounted() {
      scheduleApply()
    },
    updated() {
      scheduleApply()
    }
  })

  setTimeout(() => {
    apply()
    observer = new MutationObserver(scheduleApply)
    const root = document.getElementById('app')
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: TRANSLATABLE_ATTRS
      })
    }
  }, 0)

  window.addEventListener('beforeunload', () => observer?.disconnect())
}
