import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <main className="min-h-screen p-8 bg-slate-900 text-slate-100">
      <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
        Todo List
      </h1>
      <ul className="space-y-4">
        {todos?.map((todo) => (
          <li 
            key={todo.id}
            className="p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-lg hover:border-slate-600 transition-all"
          >
            {todo.name}
          </li>
        ))}
        {(!todos || todos.length === 0) && (
          <p className="text-slate-400 italic">No todos found. Check your Supabase database!</p>
        )}
      </ul>
    </main>
  )
}
