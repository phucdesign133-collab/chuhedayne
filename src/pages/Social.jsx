import React, { useState, useEffect } from "react";
import "../css/Tab.css";
import { supabase } from "../components/utils/supabaseClient";
import SocialGrid from "../components/SocialGrid";
import SocialIdeaGrid from "../components/SocialIdeaGrid"; 
import SocialList from "../components/SocialList";
import SocialPopup from "../components/popup/SocialPopup";
import SocialSeriesPopup from "../components/popup/SocialSeriesPopup"; 

export default function Social({ selectedFilter, isPopupOpen, setIsPopupOpen, onActiveSeriesChange }) {
  const [seriesMeta, setSeriesMeta] = useState({});
  const [seriesEpisodes, setSeriesEpisodes] = useState({});
  const [ideaMeta, setIdeaMeta] = useState({});
  const [ideaEpisodes, setIdeaEpisodes] = useState({});

  const [activeSeries, setActiveSeries] = useState(null);
  const [editingSeriesCode, setEditingSeriesCode] = useState(null);
  const [editingSeriesData, setEditingSeriesData] = useState(null);

  const [isEpisodePopupOpen, setIsEpisodePopupOpen] = useState(false);
  const [editingEpisodeIndex, setEditingEpisodeIndex] = useState(null);
  const [editingEpisodeData, setEditingEpisodeData] = useState(null);

  const fetchSocialData = async () => {
    try {
      const { data, error } = await supabase.from('social_tables').select('*');
      if (error) throw error;
      if (data) {
        setSeriesMeta(data.find(i => i.id === 'series_meta')?.content || {});
        setSeriesEpisodes(data.find(i => i.id === 'series_episodes')?.content || {});
        setIdeaMeta(data.find(i => i.id === 'idea_meta')?.content || {});
        setIdeaEpisodes(data.find(i => i.id === 'idea_episodes')?.content || {});
      }
    } catch (err) {
      console.error("Lỗi tải Social:", err);
    }
  };

  const syncSocial = async (id, content) => {
    try {
      await supabase.from('social_tables').upsert({ id, content });
    } catch (err) {
      console.error("Lỗi đồng bộ Social:", err);
    }
  };

  useEffect(() => {
    fetchSocialData();
    const handleRealtimeChange = () => fetchSocialData();
    window.addEventListener('supabase-data-changed', handleRealtimeChange);
    return () => window.removeEventListener('supabase-data-changed', handleRealtimeChange);
  }, []);

  useEffect(() => {
    if (onActiveSeriesChange) {
      onActiveSeriesChange(activeSeries);
    }
  }, [activeSeries, onActiveSeriesChange]);

  const isIdeaMode = selectedFilter === "Quản lý Ideas" || selectedFilter === "Ideas" || selectedFilter?.toLowerCase().includes("idea");

  useEffect(() => {
    setActiveSeries(null);
    setEditingSeriesCode(null);
    setEditingSeriesData(null);
  }, [selectedFilter]);

  const gridFormattedData = React.useMemo(() => {
    const result = {};
    Object.keys(seriesMeta).forEach((code) => {
      const meta = seriesMeta[code] || {};
      const episodes = seriesEpisodes[code] || [];
      const listCopy = [...episodes];
      listCopy.seriesName = meta.title;
      listCopy.purpose = meta.purpose;
      listCopy.updatedAt = meta.updatedAt || 0;
      result[code] = listCopy;
    });
    return result;
  }, [seriesMeta, seriesEpisodes]);

  const ideaGridFormattedData = React.useMemo(() => {
    const result = {};
    Object.keys(ideaMeta).forEach((code) => {
      const meta = ideaMeta[code] || {};
      const episodes = ideaEpisodes[code] || [];
      const listCopy = [...episodes];
      listCopy.seriesName = meta.title;
      listCopy.purpose = meta.purpose;
      listCopy.targetAudience = meta.targetAudience;
      listCopy.scope = meta.scope;
      listCopy.budget = meta.budget;
      listCopy.startDate = meta.startDate;
      listCopy.timeSlot = meta.timeSlot;
      listCopy.notes = meta.notes;
      listCopy.updatedAt = meta.updatedAt || 0;
      result[code] = listCopy;
    });
    return result;
  }, [ideaMeta, ideaEpisodes]);

  const handleSaveSeries = (newData) => {
    const isIdea = newData.activeTab === 'idea';
    let targetCode = isIdea ? (editingSeriesCode || `idea_${Date.now()}`) : (newData.code || "").trim().toLowerCase();
    if (!targetCode) return;

    const currentTime = Date.now();
    const metaPayload = {
      title: newData.title,
      purpose: newData.purpose,
      targetAudience: newData.targetAudience,
      scope: newData.scope,
      budget: newData.budget,
      startDate: newData.startDate,
      timeSlot: newData.timeSlot,
      notes: newData.notes,
      updatedAt: currentTime
    };

    if (isIdea) {
      const updatedIdeaMeta = { ...ideaMeta, [targetCode]: metaPayload };
      setIdeaMeta(updatedIdeaMeta);
      syncSocial('idea_meta', updatedIdeaMeta);
    } else {
      const updatedSeriesMeta = { ...seriesMeta };
      if (editingSeriesCode && editingSeriesCode !== targetCode) {
        updatedSeriesMeta[targetCode] = metaPayload;
        delete updatedSeriesMeta[editingSeriesCode];
        const updatedEpisodes = { ...seriesEpisodes };
        if (updatedEpisodes[editingSeriesCode]) {
          updatedEpisodes[targetCode] = updatedEpisodes[editingSeriesCode];
          delete updatedEpisodes[editingSeriesCode];
        }
        setSeriesEpisodes(updatedEpisodes);
        syncSocial('series_episodes', updatedEpisodes);
      } else {
        updatedSeriesMeta[targetCode] = metaPayload;
      }
      setSeriesMeta(updatedSeriesMeta);
      syncSocial('series_meta', updatedSeriesMeta);
    }

    setIsPopupOpen(false);
    setEditingSeriesCode(null);
    setEditingSeriesData(null);
  };

  const handleSaveEpisode = (episodeData) => {
    if (!activeSeries) return;
    const currentTime = Date.now();

    if (isIdeaMode) {
      const updatedEpisodes = { ...ideaEpisodes };
      const list = [...(updatedEpisodes[activeSeries] || [])];
      if (editingEpisodeIndex !== null && editingEpisodeIndex >= 0) {
        list[editingEpisodeIndex] = episodeData;
      } else {
        list.push(episodeData);
      }
      updatedEpisodes[activeSeries] = list;
      setIdeaEpisodes(updatedEpisodes);
      syncSocial('idea_episodes', updatedEpisodes);

      const updatedMeta = { ...ideaMeta, [activeSeries]: { ...(ideaMeta[activeSeries] || {}), updatedAt: currentTime } };
      setIdeaMeta(updatedMeta);
      syncSocial('idea_meta', updatedMeta);
    } else {
      const updatedEpisodes = { ...seriesEpisodes };
      const list = [...(updatedEpisodes[activeSeries] || [])];
      if (editingEpisodeIndex !== null && editingEpisodeIndex >= 0) {
        list[editingEpisodeIndex] = episodeData;
      } else {
        list.push(episodeData);
      }
      updatedEpisodes[activeSeries] = list;
      setSeriesEpisodes(updatedEpisodes);
      syncSocial('series_episodes', updatedEpisodes);

      const updatedMeta = { ...seriesMeta, [activeSeries]: { ...(seriesMeta[activeSeries] || {}), updatedAt: currentTime } };
      setSeriesMeta(updatedMeta);
      syncSocial('series_meta', updatedMeta);
    }

    setIsEpisodePopupOpen(false);
    setEditingEpisodeIndex(null);
    setEditingEpisodeData(null);
  };

  return (
    <div className="finance-wrapper">
      {!activeSeries ? (
        isIdeaMode ? (
          <SocialIdeaGrid 
            rawData={ideaGridFormattedData} 
            onSelectSeries={(seriesKey) => setActiveSeries(seriesKey)} 
            onEditSeries={(seriesKey) => {
              setEditingSeriesCode(seriesKey);
              const meta = ideaMeta[seriesKey] || {};
              setEditingSeriesData({ code: seriesKey, ...meta });
              setIsPopupOpen(true);
            }}
            onDeleteSeries={(seriesKey) => {
              if (window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ idea này không?`)) {
                const updatedIdeaMeta = { ...ideaMeta };
                delete updatedIdeaMeta[seriesKey];
                setIdeaMeta(updatedIdeaMeta);
                syncSocial('idea_meta', updatedIdeaMeta);

                const updatedIdeaEp = { ...ideaEpisodes };
                delete updatedIdeaEp[seriesKey];
                setIdeaEpisodes(updatedIdeaEp);
                syncSocial('idea_episodes', updatedIdeaEp);
              }
            }}
          />
        ) : (
          <SocialGrid 
            rawData={gridFormattedData} 
            onSelectSeries={(seriesKey) => setActiveSeries(seriesKey)} 
            onEditSeries={(seriesKey) => {
              setEditingSeriesCode(seriesKey);
              const meta = seriesMeta[seriesKey] || {};
              setEditingSeriesData({ code: seriesKey, title: meta.title || '', purpose: meta.purpose || '' });
              setIsPopupOpen(true);
            }}
            onDeleteSeries={(seriesKey) => {
              if (window.confirm(`Bạn có chắc chắn muốn xóa toàn bộ series [${seriesKey.toUpperCase()}] không?`)) {
                const updatedMeta = { ...seriesMeta };
                delete updatedMeta[seriesKey];
                setSeriesMeta(updatedMeta);
                syncSocial('series_meta', updatedMeta);

                const updatedEp = { ...seriesEpisodes };
                delete updatedEp[seriesKey];
                setSeriesEpisodes(updatedEp);
                syncSocial('series_episodes', updatedEp);
              }
            }}
          />
        )
      ) : (
        <SocialList 
          activeSeries={activeSeries}
          seriesItems={isIdeaMode ? (ideaEpisodes[activeSeries] || []) : (seriesEpisodes[activeSeries] || [])}
          onBack={() => {
            setActiveSeries(null);
            setEditingSeriesCode(null);
            setEditingSeriesData(null);
          }}
          onOpenAddPopup={() => {
            setEditingEpisodeIndex(null);
            setEditingEpisodeData(null);
            setIsEpisodePopupOpen(true);
          }}
          onEditItem={(item, index) => {
            setEditingEpisodeIndex(index);
            setEditingEpisodeData(item);
            setIsEpisodePopupOpen(true);
          }}
          onDeleteItem={(index) => {
            const currentTime = Date.now();
            if (isIdeaMode) {
              const updatedEp = { ...ideaEpisodes };
              const list = [...(updatedEp[activeSeries] || [])];
              list.splice(index, 1);
              updatedEp[activeSeries] = list;
              setIdeaEpisodes(updatedEp);
              syncSocial('idea_episodes', updatedEp);

              const updatedMeta = { ...ideaMeta, [activeSeries]: { ...(ideaMeta[activeSeries] || {}), updatedAt: currentTime } };
              setIdeaMeta(updatedMeta);
              syncSocial('idea_meta', updatedMeta);
            } else {
              const updatedEp = { ...seriesEpisodes };
              const list = [...(updatedEp[activeSeries] || [])];
              list.splice(index, 1);
              updatedEp[activeSeries] = list;
              setSeriesEpisodes(updatedEp);
              syncSocial('series_episodes', updatedEp);

              const updatedMeta = { ...seriesMeta, [activeSeries]: { ...(seriesMeta[activeSeries] || {}), updatedAt: currentTime } };
              setSeriesMeta(updatedMeta);
              syncSocial('series_meta', updatedMeta);
            }
          }}
        />
      )}

      <SocialPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditingSeriesCode(null);
          setEditingSeriesData(null);
        }}
        onSave={handleSaveSeries}
        isEditing={!!editingSeriesCode}
        lastSavedData={editingSeriesData}
        initialTab={isIdeaMode ? "idea" : "series"}
      />

      <SocialSeriesPopup
        isOpen={isEpisodePopupOpen}
        onClose={() => {
          setIsEpisodePopupOpen(false);
          setEditingEpisodeIndex(null);
          setEditingEpisodeData(null);
        }}
        onSave={handleSaveEpisode}
        lastSavedData={editingEpisodeData}
        onDelete={() => {
          if (editingEpisodeIndex !== null && editingEpisodeIndex >= 0) {
            const currentTime = Date.now();
            if (isIdeaMode) {
              const updatedEp = { ...ideaEpisodes };
              const list = [...(updatedEp[activeSeries] || [])];
              list.splice(editingEpisodeIndex, 1);
              updatedEp[activeSeries] = list;
              setIdeaEpisodes(updatedEp);
              syncSocial('idea_episodes', updatedEp);

              const updatedMeta = { ...ideaMeta, [activeSeries]: { ...(ideaMeta[activeSeries] || {}), updatedAt: currentTime } };
              setIdeaMeta(updatedMeta);
              syncSocial('idea_meta', updatedMeta);
            } else {
              const updatedEp = { ...seriesEpisodes };
              const list = [...(updatedEp[activeSeries] || [])];
              list.splice(editingEpisodeIndex, 1);
              updatedEp[activeSeries] = list;
              setSeriesEpisodes(updatedEp);
              syncSocial('series_episodes', updatedEp);

              const updatedMeta = { ...seriesMeta, [activeSeries]: { ...(seriesMeta[activeSeries] || {}), updatedAt: currentTime } };
              setSeriesMeta(updatedMeta);
              syncSocial('series_meta', updatedMeta);
            }
          }
        }}
      />
    </div>
  );
}