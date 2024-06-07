import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Button, Dropdown, Menu, message, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import CEModal from './CEModal';
import SectorModal from './SectorModal';
import ModifyCEModal from './ModifyCEModal';
import ModifySectorModal from './ModifySectorModal';
import EmployeeModal from './EmployeeModal';
import ModifyEmployeeModal from './ModifyEmployeeModal';
import './EmployeeGrid.css';

const EmployeeGrid = () => {
    const [employees, setEmployees] = useState([]);
    const [ces, setCEs] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [selectedCE, setSelectedCE] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isCEModalVisible, setCEModalVisible] = useState(false);
    const [isSectorModalVisible, setSectorModalVisible] = useState(false);
    const [isModifyCEModalVisible, setModifyCEModalVisible] = useState(false);
    const [isModifySectorModalVisible, setModifySectorModalVisible] = useState(false);
    const [isEmployeeModalVisible, setEmployeeModalVisible] = useState(false);
    const [isModifyEmployeeModalVisible, setModifyEmployeeModalVisible] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchCEs();
        fetchSectors();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get('http://localhost:8080/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
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

    const handleMenuClick = (item, type) => {
        if (type === 'ce') {
            setSelectedCE(item);
            setModifyCEModalVisible(true);
        } else if (type === 'sector') {
            setSelectedSector(item);
            setModifySectorModalVisible(true);
        } else if (type === 'employee') {
            setSelectedEmployee(item);
            setModifyEmployeeModalVisible(true);
        }
    };

    const handleDelete = async (item, type) => {
        try {
            if (type === 'ce') {
                await axios.delete(`http://localhost:8080/delete_ce/${item.id}`);
                message.success('CE deleted successfully');
                fetchCEs();
            } else if (type === 'sector') {
                await axios.delete(`http://localhost:8080/delete_sector/${item.id}`);
                message.success('Sector deleted successfully');
                fetchSectors();
            } else if (type === 'employee') {
                await axios.delete(`http://localhost:8080/delete_employee/${item.id}`);
                message.success('Employee deleted successfully');
                fetchEmployees();
            }
        } catch (error) {
            message.error('Failed to delete');
            console.error('Failed to delete:', error);
        }
    };

    const renderDropdown = (item, type) => {
        let menuItems = [
            <Menu.Item key="edit" icon={<EditOutlined/>} onClick={() => handleMenuClick(item, type)}>
                Edit
            </Menu.Item>,
            <Menu.Item key="delete" icon={<DeleteOutlined/>} onClick={() => handleDelete(item, type)}>
                Delete
            </Menu.Item>,
        ];

        if (type === 'employee') {
            menuItems.unshift(
                <Menu.Item key="add" icon={<PlusOutlined/>} onClick={() => {
                    setSelectedSector(selectedSector);
                    setSelectedCE(selectedCE);
                    setEmployeeModalVisible(true);
                }}>
                    Add
                </Menu.Item>
            );
        }

        return (
            <Dropdown overlay={<Menu>{menuItems}</Menu>}>
                <span className="dropdown-text">{item.name}</span>
            </Dropdown>
        );
    };


    const renderTableData = () => {
        const data = ces.map((ce) => {
            const row = {key: ce.id, ceName: ce.name};
            sectors.forEach((sector) => {
                const sectorEmployees = employees.filter((emp) => emp.ce_id === ce.id && emp.sector_id === sector.id);
                row[sector.name] = sectorEmployees.length ? sectorEmployees.map((emp) => (
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="edit" icon={<EditOutlined/>}
                                           onClick={() => handleMenuClick(emp, 'employee')}>
                                    Edit
                                </Menu.Item>
                                <Menu.Item key="delete" icon={<DeleteOutlined/>}
                                           onClick={() => handleDelete(emp, 'employee')}>
                                    Delete
                                </Menu.Item>
                                <Menu.Item key="add" icon={<PlusOutlined/>} onClick={() => {
                                    setSelectedSector(sector);
                                    setSelectedCE(ce);
                                    setEmployeeModalVisible(true);
                                }}>
                                    Add
                                </Menu.Item>
                            </Menu>
                        }
                        key={emp.id}
                    >
                        <span className="dropdown-text">{emp.name}</span>
                    </Dropdown>
                )) : (
                    <Button
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            setSelectedSector(sector);
                            setSelectedCE(ce);
                            setEmployeeModalVisible(true);
                        }}
                    />
                );
            });
            return row;
        });

        const columns = [
            {
                title: 'CE',
                dataIndex: 'ceName',
                key: 'ceName',
                render: (text, record) => (
                    <div className="dropdown-container">
                        {renderDropdown({name: text, id: record.key}, 'ce')}
                    </div>
                ),
            },
            ...sectors.map((sector) => ({
                title: (
                    <div className="dropdown-container">
                        {renderDropdown(sector, 'sector')}
                    </div>
                ),
                dataIndex: sector.name,
                key: sector.id,
                render: (text, record) => (
                    <div className="table-row">
                        {text}
                    </div>
                ),
            })),
        ];

        return {data, columns};
    };

    const {data, columns} = renderTableData();

    return (
        <div className="employee-grid">
            <div className="header-buttons">
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => setCEModalVisible(true)}>
                    Add CE
                </Button>
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => setSectorModalVisible(true)}>
                    Add Sector
                </Button>
            </div>
            <div className="table-responsive">
                <Table
                    dataSource={data}
                    columns={columns}
                    pagination={false}
                    scroll={{x: 'max-content'}}
                    style={{tableLayout: 'fixed'}}
                />
            </div>
            <CEModal
                visible={isCEModalVisible}
                onClose={() => setCEModalVisible(false)}
                fetchCEs={fetchCEs}
            />
            <ModifyCEModal
                visible={isModifyCEModalVisible}
                onClose={() => setModifyCEModalVisible(false)}
                ce={selectedCE}
                fetchCEs={fetchCEs}
            />
            <SectorModal
                visible={isSectorModalVisible}
                onClose={() => setSectorModalVisible(false)}
                fetchSectors={fetchSectors}
            />
            <ModifySectorModal
                visible={isModifySectorModalVisible}
                onClose={() => setModifySectorModalVisible(false)}
                sector={selectedSector}
                fetchSectors={fetchSectors}
            />
            <EmployeeModal
                visible={isEmployeeModalVisible}
                onClose={() => setEmployeeModalVisible(false)}
                ce={selectedCE}
                sector={selectedSector}
                fetchEmployees={fetchEmployees}
            />
            <ModifyEmployeeModal
                visible={isModifyEmployeeModalVisible}
                onClose={() => setModifyEmployeeModalVisible(false)}
                employee={selectedEmployee}
                fetchEmployees={fetchEmployees}
            />
        </div>
    );
};

export default EmployeeGrid;
