import Events from '@/assets/eventsJSON.json';
import cleanData from './cleanData'
import { RawEvent } from '@/assets/interfaces'

export default function getData() {
  const rawData = Events as RawEvent[]

  const data = cleanData(rawData)

  return data
}