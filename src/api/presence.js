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

export const createPresencesForToday = async (students) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const presences = students.map(student => ({
    student_id: student.student_id,
    status_id: 3,
    datetime: today.toISOString(),
  }));

  const { data, error } = await supabase
    .from('precence')
    .insert(presences);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const upsertPresences = async (presences) => {
  const { data, error } = await supabase
    .from('precence') 
    .upsert(presences, {
      onConflict: 'student_id,datetime',
    })
    .select();

  if (error) throw error;
  return data;
};

