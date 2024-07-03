import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import api from "../utils/Api.jsx";

const EditCEModal = ({ visible, onClose, ce, fetchPlannings }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (ce) {
      form.setFieldsValue(ce);
    }
  }, [ce]);

  const handleFinish = async (values) => {
    try {
      await api.put(`http://localhost:8080/update_ce/${ce.id}`, values);
      message.success('CE updated successfully');
      fetchPlannings();
      onClose();
    } catch (error) {
      message.error('Failed to update CE');
      console.error('Failed to update CE:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Edit CE"
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="CE Name"
          rules={[{ required: true, message: 'Please enter the CE name' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCEModal;
