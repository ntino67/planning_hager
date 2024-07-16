import React, { useEffect, useRef } from 'react';
import { Modal, Form, Input, message } from 'antd';
import api from "../utils/Api.js";

const SectorModal = ({ visible, onClose, sector, onSubmit }) => {
    const [form] = Form.useForm();
    const inputRef = useRef(null);

    useEffect(() => {
        if (sector) {
            form.setFieldsValue(sector);
        } else {
            form.resetFields();
        }
        // Focus on the input when the modal opens
        if (visible) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [sector, form, visible]);

    const handleSubmit = async (values) => {
        try {
            if (sector) {
                await api.put(`http://localhost:8080/update_sector/${sector.id}`, values);
                message.success('Sector updated successfully');
            } else {
                await api.post('http://localhost:8080/add_sector', values);
                message.success('Sector added successfully');
            }
            onSubmit();
            onClose();
        } catch (error) {
            message.error('Failed to save sector');
        }
    };

    return (
        <Modal
            title={sector ? 'Edit Sector' : 'Add Sector'}
            visible={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            destroyOnClose={true}
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please input the sector name!' }]}
                >
                    <Input ref={inputRef} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SectorModal;