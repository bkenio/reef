import { register } from '../lib/api.server.ts'
import { Form, Link } from '@remix-run/react'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { authenticator } from '../lib/auth.server'

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData()
    const email = form.get('email') as string
    const username = form.get('username') as string
    const password = form.get('password') as string

    // Registers the user on the server
    await register({ email, username, password }, request)

    return await authenticator.authenticate('form', request, {
        successRedirect: '/',
        failureRedirect: '/failed',
    })
}

export async function loader({ request }: LoaderFunctionArgs) {
    return await authenticator.isAuthenticated(request, {
        successRedirect: '/',
    })
}

export default function RegisterPage() {
    return (
        <div>
            <div className="flex flex-col items-center space-y-2 py-2">
                <h1 className="text-xl font-bold tracking-wide">
                    Create an account
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your email below to create your account
                </p>
            </div>
            <Form method="post">
                <div className="rounded-lg border border-gray-200 w-72 p-6 space-y-4">
                    <div className="space-y-2 ">
                        <Label htmlFor="email">Username</Label>
                        <Input
                            required
                            id="username"
                            name="username"
                            type="username"
                            placeholder="rusty"
                        />
                    </div>
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
                        <Input
                            required
                            id="password"
                            name="password"
                            type="password"
                        />
                    </div>
                    <Button className="w-full" type="submit">
                        Register
                    </Button>
                    <div>
                        <Link to="/login">
                            <Button className="w-full" variant="ghost">
                                Or Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </Form>
        </div>
    )
}
