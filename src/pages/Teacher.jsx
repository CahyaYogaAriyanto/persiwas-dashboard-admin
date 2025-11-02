import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { getUser, deleteUser, createUser } from '../api/user';

function Teacher() {
  const [search, setSearch] = useState('');
  const [teachersData, setTeachersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    account_username: '',
    account_email: '',
    account_password: '',
    id_kelas: '',
    account_type_id: 2
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      const users = await getUser();
      const teachers = (users || []).filter(u => u.account_type_id == 2);
      setTeachersData(teachers);
    };
    fetchTeachers();
  }, []);

  const handleDelete = async (teacher_id) => {
    await deleteUser(teacher_id);
    setTeachersData(prev => prev.filter(t => t.account_id !== teacher_id));
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const created = await createUser(newTeacher);
    if (created) {
      setTeachersData(prev => [...prev, created]);
      setShowModal(false);
      setNewTeacher({
        account_username: '',
        account_email: '',
        account_password: '',
        id_kelas: '',
        account_type_id: 2
      });
    }
  };

  const filteredTeachers = teachersData.filter(
    t =>
      (t.account_username && t.account_username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <aside><Navigation /></aside>
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6">Daftar Pengurus</h1>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              className="bg-black text-white px-4 py-2 rounded font-semibold"
              onClick={() => setShowModal(true)}
            >
              + Tambah Pengurus
            </button>
          </div>
          <input
            type="text"
            placeholder="Cari nama, NIP..."
            className="border px-4 py-2 rounded-lg bg-white w-72"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Akses Kelas</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4"></td>
                  <td className="py-2 px-4">{teacher.account_username}</td>
                  <td className="py-2 px-4">{teacher.id_kelas || '-'}</td>
                  <td className="py-2 px-4">{teacher.account_email || '-'}</td>
                  <td className="py-2 px-4 text-right">
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="Hapus Pengurus"
                      onClick={() => handleDelete(teacher.account_id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Add Teacher */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Tambah Pengurus Baru</h2>
              <form onSubmit={handleAddTeacher} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Username"
                  className="border px-3 py-2 rounded"
                  value={newTeacher.account_username}
                  onChange={e => setNewTeacher({ ...newTeacher, account_username: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border px-3 py-2 rounded"
                  value={newTeacher.account_email}
                  onChange={e => setNewTeacher({ ...newTeacher, account_email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="border px-3 py-2 rounded"
                  value={newTeacher.account_password}
                  onChange={e => setNewTeacher({ ...newTeacher, account_password: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Kelas"
                  className="border px-3 py-2 rounded"
                  value={newTeacher.id_kelas}
                  onChange={e => setNewTeacher({ ...newTeacher, id_kelas: e.target.value })}
                  required
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded font-semibold"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 px-4 py-2 rounded font-semibold"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Teacher;