import React, {useEffect} from 'react';
import {Button, Form, Input, Modal} from 'antd';
import api from "../utils/Api.jsx";

const CEModal = ({ visible, onClose, ce, onSubmit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (ce) {
            form.setFieldsValue(ce);
        } else {
            form.resetFields();
        }
    }, [ce, form]);

    const handleSubmit = async (values) => {
        try {
            if (ce) {
                await api.put(`http://localhost:8080/update_ce/${ce.id}`, values);
            } else {
                await api.post('http://localhost:8080/add_ce', values);
            }
            onSubmit();
            onClose();
        } catch (error) {
            message.error('Failed to save CE');
        }
    };

    return (
        <Modal
            title={ce ? 'Edit CE' : 'Add CE'}
            visible={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CEModal;