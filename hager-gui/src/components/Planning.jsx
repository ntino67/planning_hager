import React, {useEffect, useState} from 'react';
import {Button, Dropdown, Menu, message, Select, Table, Tooltip} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import api from '../utils/Api.jsx';
import './Planning.css';

const {Option} = Select;

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const SHIFTS = ['M', 'S', 'N'];

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
        console.log('Adding employee:', {day, shift, sectorId, employeeId, currentWeek});
        try {
            const date = getDateFromDayAndWeek(day, currentWeek);
            const payload = {
                date,
                shift,
                sector_id: parseInt(sectorId, 10),
                employee_id: parseInt(employeeId, 10), // Ensure this is parsed as an integer
                status: 'Scheduled'
            };
            console.log('Payload:', payload);
            const response = await api.post('/add_planning', payload);
            console.log('Employee added successfully:', response.data);
            message.success('Employee added to planning');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to add employee:', error.response?.data || error.message);
            message.error('Failed to add employee to planning');
        }
    };

    const getDateFromDayAndWeek = (day, week) => {
        const year = new Date().getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
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
                // console.log('Checking employees for sector:', sector.name);
                const competentEmployees = employees.filter(emp => {
                    // console.log('Checking employee:', emp.Name, 'for sector:', sector.name);
                    return emp.SectorID === sector.id && isEmployeeCompetent(emp, sector.id);
                });
                // console.log('Competent employees for sector', sector.name, ':', competentEmployees);

                const menu = (
                    <Menu>
                        {competentEmployees.map(emp => (
                            <Menu.Item key={emp.id}
                                       onClick={() => handleAddEmployee(record.day, record.shift, sector.id, emp.ID)}>
                                {emp.Name}
                            </Menu.Item>
                        ))}
                    </Menu>
                );

                if (sectorData && sectorData.employee) {
                    return (
                        <Tooltip title={`Status: ${sectorData.employee.status || 'N/A'}`}>
                            <span>{sectorData.employee.Name}</span>
                        </Tooltip>
                    );
                } else {
                    return (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button
                                icon={<PlusOutlined/>}
                                size="small"
                                onClick={e => e.stopPropagation()}
                            />
                        </Dropdown>
                    );
                }
            },
        })),
    ];

    const data = DAYS.flatMap(day =>
        SHIFTS.map(shift => {
            const rowData = {day, shift, key: `${day}-${shift}`, sectors: []};
            const dayShiftData = planningData.filter(entry =>
                entry.day === day && entry.shift === shift
            );

            if (dayShiftData.length > 0) {
                rowData.ce = dayShiftData[0].ce;
                rowData.sectors = sectors.map(sector => {
                    const sectorData = dayShiftData.find(entry => entry.sector.id === sector.id);
                    return sectorData ? {
                        id: sector.id,
                        employee: sectorData.employee,
                    } : {id: sector.id};
                });
            } else {
                rowData.sectors = sectors.map(sector => ({id: sector.id}));
            }

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