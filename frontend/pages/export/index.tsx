import { eventData, filteredEvents } from "@/pages/_app";

export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  if (!faves || !faves.length) {
    return (
      <>
        No faves.
      </>
    )
  }

  return (
    <>
      Export Page
    </>
  )
}