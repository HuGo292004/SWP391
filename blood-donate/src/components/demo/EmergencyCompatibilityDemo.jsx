/**
 * Demo component để test chức năng emergency request blood type compatibility
 * Component này có thể được thêm vào HomePage để test
 */

import React, { useState } from 'react';
import { Button, Card, Alert, Select, Space } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import { 
  canDonateBloodTo, 
  getCompatibleDonorBloodTypes,
  getCompatibleRecipientBloodTypes,
  getBloodTypeFromID 
} from '../utils/bloodTypeCompatibility';

const { Option } = Select;

const EmergencyCompatibilityDemo = () => {
  const [selectedUserBloodType, setSelectedUserBloodType] = useState('');
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('');
  const [compatibilityResult, setCompatibilityResult] = useState(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const mockEmergencies = [
    { id: 'EMR001', patient: 'Nguyễn Văn A', bloodType: 'A+', quantity: 500 },
    { id: 'EMR002', patient: 'Trần Thị B', bloodType: 'AB-', quantity: 450 },
    { id: 'EMR003', patient: 'Lê Văn C', bloodType: 'O-', quantity: 300 },
    { id: 'EMR004', patient: 'Phạm Thị D', bloodType: 'B+', quantity: 600 }
  ];

  const checkCompatibility = () => {
    if (!selectedUserBloodType || !selectedEmergencyType) {
      setCompatibilityResult(null);
      return;
    }

    const emergency = mockEmergencies.find(e => e.id === selectedEmergencyType);
    const isCompatible = canDonateBloodTo(selectedUserBloodType, emergency.bloodType);
    
    const userCanHelp = getCompatibleRecipientBloodTypes(selectedUserBloodType);
    const emergencyCanReceive = getCompatibleDonorBloodTypes(emergency.bloodType);

    setCompatibilityResult({
      compatible: isCompatible,
      userBloodType: selectedUserBloodType,
      emergencyBloodType: emergency.bloodType,
      emergencyPatient: emergency.patient,
      userCanHelp,
      emergencyCanReceive,
      emergency
    });
  };

  const testUrl = (emergencyId) => {
    const url = `/member/blood-donation-registration?emergencyRequestId=${emergencyId}`;
    console.log('Test URL:', url);
    alert(`Test URL generated: ${url}\n\nIn real app, this would navigate to BloodDonationRegistration with emergency context.`);
  };

  return (
    <Card title="🧪 Emergency Request Compatibility Demo" style={{ margin: '20px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <h4>Chọn nhóm máu của bạn:</h4>
          <Select
            placeholder="Chọn nhóm máu"
            style={{ width: 200 }}
            value={selectedUserBloodType}
            onChange={setSelectedUserBloodType}
          >
            {bloodTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </div>

        <div>
          <h4>Chọn yêu cầu khẩn cấp:</h4>
          <Select
            placeholder="Chọn yêu cầu khẩn cấp"
            style={{ width: 300 }}
            value={selectedEmergencyType}
            onChange={setSelectedEmergencyType}
          >
            {mockEmergencies.map(emergency => (
              <Option key={emergency.id} value={emergency.id}>
                {emergency.patient} - {emergency.bloodType} ({emergency.quantity}ml)
              </Option>
            ))}
          </Select>
        </div>

        <Button type="primary" onClick={checkCompatibility} icon={<HeartFilled />}>
          Kiểm tra tương thích
        </Button>

        {compatibilityResult && (
          <Alert
            message={compatibilityResult.compatible ? "✅ Tương thích!" : "❌ Không tương thích!"}
            description={
              <div>
                <p><strong>Nhóm máu của bạn:</strong> {compatibilityResult.userBloodType}</p>
                <p><strong>Yêu cầu khẩn cấp:</strong> {compatibilityResult.emergencyPatient} - {compatibilityResult.emergencyBloodType}</p>
                
                {compatibilityResult.compatible ? (
                  <p style={{ color: 'green' }}>
                    🎉 Bạn có thể hỗ trợ yêu cầu này!
                  </p>
                ) : (
                  <div>
                    <p style={{ color: 'red' }}>
                      ⚠️ Nhóm máu {compatibilityResult.userBloodType} không thể hỗ trợ cho nhóm máu {compatibilityResult.emergencyBloodType}.
                    </p>
                    <p><strong>Bạn có thể hỗ trợ cho:</strong> {compatibilityResult.userCanHelp.join(', ')}</p>
                    <p><strong>Yêu cầu này có thể nhận từ:</strong> {compatibilityResult.emergencyCanReceive.join(', ')}</p>
                  </div>
                )}
              </div>
            }
            type={compatibilityResult.compatible ? "success" : "error"}
          />
        )}

        <div>
          <h4>Test URLs cho yêu cầu khẩn cấp:</h4>
          <Space wrap>
            {mockEmergencies.map(emergency => (
              <Button 
                key={emergency.id} 
                size="small" 
                onClick={() => testUrl(emergency.id)}
              >
                Test {emergency.patient} ({emergency.bloodType})
              </Button>
            ))}
          </Space>
        </div>

        <Alert
          message="Hướng dẫn sử dụng"
          description={
            <div>
              <p>1. Chọn nhóm máu của bạn</p>
              <p>2. Chọn một yêu cầu khẩn cấp</p>
              <p>3. Bấm "Kiểm tra tương thích" để xem kết quả</p>
              <p>4. Sử dụng các nút "Test" để tạo URL với emergencyRequestId</p>
              <p>5. Trong ứng dụng thực, khi user bấm "Tôi muốn hỗ trợ", họ sẽ được chuyển đến trang đăng ký với URL có emergencyRequestId</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default EmergencyCompatibilityDemo;
