import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import api from '../utils/Api';

const { Option } = Select;

const ReservistModal = ({ visible, onClose, reservist, skills, onSubmit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (reservist) {
            console.log('Reservist data:', reservist); // For debugging
            form.setFieldsValue({
                name: reservist.name,
                skills: reservist.skills.map(skill => skill.id)
            });
        } else {
            form.resetFields();
        }
    }, [reservist, form]);

    const handleSubmit = async (values) => {
        console.log('Submitting values:', values); // For debugging
        try {
            await onSubmit(values);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Failed to save reservist:', error);
            message.error('Failed to save reservist: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <Modal
            title={reservist ? "Edit Reservist" : "Add Reservist"}
            visible={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            destroyOnClose={true}
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please input the reservist name!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="skills"
                    label="Skills"
                    rules={[{ required: true, message: 'Please select at least one skill!' }]}
                >
                    <Select mode="multiple" placeholder="Select skills">
                        {skills.map(skill => (
                            <Option key={skill.id} value={skill.id}>{skill.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReservistModal;