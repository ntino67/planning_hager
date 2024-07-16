import React, {useEffect, useState} from 'react';
import {Form, Input, message, Modal, Select, Spin} from 'antd';

const {Option} = Select;

interface EmployeeModalProps {
    visible: boolean;
    onClose: () => void;
    employee: Employee | null;
    ces: CE[];
    sectors: Sector[];
    skills: Skill[];
    onSubmit: (values: any, employeeId?: number) => Promise<void>;
    preSelectedCE?: number | null;
    preSelectedSector?: number | null;
}

interface Employee {
    ID: number;
    Name: string;
    CEID: number;
    SectorID: number;
    Skills: Skill[];
}

interface CE {
    id: number;
    name: string;
}

interface Sector {
    id: number;
    name: string;
}

interface Skill {
    id: number;
    name: string;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
    visible,
    onClose,
    employee,
    ces,
    sectors,
    skills,
    onSubmit,
    preSelectedCE,
    preSelectedSector
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('EmployeeModal props:', {visible, employee, preSelectedCE, preSelectedSector});

        if (visible) {
            if (employee) {
                console.log('Setting form for existing employee:', employee);
                form.setFieldsValue({
                    name: employee.Name,
                    ce_id: employee.CEID,
                    sector_id: employee.SectorID,
                    skills: employee.Skills ? employee.Skills.map(skill => skill.id) : []
                });
            } else {
                console.log('Setting form for new employee');
                form.resetFields();
                if (preSelectedCE) form.setFieldsValue({ce_id: preSelectedCE});
                if (preSelectedSector) form.setFieldsValue({sector_id: preSelectedSector});
            }
        }
    }, [visible, employee, form, preSelectedCE, preSelectedSector]);

    const handleSubmit = async (values: any) => {
        console.log('Submitting values:', values);
        setLoading(true);
        try {
            await onSubmit(values, employee?.ID);
            onClose();
        } catch (error) {
            console.error('Failed to submit employee:', error);
            message.error('Failed to submit employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={employee ? "Edit Employee" : "Add Employee"}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
        >
            <Spin spinning={loading} tip="Updating employee data...">
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{required: true, message: 'Please input the employee name!'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="ce_id"
                        label="CE"
                        rules={[{required: true, message: 'Please select a CE!'}]}
                    >
                        <Select>
                            {ces.map(ce => (
                                <Option key={ce.id} value={ce.id}>{ce.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="sector_id"
                        label="Sector"
                        rules={[{required: true, message: 'Please select a sector!'}]}
                    >
                        <Select>
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
            </Spin>
        </Modal>
    );
};

export default EmployeeModal;