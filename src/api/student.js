import { supabase } from './supabase-client.js';

export const fetchAllStudents = async () => {
    const { data, error } = await supabase
      .from('student')
      .select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
};

export const getStudentById = async (id) => {
    const { data, error } = await supabase
      .from('student')
      .select('*')
      .eq('student_id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
};


export const getStudentNameById = async (id) => {
    const { data, error } = await supabase
      .from('student')
      .select('student_name')
      .eq('student_id', id)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
};

export const createStudent = async (studentData, photos) => {
    const formData = new FormData();
    formData.append('student_number', studentData.student_nisn);
    formData.append('student_name', studentData.student_name);
    formData.append('id_kelas', studentData.id_kelas);
    formData.append('student_birth_date', studentData.student_birth_date);

    for (const photo of photos) {
        formData.append('photos', photo);
    }

    console.log('FormData prepared for student registration:');
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
    }

    try {
        const response = await fetch('https://dolly-vaporescent-myla.ngrok-free.dev/api/students/register', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to register student');
        }

        const responseData = await response.json();

        if (responseData.student_id) {
            return await getStudentById(responseData.student_id);
        }
        return responseData;
    } catch (error) {
        const errorMessage = error.message || 'Terjadi kesalahan saat menghubungi server.';
        console.error('Error registering student:', errorMessage, error);
        throw new Error(errorMessage);
    }
};

export const updateStudent = async (id, updates) => {
    const { data, error } = await supabase
      .from('student')
      .update(updates)
      .eq('student_id', id)
      .select();
    if (error) {
      throw new Error(error.message);
    }
    return data;
};

export const deleteStudent = async (id) => {
  try {
    const response = await fetch(`https://dolly-vaporescent-myla.ngrok-free.dev/api/students/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete student');
    }

    return { message: 'Student deleted successfully' };
  }
  catch (error) {
    const errorMessage = error.message || 'Terjadi kesalahan saat menghubungi server.';
    console.error('Error deleting student:', errorMessage, error);
    throw new Error(errorMessage);
  }
};


