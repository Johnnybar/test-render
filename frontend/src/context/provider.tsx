import { ReactNode, useState } from "react"
import { EventFinderContext, EventsInfo } from "./context"

interface EventFinderProviderProps {
  children: ReactNode
}

export const EventFinderProvider = ({ children }: EventFinderProviderProps) => {
  const [eventsInfo, setEventsInfo] = useState<EventsInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const value = {
    eventsInfo,
    setEventsInfo,
    loading,
    setLoading,
  }

  return (
    <EventFinderContext.Provider value={value}>
      {children}
    </EventFinderContext.Provider>
  )
}
