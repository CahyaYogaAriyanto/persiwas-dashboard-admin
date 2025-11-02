import { supabase } from "./supabase-client.js";

export const fetchAllPresencesData = async () => {
    const { data, error } = await supabase
      .from('precence')
      .select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
};

export const getPresenceByStudentId = async (id) => {
    const { data, error } = await supabase
      .from('precence')
      .select('*')
      .eq('student_id', id);
    if (error) {
      throw new Error(error.message);
    }
    return data;
};


export const getPresenceByDate = async (date) => {
    const { data, error } = await supabase
      .from('precence')
      .select('*')
      .lte('datetime', date);
    if (error) {
      throw new Error(error.message);
    }
    return data;
};


export const changePresenceStatus = async (id, status) => {
    const { data, error } = await supabase
      .from('precence')
      .update({ status_id: status })
      .eq('precense_id', id);

    
    if (error) {
      throw new Error(error.message);
    }
    return data;
};