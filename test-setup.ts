import '@testing-library/jest-dom'

// Mock ResizeObserver for Recharts components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
