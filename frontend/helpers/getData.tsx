import Events from '@/assets/events/events.json'
import cleanData from './cleanData'
import { RawEvent } from '@/assets/interfaces/Event'

export default function getData() {
  const rawData = Events as RawEvent[]

  const data = cleanData(rawData)

  return data
}