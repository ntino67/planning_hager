import React, {useCallback, useEffect, useState} from 'react';
import {Button, Dropdown, Input, Menu, message, Modal, Spin, Table, TableColumnsType, Tooltip} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';
import CEModal from './CEModal';
import SectorModal from './SectorModal';
import EmployeeModal from './EmployeeModal';
import ReservistModal from './ReservistModal';
import './EmployeeGrid.css';
import api from '../utils/Api';

const {Search} = Input;

interface Employee {
    ID: number;
    Name: string;
    CEID: number;
    CE: {
        id: number;
        name: string;
    };
    SectorID: number;
    Sector: {
        id: number;
        name: string;
    };
    Skills: {
        id: number;
        name: string;
    }[];
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

interface Reservist {
    id: number;
    name: string;
    skills: {
        id: number;
        name: string;
    }[];
}

const EmployeeGrid: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [reservists, setReservists] = useState<Reservist[]>([]);
    const [filteredReservists, setFilteredReservists] = useState<Reservist[]>([]);
    const [ces, setCEs] = useState<CE[]>([]);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isCEModalVisible, setCEModalVisible] = useState(false);
    const [isSectorModalVisible, setSectorModalVisible] = useState(false);
    const [isEmployeeModalVisible, setEmployeeModalVisible] = useState(false);
    const [isReservistModalVisible, setReservistModalVisible] = useState(false);
    const [selectedCE, setSelectedCE] = useState<CE | null>(null);
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedReservist, setSelectedReservist] = useState<Reservist | null>(null);
    const [preSelectedCE, setPreSelectedCE] = useState<number | null>(null);
    const [preSelectedSector, setPreSelectedSector] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [reservistSearchText, setReservistSearchText] = useState('');

    const fetchData = useCallback(async (endpoint: string, setter: React.Dispatch<React.SetStateAction<any>>, errorMessage: string) => {
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

    const handleSearch = (value: string) => {
        setSearchText(value);
        const filtered = employees.filter(employee =>
            employee.Name.toLowerCase().includes(value.toLowerCase()) ||
            employee.CE.name.toLowerCase().includes(value.toLowerCase()) ||
            employee.Sector.name.toLowerCase().includes(value.toLowerCase()) ||
            employee.Skills.some(skill => skill.name.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredEmployees(filtered);

        const filteredRes = reservists.filter(reservist =>
            reservist.name.toLowerCase().includes(value.toLowerCase()) ||
            reservist.skills.some(skill => skill.name.toLowerCase().includes(value.toLowerCase()))
        );
        setFilteredReservists(filteredRes);
    };

    const showDeleteConfirm = (type: string, id: number) => {
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

    const renderDropdown = (item: { id: number; name: string }, type: string, ceId?: number, sectorId?: number) => (
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

    const handleModalVisibility = (type: string, visible: boolean, item: any = null) => {
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
                if (visible) {
                    if (item && item.ID) {
                        // Editing an existing employee
                        const fullEmployeeData = employees.find(emp => emp.ID === item.ID);
                        if (fullEmployeeData) {
                            setSelectedEmployee(fullEmployeeData);
                            setPreSelectedCE(null);
                            setPreSelectedSector(null);
                        } else {
                            console.error(`Employee with ID ${item.ID} not found`);
                            message.error('Employee data not found');
                            return;
                        }
                    } else if (item && item.ceId && item.sectorId) {
                        // Adding a new employee with preselected CE and Sector
                        setSelectedEmployee(null);
                        setPreSelectedCE(item.ceId);
                        setPreSelectedSector(item.sectorId);
                    } else {
                        // Adding a new employee without preselections
                        setSelectedEmployee(null);
                        setPreSelectedCE(null);
                        setPreSelectedSector(null);
                    }
                } else {
                    // Closing the modal
                    setSelectedEmployee(null);
                    setPreSelectedCE(null);
                    setPreSelectedSector(null);
                }
                setEmployeeModalVisible(visible);
                break;
            case 'reservist':
                if (item) {
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

    const handleEmployeeSubmit = async (values: any) => {
        console.log('handleEmployeeSubmit called with values:', values);
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                ce_id: values.ce_id,
                sector_id: values.sector_id,
                skills: values.skills
            };

            let response;
            if (selectedEmployee) {
                console.log('Updating existing employee:', selectedEmployee.ID);
                response = await api.put(`/update_employee/${selectedEmployee.ID}`, payload);
            } else {
                console.log('Creating new employee');
                response = await api.post('/add_employee', payload);
            }

            console.log('API response:', response.data);

            if (response.data.requiresSwap) {
                const confirmed = await showSwapConfirmation(response.data.existingEmployee);
                if (confirmed) {
                    const swapPayload = {
                        ...payload,
                        swap: true
                    };
                    const swapResponse = await api.put(`/update_employee/${response.data.id || selectedEmployee?.ID}`, swapPayload);
                    console.log('Swap response:', swapResponse.data);
                    message.success('Employees swapped successfully');
                } else {
                    console.log('Swap cancelled by user');
                    return; // Don't close modal or refresh if swap is cancelled
                }
            } else {
                message.success(selectedEmployee ? 'Employee updated successfully' : 'Employee added successfully');
            }

            setEmployeeModalVisible(false);
            await refreshGrid();
        } catch (error) {
            console.error('Failed to submit employee:', error);
            message.error('Failed to submit employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const showSwapConfirmation = (existingEmployee: any): Promise<boolean> => {
        return new Promise((resolve) => {
            Modal.confirm({
                title: 'Confirm Employee Swap',
                content: `There is already an employee (${existingEmployee.name}) in the selected position. Do you want to swap their positions?`,
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    };

    const handleDelete = async (type: string, id: number) => {
        try {
            await api.delete(`http://localhost:8080/delete_${type}/${id}`);
            message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);

            // Update local state based on the type
            if (type === 'ce') {
                setCEs(prevCEs => prevCEs.filter(ce => ce.id !== id));
            } else if (type === 'sector') {
                setSectors(prevSectors => prevSectors.filter(sector => sector.id !== id));
            }

            // Refresh the employees grid
            await fetchEmployees();
        } catch (error) {
            message.error(`Failed to delete ${type}`);
        }
    };

    const handleReservistSubmit = async (values: any) => {
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
            console.error('Failed to save reservist:', error);
            message.error('Failed to save reservist: ' + (error as Error).message);
        }
    };

    const columns: TableColumnsType<any> = [
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
            render: (employees: any[], record: any) => (
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
        const row: any = {key: ce.id, ceName: ce.name};
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

    const reservistColumns: TableColumnsType<Reservist> = [
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