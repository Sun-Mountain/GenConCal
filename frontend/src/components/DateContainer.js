import LocationContainer from "./LocationContainer";

function DateContainer({ date, dateData, isVisible }) {
  // const locations = Object.keys(dateData).sort();

  return (
    <div>
      <h2>{date}</h2>
      {/* {locations.map(location => {
        return <LocationContainer location={location} locationData={dateData[location]} />
      })} */}
    </div>
  )

}

export default DateContainer;