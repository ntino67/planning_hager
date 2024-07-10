import React, { useEffect, useState } from 'react';
import { Form, Input, message, Modal, Select, Spin } from 'antd';
import api from '../utils/Api.jsx';

const { Option } = Select;

const EmployeeModal = ({ visible, onClose, employee, ces, sectors, skills, onSubmit }) => {
    const [form] = Form.useForm();
    const [confirmSwapVisible, setConfirmSwapVisible] = useState(false);
    const [existingEmployee, setExistingEmployee] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employee) {
            form.setFieldsValue({
                name: employee.Name,
                ce_id: employee.CEID,
                sector_id: employee.SectorID,
                skills: employee.Skills ? employee.Skills.map(skill => skill.id) : []
            });
        } else {
            form.resetFields();
        }
    }, [employee, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const response = await onSubmit(values, employee.ID);
            if (response && response.requiresSwap) {
                setExistingEmployee(response.existingEmployee);
                setConfirmSwapVisible(true);
            } else {
                onClose();
            }
        } catch (error) {
            message.error('Failed to update employee');
        } finally {
            setLoading(false);
        }
    };

    const handleSwapConfirm = async () => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            setConfirmSwapVisible(false);
            await onSubmit({ ...values, swap: true }, employee.ID);
            message.success('Employees swapped successfully');
            onClose();
        } catch (error) {
            message.error('Failed to swap employees');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                title={employee ? "Edit Employee" : "Add Employee"}
                visible={visible}
                onCancel={onClose}
                onOk={() => form.submit()}
                confirmLoading={loading}
            >
                <Spin spinning={loading} tip="Updating employee data...">
                    <Form form={form} onFinish={handleSubmit} layout="vertical">
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Please input the employee name!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="ce_id"
                            label="CE"
                            rules={[{ required: true, message: 'Please select a CE!' }]}
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
                            rules={[{ required: true, message: 'Please select a sector!' }]}
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
                                    <Option key={skill.id} value={skill.id}>{skill.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
            <Modal
                title="Confirm Employee Swap"
                visible={confirmSwapVisible}
                onOk={handleSwapConfirm}
                onCancel={() => setConfirmSwapVisible(false)}
                confirmLoading={loading}
            >
                <p>There is already an employee in the selected position. Do you want to swap their positions?</p>
                {existingEmployee && (
                    <p>Employee to swap with: {existingEmployee.Name}</p>
                )}
            </Modal>
        </>
    );
};

export default EmployeeModal;