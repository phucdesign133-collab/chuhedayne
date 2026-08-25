import React, { useState, useEffect } from 'react';
import { eventsCategories } from '../datas/dropdown';
import { fetchPosts, addPost, updatePost, deletePost, uploadImageToSupabase } from '../datas/api';
// import EventsPopup from '../components/popup/EventsPopup';
import AdminEventsGrid from '../components/AdminEventsGrid';
import '../css/Admin.css';

export default function AdminEvents() {
  const [selectedCategory, setSelectedCategory] = useState(eventsCategories[0].id);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const currentCategoryObj = eventsCategories.find(c => c.id === selectedCategory) || eventsCategories[0];
  const currentCategoryLabel = currentCategoryObj.label;
  const currentCode = currentCategoryObj.code;

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchPosts();
      // Lọc dữ liệu theo danh mục hiện tại
      const filtered = (data || []).filter(
        (item) =>
          item.category === selectedCategory ||
          item.image_url === selectedCategory ||
          (item.description && item.description.includes(`Mã: ${currentCode}`))
      );
      setPosts(filtered);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Hàm xử lý lưu dữ liệu từ Popup trả về
  const handleSaveData = async (formData) => {
    try {
      setLoading(true);
      let finalImageUrl = '';
      if (formData.images?.length > 0) {
        const firstImg = formData.images[0];
        finalImageUrl = firstImg.file ? await uploadImageToSupabase(firstImg.file) : firstImg.preview;
      } else if (editingItem) {
        finalImageUrl = editingItem.image_url;
      }

    
      const postData = {
        category: selectedCategory,
        location: formData.location || 'N/A',
        date: formData.date || null,
        images: formData.images || [], // Lưu dạng mảng JSON cho cột jsonb
        description: formData.title,  // Dùng trường title của form lưu vào cột description hoặc tuỳ ý anh
      };

      if (editingItem) {
        await updatePost(editingItem.id, postData);
      } else {
        await addPost(postData);
      }

      closeModal();
      loadPosts();
    } catch (error) {
      console.error('Lỗi lưu dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingItem(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) {
      try {
        await deletePost(id);
        loadPosts();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
      }
    }
  };

  return (
    <div className="post-admin-container">
      {/* DROPDOWN CỐ ĐỊNH PHÍA TRÊN */}
      <div className="post-admin-dropdown-box">
        <select 
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="post-admin-select"
        >
          {eventsCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label} ({cat.code})
            </option>
          ))}
        </select>
      </div>

      {/* GỌI COMPONENT CON DẠNG LƯỚI */}
      <AdminEventsGrid 
        isAdmin={true}
        posts={posts}
        loading={loading}
        selectedCategory={selectedCategory}
        currentCategoryLabel={currentCategoryLabel}
        currentCode={currentCode}
        onOpenAdd={openAddModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* GỌI POPUP DÙNG CHUNG */}
      <EventsPopup 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveData}
        defaultCategory={selectedCategory}
        initialData={editingItem ? { 
          title: editingItem.title, 
          images: [{ preview: editingItem.image_url }] 
        } : null}
      />
    </div>
  );
}