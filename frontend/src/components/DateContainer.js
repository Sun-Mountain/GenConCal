import LocationContainer from "./LocationContainer";

function DateContainer({id,  date, dateData }) {
  const locations = Object.keys(dateData).sort();

  return (
    <div id={id}>
      <h2>{date}</h2>
      {locations.map(location => {
        return <LocationContainer location={location} locationData={dateData[location]} />
      })}
    </div>
  )

}

export default DateContainer;