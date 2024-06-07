import React, {useEffect} from 'react';
import {Button, Form, Input, message, Modal} from 'antd';
import axios from 'axios';

const ModifySectorModal = ({visible, onClose, sector, fetchSectors}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (sector) {
            form.setFieldsValue({
                name: sector.name,
            });
        }
    }, [sector, form]);

    const handleFinish = async (values) => {
        try {
            await axios.put(`http://localhost:8080/update_sector/${sector.id}`, values);
            message.success('Sector updated successfully');
            fetchSectors();
            onClose();
        } catch (error) {
            message.error('Failed to update sector');
            console.error('Failed to update sector:', error);
        }
    };

    return (
        <Modal
            title="Edit Sector"
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
                        Update
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModifySectorModal;