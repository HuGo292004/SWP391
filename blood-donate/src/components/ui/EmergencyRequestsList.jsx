// Import các thư viện React và hooks cần thiết
import React, { useEffect, useState } from "react";

// Import các component từ React Bootstrap
import { Card, Button, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";

// Import API service
import { getEmergencyRequestsByStatus } from "../../services/emergencyRequestApi";
import { donorApi } from "../../services/donorApi";

// Import utils for blood type compatibility
import { canMemberDonateForEmergency, getBloodTypeFromID } from "../../utils/bloodTypeCompatibility";

// Mapping bloodTypeID sang tên nhóm máu
const BLOOD_TYPE_MAP = {
  "11111111-1111-1111-1111-111111111001": "A+",
  "11111111-1111-1111-1111-111111111002": "A-",
  "11111111-1111-1111-1111-111111111003": "B+",
  "11111111-1111-1111-1111-111111111004": "B-",
  "11111111-1111-1111-1111-111111111005": "AB+",
  "11111111-1111-1111-1111-111111111006": "AB-",
  "11111111-1111-1111-1111-111111111007": "O+",
  "11111111-1111-1111-1111-111111111008": "O-",
};

const EmergencyRequestsList = ({ onSupport }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memberBloodTypeID, setMemberBloodTypeID] = useState(null);
  const [hasDonorProfile, setHasDonorProfile] = useState(null); // null = checking, true = has profile, false = no profile

  // Kiểm tra hồ sơ hiến máu của member
  useEffect(() => {
    const checkMemberDonorProfile = async () => {
      try {
        // Kiểm tra xem member có hồ sơ hiến máu không
        const donorProfile = await donorApi.checkDonorProfile(true);
        
        if (donorProfile && donorProfile.exists && donorProfile.donorID) {
          setHasDonorProfile(true);
          
          // Lấy thông tin chi tiết về nhóm máu
          try {
            const donorDetails = await donorApi.getDonorProfileById(donorProfile.donorID);
            const bloodTypeID = donorDetails.bloodTypeId || donorDetails.bloodTypeID;
            
            if (bloodTypeID) {
              setMemberBloodTypeID(bloodTypeID);
            } else {
              console.warn("Không tìm thấy bloodTypeID trong hồ sơ hiến máu");
              setHasDonorProfile(false);
            }
          } catch (detailError) {
            console.warn("Không thể lấy chi tiết nhóm máu:", detailError);
            setHasDonorProfile(false);
          }
        } else {
          setHasDonorProfile(false);
        }
      } catch (error) {
        console.warn("Không thể kiểm tra hồ sơ hiến máu:", error);
        setHasDonorProfile(false);
      }
    };

    checkMemberDonorProfile();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getEmergencyRequestsByStatus("Opened");
        const allRequests = Array.isArray(data?.requests) ? data.requests : [];
        
        // Nếu member không có hồ sơ hiến máu, không hiển thị yêu cầu nào
        if (!hasDonorProfile || !memberBloodTypeID) {
          setRequests([]);
          return;
        }
        
        // Lọc chỉ những yêu cầu mà member có thể hiến máu
        const compatibleRequests = allRequests.filter((req) => {
          const neededBloodTypeID = req.bloodTypeRequired || req.bloodTypeID;
          if (!neededBloodTypeID) return false;
          
          return canMemberDonateForEmergency(memberBloodTypeID, neededBloodTypeID);
        });
        
        setRequests(compatibleRequests);
      } catch (err) {
        setError("Không thể tải danh sách yêu cầu khẩn cấp.");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ fetch requests khi đã check xong donor profile
    if (hasDonorProfile !== null) {
      fetchRequests();
    }
  }, [hasDonorProfile, memberBloodTypeID]);

  // Nếu đang kiểm tra hồ sơ hiến máu
  if (hasDonorProfile === null) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Đang kiểm tra hồ sơ hiến máu...</span>
      </div>
    );
  }

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto my-4" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  
  // Nếu member không có hồ sơ hiến máu
  if (!hasDonorProfile) {
    return (
      <Alert variant="info">
        <Alert.Heading>Cần có hồ sơ hiến máu</Alert.Heading>
        <p>
          Để xem và hỗ trợ các yêu cầu khẩn cấp, bạn cần có hồ sơ hiến máu với thông tin nhóm máu đầy đủ. 
          Vui lòng đăng ký hiến máu lần đầu để tạo hồ sơ.
        </p>
      </Alert>
    );
  }
  
  // Nếu có hồ sơ nhưng không có thông tin nhóm máu
  if (hasDonorProfile && !memberBloodTypeID) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Thiếu thông tin nhóm máu</Alert.Heading>
        <p>
          Hồ sơ hiến máu của bạn chưa có thông tin nhóm máu. 
          Vui lòng cập nhật thông tin nhóm máu trong hồ sơ để xem các yêu cầu khẩn cấp phù hợp.
        </p>
      </Alert>
    );
  }
  
  // Nếu không có yêu cầu tương thích
  if (!requests.length) {
    const memberBloodType = getBloodTypeFromID(memberBloodTypeID);
    return (
      <Alert variant="info">
        <Alert.Heading>Không có yêu cầu khẩn cấp phù hợp</Alert.Heading>
        <p>
          Hiện tại không có yêu cầu khẩn cấp nào phù hợp với nhóm máu {memberBloodType} của bạn.
          Cảm ơn bạn đã sẵn sàng giúp đỡ!
        </p>
      </Alert>
    );
  }

  return (
    <Row>
      {requests.map((req, idx) => (
        <Col md={6} lg={4} key={req.requestId || idx} className="mb-4">
          <Card border="danger" className="h-100">
            <Card.Body>
              <div className="mb-2">
                <Badge bg="danger">Khẩn cấp</Badge>
                {memberBloodTypeID && (
                  <Badge bg="success" className="ms-2">
                    Tương thích với nhóm máu của bạn
                  </Badge>
                )}
              </div>
              <div>
                <strong>Nhóm Máu Cần:</strong>{" "}
                {req.bloodTypeName ||
                  BLOOD_TYPE_MAP[
                    (req.bloodTypeRequired || "").toString().trim()
                  ] ||
                  req.bloodTypeRequired ||
                  (req.aboType && req.rhFactor
                    ? `${req.aboType}${req.rhFactor}`
                    : "")}
              </div>
              <div>
                <strong>Nhóm Máu Bạn:</strong>{" "}
                <Badge bg="primary">
                  {getBloodTypeFromID(memberBloodTypeID)}
                </Badge>
              </div>
              <div>
                <strong>Số lượng:</strong> {req.quantityNeeded}ml
              </div>
              <div>
                <strong>Mô tả:</strong>{" "}
                {req.description &&
                /^Emergency request\. Available units:/i.test(
                  req.description.trim()
                )
                  ? req.description
                      .replace(
                        /^Emergency request\. Available units:[^\.]*\.(\s*)?/i,
                        ""
                      )
                      .trim()
                  : req.description}
              </div>
              <Button
                variant="outline-danger"
                className="mt-3"
                onClick={() => onSupport && onSupport(req.requestId)}
              >
                Tôi muốn hỗ trợ
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default EmergencyRequestsList;
