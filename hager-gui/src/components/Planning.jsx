import React, {useEffect, useState} from 'react';
import {Button, Dropdown, Menu, message, Modal, Select, Table, Tooltip} from 'antd';
import {EditOutlined, PlusOutlined} from '@ant-design/icons';
import api from '../utils/Api.jsx';
import './Planning.css';

const {Option} = Select;

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const SHIFTS = ['M', 'S', 'N'];
const STATUS_COLORS = {
    'Day shift': '#91cf50',
    'Absent (Unplanned)': '#cc00ff',
    'Absent (Planned)': '#00afee',
    'Training': '#fdbf00',
};

const STATUS_OPTIONS = [
    'Scheduled',
    'Day shift',
    'Absent (Unplanned)',
    'Absent (Planned)',
    'Training',
];

const Planning = () => {
    const [planningData, setPlanningData] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [sectorRequiredSkills, setSectorRequiredSkills] = useState({});


    useEffect(() => {
        fetchPlanningData();
        fetchSectors();
        fetchEmployees();
        fetchSectorRequiredSkills()
    }, [currentWeek]);

    const fetchPlanningData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/planning?week=${currentWeek}`);
            setPlanningData(response.data);
        } catch (error) {
            message.error('Failed to fetch planning data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await api.get('/sectors');
            console.log('Fetched sectors:', response.data);
            setSectors(response.data);
        } catch (error) {
            console.error('Failed to fetch sectors:', error);
            message.error('Failed to fetch sectors');
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            console.log('Fetched employees:', response.data);
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            message.error('Failed to fetch employees');
        }
    };

    const fetchSectorRequiredSkills = async () => {
        try {
            const response = await api.get('/sector_required_skills');
            console.log('Fetched sector required skills:', response.data);
            const skillsBySector = response.data.reduce((acc, item) => {
                if (!acc[item.sector_id]) {
                    acc[item.sector_id] = [];
                }
                acc[item.sector_id].push(item.skill_id);
                return acc;
            }, {});
            setSectorRequiredSkills(skillsBySector);
        } catch (error) {
            console.error('Failed to fetch sector required skills:', error);
            message.error('Failed to fetch sector required skills');
        }
    };

    const handleAddEmployee = async (day, shift, sectorId, employeeId) => {
        try {
            const date = getDateFromDayAndWeek(day, currentWeek);
            const payload = {
                date,
                week: currentWeek,
                shift,
                sector_id: parseInt(sectorId, 10),
                employee_id: parseInt(employeeId, 10),
                status: 'Scheduled'
            };

            const response = await api.post('/add_planning', payload);
            console.log('Employee added successfully:', response.data);
            message.success('Employee added to planning');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to add employee:', error.response?.data || error.message);
            message.error('Failed to add employee to planning');
        }
    };

    const showEmployeeSelectionModal = (sectorId) => {
        return new Promise((resolve) => {
            const competentEmployees = employees.filter(emp =>
                emp.SectorID === sectorId && isEmployeeCompetent(emp, sectorId)
            );

            Modal.confirm({
                title: 'Select an employee',
                content: (
                    <Select style={{width: '100%'}}>
                        {competentEmployees.map(emp => (
                            <Option key={emp.ID} value={emp.ID}>{emp.Name}</Option>
                        ))}
                    </Select>
                ),
                onOk: (close) => {
                    const selectedEmployeeId = document.querySelector('.ant-select-selection-item').getAttribute('title');
                    close();
                    resolve(selectedEmployeeId);
                },
                onCancel: () => resolve(null),
            });
        });
    };

    const handleStatusChange = async (planningId, newStatus) => {
        try {
            await api.put(`/update_planning/${planningId}`, {status: newStatus});
            message.success('Status updated successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to update status:', error);
            message.error('Failed to update status');
        }
    };

    const handleDeletePlanning = async (planningId) => {
        try {
            await api.delete(`/delete_planning/${planningId}`);
            message.success('Planning entry deleted successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to delete planning entry:', error);
            message.error('Failed to delete planning entry');
        }
    };

    const showDeleteConfirm = (planningId) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this planning entry?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                handleDeletePlanning(planningId);
            },
        });
    };

    const getDateFromDayAndWeek = (day, week) => {
        const year = new Date().getFullYear();
        const firstDayOfYear = new Date(year, 0, 0);
        const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
        const firstMondayOfYear = new Date(year, 0, 1 + daysToFirstMonday);
        const targetDate = new Date(firstMondayOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
        const dayIndex = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].indexOf(day);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        return targetDate.toISOString().split('T')[0];
    };

    const isEmployeeCompetent = (employee, sectorId) => {
        // console.log('Checking competency for employee:', employee, 'in sector:', sectorId);

        if (!employee || !sectorId) {
            console.log('Employee or sectorId is undefined');
            return false;
        }

        const employeeSkills = new Set(employee.Skills?.map(skill => skill.id) || []);
        const requiredSkills = new Set(sectorRequiredSkills[sectorId] || []);

        // console.log('Employee skills:', employeeSkills);
        // console.log('Required skills:', requiredSkills);

        const isCompetent = employeeSkills.size > 0 && requiredSkills.size > 0 &&
            [...employeeSkills].some(skillId => requiredSkills.has(skillId));

        // console.log('Is employee competent:', isCompetent);
        return isCompetent;
    };

    const columns = [
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
            width: 60,
        },
        {
            title: 'Shift',
            dataIndex: 'shift',
            key: 'shift',
            width: 60,
        },
        {
            title: 'CE',
            dataIndex: 'ce',
            key: 'ce',
            width: 120,
            render: (ce) => ce ? ce.name : '-',
        },
        ...sectors.map(sector => ({
            title: sector.name,
            dataIndex: 'sectors',
            key: sector.id,
            render: (sectors, record) => {
                const sectorData = sectors.find(s => s.id === sector.id);
                const competentEmployees = employees.filter(emp =>
                    emp.SectorID === sector.id && isEmployeeCompetent(emp, sector.id)
                );

                if (sectorData && sectorData.employee) {
                    const backgroundColor = STATUS_COLORS[sectorData.status] || 'transparent';
                    const menu = (
                        <Menu>
                            {STATUS_OPTIONS.map(status => (
                                <Menu.Item
                                    key={status}
                                    onClick={() => handleStatusChange(sectorData.planningId, status)}
                                >
                                    {status}
                                </Menu.Item>
                            ))}
                            <Menu.Divider/>
                            <Menu.Item
                                key="delete"
                                onClick={() => showDeleteConfirm(sectorData.planningId)}
                                danger
                            >
                                Delete
                            </Menu.Item>
                        </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Tooltip title={`Status: ${sectorData.status}`}>
                <span style={{backgroundColor, cursor: 'pointer'}}>
                  {sectorData.employee.name} <EditOutlined style={{marginLeft: 8}}/>
                </span>
                            </Tooltip>
                        </Dropdown>
                    );
                } else {
                    const menu = (
                        <Menu>
                            {competentEmployees.map(emp => (
                                <Menu.Item key={emp.ID}
                                           onClick={() => handleAddEmployee(record.day, record.shift, sector.id, emp.ID)}>
                                    {emp.Name}
                                </Menu.Item>
                            ))}
                        </Menu>
                    );

                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button icon={<PlusOutlined/>} size="small"/>
                        </Dropdown>
                    );
                }
            },
        })),
    ];

    const data = DAYS.flatMap(day =>
        SHIFTS.map(shift => {
            const rowData = {day, shift, key: `${day}-${shift}`, sectors: []};
            sectors.forEach(sector => {
                const planningEntry = planningData.find(entry =>
                    entry.weekday === day &&
                    entry.shift === shift &&
                    entry.sector.id === sector.id &&
                    entry.week === currentWeek
                );

                if (planningEntry) {
                    rowData.sectors.push({
                        id: sector.id,
                        employee: planningEntry.employee,
                        status: planningEntry.status,
                        planningId: planningEntry.id,
                    });
                } else {
                    rowData.sectors.push({id: sector.id});
                }
            });
            return rowData;
        })
    );

    return (
        <div className="planning-container">
            <h1>Planning</h1>
            <div className="planning-controls">
                <Select
                    value={currentWeek}
                    onChange={setCurrentWeek}
                    style={{width: 200, marginRight: 16}}
                >
                    {[...Array(52)].map((_, i) => (
                        <Option key={i + 1} value={i + 1}>Week {i + 1}</Option>
                    ))}
                </Select>
                <Button onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}>
                    Previous Week
                </Button>
                <Button onClick={() => setCurrentWeek(prev => Math.min(52, prev + 1))}>
                    Next Week
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={false}
                scroll={{x: 'max-content'}}
            />
        </div>
    );
};

export default Planning;