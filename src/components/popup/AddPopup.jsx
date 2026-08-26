// src/components/popup/AddPopup.jsx
import React, { useState, useEffect } from 'react';
import '../../css/Popup.css';

export default function AddPopup({ isOpen, onClose, onSave, initialData, defaultCategory }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitle(initialData.description || initialData.title || '');
      setLocation(initialData.location || '');
      setDate(initialData.date || '');
      
      let formattedImages = [];
      
      if (Array.isArray(initialData.images) && initialData.images.length > 0) {
        formattedImages = initialData.images.map(img => {
          if (typeof img === 'string') {
            return { file: null, preview: img };
          } else if (img && typeof img === 'object') {
            return {
              file: img.file || null,
              preview: img.preview || img.url || (typeof img === 'string' ? img : '')
            };
          }
          return null;
        }).filter(img => img && img.preview);
      } else if (initialData.image_url) {
        formattedImages = [{ file: null, preview: initialData.image_url }];
      }

      setImages(formattedImages);
    } else {
      setTitle('');
      setLocation('');
      setDate('');
      setImages([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toSlug = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-');
  };

  const formatLocation = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleDateChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);

    if (val.length > 4) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    } else if (val.length > 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setDate(val);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const processedImages = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve) => {
          // Fallback an toàn cho mobile PWA nếu FileReader hoặc Canvas gặp lỗi treo
          const fallbackTimeout = setTimeout(() => {
            resolve({
              file: file,
              preview: URL.createObjectURL(file),
              name: file.name
            });
          }, 2000);

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              clearTimeout(fallbackTimeout);
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              const MAX_WIDTH = 1200;
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    resolve({
                      file: file,
                      preview: URL.createObjectURL(file),
                      name: file.name
                    });
                    return;
                  }
                  const baseSlug = title ? toSlug(title) : 'su-kien';
                  const newFileName = `${baseSlug}-${Date.now()}.webp`;
                  const newFile = new File([blob], newFileName, { type: 'image/webp' });
                  
                  resolve({
                    file: newFile,
                    preview: URL.createObjectURL(blob),
                    name: newFileName
                  });
                },
                'image/webp',
                0.8
              );
            };
            img.onerror = () => {
              clearTimeout(fallbackTimeout);
              resolve({
                file: file,
                preview: URL.createObjectURL(file),
                name: file.name
              });
            };
          };
          reader.onerror = () => {
            clearTimeout(fallbackTimeout);
            resolve({
              file: file,
              preview: URL.createObjectURL(file),
              name: file.name
            });
          };
        });
      })
    );

    setImages(prev => [...prev, ...processedImages]);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề!');
      return;
    }

    const formattedLocation = formatLocation(location);

    const formData = {
      title,
      category: initialData?.category || defaultCategory, // Giữ lại category cũ khi sửa hoặc dùng defaultCategory khi thêm mới
      location: formattedLocation,
      date,
      images
    };

    onSave(formData);
    onClose();
  };

  return (
    <div className="events-modal-overlay">
      <div className="events-modal-content">
        <div className="events-modal-header">
          <h3 className="events-modal-title">
            {initialData && Object.keys(initialData).length > 0 ? '✏️ Cập nhật mục' : '✨ Thêm mục mới'}
          </h3>
          <button type="button" onClick={onClose} className="events-close-btn">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="events-form-group">
            <label className="events-label">Tiêu đề</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="events-input"
              required
            />
          </div>

          <div className="events-form-group">
            <label className="events-label">Địa điểm tổ chức</label>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nhập địa điểm..."
              className="events-input"
            />
          </div>

          <div className="events-form-group">
            <label className="events-label">Ngày tổ chức</label>
            <input 
              type="text"
              value={date}
              onChange={handleDateChange}
              placeholder="DD/MM/YYYY"
              maxLength={10}
              className="events-input"
            />
          </div>

          <div className="events-form-group">
            <label className="events-label">Hình ảnh</label>
            <div className="events-upload-row">
              <label className="events-upload-btn">
                📁 Chọn ảnh
                <input 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                  className="events-file-input"
                />
              </label>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {images.length} ảnh đã chọn
              </span>
            </div>

            {images.length > 0 && (
              <div className="events-preview-container">
                {images.map((imgObj, idx) => (
                  <div key={idx} className="events-preview-item">
                    <img 
                      src={imgObj.preview} 
                      alt="preview" 
                      className="events-preview-img" 
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(idx)}
                      className="events-remove-img-btn"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="events-submit-btn">
            Lưu Lại
          </button>

        </form>
      </div>
    </div>
  );
}