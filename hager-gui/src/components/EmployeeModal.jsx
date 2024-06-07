import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Select} from 'antd';
import axios from 'axios';

const EmployeeModal = ({visible, onClose, ce, sector, fetchEmployees}) => {
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
                    rules={[{required: true, message: 'Please enter the employee name'}]}
                >
                    <Input/>
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

export default EmployeeModal;
