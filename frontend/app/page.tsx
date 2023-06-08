import getData from "@/helpers/getData";

export default function Home() {
  const {eventData, filters} = getData();
  console.log(filters.experienceRequirements);

  return (
    <main>
      Hello
    </main>
  )
}
