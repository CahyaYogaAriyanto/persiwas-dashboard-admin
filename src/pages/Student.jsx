import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import { fetchAllStudents, deleteStudent, createStudent, updateStudent } from '../api/student';
import { fetchAllClasses, getStudentByClassId } from '../api/class';
import { fetchAllPresencesData, getPresenceByDate } from '../api/presence';

function Student() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const selectedClass = searchParams.get('kelas');
    const [search, setSearch] = useState('');
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [studentsData, setStudentsData] = useState([]);
    useEffect(() => {
      const getStudents = async () => {
        let students;
        if (selectedClass) {
          students = await getStudentByClassId(selectedClass);
        } else {
          students = await fetchAllStudents();
        }
        const sortedStudents = (students || []).sort((a, b) => 
            (a.student_name || '').localeCompare(b.student_name || '')
        );
        setStudentsData(sortedStudents);
      };
      getStudents();
    }, [selectedClass]);

    const [presencesData, setPresencesData] = useState([]);
    useEffect(() => {
        const getPresences = async () => {
            const presences = await getPresenceByDate(new Date().toISOString());
            setPresencesData(presences || []);
        };
        getPresences();
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ message: '', isError: false });
    const [studentImages, setStudentImages] = useState([]);
    const [newStudent, setNewStudent] = useState({
        student_name: '',
        student_nisn: '',
        student_birth_date: '',
        id_kelas: selectedClass || '',
    });

    const [classesData, setClassesData] = useState([]);
    useEffect(() => {
        const getClasses = async () => {
            const classes = await fetchAllClasses();
            setClassesData(classes || []);
        };
        getClasses();
    }, []);

    const handleClassChange = async (student_id, newClassId) => {
        const updatedStudent = await getStudentByClassId(student_id, newClassId);
        setStudentsData(prev => prev.map(s => (s.student_id === student_id ? updatedStudent : s)));
        await updateStudent(student_id, { id_kelas: newClassId });
    };

    // const handleDelete = async (student_id) => {
    //     await deleteStudent(student_id);
    //     setStudentsData(prev => prev.filter(s => s.student_id !== student_id));
    // };
    const handleDelete = async (student_id) => {
    if (!window.confirm('Yakin ingin menghapus siswa ini?')) return;
    try {
        await deleteStudent(student_id);

        setStudentsData(prev =>
            prev.filter(s => s.student_id !== student_id)
        );
        alert('Data Siswa Berhasil Dihapus', student_id);
    } catch (error) {
        console.error('Gagal menghapus siswa:', error);
        alert('Gagal menghapus siswa. Cek console / backend.');
    }
    };


    const handleAddStudent = async (e) => {
        e.preventDefault();
        // Hanya pindah ke langkah berikutnya, tidak ada panggilan API di sini
        setModalStep(2);
    };

    const handleFinishRegistration = async () => {
        setIsSubmitting(true);
        setSubmissionStatus({ message: 'Mendaftarkan siswa dan memproses foto...', isError: false });
        
        try {
            const created = await createStudent(newStudent, studentImages);
    
            const newStudentData = Array.isArray(created) ? created[0] : created;
            setStudentsData(prev => 
                [...prev, newStudentData].sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''))
            );
            setSubmissionStatus({ message: 'Siswa berhasil didaftarkan!', isError: false });
            
            setTimeout(() => {
                setShowModal(false);
                setIsSubmitting(false);
            }, 2000); // Tutup modal setelah 2 detik

        } catch (error) {
            const errorMessage = error.message || 'Gagal mendaftarkan siswa. Silakan coba lagi.';
            console.error('Registration failed:', error);
            setSubmissionStatus({ message: errorMessage, isError: true });
            setIsSubmitting(false);
        }
    };

    const handleOpenModal = () => {
        setModalStep(1);
        setIsSubmitting(false);
        setSubmissionStatus({ message: '', isError: false });
        setNewStudent({
            student_name: '',
            student_nisn: 0,
            student_birth_date: '',
            id_kelas: selectedClass || 0,
        });
        setStudentImages([]);
        setShowModal(true);
    };


    const filteredStudents = studentsData.filter(
        s =>
            (s.student_name && s.student_name.toLowerCase().includes(search.toLowerCase()))
    );

    const handleImageChange = (e) => {
        if (e.target.files) {
            setStudentImages(Array.from(e.target.files));
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a23]">
            <aside><Navigation /></aside>
            <main className="flex-1 bg-[#fafafa] p-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">Dashboard Siswa {selectedClass ? `Kelas ${selectedClass}` : ''}</h1>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                        {currentTime}
                        </span>
                        <span className="text-gray-600 text-sm">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4 mb-6">
                    <div className="bg-[#0a0a23] text-white rounded-lg px-6 py-4 flex flex-col items-center">
                        <span className="text-xs font-semibold mb-1">Presensi Terisi</span>
                        <span className="text-xl font-bold">{presencesData.length} / {studentsData.length} <span className="text-xs font-normal">siswa</span></span>
                    </div>
                    <div className="bg-white border rounded-lg px-6 py-4 flex flex-col items-center">
                        <span className="text-xs font-semibold mb-1">Hadir</span>
                        <span className="text-xl font-bold">{presencesData.filter(p => p.status_id === 1).length} / {studentsData.length} <span className="text-xs font-normal">siswa</span></span>
                    </div>
                    <div className="bg-white border rounded-lg px-6 py-4 flex flex-col items-center">
                        <span className="text-xs font-semibold mb-1">Sakit</span>
                        <span className="text-xl font-bold">{presencesData.filter(p => p.status_id === 2).length} / {studentsData.length} <span className="text-xs font-normal">siswa</span></span>
                    </div>
                    <div className="bg-white border rounded-lg px-6 py-4 flex flex-col items-center">
                        <span className="text-xs font-semibold mb-1">Alpha</span>
                        <span className="text-xl font-bold">{presencesData.filter(p => p.status_id === 3).length} / {studentsData.length} <span className="text-xs font-normal">siswa</span></span>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-6">
                        <button className="font-semibold border-b-2 border-black pb-1">Daftar Siswa</button>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Cari nama, nisn, kelas..."
                            className="border px-4 py-2 rounded-lg bg-white w-72"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                            onClick={handleOpenModal}
                        >
                            + Tambah Siswa
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">NISN</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nama</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Kelas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4">{student.student_nisn}</td>
                                    <td className="py-2 px-4">{student.student_name}</td>
                                    <td className="py-2 px-4">
                                        <select
                                            name="class"
                                            id={`class-${student.student_id}`}
                                            value={student.id_kelas}
                                            onChange={e => handleClassChange(student.student_id, e.target.value)}
                                        >
                                            {classesData.map(classItem => (
                                                <option key={classItem.id} value={classItem.id_kelas}>
                                                    {classItem.kelas}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-2 px-4">
                                        <button
                                            onClick={() => handleDelete(student.student_id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus Siswa"
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        {modalStep === 1 && (
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Tambah Siswa Baru (Langkah 1/2)</h2>
                                <form onSubmit={handleAddStudent} className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nama Siswa"
                                        className="border px-3 py-2 rounded"
                                        value={newStudent.student_name}
                                        onChange={e => setNewStudent({ ...newStudent, student_name: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="NISN"
                                        className="border px-3 py-2 rounded"
                                        value={newStudent.student_nisn}
                                        onChange={e => setNewStudent({ ...newStudent, student_nisn: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="date"
                                        placeholder="Tanggal Lahir"
                                        className="border px-3 py-2 rounded"
                                        value={newStudent.student_birth_date}
                                        onChange={e => setNewStudent({ ...newStudent, student_birth_date: e.target.value })}
                                        required
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
                                        >
                                            Lanjut
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
                        )}
                        {modalStep === 2 && (
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Unggah Foto Siswa (Langkah 2/2)</h2>
                                <p className="mb-4 text-gray-600">Unggah foto untuk siswa yang baru ditambahkan. Anda dapat memilih lebih dari satu gambar.</p>
                                <input 
                                    type="file" 
                                    className="border p-2 rounded w-full mb-4"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {studentImages.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-4 max-h-48 overflow-y-auto">
                                        {studentImages.map((file, index) => (
                                            <img 
                                                key={index}
                                                src={URL.createObjectURL(file)} 
                                                alt={`preview ${index}`}
                                                className="w-full h-24 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="button"
                                        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:bg-blue-300"
                                        onClick={handleFinishRegistration}
                                        disabled={isSubmitting || studentImages.length < 5}
                                    >
                                        {isSubmitting ? 'Memproses...' : 'Selesai'}
                                    </button>
                                     <button
                                        type="button"
                                        className="bg-gray-300 px-4 py-2 rounded font-semibold"
                                        onClick={() => setModalStep(1)}
                                        disabled={isSubmitting}
                                    >
                                        Kembali
                                    </button>
                                </div>
                                {submissionStatus.message && (
                                    <p className={`mt-2 text-sm ${submissionStatus.isError ? 'text-red-500' : 'text-green-600'}`}>
                                        {submissionStatus.message}
                                    </p>
                                )}
                                {studentImages.length < 5 && (
                                    <p className="mt-2 text-sm text-red-500">
                                        Minimal 5 foto diperlukan.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Student;