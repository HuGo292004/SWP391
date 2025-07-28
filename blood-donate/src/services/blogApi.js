// Blog API service
// Ưu tiên lấy từ biến môi trường VITE_API_BASE_URL, fallback về localhost nếu chưa cấu hình
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:7262/api';

// Get auth token from localStorage
const getAuthToken = () => {
  // Thử các tên token khác nhau
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('userToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken')
  );
};

// Create headers with auth token
const createHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorData = {};

    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || `HTTP error! status: ${response.status}` };
    }

    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData,
    });

    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const responseText = await response.text();
  if (!responseText) {
    return null; // Handle empty response
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse JSON response:', responseText);
    throw new Error('Invalid JSON response from server');
  }
};

// GET /api/Blog - Get all blogs
export const getAllBlogs = async () => {
  try {
    console.log('Fetching blogs from:', `${API_BASE_URL}/Blog`);
    const response = await fetch(`${API_BASE_URL}/Blog`, {
      method: 'GET',
      headers: createHeaders(),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await handleResponse(response);
    console.log('Parsed response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

// GET /api/Blog/{id} - Get blog by ID
export const getBlogById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Blog/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching blog ${id}:`, error);
    throw error;
  }
};

// POST /api/Blog - Create new blog
export const createBlog = async (blogData) => {
  try {
    console.log('Creating blog with data (sent as-is):', blogData);
    console.log('Request URL:', `${API_BASE_URL}/Blog`);
    console.log('Request headers:', createHeaders());
    const response = await fetch(`${API_BASE_URL}/Blog`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(blogData),
    });
    console.log('Create response status:', response.status);
    const result = await handleResponse(response);
    console.log('Create response data:', result);
    return result;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// PUT /api/Blog/{id} - Update blog
export const updateBlog = async (id, blogData) => {
  try {
    if (!id || id === 'undefined') {
      throw new Error('Invalid blog ID for update');
    }

    console.log('Updating blog with ID:', id, 'Data:', blogData);
    console.log('Request URL:', `${API_BASE_URL}/Blog/${id}`);

    const response = await fetch(`${API_BASE_URL}/Blog/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(blogData),
    });

    console.log('Update response status:', response.status);
    const result = await handleResponse(response);
    console.log('Update response data:', result);
    return result;
  } catch (error) {
    console.error(`Error updating blog ${id}:`, error);
    throw error;
  }
};

// DELETE /api/Blog/{id} - Delete blog
export const deleteBlog = async (id) => {
  try {
    if (!id || id === 'undefined') {
      throw new Error('Invalid blog ID for delete');
    }

    console.log('Deleting blog with ID:', id);
    console.log('Request URL:', `${API_BASE_URL}/Blog/${id}`);

    const response = await fetch(`${API_BASE_URL}/Blog/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });

    console.log('Delete response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // DELETE might return empty response
    const result = response.status === 204 ? { success: true } : await handleResponse(response);
    console.log('Delete response data:', result);
    return result;
  } catch (error) {
    console.error(`Error deleting blog ${id}:`, error);
    throw error;
  }
};

// Increment view count (custom endpoint if available)
export const incrementViewCount = async (id) => {
  try {
    // This assumes there's an endpoint to increment view count
    // If not available, you can update the blog with incremented viewCount
    const blog = await getBlogById(id);
    const updatedBlog = {
      ...blog,
      viewCount: blog.viewCount + 1,
    };
    return await updateBlog(id, updatedBlog);
  } catch (error) {
    console.error(`Error incrementing view count for blog ${id}:`, error);
    throw error;
  }
};