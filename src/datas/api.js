import { supabase } from "../components/utils/supabaseClient";

// 1. Lấy tất cả bài đăng (Read)
export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// 2. Thêm bài đăng mới (Create)
export const addPost = async (postData) => {
  const { data, error } = await supabase
    .from('services')
    .insert([postData])
    .select();
    
  if (error) throw error;
  return data;
};

// 3. Cập nhật bài đăng (Update)
export const updatePost = async (id, updatedData) => {
  const { data, error } = await supabase
    .from('services')
    .update(updatedData)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data;
};

// 4. Xóa bài đăng (Delete)
export const deletePost = async (id) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

// 5. Upload ảnh lên Supabase Storage
export async function uploadImageToSupabase(file) {
  try {
    const fileName = `event-${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('events-images') // Tên bucket anh vừa tạo
      .upload(fileName, file);

    if (error) throw error;

    // Lấy Public URL của ảnh vừa upload
    const { data: { publicUrl } } = supabase.storage
      .from('events-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Lỗi khi upload ảnh lên Supabase:', error);
    throw error;
  }
}