import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import Script from 'next/script'
import React from 'react'

type Args = { children: React.ReactNode }

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap: {} })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={{}} serverFunction={serverFunction}>
    {children}
    <Script src="/wysiwyg-inject.js" strategy="afterInteractive" />
  </RootLayout>
)

export default Layout
