import { useContext } from 'react'
import { EntriesContext } from './entriesContextObject'

export function useEntries() {
  const context = useContext(EntriesContext)
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider')
  }
  return context
}