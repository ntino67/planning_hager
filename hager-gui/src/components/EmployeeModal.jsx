// EmployeeModal.jsx

import React, { useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

const { Option } = Select;

const EmployeeModal = ({ visible, onClose, employee, ces, sectors, skills, onSubmit, preSelectedCE, preSelectedSector }) => {
    const [form] = Form.useForm();
    const inputRef = useRef(null);

    useEffect(() => {
        if (visible) {
            form.resetFields(); // Reset form fields when modal becomes visible
            if (employee) {
                form.setFieldsValue({
                    name: employee.Name,
                    ce_id: employee.CEID,
                    sector_id: employee.SectorID,
                    skills: employee.Skills ? employee.Skills.map(skill => skill.id) : []
                });
            } else {
                form.setFieldsValue({
                    ce_id: preSelectedCE,
                    sector_id: preSelectedSector,
                    skills: [] // Reset skills when adding a new employee
                });
            }
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [visible, employee, form, preSelectedCE, preSelectedSector]);

    const handleSubmit = async (values) => {
        console.log("Submitting employee data:", values);
        onSubmit(values);
    };

    return (
        <Modal
            title={employee ? "Edit Employee" : "Add Employee"}
            visible={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            destroyOnClose={true}
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter the employee name' }]}
                >
                    <Input ref={inputRef} />
                </Form.Item>
                <Form.Item
                    name="ce_id"
                    label="CE"
                    rules={[{ required: true, message: 'Please select a CE' }]}
                >
                    <Select disabled={!employee && preSelectedCE !== null}>
                        {ces.map(ce => (
                            <Option key={ce.id} value={ce.id}>{ce.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="sector_id"
                    label="Sector"
                    rules={[{ required: true, message: 'Please select a sector' }]}
                >
                    <Select disabled={!employee && preSelectedSector !== null}>
                        {sectors.map(sector => (
                            <Option key={sector.id} value={sector.id}>{sector.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="skills"
                    label="Skills"
                >
                    <Select mode="multiple">
                        {skills.map(skill => (
                            <Option key={skill.id} value={skill.name}>{skill.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EmployeeModal;