import React, {useEffect, useState} from 'react';
import {Form, Input, Modal, Select} from 'antd';

const {Option} = Select;

const EmployeeModal = ({open, onOk, onCancel, employee, onChange, sectors, ces}) => {
    return (
        <Modal title="Add New Employee" open={open} onOk={onOk} onCancel={onCancel}>
            <Form layout="vertical">
                <Form.Item label="Name">
                    <Input
                        value={employee.name}
                        onChange={(e) => onChange({...employee, name: e.target.value})}
                    />
                </Form.Item>
                <Form.Item label="Sector">
                    <Select
                        value={employee.sector}
                        onChange={(value) => onChange({...employee, sector: value})}
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
                        onChange={(value) => onChange({...employee, ce: value})}
                    >
                        {ces.map((ce) => (
                            <Option key={ce.id} value={ce.name}>
                                {ce.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const ModifyEmployeeModal = ({open, onOk, onCancel, employee, onChange, sectors, ces}) => {
    const [localEmployee, setLocalEmployee] = useState(employee);

    useEffect(() => {
        setLocalEmployee(employee);
    }, [employee]);

    const handleOk = () => {
        onChange(localEmployee);
        onOk(localEmployee);
    };

    return (
        <Modal title="Modify Employee" open={open} onOk={handleOk} onCancel={onCancel}>
            <Form layout="vertical">
                <Form.Item label="Name">
                    <Input
                        value={localEmployee.name}
                        onChange={(e) => setLocalEmployee({...localEmployee, name: e.target.value})}
                    />
                </Form.Item>
                <Form.Item label="Sector">
                    <Select
                        value={localEmployee.sector}
                        onChange={(value) => setLocalEmployee({...localEmployee, sector: value})}
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
                        value={localEmployee.ce}
                        onChange={(value) => setLocalEmployee({...localEmployee, ce: value})}
                    >
                        {ces.map((ce) => (
                            <Option key={ce.id} value={ce.name}>
                                {ce.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export {EmployeeModal, ModifyEmployeeModal};
