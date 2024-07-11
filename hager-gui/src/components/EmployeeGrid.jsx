import React, {useCallback, useEffect, useState} from 'react';
import {Button, Dropdown, Input, Menu, message, Modal, Spin, Table, Tooltip} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';
import CEModal from './CEModal';
import SectorModal from './SectorModal';
import EmployeeModal from './EmployeeModal';
import ReservistModal from './ReservistModal';
import './EmployeeGrid.css';
import api from '../utils/Api.jsx';

const {Search} = Input;

const EmployeeGrid = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [reservists, setReservists] = useState([]);
    const [filteredReservists, setFilteredReservists] = useState([]);
    const [ces, setCEs] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [skills, setSkills] = useState([]);
    const [isCEModalVisible, setCEModalVisible] = useState(false);
    const [isSectorModalVisible, setSectorModalVisible] = useState(false);
    const [isEmployeeModalVisible, setEmployeeModalVisible] = useState(false);
    const [isReservistModalVisible, setReservistModalVisible] = useState(false);
    const [selectedCE, setSelectedCE] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedReservist, setSelectedReservist] = useState(null);
    const [preSelectedCE, setPreSelectedCE] = useState(null);
    const [preSelectedSector, setPreSelectedSector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [reservistSearchText, setReservistSearchText] = useState('');


    const fetchData = useCallback(async (endpoint, setter, errorMessage) => {
        try {
            const response = await api.get(`http://localhost:8080/${endpoint}`);
            setter(response.data);
        } catch (error) {
            message.error(errorMessage);
        }
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            console.log('Fetched employees:', response.data);
            setEmployees(response.data);
            setFilteredEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            message.error('Failed to fetch employees');
        }
    };

    const fetchReservists = useCallback(async () => {
        try {
            const response = await api.get('/reservists');
            console.log('Fetched reservists:', response.data);
            setReservists(response.data || []);
            setFilteredReservists(response.data || []);
        } catch (error) {
            console.error('Failed to fetch reservists:', error);
            message.error('Failed to fetch reservists');
            setReservists([]);
            setFilteredReservists([]);
        }
    }, []);

    const fetchCEs = async () => {
        try {
            const response = await api.get('/ces');
            console.log('Fetched CEs:', response.data);
            setCEs(response.data);
        } catch (error) {
            console.error('Error fetching CEs:', error);
            message.error('Failed to fetch CEs');
        }
    }

    const fetchSectors = async () => {
        try {
            const response = await api.get('/sectors');
            console.log('Fetched sectors:', response.data);
            setSectors(response.data);
        } catch (error) {
            console.error('Error fetching sectors:', error);
            message.error('Failed to fetch sectors');
        }
    }

    const fetchSkills = async () => {
        try {
            const response = await api.get('http://localhost:8080/skills');
            setSkills(response.data);
        } catch (error) {
            message.error('Failed to fetch skills');
        }
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchEmployees(),
            fetchReservists(),
            fetchCEs(),
            fetchSectors(),
            fetchSkills(),
        ]).then(() => setLoading(false));
    }, [fetchData]);

    useEffect(() => {
        const filtered = reservists.filter(r =>
            r.name.toLowerCase().includes(reservistSearchText.toLowerCase()) ||
            r.skills.some(s => s.name.toLowerCase().includes(reservistSearchText.toLowerCase()))
        );
        console.log('Filtered reservists:', filtered);
        setFilteredReservists(filtered);
    }, [reservists, reservistSearchText]);

    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = employees.filter(employee =>
            employee.Name.toLowerCase().includes(value.toLowerCase()) ||
            employee.CE.name.toLowerCase().includes(value.toLowerCase()) ||
            employee.Sector.name.toLowerCase().includes(value.toLowerCase()) ||
            employee.Skills.some(skill => skill.name.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredEmployees(filtered);

        const filteredRes = reservists.filter(reservist =>
            reservist.Name.toLowerCase().includes(value.toLowerCase()) ||
            reservist.Skills.some(skill => skill.name.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredReservists(filteredRes);
    };

    const showDeleteConfirm = (type, id) => {
        Modal.confirm({
            title: `Are you sure you want to delete this ${type}?`,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                handleDelete(type, id);
            },
        });
    };

    const renderDropdown = (item, type, ceId, sectorId) => (
        <Dropdown overlay={
            <Menu>
                <Menu.Item key="edit" icon={<EditOutlined/>} onClick={() => handleModalVisibility(type, true, item)}>
                    Edit
                </Menu.Item>
                <Menu.Item key="delete" icon={<DeleteOutlined/>} onClick={() => showDeleteConfirm(type, item.id)}>
                    Delete
                </Menu.Item>
            </Menu>
        }>
            <Tooltip title={`${type.charAt(0).toUpperCase() + type.slice(1)} options`}>
                <span className={`${type}-button`}>{item.name}</span>
            </Tooltip>
        </Dropdown>
    );

    const refreshGrid = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchEmployees(), fetchReservists()]);
        } catch (error) {
            console.error('Failed to refresh grid:', error);
            message.error('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    const handleModalVisibility = (type, visible, item = null) => {
        switch (type) {
            case 'ce':
                setCEModalVisible(visible);
                setSelectedCE(item);
                break;
            case 'sector':
                setSectorModalVisible(visible);
                setSelectedSector(item);
                break;
            case 'employee':
                if (item && item.ceId && item.sectorId) {
                    setPreSelectedCE(item.ceId);
                    setPreSelectedSector(item.sectorId);
                    setSelectedEmployee(null);
                } else if (item && item.id) {
                    const fullEmployeeData = employees.find(emp => emp.ID === item.id);
                    setSelectedEmployee(fullEmployeeData);
                    setPreSelectedCE(null);
                    setPreSelectedSector(null);
                } else {
                    setSelectedEmployee(null);
                    setPreSelectedCE(null);
                    setPreSelectedSector(null);
                }
                setEmployeeModalVisible(visible);
                break;
            case 'reservist':
                if (item) {
                    // Directly use the item as it already has the correct structure
                    setSelectedReservist(item);
                } else {
                    setSelectedReservist(null);
                }
                setReservistModalVisible(visible);
                break;
            default:
                break;
        }
    };

    const showSwapConfirmation = (existingEmployee) => {
        return new Promise((resolve) => {
            Modal.confirm({
                title: 'Confirm Employee Swap',
                content: `There is already an employee (${existingEmployee.Name}) in the selected position. Do you want to swap their positions?`,
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    };

    const handleEmployeeSubmit = async (values) => {
        setLoading(true)
        try {
            const payload = {};
            if (values.name) payload.name = values.name;
            if (values.ce_id) payload.ce_id = values.ce_id;
            if (values.sector_id) payload.sector_id = values.sector_id;
            if (values.skills && values.skills.length > 0) payload.skills = values.skills;

            const response = await api.put(`/update_employee/${selectedEmployee.ID}`, payload);

            if (response.data.requiresSwap) {
                const confirmed = await showSwapConfirmation(response.data.existingEmployee);
                if (confirmed) {
                    const swapResponse = await api.put(`/update_employee/${selectedEmployee.ID}`, {
                        ...payload,
                        swap: true
                    });
                    message.success('Employees swapped successfully');
                    setEmployeeModalVisible(false);
                    await refreshGrid();
                }
            } else {
                message.success('Employee updated successfully');
                setEmployeeModalVisible(false);
                await refreshGrid();
            }
        } catch (error) {
            console.error('Failed to update employee:', error);
            message.error('Failed to update employee');
        } finally {
            setLoading(false)
        }
    };

    const handleDelete = async (type, id) => {
        try {
            await api.delete(`http://localhost:8080/delete_${type}/${id}`);
            message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
            refreshGrid();
        } catch (error) {
            message.error(`Failed to delete ${type}`);
        }
    };

    const handleReservistSubmit = async (values) => {
        console.log('Submitting reservist data:', values);
        try {
            if (selectedReservist) {
                await api.put(`/update_reservist/${selectedReservist.id}`, values);
                message.success('Reservist updated successfully');
            } else {
                await api.post('/add_reservist', values);
                message.success('Reservist added successfully');
            }
            setReservistModalVisible(false);
            await fetchReservists();
        } catch (error) {
            console.error('Failed to save reservist:', error.response?.data || error.message);
            message.error('Failed to save reservist: ' + (error.response?.data?.error || error.message));
        }
    };

    const columns = [
        {
            title: 'CE',
            dataIndex: 'ceName',
            key: 'ceName',
            render: (text, record) => renderDropdown({name: text, id: record.key}, 'ce'),
            className: 'ce-column'
        },
        ...sectors.map(sector => ({
            title: renderDropdown(sector, 'sector'),
            dataIndex: sector.name,
            key: sector.id,
            render: (employees, record) => (
                <div className="employee-cell">
                    {employees && employees.length > 0 ? employees.map(employee => (
                        renderDropdown(employee, 'employee', record.key, sector.id)
                    )) : null}
                    <Button
                        icon={<PlusOutlined/>}
                        onClick={() => handleModalVisibility('employee', true, {ceId: record.key, sectorId: sector.id})}
                        className="add-employee-button"
                    />
                </div>
            ),
            className: 'sector-column'
        })),
    ];

    const data = ces.map(ce => {
        const row = {key: ce.id, ceName: ce.name};
        sectors.forEach(sector => {
            row[sector.name] = filteredEmployees.filter(emp =>
                emp.CEID === ce.id && emp.SectorID === sector.id
            ).map(emp => ({
                id: emp.ID,
                name: emp.Name,
                skills: emp.Skills.map(skill => skill.name)
            }));
        });
        return row;
    });

    const reservistColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => renderDropdown(record, 'reservist'),
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            key: 'skills',
            render: (skills) => (
                <span className="reservist-skills">
                    {skills && Array.isArray(skills) ? skills.map(skill => skill.name).join(', ') : ''}
                </span>
            ),
        },
    ];

    return (
        <Spin spinning={loading} tip="Updating data...">
            <div className="employee-grid">
                <div className="header-controls">
                    <div className="header-buttons">
                        <Tooltip title="Add new CE">
                            <Button type="primary" icon={<PlusOutlined/>}
                                    onClick={() => handleModalVisibility('ce', true)}>
                                Add CE
                            </Button>
                        </Tooltip>
                        <Tooltip title="Add new Sector">
                            <Button type="primary" icon={<PlusOutlined/>}
                                    onClick={() => handleModalVisibility('sector', true)}>
                                Add Sector
                            </Button>
                        </Tooltip>
                    </div>
                    <Search
                        placeholder="Search employees and reservists"
                        allowClear
                        enterButton={<SearchOutlined/>}
                        size="large"
                        onSearch={handleSearch}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{width: 300}}
                    />
                </div>
                <Spin spinning={loading}>
                    <Table
                        dataSource={data}
                        columns={columns}
                        pagination={false}
                        scroll={{x: 'max-content'}}
                        bordered
                        className="employee-table"
                    />
                    <h2 style={{marginTop: '20px'}}>Reservists</h2>
                    <div className="header-controls">
                        <div className="header-buttons">
                            <Tooltip title="Add new Reservist">
                                <Button type="primary" icon={<PlusOutlined/>}
                                        onClick={() => handleModalVisibility('reservist', true)}>
                                    Add Reservist
                                </Button>
                            </Tooltip>
                        </div>
                        <Search
                            placeholder="Search reservists"
                            allowClear
                            enterButton={<SearchOutlined/>}
                            size="large"
                            onSearch={setReservistSearchText}
                            onChange={(e) => setReservistSearchText(e.target.value)}
                            style={{width: 300}}
                        />
                    </div>
                    <Table
                        dataSource={filteredReservists}
                        columns={reservistColumns}
                        rowKey="id"
                        pagination={false}
                        scroll={{x: 'max-content'}}
                        bordered
                        className="reservist-table"
                    />
                </Spin>
                <CEModal
                    visible={isCEModalVisible}
                    onClose={() => handleModalVisibility('ce', false)}
                    ce={selectedCE}
                    onSubmit={() => fetchData('ces', setCEs, 'Failed to fetch CEs')}
                />
                <SectorModal
                    visible={isSectorModalVisible}
                    onClose={() => handleModalVisibility('sector', false)}
                    sector={selectedSector}
                    onSubmit={() => fetchData('sectors', setSectors, 'Failed to fetch sectors')}
                />
                <EmployeeModal
                    visible={isEmployeeModalVisible}
                    onClose={() => handleModalVisibility('employee', false)}
                    employee={selectedEmployee}
                    ces={ces}
                    sectors={sectors}
                    skills={skills}
                    onSubmit={handleEmployeeSubmit}
                    preSelectedCE={preSelectedCE}
                    preSelectedSector={preSelectedSector}
                />
                <ReservistModal
            visible={isReservistModalVisible}
            onClose={() => setReservistModalVisible(false)}
            reservist={selectedReservist}
            skills={skills}
            onSubmit={handleReservistSubmit}
        />
            </div>
        </Spin>
    );
};

export default EmployeeGrid;