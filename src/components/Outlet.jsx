// src/components/Outlet.jsx

import React from "react";
import { useParams } from "react-router-dom";
import { getManagerById } from "../datas/adminRegistry";

export default function Outlet() {
  // === 1. LẤY ID TỪ URL ===
  const { categoryId } = useParams();

  // === 2. TÌM MANAGER TRONG REGISTRY ===
  const ManagerComponent = getManagerById(categoryId);

  // === 3. KHÔNG CÓ MANAGER ===
  if (!ManagerComponent) {
    return (
      <div className="admin-outlet-empty">
        Chức năng này chưa được thiết lập.
      </div>
    );
  }

  // === 4. RENDER MANAGER ===
  return <ManagerComponent />;
}