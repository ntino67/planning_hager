import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from 'axios';

const CEModal = ({ visible, onClose, fetchCEs }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      await axios.post('http://localhost:8080/add_ce', values);
      message.success('CE added successfully');
      fetchCEs();
      onClose();
    } catch (error) {
      message.error('Failed to add CE');
      console.error('Failed to add CE:', error);
    }
  };

  return (
    <Modal
      title="Add CE"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="CE Name"
          rules={[{ required: true, message: 'Please input the name of the CE!' }]}
        >
          <Input />
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

export default CEModal;
