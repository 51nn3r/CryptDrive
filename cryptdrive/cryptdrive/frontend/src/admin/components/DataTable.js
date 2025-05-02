export default function DataTable({ columns, data }) {
    return (
        <table className="table table-striped table-hover">
            <thead>
                <tr>
                    {columns.map(col => <th key={col.key}>{col.label}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map(row => (
                    <tr key={row.id}>
                        {columns.map(col => (
                            <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
