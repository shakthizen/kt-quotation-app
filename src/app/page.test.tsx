import { render } from '@testing-library/react'
import Home from './page'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { redirect } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /request', () => {
    try {
      // In a real Server Component, this would just run. 
      // Since Home is a function, we can just call it or render it. 
      // However, it's a server component that returns nothing (void) essentially due to redirect.
      // But for testing purposes, calling it is sufficient if we just check the side effect.
      Home()
    } catch (e) {
      // ignore redirect error if implementation throws
    }
    
    expect(redirect).toHaveBeenCalledWith('/request')
  })
})
