export default function ExportPage () {
  const faves = JSON.parse(localStorage.getItem('faves') || '[]');

  console.log(faves);
  return (
    <>
      Export
    </>
  )
}