import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import axios from 'axios';

const EmployeeModal = ({ visible, onClose, ce, sector, fetchEmployees }) => {
  const [form] = Form.useForm();
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get('http://localhost:8080/skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const handleFinish = async (values) => {
    try {
      await axios.post('http://localhost:8080/add_employee', {
        ...values,
        ce_id: ce.id,
        sector_id: sector.id,
      });
      message.success('Employee added successfully');
      fetchEmployees();
      onClose();
    } catch (error) {
      message.error('Failed to add employee');
      console.error('Failed to add employee:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Add Employee"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Add
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter the employee name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="skills" label="Skills">
          <Select mode="multiple" placeholder="Select skills">
            {skills.map((skill) => (
              <Select.Option key={skill.id} value={skill.id}>
                {skill.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
