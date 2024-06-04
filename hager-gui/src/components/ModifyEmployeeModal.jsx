import React from 'react';
import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;

const ModifyEmployeeModal = ({ open, onOk, onCancel, employee, onChange, sectors, ces, skills }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...employee, [name]: value });
  };

  const handleSelectChange = (value, field) => {
    onChange({ ...employee, [field]: value });
  };

  return (
    <Modal
      open={open}
      onOk={() => onOk(employee)}
      onCancel={onCancel}
      title="Modify Employee"
    >
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input
            name="name"
            value={employee.name}
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item label="Sector">
          <Select
            value={employee.sector}
            onChange={(value) => handleSelectChange(value, 'sector')}
          >
            {sectors.map((sector) => (
              <Option key={sector.id} value={sector.name}>
                {sector.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="CE">
          <Select
            value={employee.ce}
            onChange={(value) => handleSelectChange(value, 'ce')}
          >
            {ces.map((ce) => (
              <Option key={ce.id} value={ce.name}>
                {ce.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Skills">
          <Select
            mode="multiple"
            value={employee.skills}
            onChange={(value) => handleSelectChange(value, 'skills')}
          >
            {skills.map((skill) => (
              <Option key={skill} value={skill}>
                {skill}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModifyEmployeeModal;
