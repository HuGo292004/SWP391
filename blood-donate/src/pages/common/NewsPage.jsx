import React, { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Button,
  Divider,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  RightOutlined,
  PlusOutlined,
  SaveOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementViewCount,
} from "../../services/blogApi";
import { UserAPI } from "../../services/userApi";
import "../../styles/NewsPage.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NewsPage = () => {
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [newsData, setNewsData] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [sortBy, setSortBy] = useState("newest");

  // Kiểm tra role của user
  const userRole = localStorage.getItem("userRole");
  const currentUserID =
    localStorage.getItem("userId") ||
    localStorage.getItem("userID") ||
    localStorage.getItem("id");
  const currentUserFullName =
    localStorage.getItem("fullName") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    localStorage.getItem("username");
  const canCreateNews = userRole === "Staff" || userRole === "Admin";

  // Categories cho tin tức
  const categories = [
    { value: "Chiến dịch", label: "Chiến dịch" },
    { value: "Sức khỏe", label: "Sức khỏe" },
    { value: "Thông báo", label: "Thông báo" },
    { value: "Hướng dẫn", label: "Hướng dẫn" },
    { value: "Sự kiện", label: "Sự kiện" },
    { value: "Khoa học", label: "Khoa học" },
    { value: "Công nghệ", label: "Công nghệ" },
  ];

  // Load blogs when component mounts
  useEffect(() => {
    loadBlogs();
  }, []);

  // Load user info for all authors when newsData changes
  useEffect(() => {
    const loadUserInfo = async () => {
      const authorIDs = [...new Set(newsData.map((blog) => blog.authorID))];
      for (const authorID of authorIDs) {
        if (userCache[authorID] || authorID === currentUserID) continue;
        try {
          await getAuthorName(authorID);
        } catch (_) {}
      }
    };
    if (newsData.length > 0) {
      loadUserInfo();
    }
  }, [newsData, currentUserID, userCache]);

  // Load all blogs from API
  const loadBlogs = async () => {
    try {
      setPageLoading(true);
      const response = await getAllBlogs();
      const blogs = Array.isArray(response)
        ? response
        : response?.data || response?.blogs || [];
      const processedBlogs = (blogs || []).map((blog, index) => {
        const blogID =
          blog.blogID ||
          blog.id ||
          blog.blogId ||
          blog.Id ||
          blog.ID ||
          `temp-${Date.now()}-${index}`;
        const authorID =
          blog.authorID ||
          blog.authorId ||
          blog.author_id ||
          blog.userId ||
          blog.user_id ||
          blog.createdBy ||
          blog.created_by ||
          currentUserID ||
          "UNKNOWN_AUTHOR";
        const publishDate =
          blog.publishDate ||
          blog.publish_date ||
          blog.createdAt ||
          blog.created_at ||
          blog.dateCreated ||
          blog.date_created ||
          new Date().toISOString();
        const viewCount = blog.viewCount || blog.view_count || blog.views || 0;
        return {
          ...blog,
          blogID: blogID,
          authorID: authorID,
          publishDate: publishDate,
          viewCount: viewCount,
          title: blog.title || "Untitled",
          content: blog.content || "No content",
          category: blog.category || "Thông báo",
        };
      });
      const validBlogs = processedBlogs.filter((blog) => {
        const isValid =
          blog.blogID &&
          blog.blogID !== "undefined" &&
          !blog.blogID.startsWith("temp-");
        return isValid;
      });
      if (validBlogs.length === 0) {
        const sampleBlogs = [
          {
            blogID: "sample-1",
            authorID: currentUserID || "28697d11-561a-4992-a7ca-9dbb158bca8b",
            title: "Hướng dẫn hiến máu an toàn",
            content:
              "Hiến máu là một hành động nhân đạo cao cả. Để hiến máu an toàn, bạn cần đáp ứng các điều kiện về sức khỏe và tuân thủ quy trình. Trước khi hiến máu, hãy nghỉ ngơi đầy đủ, ăn uống đủ chất và thông báo với nhân viên y tế về tình trạng sức khỏe của mình.",
            publishDate: "2024-06-25T10:00:00",
            category: "Hướng dẫn",
            viewCount: 1250,
          },
          {
            blogID: "sample-2",
            authorID: currentUserID || "28697d11-561a-4992-a7ca-9dbb158bca8b",
            title: "Lợi ích của việc hiến máu",
            content:
              "Hiến máu không chỉ giúp cứu sống người khác mà còn mang lại nhiều lợi ích cho người hiến. Việc hiến máu thường xuyên giúp cơ thể tái tạo máu mới, kiểm tra sức khỏe định kỳ và giảm nguy cơ mắc một số bệnh về tim mạch.",
            publishDate: "2024-06-20T15:30:00",
            category: "Sức khỏe",
            viewCount: 890,
          },
        ];
        setNewsData(sampleBlogs);
      } else {
        setNewsData(validBlogs);
      }
    } catch (error) {
      message.error("Không thể tải danh sách tin tức: " + error.message);
      setNewsData([
        {
          blogID: "fallback-1",
          authorID: currentUserID || "28697d11-561a-4992-a7ca-9dbb158bca8b",
          title: "Tin tức mẫu",
          content: "Đây là tin tức mẫu khi không thể kết nối API",
          publishDate: new Date().toISOString(),
          category: "Thông báo",
          viewCount: 0,
        },
      ]);
    } finally {
      setPageLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getSummary = (content, maxLength = 150) => {
    if (!content) return "";
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const getAuthorName = async (authorID) => {
    if (authorID === currentUserID && currentUserFullName) {
      return currentUserFullName;
    }
    if (userCache[authorID]) {
      return userCache[authorID];
    }
    try {
      const userInfo = await UserAPI.getUserDetail(authorID);
      const fullName =
        userInfo?.fullName ||
        userInfo?.name ||
        userInfo?.userName ||
        `User ${authorID}`;
      setUserCache((prev) => ({
        ...prev,
        [authorID]: fullName,
      }));
      return fullName;
    } catch {
      const authorMap = {
        "28697d11-561a-4992-a7ca-9dbb158bca8b": "staff",
        USER001: "Nguyễn Văn A",
        USER002: "Trần Thị B",
        USER003: "Lê Văn C",
        USER004: "Phạm Thị D",
        OTHER_USER: "Người dùng khác",
      };
      const authorName =
        authorMap[authorID] || `User ${authorID}` || "Tác giả không xác định";
      setUserCache((prev) => ({
        ...prev,
        [authorID]: authorName,
      }));
      return authorName;
    }
  };

  const getAuthorNameSync = (authorID) => {
    if (authorID === currentUserID && currentUserFullName) {
      return currentUserFullName;
    }
    if (userCache[authorID]) {
      return userCache[authorID];
    }
    const authorMap = {
      "28697d11-561a-4992-a7ca-9dbb158bca8b": "staff",
      USER001: "Nguyễn Văn A",
      USER002: "Trần Thị B",
      USER003: "Lê Văn C",
      USER004: "Phạm Thị D",
      OTHER_USER: "Người dùng khác",
    };
    return (
      authorMap[authorID] || `User ${authorID}` || "Tác giả không xác định"
    );
  };

  const handleCreateNews = async (values) => {
    try {
      setLoading(true);
      if (!canCreateNews) {
        message.error(
          "Bạn không có quyền tạo tin tức. Chỉ Staff và Admin mới có thể tạo tin tức."
        );
        return;
      }
      if (!currentUserID) {
        message.error(
          "Không thể tạo tin tức: Chưa đăng nhập hoặc không có thông tin user"
        );
        return;
      }
      const Title = (values.title || "").trim();
      const Content = (values.content || "").trim();
      const Category = (values.category || "").trim();
      if (!Title || !Content || !Category) {
        message.error("Vui lòng nhập đầy đủ Tiêu đề, Nội dung và Danh mục.");
        setLoading(false);
        return;
      }
      // Chú ý: Field tên phải đúng theo backend!
      const blogData = {
        Title,
        Content,
        Category,
        publishDate: new Date().toISOString().slice(0, 10), // yyyy-MM-dd
        authorId: currentUserID,
      };
      const newBlog = await createBlog(blogData);
      await loadBlogs();
      message.success("Tạo tin tức thành công!");
      setCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      message.error(
        "Có lỗi xảy ra khi tạo tin tức: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditNews = async (values) => {
    try {
      setLoading(true);
      if (
        !editingBlog ||
        !editingBlog.blogID ||
        editingBlog.blogID === "undefined"
      ) {
        message.error("Không thể chỉnh sửa: Blog ID không hợp lệ");
        return;
      }
      const blogData = {
        ...editingBlog,
        title: values.title,
        content: values.content,
        category: values.category,
      };
      await updateBlog(editingBlog.blogID, blogData);
      await loadBlogs();
      message.success("Cập nhật tin tức thành công!");
      setEditModalVisible(false);
      setEditingBlog(null);
      editForm.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật tin tức: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (blogID) => {
    try {
      if (!blogID || blogID === "undefined") {
        message.error("Không thể xóa: Blog ID không hợp lệ");
        return;
      }
      await deleteBlog(blogID);
      setNewsData((prevData) =>
        prevData.filter((news) => news.blogID !== blogID)
      );
      message.success("Xóa tin tức thành công!");
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa tin tức: " + error.message);
    }
  };

  const openEditModal = (blog) => {
    if (!blog || !blog.blogID || blog.blogID === "undefined") {
      message.error("Không thể chỉnh sửa: Blog không hợp lệ");
      return;
    }
    setEditingBlog(blog);
    editForm.setFieldsValue({
      title: blog.title || "",
      content: blog.content || "",
      category: blog.category || "",
    });
    setEditModalVisible(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Chiến dịch": "#1976D2",
      "Khoa học": "#2E7D32",
      "Sức khỏe": "#E91E63",
      "Công nghệ": "#F57C00",
      "Thông báo": "#FF9800",
      "Hướng dẫn": "#9C27B0",
      "Sự kiện": "#607D8B",
    };
    return colors[category] || "#1976D2";
  };

  const handleViewNews = async (news) => {
    try {
      await incrementViewCount(news.blogID);
      setSelectedNews(news);
      setDetailModalVisible(true);
    } catch (error) {
      setSelectedNews(news);
      setDetailModalVisible(true);
    }
  };

  const canEditBlog = (blog) => {
    const realUserID =
      localStorage.getItem("userId") ||
      localStorage.getItem("userID") ||
      localStorage.getItem("id");
    if (userRole === "Admin" || userRole === "admin") {
      return true;
    }
    if (userRole === "Staff" || userRole === "staff") {
      const isOwner =
        (realUserID && blog.authorID === realUserID) ||
        (currentUserID && blog.authorID === currentUserID);
      return isOwner;
    }
    return false;
  };

  const filteredAndSortedNews = useMemo(() => {
    let filtered = newsData || [];
    if (selectedCategory) {
      filtered = filtered.filter((news) => news.category === selectedCategory);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.publishDate) - new Date(b.publishDate);
        case "newest":
        default:
          return new Date(b.publishDate) - new Date(a.publishDate);
      }
    });
    return filtered;
  }, [newsData, selectedCategory, sortBy]);

  return (
    <div className="news-page">
      <div className="news-header">
        <div className="news-header-content">
          <h1 className="news-title">
            <FileTextOutlined
              style={{ marginRight: "12px", color: "#ffffff" }}
            />
            Tin tức & Sự kiện
          </h1>
          <p className="news-subtitle">
            Cập nhật những tin tức mới nhất về hoạt động hiến máu và các sự kiện
            sắp diễn ra
          </p>
        </div>
      </div>
      <div className="news-top-section">
        <div className="categories-container">
          <div className="top-categories-section">
            <h3 className="section-title">
              <BookOutlined style={{ marginRight: "8px" }} />
              Danh mục
            </h3>
            <div className="category-list-horizontal">
              {categories.map((cat, index) => {
                const count = newsData.filter(
                  (news) => news.category === cat.value
                ).length;
                return (
                  <div
                    key={`top-cat-${cat.value}-${index}`}
                    className="category-item-horizontal"
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat.value ? undefined : cat.value
                      )
                    }
                    style={{
                      background:
                        selectedCategory === cat.value ? "#e6f3ff" : "white",
                      borderColor:
                        selectedCategory === cat.value ? "#1976d2" : "#e2e8f0",
                    }}
                  >
                    <span className="category-name">{cat.label}</span>
                    <span className="category-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="news-container-new">
        <div className="news-main-content-full">
          <div className="news-controls">
            <div className="news-filters">
              <div className="filter-group">
                <Select
                  placeholder="Sắp xếp"
                  style={{ minWidth: 150 }}
                  defaultValue="newest"
                  value={sortBy}
                  onChange={setSortBy}
                  dropdownClassName="enhanced-select-dropdown"
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="oldest">Cũ nhất</Option>
                </Select>
              </div>
            </div>
            {canCreateNews && (
              <Button
                className="create-blog-btn"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
                size="large"
              >
                Tạo tin tức mới
              </Button>
            )}
          </div>
          <div className="blog-list">
            {pageLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Đang tải tin tức...</div>
              </div>
            ) : newsData && newsData.length > 0 ? (
              <div className="blog-cards-container">
                {filteredAndSortedNews.map((news, index) => (
                  <Card
                    key={`news-${news.blogID || index}`}
                    className="news-card-modern"
                    hoverable
                  >
                    <div className="news-card-content">
                      <div className="news-card-header">
                        <Tag
                          className="news-card-category"
                          color={getCategoryColor(news.category)}
                        >
                          {news.category}
                        </Tag>
                      </div>
                      <h3 className="news-card-title">{news.title}</h3>
                      <p className="news-card-description">
                        {getSummary(news.content, 100)}
                      </p>
                      <div className="news-card-meta">
                        <div className="news-card-author">
                          <UserOutlined />
                          <span>{getAuthorNameSync(news.authorID)}</span>
                        </div>
                        <div className="news-card-date">
                          <CalendarOutlined />
                          <span>{formatDate(news.publishDate)}</span>
                        </div>
                      </div>
                      <div className="news-card-actions">
                        <Button
                          className="news-detail-btn"
                          onClick={() => handleViewNews(news)}
                          block
                        >
                          Xem chi tiết
                        </Button>
                        {canEditBlog(news) &&
                          news.blogID &&
                          news.blogID !== "undefined" && (
                            <div className="news-admin-actions">
                              <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => openEditModal(news)}
                                style={{ marginRight: "8px" }}
                              >
                                Sửa
                              </Button>
                              <Popconfirm
                                title="Xóa tin tức"
                                description="Bạn có chắc chắn muốn xóa tin tức này?"
                                onConfirm={() => handleDeleteNews(news.blogID)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okType="danger"
                              >
                                <Button
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                >
                                  Xóa
                                </Button>
                              </Popconfirm>
                            </div>
                          )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📰</div>
                <h3 className="empty-title">Chưa có tin tức nào</h3>
                <p className="empty-description">
                  {canCreateNews
                    ? "Hãy tạo tin tức đầu tiên của bạn!"
                    : "Các tin tức sẽ được hiển thị tại đây khi có cập nhật mới."}
                </p>
                {canCreateNews && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                    style={{ marginTop: "16px" }}
                  >
                    Tạo tin tức đầu tiên
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal tạo tin tức mới */}
      <Modal
        title={
          <span>
            <PlusOutlined style={{ marginRight: "8px" }} />
            Tạo tin tức mới
          </span>
        }
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateNews}
          className="modal-form"
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label={<span className="form-label">Tiêu đề</span>}
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                className="form-group"
              >
                <Input placeholder="Nhập tiêu đề tin tức" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label={<span className="form-label">Danh mục</span>}
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                className="form-group"
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((cat, index) => (
                    <Option
                      key={`create-${cat.value}-${index}`}
                      value={cat.value}
                    >
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="content"
            label={<span className="form-label">Nội dung</span>}
            rules={[
              { required: true, message: "Vui lòng nhập nội dung" },
              { min: 50, message: "Nội dung phải có ít nhất 50 ký tự" },
            ]}
            className="form-group"
          >
            <TextArea
              rows={12}
              placeholder="Nhập nội dung chi tiết của tin tức..."
              showCount
              maxLength={5000}
            />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
            <Space>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  createForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Tạo tin tức
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal chỉnh sửa tin tức */}
      <Modal
        title={
          <span>
            <EditOutlined style={{ marginRight: "8px" }} />
            Chỉnh sửa tin tức
          </span>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingBlog(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditNews}
          className="modal-form"
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label={<span className="form-label">Tiêu đề</span>}
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                className="form-group"
              >
                <Input placeholder="Nhập tiêu đề tin tức" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label={<span className="form-label">Danh mục</span>}
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                className="form-group"
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((cat, index) => (
                    <Option
                      key={`edit-${cat.value}-${index}`}
                      value={cat.value}
                    >
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="content"
            label={<span className="form-label">Nội dung</span>}
            rules={[
              { required: true, message: "Vui lòng nhập nội dung" },
              { min: 50, message: "Nội dung phải có ít nhất 50 ký tự" },
            ]}
            className="form-group"
          >
            <TextArea
              rows={12}
              placeholder="Nhập nội dung chi tiết của tin tức..."
              showCount
              maxLength={5000}
            />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginTop: "24px" }}>
            <Space>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingBlog(null);
                  editForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Cập nhật tin tức
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal xem chi tiết tin tức */}
      <Modal
        title={
          <span>
            <FileTextOutlined style={{ marginRight: "8px" }} />
            Chi tiết tin tức
          </span>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedNews(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedNews(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedNews && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <Tag
                color={getCategoryColor(selectedNews.category)}
                style={{ marginBottom: "12px" }}
              >
                {selectedNews.category}
              </Tag>
              <Title level={2} style={{ margin: "0 0 16px 0" }}>
                {selectedNews.title}
              </Title>
              <Space
                split={<Divider type="vertical" />}
                style={{ fontSize: "14px", color: "#666" }}
              >
                <Space>
                  <CalendarOutlined /> {formatDate(selectedNews.publishDate)}
                </Space>
                <Space>
                  <UserOutlined /> {getAuthorNameSync(selectedNews.authorID)}
                </Space>
              </Space>
            </div>
            <Divider />
            <div
              style={{
                lineHeight: "1.8",
                fontSize: "16px",
                color: "#333",
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedNews.content}
            </div>
            {canEditBlog(selectedNews) && (
              <div
                style={{
                  marginTop: "32px",
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setDetailModalVisible(false);
                      openEditModal(selectedNews);
                    }}
                  >
                    Chỉnh sửa bài viết
                  </Button>
                  <Popconfirm
                    title="Xóa tin tức"
                    description="Bạn có chắc chắn muốn xóa tin tức này?"
                    onConfirm={() => {
                      setDetailModalVisible(false);
                      handleDeleteNews(selectedNews.blogID);
                    }}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Xóa bài viết
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsPage;
