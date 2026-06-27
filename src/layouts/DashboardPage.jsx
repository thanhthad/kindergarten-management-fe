import React from 'react';
import { Row, Col, Card, Statistic, Table } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';

const DashboardPage = () => {
    // Dữ liệu mẫu - Sau này bạn sẽ thay bằng API gọi về từ Backend
    const stats = [
        { title: 'Tổng người dùng', value: 1250, icon: <UserOutlined />, color: '#1890ff' },
        { title: 'Đơn hàng mới', value: 45, icon: <ShoppingCartOutlined />, color: '#52c41a' },
        { title: 'Doanh thu', value: 158000000, icon: <DollarOutlined />, color: '#faad14' },
        { title: 'Bài viết', value: 120, icon: <FileTextOutlined />, color: '#eb2f96' },
    ];

    const columns = [
        { title: 'Người dùng', dataIndex: 'user', key: 'user' },
        { title: 'Hành động', dataIndex: 'action', key: 'action' },
        { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    ];

    const data = [
        { key: 1, user: 'Nguyen Van A', action: 'Đăng nhập', time: '5 phút trước' },
        { key: 2, user: 'Tran Thi B', action: 'Mua gói dịch vụ', time: '1 giờ trước' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h2>Tổng quan hệ thống</h2>
            
            {/* Thống kê nhanh */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                {stats.map((item, index) => (
                    <Col span={6} key={index}>
                        <Card bordered={false}>
                            <Statistic 
                                title={item.title} 
                                value={item.value} 
                                prefix={item.icon}
                                valueStyle={{ color: item.color }} 
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Bảng hoạt động gần nhất */}
            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Hoạt động gần đây">
                        <Table columns={columns} dataSource={data} pagination={false} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;