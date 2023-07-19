export function TableRow ({
  category,
  detail,
}: {
  category: string,
  detail: string
}) {
  return (
    <tr>
      <td>
        {category}
      </td>
      <td>
        {detail}
      </td>
    </tr>
  )
}