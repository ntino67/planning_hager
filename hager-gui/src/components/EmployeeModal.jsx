import React from 'react';
import {Form, Input, Modal, Select} from 'antd';

const {Option} = Select;

const EmployeeModal = ({visible, onOk, onCancel, employee, onChange, sectors, ces, skills}) => {
    const handleChange = (e) => {
        const {name, value} = e.target;
        onChange({...employee, [name]: value});
    };

    const handleSelectChange = (value, field) => {
        onChange({...employee, [field]: value});
    };

    return (
        <Modal title="Add Employee" visible={visible} onOk={onOk} onCancel={onCancel}>
            <Form layout="vertical">
                <Form.Item label="Name">
                    <Input name="name" value={employee.name} onChange={handleChange}/>
                </Form.Item>
                <Form.Item label="Sector">
                    <Select value={employee.sector} onChange={(value) => handleSelectChange(value, 'sector')}>
                        {sectors.map((sector) => (
                            <Option key={sector.id} value={sector.name}>
                                {sector.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="CE">
                    <Select value={employee.ce} onChange={(value) => handleSelectChange(value, 'ce')}>
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
                            <Option key={skill.id} value={skill.id}>
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
