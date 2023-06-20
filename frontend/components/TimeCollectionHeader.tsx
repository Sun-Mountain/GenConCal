export default function TimeCollectionHeader () {
  return (
    <div className='event-listing listing-header'>
      <div className='flex-row'>
        <div>
          Title
        </div>
      </div>
      <div className='event-details'>
        <div className='tickets-column'>
          Tickets
        </div>
        <div className='duration-column'>
          Duration
        </div>
        <div className='cost-column'>
          Cost
        </div>
      </div>
    </div>
  )
}