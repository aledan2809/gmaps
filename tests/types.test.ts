import { describe, it, expect } from 'vitest'
import { GMapsError } from '../src/types'

describe('GMapsError', () => {
  it('should create error with message and status', () => {
    const error = new GMapsError('Test error message', 'REQUEST_DENIED')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(GMapsError)
    expect(error.message).toBe('Test error message')
    expect(error.status).toBe('REQUEST_DENIED')
    expect(error.name).toBe('GMapsError')
    expect(error.code).toBeUndefined()
  })

  it('should create error with message, status and code', () => {
    const error = new GMapsError('Test error', 'INVALID_REQUEST', 400)

    expect(error.message).toBe('Test error')
    expect(error.status).toBe('INVALID_REQUEST')
    expect(error.code).toBe(400)
  })

  it('should have correct inheritance chain', () => {
    const error = new GMapsError('Test', 'ERROR')

    expect(error instanceof Error).toBe(true)
    expect(error instanceof GMapsError).toBe(true)
  })

  it('should have error stack trace', () => {
    const error = new GMapsError('Test', 'ERROR')

    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })
})