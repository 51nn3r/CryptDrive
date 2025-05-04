import React from 'react';

import { getCookie } from '../../utils/csrf';

export default function DataTable({ columns, data, onEdit, onDelete }) {
    const csrf = getCookie('csrftoken');

    return (
        <table className="table">
            <thead>
                <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}
                        {(onEdit||onDelete) && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
                {data.map(item => (
                    <tr key={item.id}>
                        {columns.map(c => (
                            <td key={c.key}>
                                {c.render ? c.render(item) : item[c.key]}
                            </td>
                        ))}
                        {(onEdit||onDelete) && (
                            <td>
                                {onEdit && <button className="btn btn-sm btn-primary me-1" onClick={()=>onEdit(item)}>Edit</button>}
                                {onDelete && <button className="btn btn-sm btn-danger" onClick={()=>onDelete(item)}>Delete</button>}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
