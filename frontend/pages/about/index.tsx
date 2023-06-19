import Link from "next/link";
import React, { Component } from "react";

class About extends Component {
  state = {};
  render() {
    return (
      <main className="content-container">
        <h2>
          About The App
        </h2>
        <p>
          GenCon Calendar (or GenConCal for short)
        </p>
        <h3>
          Acknowledgements
        </h3>
        <p>
          This website was inspired by Jon Schultz&apos;s <Link href='https://gencon.eventdb.us/' target='_blank'>GenCon Event Database</Link>.
        </p>
        <h3>
          Why this app?
        </h3>
        <p>
          I attended my first GenCon in 2022. It was both magical and overwhelming and, like most first timers (I&apos;m told), had completely botched how I ordered my wishlist and therefore did not get any variety the games I played.
        </p>
        <p>
          For round 2, in 2023, I poured over the GenCon event list and made a very complicated spreadsheet. Which, normally, I would enjoy, but did not have time to make as detailed as I would like.
        </p>
      </main>
    )
  }
}

export default About;