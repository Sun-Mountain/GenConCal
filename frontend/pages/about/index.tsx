import Link from "next/link";
import React, { Component } from "react";

class About extends Component {
  state = {};
  render() {
    return (
      <main>
        <h3>
          Acknowledgements
        </h3>
        <p>
          This website was inspired by Jon Schultz&apos;s <Link href='https://gencon.eventdb.us/' target='_blank'>GenCon Event Database</Link>.
        </p>
      </main>
    )
  }
}

export default About;