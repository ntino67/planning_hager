import React from 'react';
import {Button, Dropdown, Space, Table} from 'antd';
import {EllipsisOutlined, PlusOutlined} from '@ant-design/icons';

const EmployeeGrid = ({onAdd, onModify, onDelete, employees, sectors, ces}) => {
    const generateTableData = () => {
        return ces.map(ce => {
            const row = {ce: ce.name};
            sectors.forEach(sector => {
                const employeesInSector = employees
                    .filter(emp => emp.ce_name === ce.name && emp.sector_name === sector.name)
                    .map(emp => (
                        <div key={emp.employee_id}>
                            <Space>
                                {emp.employee_name}
                                <Dropdown
                                    menu={{
                                        items: [
                                            {key: 'add', label: 'Add'},
                                            {key: 'modify', label: 'Modify'},
                                            {key: 'delete', label: 'Delete'}
                                        ],
                                        onClick: (e) => handleMenuClick(e, sector.name, ce.name, emp),
                                    }}
                                    trigger={['click']}
                                >
                                    <Button type="link" icon={<EllipsisOutlined/>}/>
                                </Dropdown>
                            </Space>
                        </div>
                    ));

                row[sector.name] = (
                    <Space>
                        <div>{employeesInSector}</div>
                        {!employeesInSector.length && (
                            <Button
                                type="link"
                                icon={<PlusOutlined/>}
                                onClick={(e) => handleMenuClick({key: 'add'}, sector.name, ce.name)}
                            />
                        )}
                    </Space>
                );
            });
            return row;
        });
    };

    const handleMenuClick = (e, sector, ce, employee) => {
        if (e.key === 'add') {
            onAdd(sector, ce);
        } else if (e.key === 'modify') {
            onModify(employee);
        } else if (e.key === 'delete') {
            onDelete(employee.employee_name, sector, ce);
        }
    };

    const columns = [
        {
            title: 'CE / Sector',
            dataIndex: 'ce',
            key: 'ce',
        },
        ...sectors.map(sector => ({
            title: sector.name,
            dataIndex: sector.name,
            key: sector.name,
        }))
    ];

    return (
        <Table dataSource={generateTableData()} columns={columns} pagination={false} rowKey="ce"/>
    );
};

export default EmployeeGrid;
