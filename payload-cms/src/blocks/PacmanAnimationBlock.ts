import type { Block } from 'payload'
export const PacmanAnimationBlock: Block = {
  slug: 'pacman-animation',
  labels: { singular: 'Pac-Man анимация', plural: 'Pac-Man анимации' },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Включить анимацию' },
    { name: 'maxCreatures', type: 'number', defaultValue: 5, label: 'Макс. количество существ (3-8)' },
    { name: 'explosionRadius', type: 'number', defaultValue: 80, label: 'Радиус взрыва от курсора (px)' },
  ],
}
