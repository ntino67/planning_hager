import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Select} from 'antd';
import axios from 'axios';

const ModifyEmployeeModal = ({visible, onClose, employee, fetchEmployees}) => {
    const [form] = Form.useForm();
    const [skills, setSkills] = useState([]);
    const [ces, setCEs] = useState([]);
    const [sectors, setSectors] = useState([]);

    useEffect(() => {
        fetchSkills();
        fetchCEs();
        fetchSectors();
        if (employee) {
            form.setFieldsValue({
                name: employee.name,
                ce_id: employee.ce_id,
                sector_id: employee.sector_id,
                skills: employee.Skills.map((skill) => skill.id),
            });
        }
    }, [employee]);

    const fetchSkills = async () => {
        try {
            const response = await axios.get('http://localhost:8080/skills');
            setSkills(response.data);
        } catch (error) {
            console.error('Failed to fetch skills:', error);
        }
    };

    const fetchCEs = async () => {
        try {
            const response = await axios.get('http://localhost:8080/ces');
            setCEs(response.data);
        } catch (error) {
            console.error('Failed to fetch CEs:', error);
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/sectors');
            setSectors(response.data);
        } catch (error) {
            console.error('Failed to fetch sectors:', error);
        }
    };

    const handleFinish = async (values) => {
        try {
            await axios.put(`http://localhost:8080/update_employee/${employee.id}`, {
                ...values,
                id: employee.id,
            });
            message.success('Employee updated successfully');
            fetchEmployees();
            onClose();
        } catch (error) {
            message.error('Failed to update employee');
            console.error('Failed to update employee:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            title="Modify Employee"
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    Save
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{required: true, message: 'Please enter the employee name'}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="ce_id"
                    label="CE"
                    rules={[{required: true, message: 'Please select the CE'}]}
                >
                    <Select placeholder="Select CE">
                        {ces.map((ce) => (
                            <Select.Option key={ce.id} value={ce.id}>
                                {ce.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="sector_id"
                    label="Sector"
                    rules={[{required: true, message: 'Please select the sector'}]}
                >
                    <Select placeholder="Select sector">
                        {sectors.map((sector) => (
                            <Select.Option key={sector.id} value={sector.id}>
                                {sector.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="skills" label="Skills">
                    <Select
                        mode="multiple"
                        showSearch
                        placeholder="Select skills"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {skills.map(skill => (
                            <Option key={skill.id} value={skill.id} label={skill.name}>
                                {skill.name}
                            </Option>
                        ))}
                    </Select>

                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModifyEmployeeModal;
