import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function ModalForm({ show, onHide, title, initial, fields, onSubmit }) {
    const [form, setForm] = useState({});

    useEffect(() => {
        setForm(initial || {});
    }, [initial]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeCheckbox = (e) => {
        const { name, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {fields.map(f => (
                        <Form.Group className="mb-3" controlId={f.name} key={f.name}>
                            <Form.Label>{f.label}</Form.Label>
                            {f.type === 'checkbox' ? (
                            <Form.Check
                                type="checkbox"
                                name={f.name}
                                label={f.label}
                                checked={!!form[f.name]}
                                onChange={handleChangeCheckbox}
                            />
                            ) : (
                            <Form.Control
                                type={f.type || 'text'}
                                name={f.name}
                                value={form[f.name] || ''}
                                onChange={handleChange}
                                required={f.required}
                            />
                            )}
                        </Form.Group>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancel</Button>
                    <Button variant="primary" type="submit">Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
