'use client'
import getData from "@/helpers/getData";
import { useState } from "react";

export default function Home() {
  const {eventData, filters} = getData();
  console.log(filters);

  const [eventList, setEventList] = useState(eventData);
  const [filtersList, setFiltersList] = useState(filters);

  return (
    <main>
      Hello
    </main>
  )
}
