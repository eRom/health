import type { Meta, StoryObj } from '@storybook/react'
import { LoginForm } from './login-form'

const meta = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoginForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <LoginForm />
    </div>
  ),
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: () => (
    <div className="w-full max-w-md">
      <LoginForm />
    </div>
  ),
}

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="min-h-screen bg-background p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  render: () => (
    <div className="w-full max-w-md">
      <LoginForm />
    </div>
  ),
}
