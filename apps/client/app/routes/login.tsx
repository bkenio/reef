import { apiEndpoints } from '../lib/env'
import { Form, Link } from '@remix-run/react'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { authenticator } from '../services/auth.server'

import type { ActionFunction } from '@remix-run/node'

const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const email = form.get('email') as string
  const password = form.get('password') as string

  const userLoginRequest = await fetch(apiEndpoints.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  // Stubbed out response from API
  const user = await userLoginRequest.json()
  console.log('Response from API', user)

  return await authenticator.authenticate('form', request, {
    successRedirect: '/',
    failureRedirect: '/failed',
    context: { formData: form },
  })
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center space-y-4 p-4">
      <header className="flex flex-col items-center space-y-2">
        <h1 className="text-xl font-bold tracking-wide">Log In</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Lets get you logged in
        </p>
      </header>
      <Form method="post">
        <div className="rounded-lg border border-gray-200 w-72 p-6 space-y-4">
          <div className="space-y-2 ">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              id="email"
              name="email"
              type="email"
              placeholder="rusty@alcoves.io"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input required id="password" name="password" type="password" />
          </div>
          <Button className="w-full" type="submit">
            Log In
          </Button>
          <div>
            <Link to="/register">
              <Button className="w-full" variant="ghost">
                Or Register
              </Button>
            </Link>
          </div>
        </div>
      </Form>
    </div>
  )
}

export { action }
