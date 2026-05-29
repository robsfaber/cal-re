import { useContext } from 'react'
import { UserProfileContext } from './userProfileContextObject'

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
}