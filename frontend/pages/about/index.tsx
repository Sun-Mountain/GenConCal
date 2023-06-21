import Link from "next/link";

export default function About() {
  return (
    <>
      <h2>About The App</h2>
      <p>
        GenCon Calendar (or GenConCal for short)
      </p>
      <h3>Acknowledgements</h3>
      <p>
        This website was inspired by Jon Schultz&apos;s <Link href='https://gencon.eventdb.us/' target='_blank'>GenCon Event Database</Link>.
      </p>
    </>
  )
}
