import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../components/utils/supabaseClient';
import Carousel from '../components/Carousel';
import '../css/Home.css';
import Calendar from '../components/Calendar';

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách bài viết:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page-container">
      <div className="home-header-section">
        <h1 className="home-title">Recents</h1>
        <p className="home-subtitle">*Guten Tag!* Những khoảnh khắc gần đây...</p>
      </div>

      <div className="home-carousel-wrapper">
        {loading ? (
          <div className="home-loading">Đang tải dữ liệu...</div>
        ) : (
          <Carousel items={posts} />
        )}
      </div>

      <Calendar isAdmin={false}/>
    </div>
  );
}