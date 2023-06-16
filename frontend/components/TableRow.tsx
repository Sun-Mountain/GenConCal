export default function TableRow ({ label, value }: { label: string, value: string}) {
  return (
    <tr>
      <td>
        {label}
      </td>
      <td>
        {value}
      </td>
    </tr>
  )
}