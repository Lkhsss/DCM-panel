/**
 * 响应式工具函数集合
 */

/**
 * 判断当前是否为移动设备
 */
export function isMobile(): boolean {
  return window.innerWidth < 768
}

/**
 * 判断当前是否为平板设备
 */
export function isTablet(): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

/**
 * 判断当前是否为桌面设备
 */
export function isDesktop(): boolean {
  return window.innerWidth >= 1024
}

/**
 * 获取当前视口宽度
 */
export function getViewportWidth(): number {
  return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
}

/**
 * 获取当前视口高度
 */
export function getViewportHeight(): number {
  return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
}

/**
 * 判断是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return (
    (typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        (navigator as any).maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0)) ||
    false
  )
}

/**
 * 判断是否为iOS设备
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * 判断是否为Android设备
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

/**
 * 判断是否为横屏模式
 */
export function isLandscape(): boolean {
  return window.innerHeight < window.innerWidth
}

/**
 * 判断是否为竖屏模式
 */
export function isPortrait(): boolean {
  return window.innerHeight >= window.innerWidth
}

/**
 * 获取安全区域信息 (用于刘海屏等)
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseFloat(style.getPropertyValue('--safe-area-inset-top') || '0'),
    left: parseFloat(style.getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseFloat(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseFloat(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
  }
}

/**
 * 防止移动端双击缩放
 */
export function preventMobileZoom() {
  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    false,
  )
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}
