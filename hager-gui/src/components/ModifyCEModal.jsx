import React, {useEffect} from 'react';
import {Button, Form, Input, message, Modal} from 'antd';
import axios from 'axios';

const ModifyCEModal = ({visible, onClose, ce, fetchCEs}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (ce) {
            form.setFieldsValue({
                name: ce.name,
            });
        }
    }, [ce, form]);

    const handleFinish = async (values) => {
        try {
            await axios.put(`http://localhost:8080/update_ce/${ce.id}`, values);
            message.success('CE updated successfully');
            fetchCEs();
            onClose();
        } catch (error) {
            message.error('Failed to update CE');
            console.error('Failed to update CE:', error);
        }
    };

    return (
        <Modal
            title="Edit CE"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form form={form} onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="CE Name"
                    rules={[{required: true, message: 'Please input the name of the CE!'}]}
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

export default ModifyCEModal;