// Import các thư viện React và hooks cần thiết
import React, { useEffect, useState } from "react";

// Import các component từ React Bootstrap
import { Card, Button, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";

// Import API service
import { getEmergencyRequestsByStatus } from "../../services/emergencyRequestApi";

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

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getEmergencyRequestsByStatus("Opened");
        setRequests(Array.isArray(data?.requests) ? data.requests : []);
      } catch (err) {
        setError("Không thể tải danh sách yêu cầu khẩn cấp.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading)
    return <Spinner animation="border" className="d-block mx-auto my-4" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!requests.length)
    return <Alert variant="info">Không có yêu cầu khẩn cấp nào đang mở.</Alert>;

  return (
    <Row>
      {requests.map((req, idx) => (
        <Col md={6} lg={4} key={req.requestId || idx} className="mb-4">
          <Card border="danger" className="h-100">
            <Card.Body>
              <div className="mb-2">
                <Badge bg="danger">Khẩn cấp</Badge>
              </div>
              <div>
                <strong>Nhóm Máu:</strong>{" "}
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
