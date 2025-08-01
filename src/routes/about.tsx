import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (<div className="p-2">
    <p>
      This is a simple Preact app using TanStack Router for routing. It is built with Vite and styled with Tailwind CSS.
    </p>
  </div>)
}