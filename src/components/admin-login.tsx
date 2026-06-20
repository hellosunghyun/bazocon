"use client"

import { useState, useTransition } from "react"

export function AdminLogin() {
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function login() {
    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!response.ok) {
        setMessage("비밀번호를 확인해주세요.")
        return
      }
      window.location.reload()
    })
  }

  return (
    <main className="app-page grid place-items-center bg-[#eef2f3] px-5 text-zinc-950">
      <section className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white p-5 shadow-md">
        <h1 className="text-xl font-black text-zinc-950">BAZOCON 관리자</h1>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-5 w-full rounded-md border border-zinc-400 bg-white px-3 py-2 text-zinc-950 outline-none placeholder:text-zinc-500 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          placeholder="관리자 비밀번호"
        />
        <button
          type="button"
          disabled={isPending || password.length === 0}
          onClick={login}
          className="mt-3 w-full rounded-md bg-zinc-950 px-4 py-2 text-sm font-bold text-white disabled:bg-zinc-600 disabled:text-zinc-100"
        >
          로그인
        </button>
        {message === null ? null : <p className="mt-3 text-sm text-red-600">{message}</p>}
      </section>
    </main>
  )
}
