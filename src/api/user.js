import { supabase } from './supabase-client.js';

export const getUser = async() => {
  const { data, error } = await supabase
    .from('account')
    .select('*')

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const createUser = async (user) => {
  const { data, error } = await supabase
    .from('account')
    .insert([user])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateUser = async (id, updates) => {
  const { data, error } = await supabase
    .from('account')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
export const deleteUser = async (id) => {
  const { data, error } = await supabase
    .from('account')
    .delete()
    .eq('account_id', id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('account')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('account')
    .select('*')
    .eq('account_email', email)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const loginUser = async (email, password) => {
  const { data, error } = await supabase
    .from('account')
    .select('*')
    .eq('account_email', email)
    .eq('account_password', password)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("User not found");
  }

  if (data.account_password != password) {
    throw new Error("Incorrect password");
  }

  await supabase.auth.signInWithPassword({ email, password });

  return data;
};
