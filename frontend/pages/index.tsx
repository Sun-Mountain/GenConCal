import { filterTypes } from "@/pages/_app";
import DailyTabs from '@/components/DailyTabs';

export default function Home () {
  console.log(filterTypes)

  return (
    <>
      <DailyTabs />
    </>
  )
}
