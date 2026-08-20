import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import "../../css/Popup.css";

export default function SocialSeriesPopup({ isOpen, onClose, onSave, onDelete, lastSavedData }) {
  if (!isOpen) return null;

  const [episode, setEpisode] = useState('');
  const [publishDateInput, setPublishDateInput] = useState(''); 
  const [keyWord, setKeyWord] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const [postedMeta, setPostedMeta] = useState(false);
  const [metaLink, setMetaLink] = useState('');

  const [postedYouTube, setPostedYouTube] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');

  const [postedTikTok, setPostedTikTok] = useState(false);
  const [tiktokLink, setTiktokLink] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEpisode(lastSavedData?.episode || '');
      setPublishDateInput(lastSavedData?.publishDateRaw || lastSavedData?.chapter || '');
      setKeyWord(lastSavedData?.keyWord || lastSavedData?.clipName || ''); 
      setImagePreview(lastSavedData?.imagePreview || lastSavedData?.thumbnail_url || '');
      
      setPostedMeta(lastSavedData?.postedMeta || false);
      setMetaLink(lastSavedData?.metaLink || '');

      setPostedYouTube(lastSavedData?.postedYouTube || false);
      setYoutubeLink(lastSavedData?.youtubeLink || '');

      setPostedTikTok(lastSavedData?.postedTikTok || false);
      setTiktokLink(lastSavedData?.tiktokLink || '');

      setImageFile(null);
      setUploading(false);
    }
  }, [isOpen, lastSavedData]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 540;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          width = MAX_WIDTH;
          height = Math.round(width * (16 / 9));
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const compressedFile = new File([blob], `item-${Date.now()}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            setImageFile(compressedFile);
            setImagePreview(URL.createObjectURL(blob));
          },
          'image/webp',
          0.7
        );
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDateChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (raw.length > 0) {
      formatted = raw.slice(0, 2);
      if (raw.length >= 3) formatted += '/' + raw.slice(2, 4);
      if (raw.length >= 5) formatted += '/' + raw.slice(4, 8);
    }
    setPublishDateInput(formatted);
  };

  // Hàm xử lý khi nhập link -> Tự động tích chọn nếu có nội dung, bỏ tích nếu trống
  const handleLinkChange = (platform, value) => {
    const hasText = value.trim().length > 0;
    if (platform === 'meta') {
      setMetaLink(value);
      if (hasText) setPostedMeta(true);
    } else if (platform === 'youtube') {
      setYoutubeLink(value);
      if (hasText) setPostedYouTube(true);
    } else if (platform === 'tiktok') {
      setTiktokLink(value);
      if (hasText) setPostedTikTok(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    let finalImageUrl = imagePreview;

    try {
      if (imageFile) {
        const fileName = `clip-${Date.now()}.webp`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error.message);
      alert("Lỗi upload ảnh: " + error.message);
      setUploading(false);
      return;
    }

    const dataToSave = {
      episode,
      publishDateRaw: publishDateInput,
      chapter: publishDateInput,
      clipName: keyWord, 
      keyWord: keyWord,  
      imagePreview: finalImageUrl,
      thumbnail_url: finalImageUrl,
      postedMeta,
      metaLink,
      postedYouTube,
      youtubeLink,
      postedTikTok,
      tiktokLink,
      updatedAt: new Date().toISOString()
    };

    setUploading(false);
    onSave(dataToSave);
    onClose();
  };

  const handleDeleteClick = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này không?")) {
      if (onDelete && lastSavedData) {
        onDelete(lastSavedData);
      }
      onClose();
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{lastSavedData ? "Cập Nhật mục Series" : "Thêm mục Mới"}</h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {lastSavedData && (
              <button 
                type="button" 
                onClick={handleDeleteClick} 
                title="Xóa mục này"
                style={{
                  background: '#fff5f5', color: '#e53e3e', border: '1px solid #feb2b2',
                  borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold'
                }}
              >
                🗑️
              </button>
            )}

            <button type="button" className="popup-close-btn" onClick={onClose} style={{ margin: 0 }}>
              &times;
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label>Số thứ tự mục (VD: 20):</label>
            <input 
              type="text" 
              value={episode} 
              onChange={(e) => setEpisode(e.target.value)} 
              placeholder="Nhập số thứ tự mục..." 
              required
            />
          </div>

          <div className="form-group">
            <label>Ngày đăng (VD: 12/08/2026):</label>
            <input 
              type="text" 
              value={publishDateInput} 
              onChange={handleDateChange} 
              placeholder="dd/mm/yyyy" 
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label>Nhập tên clip / mẫu:</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={keyWord} 
                onChange={(e) => setKeyWord(e.target.value)} 
                placeholder="Nhập tên clip/mẫu..." 
                style={{ flex: 1 }}
                required
              />
              
              {imagePreview && (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <button 
                    type="button" 
                    onClick={() => { setImageFile(null); setImagePreview(''); }} 
                    style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    &times;
                  </button>
                </div>
              )}

              <label className="upload-btn-label" style={{ 
                padding: '8px 12px', background: '#f0f2f5', border: '1px solid #ccc', 
                borderRadius: '4px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap'
              }}>
                📁 Chọn ảnh
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Nền tảng đã đăng:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              
              {/* Meta */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>Meta</span>
                  <input 
                    type="checkbox" 
                    checked={postedMeta} 
                    onChange={(e) => setPostedMeta(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer', margin:'0' }}
                  />
                </div>
                <input 
                  type="text" 
                  value={metaLink} 
                  onChange={(e) => handleLinkChange('meta', e.target.value)} 
                  placeholder="Dán link bài viết Meta..." 
                  style={{ width: '100%', padding: '6px 10px', fontSize: '13px' }}
                />
              </div>

              {/* YouTube */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>YouTube</span>
                  <input 
                    type="checkbox" 
                    checked={postedYouTube} 
                    onChange={(e) => setPostedYouTube(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer', margin:'0' }}
                  />
                </div>
                <input 
                  type="text" 
                  value={youtubeLink} 
                  onChange={(e) => handleLinkChange('youtube', e.target.value)} 
                  placeholder="Dán link YouTube..." 
                  style={{ width: '100%', padding: '6px 10px', fontSize: '13px' }}
                />
              </div>

              {/* TikTok */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>TikTok</span>
                  <input 
                    type="checkbox" 
                    checked={postedTikTok} 
                    onChange={(e) => setPostedTikTok(e.target.checked)} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer', margin:'0' }}
                  />
                </div>
                <input 
                  type="text" 
                  value={tiktokLink} 
                  onChange={(e) => handleLinkChange('tiktok', e.target.value)} 
                  placeholder="Dán link TikTok..." 
                  style={{ width: '100%', padding: '6px 10px', fontSize: '13px' }}
                />
              </div>

            </div>
          </div>

          <button type="submit" className="popup-submit-btn" disabled={uploading}>
            {uploading ? "Đang xử lý..." : "Lưu Lại"}
          </button>
        </form>
      </div>
    </div>
  );
}