import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const [active] = useState(0)

  return (
    <div>
      <p>Active: {active}</p>
    </div>
  )
}
