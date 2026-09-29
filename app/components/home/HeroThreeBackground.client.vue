<template>
  <div ref="host" class="hero-three-background" aria-hidden="true">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import type * as Three from 'three'

interface FloatingObject {
  group: Three.Group
  baseX: number
  drift: number
  phase: number
  speed: number
  spinX: number
  spinY: number
}

interface NavigatorWithPerformanceHints extends Navigator {
  connection?: { saveData?: boolean }
  deviceMemory?: number
}

const host = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | undefined

onBeforeUnmount(() => cleanup?.())

onMounted(async () => {
  const performanceNavigator = navigator as NavigatorWithPerformanceHints
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const constrainedDevice = performanceNavigator.connection?.saveData
    || (performanceNavigator.deviceMemory !== undefined && performanceNavigator.deviceMemory <= 2)
    || (performanceNavigator.hardwareConcurrency !== undefined && performanceNavigator.hardwareConcurrency <= 2)

  if (reducedMotion.matches || constrainedDevice || !host.value || !canvas.value) return

  const THREE = await import('three')
  if (!host.value || !canvas.value) return

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30)
  camera.position.z = 8

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: window.innerWidth >= 768,
    canvas: canvas.value,
    powerPreference: 'low-power',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  scene.add(new THREE.HemisphereLight(0xffffff, 0x88a6d8, 1.8))
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(3, 5, 6)
  scene.add(keyLight)

  const geometries = new Set<Three.BufferGeometry>()
  const materials = new Set<Three.Material>()
  const rememberGeometry = <T extends Three.BufferGeometry>(geometry: T) => {
    geometries.add(geometry)
    return geometry
  }
  const rememberMaterial = <T extends Three.Material>(material: T) => {
    materials.add(material)
    return material
  }

  const blue = rememberMaterial(new THREE.MeshStandardMaterial({ color: 0x6898ed, roughness: 0.48, metalness: 0.04, transparent: true, opacity: 0.58 }))
  const paleBlue = rememberMaterial(new THREE.MeshStandardMaterial({ color: 0xb9cff6, roughness: 0.56, metalness: 0.02, transparent: true, opacity: 0.52 }))
  const navy = rememberMaterial(new THREE.MeshStandardMaterial({ color: 0x315b9f, roughness: 0.5, metalness: 0.04, transparent: true, opacity: 0.46 }))
  const gold = rememberMaterial(new THREE.MeshStandardMaterial({ color: 0xf0b862, roughness: 0.58, metalness: 0.02, transparent: true, opacity: 0.48 }))

  const boxGeometry = rememberGeometry(new THREE.BoxGeometry(0.82, 0.72, 0.62))
  const parcelBandGeometry = rememberGeometry(new THREE.BoxGeometry(0.16, 0.75, 0.65))
  const bagGeometry = rememberGeometry(new THREE.BoxGeometry(0.78, 0.66, 0.22))
  const handleGeometry = rememberGeometry(new THREE.TorusGeometry(0.22, 0.035, 7, 18, Math.PI))
  const tagGeometry = rememberGeometry(new THREE.BoxGeometry(0.78, 0.5, 0.12))
  const tagHoleGeometry = rememberGeometry(new THREE.TorusGeometry(0.08, 0.025, 6, 12))
  const cartGeometry = rememberGeometry(new THREE.BoxGeometry(0.82, 0.48, 0.46))
  const barGeometry = rememberGeometry(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8))
  const wheelGeometry = rememberGeometry(new THREE.TorusGeometry(0.11, 0.035, 7, 14))
  const orbGeometry = rememberGeometry(new THREE.IcosahedronGeometry(0.42, 0))

  const mesh = (geometry: Three.BufferGeometry, material: Three.Material) => new THREE.Mesh(geometry, material)

  const makeParcel = () => {
    const group = new THREE.Group()
    group.add(mesh(boxGeometry, paleBlue))
    group.add(mesh(parcelBandGeometry, blue))
    return group
  }

  const makeBag = () => {
    const group = new THREE.Group()
    const body = mesh(bagGeometry, blue)
    const handle = mesh(handleGeometry, navy)
    handle.position.y = 0.34
    handle.rotation.z = Math.PI
    group.add(body, handle)
    return group
  }

  const makeTag = () => {
    const group = new THREE.Group()
    const body = mesh(tagGeometry, gold)
    body.rotation.z = -0.18
    const hole = mesh(tagHoleGeometry, navy)
    hole.position.set(-0.24, 0.08, 0.08)
    group.add(body, hole)
    return group
  }

  const makeCart = () => {
    const group = new THREE.Group()
    const basket = mesh(cartGeometry, paleBlue)
    basket.position.y = 0.12
    const handle = mesh(barGeometry, navy)
    handle.position.set(-0.48, 0.45, 0)
    handle.rotation.z = -0.42
    const wheelA = mesh(wheelGeometry, blue)
    const wheelB = mesh(wheelGeometry, blue)
    wheelA.position.set(-0.25, -0.27, 0.28)
    wheelB.position.set(0.27, -0.27, 0.28)
    group.add(basket, handle, wheelA, wheelB)
    return group
  }

  const makeOrb = () => {
    const group = new THREE.Group()
    group.add(mesh(orbGeometry, paleBlue))
    return group
  }

  const makers = [makeParcel, makeBag, makeTag, makeCart, makeOrb] as const
  const objects: FloatingObject[] = []
  let horizontalLimit = 5
  let visibleCount = 11
  let motionScale = 1

  const resetObject = (object: FloatingObject, initial = false) => {
    object.baseX = THREE.MathUtils.lerp(-horizontalLimit * 0.72, horizontalLimit, Math.random())
    object.group.position.set(object.baseX, initial ? THREE.MathUtils.lerp(-3.8, 4.4, Math.random()) : 4.4 + Math.random() * 1.8, THREE.MathUtils.lerp(-1.9, 1.1, Math.random()))
    object.group.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
    const size = THREE.MathUtils.lerp(0.48, 0.92, Math.random())
    object.group.scale.setScalar(size)
    object.speed = THREE.MathUtils.lerp(0.17, 0.35, Math.random())
    object.drift = THREE.MathUtils.lerp(0.3, 0.65, Math.random())
    object.phase = Math.random() * Math.PI * 2
    object.spinX = THREE.MathUtils.lerp(-0.16, 0.16, Math.random())
    object.spinY = THREE.MathUtils.lerp(-0.2, 0.2, Math.random())
  }

  for (let index = 0; index < 11; index += 1) {
    const group = makers[index % makers.length]!()
    const object: FloatingObject = { group, baseX: 0, drift: 0, phase: 0, speed: 0, spinX: 0, spinY: 0 }
    resetObject(object, true)
    objects.push(object)
    scene.add(group)
  }

  const updateSize = () => {
    if (!host.value) return
    const width = host.value.clientWidth
    const height = host.value.clientHeight
    if (width === 0 || height === 0) return

    visibleCount = width < 640 ? 4 : width < 1024 ? 7 : 11
    motionScale = width < 640 ? 0.55 : width < 1024 ? 0.78 : 1
    horizontalLimit = Math.max(3.2, (width / height) * 3.8)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 768 ? 1 : 1.5))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    objects.forEach((object, index) => { object.group.visible = index < visibleCount })
  }

  const resizeObserver = new ResizeObserver(updateSize)
  resizeObserver.observe(host.value)
  updateSize()

  let frameId = 0
  let previousTime = performance.now()
  let intersecting = true
  let pageVisible = !document.hidden

  const renderFrame = (time: number) => {
    frameId = 0
    const delta = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time
    const elapsed = time / 1000

    for (let index = 0; index < visibleCount; index += 1) {
      const object = objects[index]!
      object.group.position.y -= object.speed * delta * motionScale
      object.group.position.x = object.baseX + Math.sin(elapsed * object.drift + object.phase) * 0.28
      object.group.rotation.x += object.spinX * delta * motionScale
      object.group.rotation.y += object.spinY * delta * motionScale
      if (object.group.position.y < -4.4) resetObject(object)
    }

    renderer.render(scene, camera)
    if (intersecting && pageVisible) frameId = requestAnimationFrame(renderFrame)
  }

  const start = () => {
    if (frameId || !intersecting || !pageVisible) return
    previousTime = performance.now()
    frameId = requestAnimationFrame(renderFrame)
  }
  const stop = () => {
    if (!frameId) return
    cancelAnimationFrame(frameId)
    frameId = 0
  }

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    intersecting = entry?.isIntersecting ?? false
    if (intersecting) start()
    else stop()
  }, { rootMargin: '80px' })
  intersectionObserver.observe(host.value)

  const onVisibilityChange = () => {
    pageVisible = !document.hidden
    if (pageVisible) start()
    else stop()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  start()

  cleanup = () => {
    stop()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    geometries.forEach(geometry => geometry.dispose())
    materials.forEach(material => material.dispose())
    renderer.dispose()
    renderer.forceContextLoss()
    scene.clear()
  }
})
</script>

<style scoped>
.hero-three-background {
  position: absolute;
  inset: 0;
  z-index: -15;
  contain: strict;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.76;
  mask-image: linear-gradient(to right, transparent 0%, rgb(0 0 0 / 45%) 35%, #000 72%);
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@media (max-width: 767px) {
  .hero-three-background {
    opacity: 0.48;
    mask-image: linear-gradient(to bottom, rgb(0 0 0 / 12%), #000);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-three-background {
    display: none;
  }
}
</style>
