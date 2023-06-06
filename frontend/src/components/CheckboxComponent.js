function CheckboxComponent({ value, set, checked }) {
  const handleClick = (e) => {
    const { value, checked } = e.target;
    set((prev) =>
      prev.map((item) => {
        if (item.value === value) item.checked = checked;
        return item;
      })
    );
  }

  return (
    <div>
      <label htmlFor="example_checkbox">{ value }: </label>
      <input
        type="checkbox"
        id="example_checkbox"
        onClick={handleClick}
        defaultChecked={checked}
        value={value}
      />
    </div>
  )
}

export default CheckboxComponent