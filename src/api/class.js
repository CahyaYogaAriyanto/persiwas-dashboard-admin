import { supabase } from "./supabase-client.js";

export const fetchAllClasses = async () => {
    const { data, error } = await supabase
      .from('kelas')
      .select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
};

export const getStudentByClassId = async (classId) => {
    const { data, error } = await supabase
      .from('student')
      .select('*')
      .eq('id_kelas', classId);
    if (error) {
      throw new Error(error.message);
    }
    return data;
};

