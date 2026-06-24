"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type TrackingUpdate = {
  id: string;
  shipment_id: string;
  status: string;
  location?: string;
  notes?: string;
  timestamp: string;
  updated_by?: string;
};

export const useTracking = (shipmentId?: string) => {
  const { profile } = useAuth();
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId || !profile) {
      setLoading(false);
      return;
    }

    const fetchUpdates = async () => {
      const { data, error } = await supabase
        .from('shipment_updates')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('timestamp', { ascending: false });

      if (!error && data) {
        setUpdates(data);
      }
      setLoading(false);
    };

    fetchUpdates();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`shipment-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipment_updates',
          filter: `shipment_id=eq.${shipmentId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUpdates(prev => [payload.new as TrackingUpdate, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setUpdates(prev => prev.map(u => u.id === payload.new.id ? payload.new as TrackingUpdate : u));
          } else if (payload.eventType === 'DELETE') {
            setUpdates(prev => prev.filter(u => u.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId, profile]);

  return { updates, loading };
};