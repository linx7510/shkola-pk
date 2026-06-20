import type { Block } from 'payload'
export const SnakeAnimationBlock: Block = {
  slug: 'snake-animation',
  labels: { singular: '16-бит Змейка', plural: '16-бит Змейки' },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Включить анимацию' },
    { name: 'maxSnakes', type: 'number', defaultValue: 3, label: 'Кол-во змеек (1-5)' },
    { name: 'explosionRadius', type: 'number', defaultValue: 70, label: 'Радиус взрыва от курсора (px)' },
  ],
}
