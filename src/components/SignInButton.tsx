'use client'
import React from 'react'
import { Button } from './ui/button'
import { signIn, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

type Props = { text: string }

const SignInButton = ({ text }: Props) => {
  const { data: session, status } = useSession()

  if (status === 'authenticated' || session) {
    return redirect('/quiz')
  }

  return (
    <Button
      className="rounded-full border border-solid border-[#ccc] transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      rel="noopener noreferrer"
      onClick={() => {
        signIn('google').catch(console.error)
      }}
    >
      {text}
    </Button>
  )
}

export default SignInButton
