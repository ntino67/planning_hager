import React, {useEffect, useState} from 'react';
import {Button, Dropdown, Menu, message, Table} from 'antd';
import axios from 'axios';
import './EmployeeGrid.css';
import {EmployeeModal, ModifyEmployeeModal} from './EmployeeModal';

const PlanningGrid = ({sectors, ces}) => {
    const [planning, setPlanning] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
    const [newEmployee, setNewEmployee] = useState({name: '', sector: '', ce: ''});
    const [modifyEmployee, setModifyEmployee] = useState({id: '', name: '', sector: '', ce: ''});

    useEffect(() => {
        fetchPlanningData();
    }, []);

    const fetchPlanningData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/planning');
            setPlanning(response.data || []);
        } catch (error) {
            console.error('Failed to fetch planning data', error);
        }
    };

    const handleAdd = (ce, sector) => {
        setNewEmployee({name: '', sector, ce});
        setIsModalVisible(true);
    };

    const handleModify = (employee) => {
        setModifyEmployee({
            id: employee.employee_id,
            name: employee.employee_name,
            sector: employee.sector_name,
            ce: employee.ce_name,
        });
        setIsModifyModalVisible(true);
    };

    const handleDelete = async (name, sector, ce) => {
        try {
            const response = await axios.post('http://localhost:8080/delete_employee', {name, sector, ce});
            if (response.status === 200) {
                message.success('Employee deleted successfully');
                fetchPlanningData();
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to delete employee');
        }
    };

    const handleOk = async () => {
        try {
            const response = await axios.post('http://localhost:8080/add_employee', newEmployee);
            if (response.status === 200) {
                message.success('Employee added successfully');
                fetchPlanningData();
            }
        } catch (error) {
            console.error('Failed to add employee:', error);
            message.error('Failed to add employee');
        }
        setIsModalVisible(false);
    };

    const handleModifyOk = async (updatedEmployee) => {
        try {
            const response = await axios.post('http://localhost:8080/modify_employee', updatedEmployee);
            if (response.status === 200) {
                message.success('Employee modified successfully');
                fetchPlanningData();
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to modify employee');
        }
        setIsModifyModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsModifyModalVisible(false);
    };

    const columns = [
        {
            title: 'Shift',
            dataIndex: 'shift',
            key: 'shift',
            render: (text, record) => (
                <div>
                    {record.ce ? (
                        <div className="employee-cell" onClick={() => handleModify(record.ce)}>
                            <span className="employee-name">{record.ce}</span>
                        </div>
                    ) : (
                        <Button
                            type="dashed"
                            className="custom-add-button"
                            onClick={() => handleAdd(record.ce, record.sector)}
                        >
                            +
                        </Button>
                    )}
                </div>
            ),
        },
        ...sectors.map((sector) => ({
            title: sector.name,
            dataIndex: sector.name,
            key: sector.id,
            render: (text, record) => (
                <div>
                    {record[sector.name] ? (
                        <Dropdown
                            overlay={
                                <Menu onClick={(e) => handleMenuClick(e, record[sector.name])}>
                                    <Menu.Item key="edit">Edit</Menu.Item>
                                    <Menu.Item key="delete">Delete</Menu.Item>
                                </Menu>
                            }
                        >
                            <div className="employee-cell">
                                <span className="employee-name">{record[sector.name]}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <Button
                            type="dashed"
                            className="custom-add-button"
                            onClick={() => handleAdd(record.ce, sector.name)}
                        >
                            +
                        </Button>
                    )}
                </div>
            ),
        })),
    ];

    const data = generateTableData(planning, sectors);

    return (
        <div>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                rowKey="shift"
            />
            <EmployeeModal
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                employee={newEmployee}
                onChange={setNewEmployee}
                sectors={sectors}
                ces={ces}
            />
            <ModifyEmployeeModal
                open={isModifyModalVisible}
                onOk={handleModifyOk}
                onCancel={handleCancel}
                employee={modifyEmployee}
                onChange={setModifyEmployee}
                sectors={sectors}
                ces={ces}
            />
        </div>
    );
};

const generateTableData = (planning, sectors) => {
    const shifts = ['4 AM - 12 PM', '12 PM - 8 PM', '8 PM - 4 AM'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const data = [];

    days.forEach((day) => {
        shifts.forEach((shift) => {
            const row = {shift: `${day} ${shift}`, ce: null};
            sectors.forEach((sector) => {
                row[sector.name] = null;
            });
            data.push(row);
        });
    });

    planning.forEach((item) => {
        const dayIndex = days.findIndex((day) => day === item.day);
        const shiftIndex = shifts.findIndex((shift) => shift === item.shift);
        const rowIndex = dayIndex * 3 + shiftIndex;
        const row = data[rowIndex];
        row.ce = item.ce;
        item.sectors.forEach((sector) => {
            row[sector.name] = sector.employee;
        });
    });

    return data;
};

export default PlanningGrid;
