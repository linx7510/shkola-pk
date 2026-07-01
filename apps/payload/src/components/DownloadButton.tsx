// @ts-nocheck
'use client'
import React from 'react'

/**
 * DownloadButton — кнопка для скачивания медиафайла
 * Отображается в админке Media collection
 */
const DownloadButton = (props: any) => {
  const { data } = props
  
  if (!data?.url) return null
  
  // Формируем полный URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://2980738.ru'
  const fileUrl = data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`
  
  return React.createElement('div', {
    style: {
      marginTop: '1rem',
      padding: '0.75rem 1rem',
      background: 'rgba(230,136,99,0.1)',
      border: '1px solid rgba(230,136,99,0.3)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }
  },
    React.createElement('a', {
      href: fileUrl,
      download: data.filename || 'file',
      target: '_blank',
      rel: 'noopener noreferrer',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        background: 'linear-gradient(135deg, #C96E4D, #E68863)',
        color: '#0D0C0A',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: 'pointer',
      }
    }, 
      React.createElement('span', null, '⬇'),
      React.createElement('span', null, `Скачать ${data.filename || 'файл'}`)
    ),
    React.createElement('span', {
      style: { fontSize: '0.8rem', color: 'rgba(214,198,178,0.5)' }
    }, `${(data.filesize / 1024).toFixed(1)} KB · ${data.mimeType || ''}`)
  )
}

export default DownloadButton
