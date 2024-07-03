import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import api from "../utils/Api.jsx";

const { Option } = Select;

const AddEmployeeModal = ({ visible, onClose, planning, fetchPlannings }) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('http://localhost:8080/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleFinish = async (values) => {
    try {
      await api.post('http://localhost:8080/add_employee_to_planning', {
        ...values,
        ce_id: planning.ce_id,
        sector_id: planning.sector_id,
        date: planning.date,
        shift: planning.shift,
      });
      message.success('Employee added to planning successfully');
      fetchPlannings();
      onClose();
    } catch (error) {
      message.error('Failed to add employee to planning');
      console.error('Failed to add employee to planning:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Add Employee to Planning"
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

export default AddEmployeeModal;
