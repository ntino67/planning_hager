import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';
import api from "../utils/Api.jsx";

const AddCEModal = ({ open, onClose, fetchCEs }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [open]);

  const handleFinish = async (values) => {
    try {
      await api.post('http://localhost:8080/add_ce', values);
      fetchCEs();
      onClose();
    } catch (error) {
      console.error('Failed to save CE:', error);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null}>
      <Form form={form} onFinish={handleFinish}>
        <Form.Item name="name" label="CE Name" rules={[{ required: true, message: 'Please input the CE name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCEModal;
