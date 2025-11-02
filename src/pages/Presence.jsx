import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { fetchAllPresencesData, changePresenceStatus } from '../api/presence';
import { fetchAllStudents } from '../api/student';
import { getStudentByClassId } from '../api/class';

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
      const dates = [...new Set(presenceHistory.map(p => new Date(p.datetime).toISOString().split('T')[0]))]
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
          const date = new Date(presence.datetime).toISOString().split('T')[0];
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
      return [today.toISOString().split('T')[0]];
    }

    if (!selectedMonth) return [];

    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const dates = [];

    while (date.getMonth() === month) {
      dates.push(new Date(date).toISOString().split('T')[0]);
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
              <button className="bg-black text-white px-4 py-2 rounded font-semibold">+ Tambah Presensi</button>
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
    </div>
  );
}

export default Presence;