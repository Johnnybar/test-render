import { createContext } from "react"

export interface EventsInfo {
  id: number
  latitude: number
  longitude: number
  eventInfo: {
    ort: string
    kurztitel: string
    va_adresse: string
    datum_beginn: string
    va_name: string
    datum_ende: string
  }
}

interface EventFinderContextType {
  eventsInfo: EventsInfo[]
  setEventsInfo: React.Dispatch<React.SetStateAction<EventsInfo[]>>
  loading: boolean
}

export const EventFinderContext = createContext<EventFinderContextType>({
  eventsInfo: [],
  setEventsInfo: () => {},
  loading: false,
})
