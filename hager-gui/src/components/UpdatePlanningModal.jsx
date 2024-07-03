import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const UpdatePlanningModal = ({ visible, onClose, planning, fetchPlannings }) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
    if (planning) {
      form.setFieldsValue(planning);
    }
  }, [planning]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8080/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleFinish = async (values) => {
    try {
      await axios.put(`http://localhost:8080/update_planning/${planning.id}`, values);
      message.success('Planning updated successfully');
      fetchPlannings();
      onClose();
    } catch (error) {
      message.error('Failed to update planning');
      console.error('Failed to update planning:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Update Planning"
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="employee_id"
          label="Employee"
          rules={[{ required: true, message: 'Please select an employee' }]}
        >
          <Select placeholder="Select an employee">
            {employees.map((employee) => (
              <Option key={employee.id} value={employee.id}>{employee.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select placeholder="Select a status">
            <Option value="available">Available</Option>
            <Option value="unavailable">Unavailable</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdatePlanningModal;
