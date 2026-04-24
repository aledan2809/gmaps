import { describe, it, expect } from 'vitest'
import * as GMapsModule from '../src/index'
import { GMapsClient } from '../src/client'
import { GMapsError } from '../src/types'
import { getCurrentPosition, distanceMeters, formatDistance } from '../src/utils'

describe('Module exports', () => {
  it('should export GMapsClient class', () => {
    expect(GMapsModule.GMapsClient).toBe(GMapsClient)
    expect(typeof GMapsModule.GMapsClient).toBe('function')
  })

  it('should export GMapsError class', () => {
    expect(GMapsModule.GMapsError).toBe(GMapsError)
    expect(typeof GMapsModule.GMapsError).toBe('function')
  })

  it('should export utility functions', () => {
    expect(GMapsModule.getCurrentPosition).toBe(getCurrentPosition)
    expect(GMapsModule.distanceMeters).toBe(distanceMeters)
    expect(GMapsModule.formatDistance).toBe(formatDistance)
    expect(typeof GMapsModule.getCurrentPosition).toBe('function')
    expect(typeof GMapsModule.distanceMeters).toBe('function')
    expect(typeof GMapsModule.formatDistance).toBe('function')
  })

  it('should export all type interfaces (runtime check)', () => {
    // Types are compile-time only, so we check they exist through usage
    const config = { apiKey: 'test' }
    const client = new GMapsModule.GMapsClient(config)
    expect(client).toBeInstanceOf(GMapsModule.GMapsClient)
  })

  it('should not export any unexpected members', () => {
    const expectedExports = [
      'GMapsClient',
      'GMapsError',
      'getCurrentPosition',
      'distanceMeters',
      'formatDistance',
      'aiRouter',
      'routeAI',
      'router'
    ]

    const actualExports = Object.keys(GMapsModule)
    expect(actualExports.sort()).toEqual(expectedExports.sort())
  })
})