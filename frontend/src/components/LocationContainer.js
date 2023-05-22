import TimeContainer from "./TimeContainer";

function LocationContainer({location, locationData}) {
  const times = Object.keys(locationData).sort();

  return(
    <>
      <h3>{location}</h3>
      {times.map(time => {
        return <TimeContainer time={time} events={locationData[time]} />
      })}
    </>
  )
}

export default LocationContainer;