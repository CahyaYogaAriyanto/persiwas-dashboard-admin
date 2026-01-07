import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/icon-text-horizontal.png';
import iconProfile from '../assets/images/icon-profile.png';
import iconChevron from '../assets/images/icon-chevron.png';
import iconTeacher from '../assets/images/icon-teacher.png';
import iconPresence from '../assets/images/icon-presence.png';
import iconLogout from '../assets/images/icon-logout.png';

function Navigation() {
  const [isSiswaOpen, setIsSiswaOpen] = useState(false);
  const [isPresensiOpen, setIsPresensiOpen] = useState(false);
  const location = useLocation();
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/');
  };
  useEffect(() => {
    if (location.pathname === '/') {
      setIsSiswaOpen(true);
      setIsPresensiOpen(false);
    } else if (location.pathname === '/presence') {
      setIsPresensiOpen(true);
      setIsSiswaOpen(false);
    } else {
      setIsSiswaOpen(false);
      setIsPresensiOpen(false);
    }
  }, [location.pathname, location.search]);

  return (
    <div className="w-64 h-screen bg-[#0a0a23] text-white flex flex-col justify-between py-8 px-6">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <img src={logo} alt="" className='w-3/4'/>
          </div>
          <nav className="flex flex-col gap-4">
            <div>
              <button onClick={() => setIsSiswaOpen(!isSiswaOpen)} className="w-full flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <img src={iconProfile} alt="" className='w-5 h-5'/>
                  Siswa
                </div>
                <img src={iconChevron} alt="" className={`w-4 h-4 transition-transform ${isSiswaOpen ? 'rotate-90' : ''}`}/>
              </button>
              {isSiswaOpen && (
                <div className="flex flex-col gap-2 mt-2 pl-8">
                  {[1, 2, 3, 4, 5, 6].map(kelas => (
                    <Link key={kelas} to={`/?kelas=${kelas}`} className="text-gray-300 hover:text-white">
                      Kelas {kelas}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/teacher" className="flex items-center gap-3 text-white">
              <img src={iconTeacher} alt="" className='w-6 h-6'/>
              Guru
            </Link>
            <div>
              <button onClick={() => setIsPresensiOpen(!isPresensiOpen)} className="w-full flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <img src={iconPresence} alt="" className='w-6 h-6'/>
                  Presensi
                </div>
                <img src={iconChevron} alt="" className={`w-4 h-4 transition-transform ${isPresensiOpen ? 'rotate-90' : ''}`}/>
              </button>
              {isPresensiOpen && (
                <div className="flex flex-col gap-2 mt-2 pl-8">
                  {[1, 2, 3, 4, 5, 6].map(kelas => (
                    <Link key={kelas} to={`/presence?kelas=${kelas}`} className="text-gray-300 hover:text-white">
                      Kelas {kelas}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <img src={iconProfile} alt="" className='w-5 h-5'/>
            Admin
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-300 hover:text-red-400" >
            <img src={iconLogout} alt="" className='w-5 h-5'/>
            Logout
          </button>
        </div>
    </div>
  )
}

export default Navigation