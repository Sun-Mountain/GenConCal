export default function ExportPage () {
  const faves = localStorage.getItem('faves' || '[]');

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