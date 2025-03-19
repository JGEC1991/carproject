import React, { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invitationToken, setInvitationToken] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Validate invitation token
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', invitationToken)
        .eq('email', email)
        .single()

      if (invitationError || !invitation) {
        console.error('Invalid invitation token:', invitationError)
        alert('Invalid invitation token')
        return
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        console.error('Signup error:', error.message)
        alert(error.message)
      } else {
        console.log('Signed up:', data)
        // Delete the invitation after successful signup
        await supabase.from('invitations').delete().eq('token', invitationToken)
        navigate('/login')
      }
    } catch (error) {
      console.error('Signup error:', error.message)
      alert(error.message)
    }
  }

  return (
    <div className="page">
      <h1 className="text-3xl font-semibold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <label htmlFor="invitationToken" className="block text-gray-700 text-sm font-bold mb-2">Invitation Token</label>
        <input
          type="text"
          id="invitationToken"
          name="invitationToken"
          value={invitationToken}
          onChange={(e) => setInvitationToken(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}

export default Signup
