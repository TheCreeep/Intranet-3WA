import { mount, type MountingOptions } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '../../router'
import { flushPromises } from '@vue/test-utils'
import { vi } from 'vitest'

/**
 * Crée une configuration de montage standardisée pour les tests de composants Vue
 */
export function createTestMountOptions(options: Partial<MountingOptions<any>> = {}) {
  // Créer un routeur de test
  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  // Configuration Pinia par défaut
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false // Important pour permettre l'exécution des actions
  })

  // Combiner avec les options personnalisées
  return {
    global: {
      plugins: [router, pinia],
      ...options.global
    },
    ...options
  }
}

/**
 * Monte un composant avec la configuration standard de test
 */
export async function mountWithSetup(component: any, options: Partial<MountingOptions<any>> = {}) {
  const wrapper = mount(component, createTestMountOptions(options))
  
  // Attendre que le routeur et les composants soient initialisés
  await router.isReady()
  await flushPromises()
  
  return wrapper
}

// Exporter le routeur pour pouvoir le manipuler dans les tests
export const router = createRouter({
  history: createWebHistory(),
  routes
}) 