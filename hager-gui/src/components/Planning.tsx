import React, { useCallback, useEffect, useState } from 'react';
import { Button, Dropdown, Menu, message, Modal, Select, Table, Tag, Tooltip } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import api from '../utils/Api';
import { generateShiftSchedule } from '../utils/shift';
import './Planning.css';
import { TableColumnsType } from 'antd';

dayjs.extend(weekOfYear);

const { Option } = Select;

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const SHIFTS = ['M', 'S', 'N'];
const STATUS_COLORS: { [key: string]: string } = {
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

const frenchToEnglishDay: { [key: string]: string } = {
  'Lu': 'Mo',
  'Ma': 'Tu',
  'Me': 'We',
  'Je': 'Th',
  'Ve': 'Fr',
  'Sa': 'Sa',
  'Di': 'Su'
};

interface PlanningEntry {
  id: number;
  date: string;
  week: number;
  day: string;
  shift: string;
  status: string;
  sector?: {
    id: number;
    name: string;
  };
  employee?: {
    id: number;
    name: string;
  };
  ce?: {
    id: number;
    name: string;
  };
  substitute?: {
    id: number;
    name: string;
  };
}

interface Employee {
  ID: number;
  Name: string;
  CEID: number;
  SectorID: number;
  Skills: { id: number; name: string }[];
}

interface Sector {
  id: number;
  name: string;
}

interface CE {
  id: number;
  name: string;
}

const Planning: React.FC = () => {
    const [planningData, setPlanningData] = useState<PlanningEntry[]>([]);
    const [currentWeek, setCurrentWeek] = useState(dayjs().week());
    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sectorRequiredSkills, setSectorRequiredSkills] = useState<Record<number, number[]>>({});
    const [ces, setCEs] = useState<CE[]>([]);
    const [shiftType, setShiftType] = useState<string>('4x8 L');

    const fetchPlanningData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/planning?week=${currentWeek}`);
            console.log('Fetched planning data:', response.data);
            setPlanningData(response.data);
        } catch (error) {
            console.error('Failed to fetch planning data:', error);
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
            const skillsBySector = response.data.reduce((acc: Record<number, number[]>, item: any) => {
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

    const fetchCEs = async () => {
        try {
            const response = await api.get('/ces');
            setCEs(response.data);
        } catch (error) {
            console.error('Failed to fetch CEs:', error);
            message.error('Failed to fetch CEs');
        }
    };

    useEffect(() => {
        fetchPlanningData();
        fetchSectors();
        fetchEmployees();
        fetchSectorRequiredSkills();
        fetchCEs();
    }, [currentWeek]);

    useEffect(() => {
        setShiftType('');
    }, [currentWeek]);

    const handleAddEmployee = async (day: string, shift: string, sectorId: number, employeeId: number) => {
        try {
            const date = getDateFromDayAndWeek(day, currentWeek);
            const payload = {
                date,
                week: currentWeek,
                shift,
                sector_id: sectorId,
                employee_id: employeeId,
                status: 'Scheduled'
            };

            const response = await api.post('/add_planning', payload);
            console.log('Employee added successfully:', response.data);
            message.success('Employee added to planning');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to add employee:', error);
            message.error('Failed to add employee to planning');
        }
    };

    const handleAddCE = async (day: string, shift: string, ceId: number) => {
        try {
            const schedule = generateShiftSchedule(ceId, currentWeek, shiftType);

            for (const [scheduleDay, scheduleShift] of Object.entries(schedule)) {
                const date = getDateFromDayAndWeek(scheduleDay, currentWeek);
                const payload = {
                    date,
                    week: currentWeek,
                    shift: scheduleShift,
                    ce_id: ceId,
                    status: 'Scheduled'
                };

                await api.post('/add_ce_planning', payload);
            }

            message.success('CE and team added to planning');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to add CE and team:', error);
            message.error('Failed to add CE and team to planning');
        }
    };

    const handleCEStatusChange = async (planningId: number, newStatus: string) => {
        try {
            await api.put(`/update_ce_planning/${planningId}`, {status: newStatus});
            message.success('CE status updated successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to update CE status:', error);
            message.error('Failed to update CE status');
        }
    };

    const showDeleteConfirmCE = (planningId: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this CE planning entry?',
            content: 'This will also remove all associated employee entries.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                handleDeleteCEPlanning(planningId);
            },
        });
    };

    const handleDeleteCEPlanning = async (planningId: number) => {
        try {
            await api.delete(`/delete_ce_planning/${planningId}`);
            message.success('CE planning entry deleted successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to delete CE planning entry:', error);
            message.error('Failed to delete CE planning entry');
        }
    };

    const handleStatusChange = async (planningId: number, newStatus: string) => {
        if (newStatus === 'Absent (Planned)' || newStatus === 'Absent (Unplanned)' || newStatus === 'Training') {
            const planningEntry = planningData.find(entry => entry.id === planningId);
            if (!planningEntry) return;

            const competentEmployees = employees.filter(emp =>
                isEmployeeCompetent(emp, planningEntry.sector!.id) && emp.ID !== planningEntry.employee!.id
            );

            Modal.confirm({
                title: 'Choose a substitute',
                content: (
                    <Select
                        style={{width: '100%'}}
                        onChange={(value) => handleSubstituteSelection(planningId, newStatus, value)}
                    >
                        <Option value={null}>No substitute</Option>
                        {competentEmployees.map(emp => (
                            <Option key={emp.ID} value={emp.ID}>{emp.Name}</Option>
                        ))}
                    </Select>
                ),
                onOk() {
                },
                onCancel() {
                },
            });
        } else {
            try {
                await api.put(`/update_planning/${planningId}`, {status: newStatus, substituteId: null});
                message.success('Status updated successfully');
                fetchPlanningData();
            } catch (error) {
                console.error('Failed to update status:', error);
                message.error('Failed to update status');
            }
        }
    };

    const handleSubstituteSelection = async (planningId: number, newStatus: string, substituteId: number | null) => {
        try {
            await api.put(`/update_planning/${planningId}`, {
                status: newStatus,
                substituteId: substituteId
            });
            message.success('Status and substitute updated successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to update status and substitute:', error);
            message.error('Failed to update status and substitute');
        }
    };

    const handleDeletePlanning = async (planningId: number) => {
        try {
            await api.delete(`/delete_planning/${planningId}`);
            message.success('Planning entry deleted successfully');
            fetchPlanningData();
        } catch (error) {
            console.error('Failed to delete planning entry:', error);
            message.error('Failed to delete planning entry');
        }
    };

    const showDeleteConfirm = (planningId: number) => {
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

    const getDateFromDayAndWeek = (day: string, week: number) => {
    const year = dayjs().year();
    const startOfWeek = dayjs().year(year).week(week).startOf('week');
    const dayIndex = DAYS.indexOf(day);
    return startOfWeek.add(dayIndex, 'day').format('YYYY-MM-DD');
  };

  const isCurrentDay = (day: string) => {
    const today = dayjs();
    const currentDay = today.format('dd');
    return frenchToEnglishDay[day] === currentDay && currentWeek === today.week();
  };

  const isEmployeeCompetent = (employee: Employee, sectorId: number) => {
    if (!employee || !sectorId) {
      console.log('Employee or sectorId is undefined');
      return false;
    }

    const employeeSkills = new Set(employee.Skills?.map(skill => skill.id) || []);
    const requiredSkills = new Set(sectorRequiredSkills[sectorId] || []);

    const isCompetent = employeeSkills.size > 0 && requiredSkills.size > 0 &&
      [...employeeSkills].some(skillId => requiredSkills.has(skillId));

    return isCompetent;
  };

  const handleShiftTypeChange = async (value: string) => {
    setShiftType(value);
    try {
      await api.post('/update_planning_shift_type', {
        week: currentWeek,
        shiftType: value
      });
      message.success('Shift type updated successfully');
      fetchPlanningData();
    } catch (error) {
      console.error('Failed to update shift type:', error);
      message.error('Failed to update shift type');
    }
  };

  const getDropdownProps = useCallback(() => {
    return {
      getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement,
      overlayStyle: { position: 'fixed' },
      trigger: ['click'] as const,
    };
  }, []);

  const getRowStyle = (record: any) => {
    const baseStyle: React.CSSProperties = {
      borderTop: '1px solid #d9d9d9',
    };

    if (record.day === 'Lu') {
      baseStyle.borderTop = '2px solid #1890ff';
    }

    if (record.day === 'VSD') {
      baseStyle.backgroundColor = '#f0f0f0';
    } else if (isCurrentDay(record.day)) {
      baseStyle.backgroundColor = '#e6f7ff';
    } else if (record.className.includes('even-day')) {
      baseStyle.backgroundColor = '#ffffff';
    } else {
      baseStyle.backgroundColor = '#f9f9f9';
    }

    return baseStyle;
  };

  const getRowClassName = (record: any) => {
    let className = record.className || '';
    if (record.day === 'Lu') {
      className += ' highlight-top-border';
    }
    if (record.day === 'Di' || record.day === 'VSD') {
      className += ' highlight-bottom-border';
    }
    return className;
  };

  const rulesContent = (
    <div>
      <h3>REGLES</h3>
      <ol>
        <li>10h maximum par jour</li>
        <li>8 heures maxi en équipe de nuit (21h-5h)</li>
        <li>11h entre 2 repos</li>
        <li>6 jours maxi par semaine</li>
        <li>5 jours maxi en nuit par semaine</li>
        <li>Coupure hebdomadaire obligatoire de 35h</li>
      </ol>
    </div>
  );

  const columns: TableColumnsType<PlanningEntry> = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      fixed: 'left',
      width: 100,
      render: (text, record) => (
        <Tooltip title={`${record.date}`}>
          <Tag color={record.day === 'Sa' || record.day === 'Di' ? 'orange' : 'blue'}>{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      key: 'shift',
      fixed: 'left',
      width: 80,
      filters: [
        {text: 'Morning', value: 'M'},
        {text: 'Evening', value: 'S'},
        {text: 'Night', value: 'N'},
      ],
      onFilter: (value, record) => record.shift === value,
    },
    {
      title: 'CE',
      dataIndex: 'ce',
      key: 'ce',
      render: (ce, record) => {
        if (ce) {
          const menu = (
            <Menu>
              {STATUS_OPTIONS.map(status => (
                <Menu.Item
                  key={status}
                  onClick={() => handleCEStatusChange(record.id, status)}
                >
                  {status}
                </Menu.Item>
              ))}
              <Menu.Divider/>
              <Menu.Item
                key="delete"
                onClick={() => showDeleteConfirmCE(record.id)}
                danger
              >
                Delete
              </Menu.Item>
            </Menu>
          );

          return (
            <Dropdown overlay={menu} trigger={['click']}>
              <Tooltip title={`Status: ${ce.status || 'Not set'}`}>
                <span style={{
                  cursor: 'pointer',
                  backgroundColor: STATUS_COLORS[ce.status] || 'transparent',
                  padding: '2px 4px',
                  borderRadius: '4px'
                }}>
                  {ce.name}
                </span>
              </Tooltip>
            </Dropdown>
          );
        } else {
          const menu = (
            <Menu>
              {ces.map(ce => (
                <Menu.Item key={ce.id} onClick={() => handleAddCE(record.day, record.shift, ce.id)}>
                  {ce.name}
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
    },
    ...sectors.map((sector) => ({
      title: sector.name,
      dataIndex: 'sectors',
      key: sector.id,
      render: (sectors: any, record: PlanningEntry) => {
        const sectorData = sectors?.find((s: any) => s.id === sector.id);
        const competentEmployees = employees.filter(emp =>
          isEmployeeCompetent(emp, sector.id)
        );

        if (sectorData && sectorData.employee) {
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
            <Dropdown
              overlay={menu}
              {...getDropdownProps()}
            >
              <Tooltip title={`Status: ${sectorData.status}`}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <span style={{
                    cursor: 'pointer',
                    backgroundColor: STATUS_COLORS[sectorData.status] || 'transparent',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    width: '100%'
                  }}>
                    {sectorData.employee.name}
                  </span>
                  {sectorData.substitute && (
                    <span style={{
                      color: '#df0000',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      display: 'inline-block',
                      width: '100%',
                      fontSize: '0.9em'
                    }}>
                      {sectorData.substitute.name}
                    </span>
                  )}
                </div>
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

  const data = DAYS.flatMap((day, index) => {
    const isEvenDay = index % 2 === 0;
    if (day === 'Sa') {
      return [
        {
          day: 'Sa',
          shift: 'M',
          key: 'Sa-M',
          sectors: [],
          className: `${isEvenDay ? 'even-day' : 'odd-day'} Sa-row`
        },
        {day: 'VSD', shift: 'VSD', key: 'VSD', sectors: [], className: 'vsd-row'},
      ];
    }
    if (day === 'Di') {
      return [
        {
          day: 'Di',
          shift: 'N',
          key: 'Di-N',
          sectors: [],
          className: `${isEvenDay ? 'even-day' : 'odd-day'} Di-row`
        },
      ];
    }
    return SHIFTS.map(shift => ({
      day,
      shift,
      key: `${day}-${shift}`,
      sectors: [],
      className: `${isEvenDay ? 'even-day' : 'odd-day'} ${day}-row`,
    }));
  }).map(row => {
    const dayShiftData = planningData.filter(entry =>
      entry.day === row.day && entry.shift === row.shift
    );

    if (dayShiftData.length > 0) {
      const ceEntry = dayShiftData.find(entry => entry.ce);
      if (ceEntry) {
        row.ce = {
          ...ceEntry.ce,
          status: ceEntry.status
        };
        row.planningId = ceEntry.id;
      }
      row.sectors = sectors.map(sector => {
        const sectorData = dayShiftData.find(entry => entry.sector && entry.sector.id === sector.id);
        return sectorData ? {
          id: sector.id,
          employee: sectorData.employee,
          status: sectorData.status,
          planningId: sectorData.id,
          substitute: sectorData.substitute
        } : {id: sector.id};
      });
    }

    return row;
  });

  return (
    <div className="planning-container">
      <div className="planning-controls">
        <Select
          value={currentWeek}
          onChange={setCurrentWeek}
          style={{width: 120}}
        >
          {[...Array(52)].map((_, i) => (
            <Option key={i + 1} value={i + 1}>Week {i + 1}</Option>
          ))}
        </Select>
        <Select
          value={shiftType}
          onChange={handleShiftTypeChange}
          style={{width: 120, marginLeft: 16}}
          placeholder="Choose shift type"
        >
          <Option value="4x8 L">4x8 Long</Option>
          <Option value="4x8 N">4x8 Normal</Option>
          <Option value="4x8 C">4x8 Short</Option>
        </Select>
        <Button onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}>
          Previous Week
        </Button>
        <Button onClick={() => setCurrentWeek(prev => Math.min(52, prev + 1))}>
          Next Week
        </Button>
        <Tooltip title={rulesContent} placement="bottomRight" overlayClassName="rules-tooltip">
          <Button
            icon={<QuestionCircleOutlined/>}
            type="primary"
            style={{marginLeft: 'auto'}}
          >
            Regles
          </Button>
        </Tooltip>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={false}
        size="small"
        rowClassName={getRowClassName}
        onRow={(record) => ({
          style: getRowStyle(record),
        })}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{margin: 0}}>
              {record.notes || 'No additional information'}
            </p>
          ),
          rowExpandable: (record) => !!record.notes,
        }}
      />
    </div>
  );
};

export default Planning;
