import { ReactElement } from "react"

export default function TableRow ({
  label,
  value
}: {
  label: string,
  value: string | ReactElement
}) {
  return (
    <tr className="modal-table-row">
      <td className="table-label-container">
        {label}
      </td>
      <td className="table-value-container">
        {value}
      </td>
    </tr>
  )
}