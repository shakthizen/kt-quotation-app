import { describe, it, expect, vi, beforeEach } from 'vitest'
import { quotationRouter } from './quotation'
import { ZodError } from 'zod'

// Mock the context and db
const mockDb = {
  quotation: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  quotationItem: {
    deleteMany: vi.fn(),
  },
  request: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}

const mockContext = {
  db: mockDb as any,
  headers: new Headers(),
}

const caller = quotationRouter.createCaller(mockContext)

describe('quotationRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default transaction mock just runs the callback
    mockDb.$transaction.mockImplementation((cb) => cb(mockDb))
  })

  describe('createQuotation', () => {
    it('creates a new quotation if one does not exist', async () => {
      // Setup: findUnique returns null (not found)
      mockDb.quotation.findUnique.mockResolvedValue(null)
      
      const input = {
        requestId: 'req-123',
        notes: 'Test notes',
        items: [
          { description: 'Item 1', quantity: 2, unitPrice: 100 },
          { description: 'Item 2', quantity: 1, unitPrice: 50 },
        ],
      }

      await caller.createQuotation(input)

      // Verify transaction called
      expect(mockDb.$transaction).toHaveBeenCalled()

      // Verify create called with correct data
      const expectedTotal = 250 // (2*100) + (1*50)
      expect(mockDb.quotation.create).toHaveBeenCalledWith({
        data: {
          requestId: 'req-123',
          adminId: 'admin-1',
          notes: 'Test notes',
          totalAmount: expectedTotal,
          items: {
            create: [
              { description: 'Item 1', quantity: 2, unitPrice: 100, amount: 200 },
              { description: 'Item 2', quantity: 1, unitPrice: 50, amount: 50 },
            ],
          },
        },
      })

      // Verify request status update
      expect(mockDb.request.update).toHaveBeenCalledWith({
        where: { id: 'req-123' },
        data: { status: 'Replied' },
      })
    })

    it('updates existing quotation if found', async () => {
      // Setup: findUnique returns existing quotation
      mockDb.quotation.findUnique.mockResolvedValue({ id: 'quote-existing-1' })
      // mock update to return something so it doesn't crash
      mockDb.quotation.update.mockResolvedValue({ id: 'quote-existing-1' })

      const input = {
        requestId: 'req-123',
        notes: 'Updated notes',
        items: [{ description: 'New Item', quantity: 1, unitPrice: 500 }],
      }

      await caller.createQuotation(input)

      // Verify findUnique was called
      expect(mockDb.quotation.findUnique).toHaveBeenCalledWith({
        where: { requestId: 'req-123' },
      })

      // Verify delete old items
      expect(mockDb.quotationItem.deleteMany).toHaveBeenCalledWith({
        where: { quotationId: 'quote-existing-1' },
      })

      // Verify update called
      expect(mockDb.quotation.update).toHaveBeenCalledWith({
        where: { id: 'quote-existing-1' },
        data: expect.objectContaining({
          notes: 'Updated notes',
          totalAmount: 500,
          items: {
            create: expect.arrayContaining([
              expect.objectContaining({ description: 'New Item' }),
            ]),
          },
        }),
      })
    })
  })
})
