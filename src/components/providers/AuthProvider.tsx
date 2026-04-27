'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/store/useAuth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (mounted) {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          setProfile(profile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        setProfile(profile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, setUser, setProfile, setLoading])

  return <>{children}</>
}
