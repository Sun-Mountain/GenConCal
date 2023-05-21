function CheckboxComponent({ setCurrentState }) {
  const handleClick = (event) => {
    if (event.target.checked === true) {
      setCurrentState('Checked')
    } else {
      setCurrentState('Unchecked')
    }
  }

  return (
    <>
      <label htmlFor="example_checkbox">Set state to: </label>
      <input
        type="checkbox"
        id="example_checkbox"
        onClick={(event) => handleClick(event)}
      />
    </>
  )
}

export default CheckboxComponent