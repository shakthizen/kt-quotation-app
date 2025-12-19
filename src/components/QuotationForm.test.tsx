import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuotationForm } from './QuotationForm'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock ReactQuill because it relies on document objects not fully present in JSDOM or just for simplicity
vi.mock('react-quill-new', () => {
  return {
    default: ({ theme, onChange, value }: any) => (
      <textarea
        data-testid="mock-quill"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  }
})

// Mock next/navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe('QuotationForm', () => {
  const mockOnFinish = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Need to handle matchMedia for AntD if not globally set (we did set it in setup.ts)
  })

  it('renders initial form fields', () => {
    render(<QuotationForm onFinish={mockOnFinish} />)
    expect(screen.getByPlaceholderText('Item Description')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Qty')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Price')).toBeInTheDocument()
    // Verify default item is present
    expect(screen.getByDisplayValue('1')).toBeInTheDocument() // Qty 1
  })

  it('validates required fields', async () => {
    render(<QuotationForm onFinish={mockOnFinish} />)
    
    // Clear the description (it might be empty by default, but let's be sure)
    // Actually default is empty string, so just try to submit.
    
    const submitBtn = screen.getByRole('button', { name: /Send Quotation/i })
    fireEvent.click(submitBtn)

    // Ant Design validation is async
    expect(await screen.findByText('Missing description')).toBeInTheDocument()
    // Price has default 0 so it won't show error unless cleared manually
    
    expect(mockOnFinish).not.toHaveBeenCalled()
  })

  it('adds a new item row', async () => {
    render(<QuotationForm onFinish={mockOnFinish} />)
    const addBtn = screen.getByRole('button', { name: /Add Item/i })
    fireEvent.click(addBtn)
    
    await waitFor(() => {
      const descInputs = screen.getAllByPlaceholderText('Item Description')
      expect(descInputs).toHaveLength(2)
    })
  })

  it('calculates total correctly', async () => {
    render(<QuotationForm onFinish={mockOnFinish} />)
    
    const qtyInput = screen.getByPlaceholderText('Qty')
    const priceInput = screen.getByPlaceholderText('Price')

    // Change price to 10
    fireEvent.change(priceInput, { target: { value: '10' } })
    // Change qty to 2
    fireEvent.change(qtyInput, { target: { value: '2' } })

    // Need to wait for form value updates if there's any lag, but AntD usually updates.
    // However, the "Total" display depends on `items` watch.
    
    await waitFor(() => {
      // Total: $20.00
      expect(screen.getByText('Total: $20.00')).toBeInTheDocument()
    })
  })
})
