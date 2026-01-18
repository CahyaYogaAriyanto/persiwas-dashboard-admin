import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { fetchAllPresencesData, changePresenceStatus,createPresencesForToday,upsertPresences  } from '../api/presence';
import { indoDateToISO } from '../helper/date';
import { fetchAllStudents } from '../api/student';
import { getStudentByClassId } from '../api/class';
// apapap
const getLocalDate = (datetime) => {
  const d = new Date(datetime);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

function Presence() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedClass = searchParams.get('kelas');
  const [studentsData, setStudentsData] = useState([]);
  const [presenceHistory, setPresenceHistory] = useState([]);
  const [showToday, setShowToday] = useState(false);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const todayDateString = (() => {
    const d = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  })();

  useEffect(() => {
    const getPresence = async () => {
      const [presenceData, allStudents] = await Promise.all([
        fetchAllPresencesData(),
        fetchAllStudents()
      ]);

      setPresenceHistory(presenceData || []);

      let relevantStudents;
      if (selectedClass) {
        relevantStudents = await getStudentByClassId(selectedClass);
      } else {
        relevantStudents = allStudents;
      }
      setStudentsData((relevantStudents || []).sort((a, b) => (a.student_name || '').localeCompare(b.student_name || '')));
    };
    getPresence();
  }, [selectedClass]);

  const [presenceMatrix, setPresenceMatrix] = useState({});
  const [uniqueDates, setUniqueDates] = useState([]);

  useEffect(() => {
    if (presenceHistory.length > 0) {
      const monthSet = new Set();
      const presenceWithDates = presenceHistory.map(p => ({...p, dateObj: new Date(p.datetime)}));
      presenceHistory.forEach(p => {
        if (p.datetime) {
          const dateObj = new Date(p.datetime);
          const year = dateObj.getFullYear();
          const month = dateObj.getMonth(); // 0-11
          monthSet.add(`${year}-${String(month).padStart(2, '0')}`);
        }
      });
      const sortedMonths = [...monthSet].sort((a, b) => b.localeCompare(a)); // Sort descending
      setUniqueMonths(sortedMonths);
      if (!selectedMonth && sortedMonths.length > 0) {
        setSelectedMonth(sortedMonths[0]);
      }
    }
  }, [presenceHistory]);

  useEffect(() => {
    if (studentsData.length > 0 && presenceHistory.length > 0) {
      const dates = [...new Set(
        presenceHistory.map(p => getLocalDate(p.datetime))
      )]
        .sort((a, b) => new Date(b) - new Date(a)); // Sort dates descending
      setUniqueDates(dates);
      

      const matrix = studentsData.reduce((acc, student) => {
        acc[student.student_id] = {
          name: student.student_name,
          nisn: student.student_nisn,
          presences: {}
        };
        return acc;
      }, {});

      presenceHistory.forEach(presence => {
        if (matrix[presence.student_id]) {
          const date = getLocalDate(presence.datetime);
          matrix[presence.student_id].presences[date] = {
            status_id: presence.status_id,
            presence_id: presence.presence_id
          };
        }
      });

      setPresenceMatrix(matrix);
    } else {
      setUniqueDates([]);
      setPresenceMatrix({});
    }
  }, [studentsData, presenceHistory]);

  const filteredDates = React.useMemo(() => {
    if (showToday) {
      const today = new Date();
      return [getLocalDate(today)];
    }

    if (!selectedMonth) return [];

    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const dates = [];

    while (date.getMonth() === month) {
      dates.push(getLocalDate(date));
      date.setDate(date.getDate() + 1);
    }
    return dates; 
  }, [selectedMonth, showToday]);

    const handleStatusChange = async (presence_id, newStatus) => {
    const success = await changePresenceStatus(presence_id, newStatus);
    if (success) {
      setPresenceHistory(prev => prev.map(p => p.presence_id === presence_id ? { ...p, status_id: newStatus } : p));
    }
  };
  const handleAddPresence = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const alreadyExists = presenceHistory.some(p =>
      new Date(p.datetime).toISOString().split('T')[0] === today
    );

    if (alreadyExists) {
      alert('Presensi hari ini sudah dibuat');
      return;
    }

    await createPresencesForToday(studentsData);

    const updatedPresence = await fetchAllPresencesData();
    setPresenceHistory(updatedPresence);

    alert('Presensi berhasil ditambahkan');
  } catch (error) {
    console.error(error);
    alert('Gagal menambahkan presensi');
  }
};
const indoDateToISO = (dateIndo) => {
  // dateIndo: DD-MM-YYYY
  const [day, month, year] = dateIndo.split("-");
  return `${year}-${month}-${day}`;
};
const handleSubmitPresence = async ({
    mode,
    studentId,
    statusId,
    dateIndo,
  }) => {
    try {
      const datetime = indoDateToISO(dateIndo);
      let payload = [];

      if (mode === 'all') {
        payload = studentsData.map(s => ({
          student_id: s.student_id,
          status_id: statusId,
          datetime,
        }));
      } else {
        payload = [{
          student_id: studentId,
          status_id: statusId,
          datetime,
        }];
      }
      await upsertPresences(payload);

      const updated = await fetchAllPresencesData();
      setPresenceHistory(updated);

      alert('Presensi berhasil disimpan');
    } catch (err) {
      console.error("ERROR PRESENSI:", err);
      alert(err?.message || 'Gagal menyimpan presensi');
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('all'); // all | single
  const [selectedStudent, setSelectedStudent] = useState('');
  const [statusId, setStatusId] = useState(1);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  });



  const getStatusTextAndColor = (statusId) => {
      switch (statusId) {
          case 1: return { text: 'H', color: 'bg-green-100 text-green-800', title: 'Hadir' };
          case 2: return { text: 'S', color: 'bg-yellow-100 text-yellow-800', title: 'Sakit' };
          case 3: return { text: 'A', color: 'bg-red-100 text-red-800', title: 'Alpha' };
          default: return { text: '-', color: 'text-gray-400', title: 'Belum ada data' };
      }
  }

  const handleDownloadCSV = () => {
    const statusMap = {
      1: 'Hadir',
      2: 'Sakit',
      3: 'Alpha',
    };

    const headers = ['Nama Siswa', ...filteredDates.map(date => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }))];

    const csvRows = studentsData.map(student => {
      const studentMatrixData = presenceMatrix[student.student_id];
      if (!studentMatrixData) return '';

      const rowData = [studentMatrixData.name];
      for (const date of filteredDates) {
        const presence = studentMatrixData.presences[date];
        rowData.push(statusMap[presence?.status_id] || '-');
      }
      return rowData.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const monthName = selectedMonth ? new Date(selectedMonth + '-02').toLocaleString('id-ID', { month: 'long', year: 'numeric' }) : 'semua';
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap-presensi-${monthName.replace(' ', '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] w-screen">
      <aside><Navigation /></aside>
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-6">Riwayat Presensi {selectedClass ? `Kelas ${selectedClass}` : ''}</h1>
        <div className="flex gap-6 mb-4">
          <button
            className={`font-semibold pb-1 ${showToday ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            onClick={() => setShowToday(true)}
          >
            Hari ini
          </button>
          <button
            className={`font-semibold pb-1 ${!showToday ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            onClick={() => setShowToday(false)}
          >
            Riwayat
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className='flex flex-row gap-4 mb-2'>
            <div className="">
              <button onClick={() => setShowModal(true)} className="bg-black text-white px-4 py-2 rounded font-semibold">+ Tambah Presensi</button>
            </div>
            <button onClick={handleDownloadCSV} className="bg-black text-white px-4 py-2 rounded font-semibold">Download Rekap Presensi</button>
          </div>
          <select
            className="border px-4 py-2 rounded-lg bg-white w-60"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {uniqueMonths.map(month => (
              <option key={month} value={month}> 
                {new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 1)
                  .toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 bg-white py-3 px-4 text-left text-sm font-semibold text-gray-700 z-10">Nama Siswa</th>
                {filteredDates.map(date => (
                    <th key={date} className="py-3 px-2 text-center text-sm font-semibold text-gray-700">
                        {new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentsData.map(student => {
                  const studentMatrixData = presenceMatrix[student.student_id];
                  if (!studentMatrixData) return null;
                  return (
                      <tr key={student.student_id} className="border-b bg-white hover:bg-gray-50">
                          <td className="sticky left-0 bg-inherit py-2 px-4 whitespace-nowrap z-10">{studentMatrixData.name}</td>
                          {filteredDates.map(date => {
                              const presence = studentMatrixData.presences[date];
                              const { text, color, title } = getStatusTextAndColor(presence?.status_id);
                              return (
                                  <td key={date} className="py-2 px-2 text-center" title={title}>
                                      <span className={`inline-block text-xs font-bold w-6 h-6 leading-6 rounded-full ${color}`}>{text}</span>
                                  </td>
                              );
                          })}
                      </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </main>
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl w-full max-w-md p-6">
          
          <h2 className="text-lg font-bold mb-4">Tambah Presensi</h2>

          {/* PILIH MODE */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Jenis Presensi</label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="all">Semua Siswa</option>
              <option value="single">Pilih Salah Satu Siswa</option>
            </select>
          </div>

          {/* PILIH SISWA */}
          {mode === 'single' && (
            <div className="mb-4">
              <label className="block font-semibold mb-1">Nama Siswa</label>
              <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Pilih Siswa --</option>
                {studentsData.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.student_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* TANGGAL */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Tanggal (DD-MM-YYYY)</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* STATUS */}
          <div className="mb-6">
            <label className="block font-semibold mb-1">Status</label>
            <select
              value={statusId}
              onChange={e => setStatusId(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            >
              <option value={1}>Hadir</option>
              <option value={2}>Sakit</option>
              <option value={3}>Alpha</option>
            </select>
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded border"
            >
              Batal
            </button>

            <button
              onClick={() => {
                handleSubmitPresence({
                  mode,
                  studentId: selectedStudent,
                  statusId,
                  dateIndo: date
                });
                setShowModal(false);
              }}
              className="px-4 py-2 rounded bg-black text-white font-semibold"
            >
              Simpan
            </button>
          </div>

        </div>
      </div>
    )}

    </div>
  );
}

export default Presence;