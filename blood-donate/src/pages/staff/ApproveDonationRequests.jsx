import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  Modal, 
  Badge, 
  Alert,
  InputGroup,
  Dropdown,
  DropdownButton,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  FaSearch, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaUser, 
  FaCalendarAlt, 
  FaHeart, 
  FaShieldAlt,
  FaFilter,
  FaClock,
  FaMapMarkerAlt,
  FaEnvelope,
  FaIdCard,
  FaSync,
  FaUserMd,
  FaHeartbeat,
  FaClipboardList,
  FaExclamationTriangle
} from 'react-icons/fa';
import { bloodDonationApi } from '../../services/bloodDonationApi';
import { healthCheckApi } from '../../services/healthCheckApi';
import '../../styles/pages.css';



const ApproveDonationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [healthForms, setHealthForms] = useState(null); // null = not loaded yet, [] = loaded but empty
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRequestType, setFilterRequestType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', type: 'success' });
  const [authStatus, setAuthStatus] = useState({ isValid: true, message: '' });

  // Check authentication status
  const checkAuthStatus = () => {
    const userToken = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!userToken) {
      setAuthStatus({
        isValid: false,
        message: 'Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.'
      });
      return false;
    }
    
    if (userToken === 'demo-token') {
      setAuthStatus({
        isValid: false,
        message: 'Đang sử dụng demo token. Vui lòng đăng nhập với tài khoản thực để truy cập API.'
      });
      return false;
    }
    
    if (!userRole) {
      setAuthStatus({
        isValid: false,
        message: 'Không tìm thấy thông tin quyền người dùng. Vui lòng đăng nhập lại.'
      });
      return false;
    }
    
    setAuthStatus({ isValid: true, message: '' });
    return true;
  };

  // Load requests when component mounts
  useEffect(() => {
    // Check authentication status first
    const isAuthValid = checkAuthStatus();
    
    if (isAuthValid) {
      loadData();
    }
  }, []);

  // Load data in correct order to avoid race conditions
  const loadData = async () => {
    try {
      console.log('🔄 Starting data load sequence...');
      
      // First load health forms, then requests
      // This ensures health forms are available when we map them to requests
      await loadHealthForms();
      await loadRequests();
      
      console.log('✅ Data load sequence completed');
    } catch (error) {
      console.error('❌ Data load sequence failed:', error);
      
      // Ensure healthForms is not left as null if load fails
      if (healthForms === null) {
        console.warn('⚠️ Setting healthForms to empty array due to load failure');
        setHealthForms([]);
      }
    }
  };

  // Update health form status after both data are loaded
  useEffect(() => {
    // Only update if we have requests AND health forms have been loaded (even if empty)
    // We use a flag to distinguish between "not loaded yet" vs "loaded but empty"
    if (requests.length > 0 && healthForms !== null) {
      console.log('🔄 Triggering health form status update...');
      console.log('📊 Requests count:', requests.length);
      console.log('🏥 Health forms count:', healthForms.length);
      updateHealthFormStatusInRequests();
    }
  }, [requests.length, healthForms]);

  // Show alert message
  const showMessage = (message, type = 'success') => {
    setShowAlert({ show: true, message, type });
    setTimeout(() => setShowAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  // Handle API errors
  const handleApiError = (error, defaultMessage = 'Đã xảy ra lỗi') => {
    console.error('API Error:', error);
    let errorMessage = defaultMessage;
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    showMessage(errorMessage, 'danger');
  };

  // Load blood donation requests from API
  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await bloodDonationApi.getAllBloodDonations();
      
      // Format data to match UI structure
      const formattedRequests = Array.isArray(data) ? data.map(formatBloodDonationData) : [];
      setRequests(formattedRequests);
      
      console.log('✅ Blood donation requests loaded successfully:', formattedRequests.length, 'items');
      
    } catch (error) {
      console.error('❌ Failed to load blood donation requests:', error);
      
      // Check if it's an auth error and update auth status
      if (error.message.includes('đăng nhập') || error.message.includes('401')) {
        setAuthStatus({
          isValid: false,
          message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
        });
      }
      
      handleApiError(error, 'Không thể tải danh sách đơn hiến máu');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Load health forms from API
  const loadHealthForms = async () => {
    try {
      console.log('🔄 Loading health forms...');
      const data = await healthCheckApi.getAllHealthChecks();
      
      // Format data to match UI structure
      const formattedHealthForms = Array.isArray(data) ? data.map(formatHealthFormData) : [];
      setHealthForms(formattedHealthForms);
      
      console.log('✅ Health forms loaded successfully:', formattedHealthForms.length, 'items');
      
    } catch (error) {
      console.error('❌ Failed to load health forms:', error);
      
      // Check if it's an auth error and update auth status
      if (error.message.includes('đăng nhập') || error.message.includes('401')) {
        setAuthStatus({
          isValid: false,
          message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
        });
      }
      
      handleApiError(error, 'Không thể tải danh sách phiếu sức khỏe');
      
      // Set empty array instead of leaving null, so UI knows it's loaded but empty
      setHealthForms([]);
    }
  };

  // Format blood donation data from API
  const formatBloodDonationData = (donation) => {
    return {
      id: donation.donationId || donation.id || donation.ID,
      requesterId: donation.donorId || donation.userID || donation.UserID,
      requesterName: donation.fullName || donation.donorName || donation.name || 'N/A',
      requesterEmail: donation.email || 'N/A',
      requesterPhone: donation.phoneNumber || donation.phone || 'Chưa cập nhật',
      idCard: donation.userIdCard || donation.idCard || 'Chưa cập nhật',
      bloodType: donation.bloodType || 'N/A',
      requestType: donation.isEmergency ? 'emergency' : 'regular',
      requestDate: donation.registrationDate || donation.requestDate || donation.createdDate || '',
      preferredDate: donation.donationDate || donation.preferredDate || '',
      location: donation.address || donation.location || 'N/A',
      status: mapApiStatus(donation.status),
      healthFormStatus: 'none', // Will be updated later via updateHealthFormStatusInRequests
      healthInfo: {
        weight: donation.weight || 'N/A',
        height: donation.height || 'N/A',
        lastDonation: donation.lastDonationDate || 'N/A',
        chronicDiseases: donation.chronicDiseases || 'Không',
        currentMedications: donation.currentMedications || donation.notes || 'Không',
        allergies: donation.allergies || 'Không'
      },
      emergencyContact: donation.emergencyContact || {},
      notes: donation.notes || donation.requestDescription || '',
      rejectReason: donation.rejectReason || '',
      dateOfBirth: donation.dateOfBirth || '',
      role: donation.role || ''
    };
  };

  // Format health form data from API
  const formatHealthFormData = (healthForm) => {
    console.log('Formatting health form data:', healthForm);
    
    return {
      id: healthForm.healthCheckId || healthForm.id || healthForm.ID,
      healthCheckID: healthForm.healthCheckId || healthForm.id || 'N/A',
      userID: healthForm.donorID || healthForm.userIdCard || healthForm.donorId || 'N/A',
      donorId: healthForm.donorID || healthForm.donorId || healthForm.userIdCard,
      fullName: healthForm.fullName || healthForm.donorName || 'N/A',
      idCard: healthForm.userIdCard || healthForm.idCard || 'N/A',
      phone: healthForm.phoneNumber || healthForm.phone || 'Chưa cập nhật',
      bloodType: healthForm.bloodType || 'N/A',
      age: healthForm.age || calculateAge(healthForm.dateOfBirth) || 'N/A',
      gender: healthForm.gender || 'N/A',
      submittedDate: healthForm.healthCheck_Date || healthForm.healthCheckDate || healthForm.createdDate || new Date().toISOString(),
      status: mapApiStatus(healthForm.healthCheck_Status || healthForm.healthCheckStatus || healthForm.status),
      weight: healthForm.weight || 'N/A',
      height: healthForm.height || 'N/A',
      bloodPressure: healthForm.blood_pressure || healthForm.bloodPressure || 'N/A',
      heartRate: healthForm.heartRate || 'N/A',
      temperature: healthForm.temperature || 'N/A',
      medicalHistory: healthForm.medicalHistory || 'Không có thông tin',
      lastDonation: healthForm.lastDonationDate || 'Chưa từng hiến máu',
      notes: healthForm.notes || healthForm.additionalNotes || '',
      allergies: healthForm.allergies || 'Không',
      currentMedications: healthForm.currentMedications || 'Không',
      createdBy: {
        staffID: healthForm.createdByStaffId || 'SYSTEM',
        staffName: healthForm.createdByStaffName || 'Hệ thống',
        position: healthForm.createdByPosition || 'Y tá'
      }
    };
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Map API status to UI status
  const mapApiStatus = (status) => {
    if (!status) return 'pending';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'accepted':
      case 'completed':
        return 'approved';
      case 'rejected':
      case 'declined':
      case 'cancelled':
        return 'rejected';
      case 'pending':
      case 'waiting':
      case 'processing':
      default:
        return 'pending';
    }
  };

  // Get health form status for a donor
  const getHealthFormStatus = (donorId) => {
    console.log('Finding health form for donorId:', donorId);
    console.log('Available health forms:', healthForms);
    
    // If health forms not loaded yet, return 'loading'
    if (healthForms === null) {
      console.log('Health forms not loaded yet');
      return 'loading';
    }
    
    // If no health forms available, return 'none'
    if (!Array.isArray(healthForms) || healthForms.length === 0) {
      console.log('No health forms available');
      return 'none';
    }
    
    const healthForm = healthForms.find(form => {
      console.log('Checking form:', form);
      
      // More robust matching logic
      const formDonorId = form.donorId || form.userID || form.donorID;
      const formIdCard = form.idCard || form.userIdCard;
      
      return formDonorId === donorId || 
             formIdCard === donorId ||
             String(formDonorId) === String(donorId) ||
             String(formIdCard) === String(donorId);
    });
    
    console.log('Found health form:', healthForm);
    return healthForm ? healthForm.status : 'none';
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  const getRequestTypeText = (type) => {
    switch (type) {
      case 'regular': return 'Hiến máu thường';
      case 'emergency': return 'Hiến máu khẩn cấp';
      default: return 'Không xác định';
    }
  };

  const getRequestTypeBadgeVariant = (type) => {
    switch (type) {
      case 'regular': return 'primary';
      case 'emergency': return 'danger';
      default: return 'secondary';
    }
  };

  const getHealthFormStatusBadge = (status, request = null) => {
    // Check for inconsistency between blood donation and health form status
    const hasInconsistency = request && 
      request.status === 'rejected' && 
      (status === 'pending' || status === 'approved');
    
    switch (status) {
      case 'loading': return <Badge bg="info">Đang tải...</Badge>;
      case 'none': return <Badge bg="secondary">Chưa có phiếu</Badge>;
      case 'pending': 
        return hasInconsistency ? 
          <Badge bg="warning" className="d-flex align-items-center">
            Đã có phiếu 
            <small className="ms-1" title="Không đồng bộ với trạng thái đơn hiến máu">⚠️</small>
          </Badge> : 
          <Badge bg="warning">Đã có phiếu</Badge>;
      case 'approved': 
        return hasInconsistency ? 
          <Badge bg="success" className="d-flex align-items-center">
            Phiếu đã duyệt 
            <small className="ms-1" title="Không đồng bộ với trạng thái đơn hiến máu">⚠️</small>
          </Badge> : 
          <Badge bg="success">Phiếu đã duyệt</Badge>;
      case 'rejected': return <Badge bg="danger">Phiếu bị từ chối</Badge>;
      default: return <Badge bg="secondary">Không xác định</Badge>;
    }
  };

  const canApproveRequest = (request) => {
    // Có thể duyệt đơn nếu có phiếu sức khỏe (pending hoặc approved)
    return request.healthFormStatus !== 'none' && 
           request.healthFormStatus !== 'rejected' && 
           request.healthFormStatus !== 'loading';
  };

  // Check if there's inconsistency between blood donation and health form status
  const hasStatusInconsistency = (request) => {
    return request.status === 'rejected' && 
           (request.healthFormStatus === 'pending' || request.healthFormStatus === 'approved');
  };

  // Sync health form status with blood donation status
  const handleSyncHealthFormStatus = async (request) => {
    if (!hasStatusInconsistency(request)) return;

    try {
      const healthForm = healthForms && Array.isArray(healthForms) ? healthForms.find(form => 
        form.donorId === request.requesterId || 
        form.userID === request.requesterId ||
        form.idCard === request.idCard ||
        form.userID === request.idCard
      ) : null;

      if (healthForm) {
        console.log('Syncing health form status to rejected for:', healthForm.id);
        
        // Auto-reject health form to match blood donation status
        await healthCheckApi.rejectHealthCheck(healthForm.id, {
          rejectionReason: 'Tự động đồng bộ: đơn hiến máu đã bị từ chối',
          rejectedDate: new Date().toISOString()
        });

        // Update local state
        setHealthForms(prev => 
          prev.map(form => 
            form.id === healthForm.id ? { ...form, status: 'rejected' } : form
          )
        );

        showMessage('Đã đồng bộ trạng thái phiếu sức khỏe với đơn hiến máu', 'success');
        
        // Reload data to ensure consistency
        await loadData();
      }
    } catch (error) {
      console.error('Error syncing health form status:', error);
      
      // Fallback: update locally
      const healthForm = healthForms && Array.isArray(healthForms) ? healthForms.find(form => 
        form.donorId === request.requesterId || 
        form.userID === request.requesterId ||
        form.idCard === request.idCard ||
        form.userID === request.idCard
      ) : null;

      if (healthForm) {
        setHealthForms(prev => 
          prev.map(form => 
            form.id === healthForm.id ? { ...form, status: 'rejected' } : form
          )
        );
        showMessage('Đã đồng bộ trạng thái phiếu sức khỏe (cục bộ)', 'warning');
      }
    }
  };

  // Health form handlers
  const handleApproveHealthForm = async (formId) => {
    try {
      // Gọi API duyệt phiếu sức khỏe
      await healthCheckApi.approveHealthCheck(formId, {
        approvedDate: new Date().toISOString(),
        notes: 'Phiếu sức khỏe đã được duyệt'
      });
      
      // Cập nhật state sau khi API thành công
      setHealthForms(prev => 
        prev.map(form => 
          form.id === formId ? { ...form, status: 'approved' } : form
        )
      );
      showMessage('Phiếu sức khỏe đã được duyệt!', 'success');
      
      // Reload data to update health form status
      await loadData();
    } catch (error) {
      console.error('Health form approval error:', error);
      
      // Fallback: update locally if API fails
      setHealthForms(prev => 
        prev.map(form => 
          form.id === formId ? { ...form, status: 'approved' } : form
        )
      );
      showMessage('Phiếu sức khỏe đã được duyệt (cập nhật cục bộ - vui lòng kiểm tra với quản trị viên)', 'warning');
      
      console.warn('Health form API failed, updated locally:', error.message);
    }
  };

  const handleRejectHealthForm = async (formId) => {
    try {
      // Gọi API từ chối phiếu sức khỏe
      await healthCheckApi.rejectHealthCheck(formId, {
        rejectionReason: 'Phiếu sức khỏe không đạt yêu cầu',
        rejectedDate: new Date().toISOString()
      });
      
      // Cập nhật state sau khi API thành công
      setHealthForms(prev => 
        prev.map(form => 
          form.id === formId ? { ...form, status: 'rejected' } : form
        )
      );
      showMessage('Phiếu sức khỏe đã bị từ chối!', 'warning');
      
      // Reload data to update health form status
      await loadData();
    } catch (error) {
      console.error('Health form rejection error:', error);
      
      // Fallback: update locally if API fails
      setHealthForms(prev => 
        prev.map(form => 
          form.id === formId ? { ...form, status: 'rejected' } : form
        )
      );
      showMessage('Phiếu sức khỏe đã bị từ chối (cập nhật cục bộ - vui lòng kiểm tra với quản trị viên)', 'warning');
      
      console.warn('Health form API failed, updated locally:', error.message);
    }
  };
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requesterName.toLowerCase().includes(searchText.toLowerCase()) ||
                         request.requesterEmail.toLowerCase().includes(searchText.toLowerCase()) ||
                         request.bloodType.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesRequestType = filterRequestType === 'all' || request.requestType === filterRequestType;
    
    return matchesSearch && matchesStatus && matchesRequestType;
  });

  const showRequestDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const showApprovalConfirm = (request, action) => {
    if (action === 'approve' && !canApproveRequest(request)) {
      showMessage('Không thể duyệt đơn hiến máu khi chưa có phiếu sức khỏe hợp lệ', 'danger');
      return;
    }
    setSelectedRequest(request);
    setApprovalAction(action);
    setRejectReason('');
    setShowApprovalModal(true);
  };

  const handleApproval = async () => {
    if (approvalAction === 'reject' && !rejectReason.trim()) {
      showMessage('Vui lòng nhập lý do từ chối', 'danger');
      return;
    }

    setLoading(true);
    console.log('Starting approval process:', {
      action: approvalAction,
      requestId: selectedRequest.id,
      requesterId: selectedRequest.requesterId,
      healthFormStatus: selectedRequest.healthFormStatus
    });

    try {
      if (approvalAction === 'approve') {
        // Tự động duyệt cả đơn hiến máu và phiếu sức khỏe
        
        // 1. Duyệt phiếu sức khỏe trước (nếu đang pending)
        if (selectedRequest.healthFormStatus === 'pending') {
          const healthForm = healthForms && Array.isArray(healthForms) ? healthForms.find(form => 
            form.donorId === selectedRequest.requesterId || 
            form.userID === selectedRequest.requesterId ||
            form.idCard === selectedRequest.idCard ||
            form.userID === selectedRequest.idCard
          ) : null;
          
          if (healthForm) {
            try {
              console.log('Approving health form:', healthForm.id);
              // Gọi API duyệt phiếu sức khỏe
              await healthCheckApi.approveHealthCheck(healthForm.id, {
                approvedDate: new Date().toISOString(),
                notes: 'Đã duyệt cùng với đơn hiến máu'
              });
              
              // Cập nhật trạng thái phiếu sức khỏe trong state
              setHealthForms(prev => 
                prev.map(form => 
                  form.id === healthForm.id ? { ...form, status: 'approved' } : form
                )
              );
              console.log('Health form approved successfully');
            } catch (error) {
              console.error('Health check approval API error:', error);
              // Thay vì dừng lại, chúng ta sẽ tiếp tục với việc duyệt đơn hiến máu
              // và cập nhật state phiếu sức khỏe locally
              console.warn('Health check API failed, updating locally and continuing with blood donation approval...');
              
              setHealthForms(prev => 
                prev.map(form => 
                  form.id === healthForm.id ? { ...form, status: 'approved' } : form
                )
              );
              
              showMessage('Đã duyệt đơn hiến máu (lưu ý: có thể cần cập nhật thủ công trạng thái phiếu sức khỏe)', 'warning');
            }
          }
        }
        
        // 2. Duyệt đơn hiến máu
        const approvalData = {
          donationId: selectedRequest.id,
          donorId: selectedRequest.requesterId,
          approvedDate: new Date().toISOString(),
          notes: 'Đã duyệt đơn hiến máu và phiếu sức khỏe'
        };
        
        console.log('Sending approval data:', approvalData);
        await bloodDonationApi.approveBloodDonation(approvalData);
        console.log('Blood donation approved successfully');
        showMessage('Đã duyệt đơn hiến máu và phiếu sức khỏe thành công', 'success');
        
      } else if (approvalAction === 'reject') {
        // Gọi API từ chối đơn hiến máu
        const rejectionData = {
          donationId: selectedRequest.id,
          donorId: selectedRequest.requesterId,
          rejectionReason: rejectReason,
          rejectedDate: new Date().toISOString()
        };
        
        console.log('Sending rejection data:', rejectionData);
        await bloodDonationApi.rejectBloodDonation(rejectionData);
        console.log('Blood donation rejected successfully');
        
        // Nếu có phiếu sức khỏe đang pending, cũng từ chối luôn
        if (selectedRequest.healthFormStatus === 'pending') {
          const healthForm = healthForms && Array.isArray(healthForms) ? healthForms.find(form => 
            form.donorId === selectedRequest.requesterId || 
            form.userID === selectedRequest.requesterId ||
            form.idCard === selectedRequest.idCard ||
            form.userID === selectedRequest.idCard
          ) : null;
          
          if (healthForm) {
            try {
              console.log('Rejecting health form:', healthForm.id);
              await healthCheckApi.rejectHealthCheck(healthForm.id, {
                rejectionReason: rejectReason,
                rejectedDate: new Date().toISOString()
              });
              
              // Cập nhật trạng thái phiếu sức khỏe trong state
              setHealthForms(prev => 
                prev.map(form => 
                  form.id === healthForm.id ? { ...form, status: 'rejected' } : form
                )
              );
              console.log('Health form rejected successfully');
            } catch (error) {
              console.error('Health check rejection API error:', error);
              // Cập nhật state locally nếu API thất bại
              console.warn('Health check rejection API failed, updating locally...');
              
              setHealthForms(prev => 
                prev.map(form => 
                  form.id === healthForm.id ? { ...form, status: 'rejected' } : form
                )
              );
            }
          }
        }
        
        showMessage('Đã từ chối đơn hiến máu', 'warning');
      }

      // Reload data to get updated information
      console.log('Reloading data...');
      await loadData();
      
    } catch (error) {
      console.error('Approval process error:', error);
      handleApiError(error, 'Lỗi khi xử lý đơn hiến máu');
    } finally {
      setLoading(false);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  // Update health form status in requests after health forms are loaded
  const updateHealthFormStatusInRequests = () => {
    console.log('Updating health form status in requests...');
    console.log('Current requests:', requests);
    console.log('Current health forms:', healthForms);
    
    setRequests(prevRequests => 
      prevRequests.map(request => {
        const newHealthFormStatus = getHealthFormStatus(request.requesterId || request.idCard);
        console.log(`Request ${request.id}: ${request.requesterId || request.idCard} -> ${newHealthFormStatus}`);
        return {
          ...request,
          healthFormStatus: newHealthFormStatus
        };
      })
    );
  };

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-2">
                <FaHeart className="me-2" />
                Duyệt Đơn Hiến Máu & Phiếu Sức Khỏe
              </h2>
              <p className="text-muted mb-0">Quản lý và duyệt các đơn đăng ký hiến máu và phiếu sức khỏe</p>
            </div>
            <div>
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  const isAuthValid = checkAuthStatus();
                  if (isAuthValid) {
                    loadData();
                  }
                }}
                disabled={loading}
                className="d-flex align-items-center"
              >
                <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
                {loading ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alert Messages */}
      {showAlert.show && (
        <Row className="mb-3">
          <Col>
            <Alert 
              variant={showAlert.type} 
              dismissible 
              onClose={() => setShowAlert({ show: false, message: '', type: 'success' })}
            >
              {showAlert.message}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Authentication Status Alert */}
      {!authStatus.isValid && (
        <Row className="mb-3">
          <Col>
            <Alert variant="warning" className="d-flex justify-content-between align-items-center">
              <div>
                <strong>⚠️ Vấn đề xác thực:</strong> {authStatus.message}
              </div>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => window.location.href = '/login'}
                  className="me-2"
                >
                  Đăng nhập lại
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={checkAuthStatus}
                >
                  Kiểm tra lại
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Data Inconsistency Alert */}
      {(() => {
        const inconsistentRequests = requests.filter(hasStatusInconsistency);
        return inconsistentRequests.length > 0 && (
          <Row className="mb-3">
            <Col>
              <Alert variant="warning" className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>⚠️ Phát hiện dữ liệu không đồng bộ:</strong> Có {inconsistentRequests.length} đơn hiến máu có 
                  trạng thái không nhất quán với phiếu sức khỏe. Hãy sử dụng nút đồng bộ để khắc phục.
                </div>
                <div>
                  <Button 
                    variant="outline-warning" 
                    size="sm" 
                    onClick={async () => {
                      for (const request of inconsistentRequests) {
                        await handleSyncHealthFormStatus(request);
                      }
                    }}
                  >
                    <FaSync className="me-2" />
                    Đồng bộ tất cả
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        );
      })()}

      {/* Filters and Search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col lg={4} md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, nhóm máu..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={3} md={6}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={6}>
              <Form.Select
                value={filterRequestType}
                onChange={(e) => setFilterRequestType(e.target.value)}
              >
                <option value="all">Tất cả loại đơn</option>
                <option value="regular">Hiến máu thường</option>
                <option value="emergency">Hiến máu khẩn cấp</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Button variant="outline-primary" className="w-100">
                <FaFilter className="me-2" />
                Lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistics */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-warning">
            <Card.Body>
              <FaClock className="text-warning mb-2" size={24} />
              <h4 className="text-warning">
                {requests.filter(r => r.status === 'pending').length}
              </h4>
              <small className="text-muted">Chờ duyệt</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-success">
            <Card.Body>
              <FaCheck className="text-success mb-2" size={24} />
              <h4 className="text-success">
                {requests.filter(r => r.status === 'approved').length}
              </h4>
              <small className="text-muted">Đã duyệt</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-danger">
            <Card.Body>
              <FaTimes className="text-danger mb-2" size={24} />
              <h4 className="text-danger">
                {requests.filter(r => r.status === 'rejected').length}
              </h4>
              <small className="text-muted">Từ chối</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="text-center border-primary">
            <Card.Body>
              <FaHeart className="text-primary mb-2" size={24} />
              <h4 className="text-primary">
                {requests.length}
              </h4>
              <small className="text-muted">Tổng đơn</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content - Only Donations */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaHeart className="me-2" />
            Danh sách đơn hiến máu ({filteredRequests.length})
          </h5>
        </Card.Header>
        <Card.Body>
          {/* Donations Table */}
          <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người đăng ký</th>
                    <th>Nhóm máu</th>
                    <th>Loại đơn</th>
                    <th>Ngày mong muốn</th>
                    <th>Phiếu sức khỏe</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        Không có dữ liệu phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(request => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td>
                          <strong>{request.requesterName}</strong>
                        </td>
                        <td>
                          <Badge bg="danger" className="blood-type-badge">
                            {request.bloodType}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getRequestTypeBadgeVariant(request.requestType)}>
                            {getRequestTypeText(request.requestType)}
                          </Badge>
                        </td>
                        <td>{request.preferredDate}</td>
                        <td>{getHealthFormStatusBadge(request.healthFormStatus, request)}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(request.status)}>
                            {getStatusText(request.status)}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Xem chi tiết</Tooltip>}
                            >
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => showRequestDetail(request)}
                              >
                                <FaEye />
                              </Button>
                            </OverlayTrigger>
                            {request.status === 'pending' && (
                              <>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>
                                    {request.healthFormStatus === 'loading' 
                                      ? 'Đang tải thông tin phiếu sức khỏe...'
                                      : canApproveRequest(request) 
                                        ? 'Duyệt đơn hiến máu và phiếu sức khỏe' 
                                        : 'Cần có phiếu sức khỏe hợp lệ'
                                    }
                                  </Tooltip>}
                                >
                                  <Button
                                    variant={canApproveRequest(request) ? "outline-success" : "outline-secondary"}
                                    size="sm"
                                    onClick={() => showApprovalConfirm(request, 'approve')}
                                    disabled={!canApproveRequest(request)}
                                  >
                                    <FaCheck />
                                  </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Từ chối</Tooltip>}
                                >
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => showApprovalConfirm(request, 'reject')}
                                  >
                                    <FaTimes />
                                  </Button>
                                </OverlayTrigger>
                              </>
                            )}
                            {hasStatusInconsistency(request) && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Đồng bộ trạng thái phiếu sức khỏe với đơn hiến máu</Tooltip>}
                              >
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleSyncHealthFormStatus(request)}
                                  className="ms-2"
                                >
                                  <FaSync />
                                </Button>
                              </OverlayTrigger>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            Chi tiết đơn hiến máu #{selectedRequest?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <Tabs defaultActiveKey="donation" className="mb-3">
              <Tab eventKey="donation" title={
                <span>
                  <FaHeart className="me-2" />
                  Thông tin đơn hiến máu
                </span>
              }>
                {/* Blood Donation Request Details */}
                <Card className="mb-3">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="info-item mb-3">
                          <strong>Họ và tên:</strong>
                          <span className="ms-2">{selectedRequest.requesterName}</span>
                        </div>
                        <div className="info-item mb-3">
                          <strong>Email:</strong>
                          <span className="ms-2">{selectedRequest.requesterEmail}</span>
                        </div>
                        <div className="info-item mb-3">
                          <strong>Số điện thoại:</strong>
                          <span className="ms-2">
                            {selectedRequest.requesterPhone && selectedRequest.requesterPhone !== 'Chưa cập nhật' && selectedRequest.requesterPhone !== 'N/A' 
                              ? selectedRequest.requesterPhone 
                              : 'Chưa cập nhật'}
                          </span>
                        </div>
                        <div className="info-item mb-3">
                          <strong>CCCD/CMND:</strong>
                          <span className="ms-2">
                            {selectedRequest.idCard && selectedRequest.idCard !== 'Chưa cập nhật' && selectedRequest.idCard !== 'N/A'
                              ? selectedRequest.idCard
                              : 'Chưa cập nhật'}
                          </span>
                        </div>
                        {selectedRequest.dateOfBirth && (
                          <div className="info-item mb-3">
                            <strong>Ngày sinh:</strong>
                            <span className="ms-2">{selectedRequest.dateOfBirth}</span>
                          </div>
                        )}
                      </Col>
                      <Col md={6}>
                        <div className="info-item mb-3">
                          <strong>Nhóm máu:</strong>
                          <Badge bg="danger" className="ms-2">
                            {selectedRequest.bloodType}
                          </Badge>
                        </div>
                        <div className="info-item mb-3">
                          <strong>Loại đơn:</strong>
                          <Badge bg={getRequestTypeBadgeVariant(selectedRequest.requestType)} className="ms-2">
                            {getRequestTypeText(selectedRequest.requestType)}
                          </Badge>
                        </div>
                        <div className="info-item mb-3">
                          <strong>Ngày hiến máu:</strong>
                          <span className="ms-2">{selectedRequest.preferredDate}</span>
                        </div>
                      </Col>
                    </Row>
                    <div className="info-item mb-3">
                      <strong>Địa chỉ:</strong>
                      <span className="ms-2">{selectedRequest.location}</span>
                    </div>
                    <div className="info-item mb-3">
                      <strong>Ghi chú:</strong>
                      <p className="mt-2">{selectedRequest.notes}</p>
                    </div>
                    {selectedRequest.status === 'rejected' && selectedRequest.rejectReason && (
                      <Alert variant="danger">
                        <strong>Lý do từ chối:</strong> {selectedRequest.rejectReason}
                      </Alert>
                    )}
                    {!canApproveRequest(selectedRequest) && selectedRequest.status === 'pending' && (
                      <Alert variant="warning">
                        <FaExclamationTriangle className="me-2" />
                        <strong>Lưu ý:</strong> Không thể duyệt đơn hiến máu khi chưa có phiếu sức khỏe hợp lệ.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
              
              <Tab eventKey="healthform" title={
                <span>
                  <FaClipboardList className="me-2" />
                  Phiếu sức khỏe
                </span>
              }>
                {/* Health Form Details Section */}
                <Card className="mb-3">
                  <Card.Body>
                    {selectedRequest.healthFormStatus === 'none' ? (
                      <Alert variant="info">
                        <FaClipboardList className="me-2" />
                        <strong>Chưa có phiếu sức khỏe</strong>
                        <p className="mt-2 mb-0">
                          Người hiến máu này chưa có phiếu sức khỏe. Vui lòng yêu cầu người hiến máu nộp phiếu sức khỏe 
                          hoặc nhân viên y tế tạo phiếu sức khỏe trước khi duyệt đơn hiến máu.
                        </p>
                      </Alert>
                    ) : (
                      // Hiển thị thông tin phiếu sức khỏe từ healthForms
                      (() => {
                        const healthForm = healthForms.find(form => 
                          form.donorId === selectedRequest.requesterId || 
                          form.userID === selectedRequest.requesterId ||
                          form.idCard === selectedRequest.idCard ||
                          form.userID === selectedRequest.idCard
                        );
                        
                        if (!healthForm) {
                          return (
                            <Alert variant="warning">
                              <FaExclamationTriangle className="me-2" />
                              <strong>Không tìm thấy chi tiết phiếu sức khỏe</strong>
                              <p className="mt-2 mb-0">
                                Hệ thống cho biết có phiếu sức khỏe nhưng không thể tải chi tiết. 
                                Vui lòng liên hệ quản trị viên.
                              </p>
                            </Alert>
                          );
                        }
                        
                        return (
                          <>
                            {/* Header Card - Chỉ tiêu đề và ngày khám */}
                            <Card className="mb-3 border-primary">
                              <Card.Header className="bg-primary text-white">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <FaClipboardList className="me-2" />
                                    Phiếu sức khỏe
                                  </div>
                                </div>
                              </Card.Header>
                              <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                  <FaIdCard className="me-2 text-primary" />
                                  <strong>Mã phiếu sức khỏe:</strong>
                                  <span className="ms-2">#{healthForm.healthCheckID}</span>
                                </div>
                                <div className="d-flex align-items-center mb-3">
                                  <FaCalendarAlt className="me-2 text-primary" />
                                  <strong>Ngày khám:</strong>
                                  <span className="ms-2">{new Date(healthForm.submittedDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                              </Card.Body>
                            </Card>

                            <Row>
                              {/* Chỉ số sinh hiệu */}
                              <Col md={6}>
                                <Card className="mb-3 h-100">
                                  <Card.Header className="bg-success text-white">
                                    <FaHeartbeat className="me-2" />
                                    Chỉ số sinh hiệu
                                  </Card.Header>
                                  <Card.Body>
                                    <div className="vital-signs">
                                      <div className="vital-item mb-3 p-2 border rounded">
                                        <div className="d-flex justify-content-between">
                                          <strong>Cân nặng:</strong>
                                          <span className="text-success fw-bold">{healthForm.weight} kg</span>
                                        </div>
                                      </div>
                                      <div className="vital-item mb-3 p-2 border rounded">
                                        <div className="d-flex justify-content-between">
                                          <strong>Chiều cao:</strong>
                                          <span className="text-success fw-bold">{healthForm.height} cm</span>
                                        </div>
                                      </div>
                                      <div className="vital-item mb-3 p-2 border rounded">
                                        <div className="d-flex justify-content-between">
                                          <strong>Huyết áp:</strong>
                                          <span className="text-success fw-bold">{healthForm.bloodPressure} mmHg</span>
                                        </div>
                                      </div>
                                      <div className="vital-item mb-3 p-2 border rounded">
                                        <div className="d-flex justify-content-between">
                                          <strong>Nhịp tim:</strong>
                                          <span className="text-success fw-bold">{healthForm.heartRate} lần/phút</span>
                                        </div>
                                      </div>
                                      <div className="vital-item p-2 border rounded">
                                        <div className="d-flex justify-content-between">
                                          <strong>Nhiệt độ:</strong>
                                          <span className="text-success fw-bold">{healthForm.temperature}°C</span>
                                        </div>
                                      </div>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>

                              {/* Thông tin y tế */}
                              <Col md={6}>
                                <Card className="mb-3 h-100">
                                  <Card.Header className="bg-info text-white">
                                    <FaClipboardList className="me-2" />
                                    Thông tin y tế
                                  </Card.Header>
                                  <Card.Body>
                                    <div className="medical-info">
                                      <div className="info-item mb-3">
                                        <strong className="text-info">Dị ứng:</strong>
                                        <div className="mt-2 p-3 bg-light rounded">
                                          <p className="mb-0 text-muted">{healthForm.allergies}</p>
                                        </div>
                                      </div>
                                      <div className="info-item mb-3">
                                        <strong className="text-info">Thuốc đang sử dụng:</strong>
                                        <div className="mt-2 p-3 bg-light rounded">
                                          <p className="mb-0 text-muted">{healthForm.currentMedications}</p>
                                        </div>
                                      </div>
                                      <div className="info-item">
                                        <strong className="text-info">Tiền sử bệnh lý:</strong>
                                        <div className="mt-2 p-3 bg-light rounded">
                                          <p className="mb-0 text-muted">
                                            {healthForm.medicalHistory || 'Không có thông tin'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>
                          </>
                        );
                      })()
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                variant={canApproveRequest(selectedRequest) ? "success" : "secondary"}
                disabled={!canApproveRequest(selectedRequest)}
                onClick={() => {
                  setShowDetailModal(false);
                  showApprovalConfirm(selectedRequest, 'approve');
                }}
              >
                <FaCheck className="me-2" />
                Duyệt đơn hiến máu
              </Button>
              <Button 
                variant="danger"
                onClick={() => {
                  setShowDetailModal(false);
                  showApprovalConfirm(selectedRequest, 'reject');
                }}
              >
                <FaTimes className="me-2" />
                Từ chối
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Approval Confirmation Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {approvalAction === 'approve' ? (
              <>
                <FaCheck className="me-2 text-success" />
                Xác nhận duyệt đơn
              </>
            ) : (
              <>
                <FaTimes className="me-2 text-danger" />
                Xác nhận từ chối
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn {approvalAction === 'approve' ? 'duyệt đơn hiến máu và phiếu sức khỏe' : 'từ chối'} của{' '}
            <strong>{selectedRequest?.requesterName}</strong>?
          </p>
          
          {approvalAction === 'approve' && selectedRequest?.healthFormStatus === 'pending' && (
            <Alert variant="info">
              <FaCheck className="me-2" />
              <strong>Lưu ý:</strong> Phiếu sức khỏe đang chờ duyệt sẽ được tự động duyệt cùng với đơn hiến máu.
            </Alert>
          )}
          
          {approvalAction === 'reject' && (
            <Form.Group className="mt-3">
              <Form.Label>Lý do từ chối *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối đơn hiến máu..."
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowApprovalModal(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            variant={approvalAction === 'approve' ? 'success' : 'danger'}
            onClick={handleApproval}
            disabled={loading}
            className="d-flex align-items-center"
          >
            {loading && <Spinner size="sm" className="me-2" />}
            {approvalAction === 'approve' ? 'Xác nhận duyệt đơn hiến máu' : 'Xác nhận từ chối'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ApproveDonationRequests;
