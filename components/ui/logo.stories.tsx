import type { Meta, StoryObj } from '@storybook/react'
import { Logo } from './logo'

const meta = {
  title: 'UI/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'h-8 w-8',
  },
}

export const Small: Story = {
  args: {
    className: 'h-6 w-6',
  },
}

export const Large: Story = {
  args: {
    className: 'h-16 w-16',
  },
}

export const ExtraLarge: Story = {
  args: {
    className: 'h-32 w-32',
  },
}

export const WithText: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Logo className="h-10 w-10" />
      <span className="text-2xl font-bold">Health In Cloud</span>
    </div>
  ),
}

export const InHeader: Story = {
  render: () => (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center gap-2 px-4">
        <Logo className="h-8 w-8" />
        <span className="text-xl font-semibold">Health In Cloud</span>
      </div>
    </header>
  ),
}

export const DarkBackground: Story = {
  render: () => (
    <div className="rounded-lg bg-slate-900 p-8">
      <Logo className="h-16 w-16" />
    </div>
  ),
}

export const MultipleSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Logo className="h-6 w-6" />
      <Logo className="h-8 w-8" />
      <Logo className="h-12 w-12" />
      <Logo className="h-16 w-16" />
      <Logo className="h-24 w-24" />
    </div>
  ),
}
