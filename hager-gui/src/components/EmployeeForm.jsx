import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { useAppContext } from '../context/AppContext.jsx';

const { Option } = Select;

const EmployeeForm = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const { ces, sectors, skills } = useAppContext();

  const handleSubmit = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="inline">
      <Form.Item name="name" rules={[{ required: true, message: 'Please input the name!' }]}>
        <Input placeholder="Name" />
      </Form.Item>
      <Form.Item name="ce_id" rules={[{ required: true, message: 'Please select a CE!' }]}>
        <Select placeholder="Select CE">
          {ces.map((ce) => (
            <Option key={ce.id} value={ce.id}>{ce.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="sector_id" rules={[{ required: true, message: 'Please select a sector!' }]}>
        <Select placeholder="Select Sector">
          {sectors.map((sector) => (
            <Option key={sector.id} value={sector.id}>{sector.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="skills" rules={[{ required: true, message: 'Please select skills!' }]}>
        <Select mode="multiple" placeholder="Select Skills">
          {skills.map((skill) => (
            <Option key={skill.id} value={skill.id}>{skill.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Add Employee</Button>
      </Form.Item>
    </Form>
  );
};

export default EmployeeForm;