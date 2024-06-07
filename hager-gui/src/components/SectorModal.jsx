import React from 'react';
import {Button, Form, Input, message, Modal} from 'antd';
import axios from 'axios';

const SectorModal = ({visible, onClose, fetchSectors}) => {
    const [form] = Form.useForm();

    const handleFinish = async (values) => {
        try {
            await axios.post('http://localhost:8080/add_sector', values);
            message.success('Sector added successfully');
            fetchSectors();
            onClose();
        } catch (error) {
            message.error('Failed to add sector');
            console.error('Failed to add sector:', error);
        }
    };

    return (
        <Modal
            title="Add Sector"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="Sector Name"
                    rules={[{required: true, message: 'Please input the name of the sector!'}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Add
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SectorModal;
