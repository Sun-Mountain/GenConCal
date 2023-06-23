import Link from "next/link";

export default function About() {
  return (
    <>
      <h2>About The App</h2>
      <div>
        GenCon Calendar (or GenConCal for short)
      </div>
      <h3>Acknowledgements</h3>
      <div>
        This website was inspired by Jon Schultz&apos;s <Link href='https://gencon.eventdb.us/' target='_blank'>GenCon Event Database</Link>.
      </div>
      <div>
        This website was made with the <Link href='https://mui.com/' target='_blank'>Material UI</Link> library.
      </div>
    </>
  )
}
