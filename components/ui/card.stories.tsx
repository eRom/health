import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Button } from './button'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some example text.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Exercise Progress</CardTitle>
        <CardDescription>Your recent activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Completed</span>
            <span className="text-sm font-medium">12/20</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div className="h-2 w-3/5 rounded-full bg-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  ),
}

export const ExerciseCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            🧠
          </div>
          <div>
            <CardTitle>Mémoire de Travail</CardTitle>
            <CardDescription>Exercice neuropsychologique</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Entraînez votre mémoire avec des séquences de lettres et de chiffres.
        </p>
        <div className="mt-4 flex gap-2">
          <div className="rounded-lg bg-secondary px-2 py-1 text-xs">15 min</div>
          <div className="rounded-lg bg-secondary px-2 py-1 text-xs">Moyen</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Commencer</Button>
      </CardFooter>
    </Card>
  ),
}

export const StatCard: Story = {
  render: () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Exercices</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">245</div>
        <p className="text-xs text-muted-foreground">+20% par rapport au mois dernier</p>
      </CardContent>
    </Card>
  ),
}

export const MultipleCards: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Exercices Complétés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">245</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Temps Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">42h</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Score Moyen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">85%</div>
        </CardContent>
      </Card>
    </div>
  ),
}
