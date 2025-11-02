import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const [isSiswaOpen, setIsSiswaOpen] = useState(false);
  const [isPresensiOpen, setIsPresensiOpen] = useState(false);
  const location = useLocation();

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
            <img src="src/assets/images/icon-text-horizontal.png" alt="" className='w-3/4'/>
          </div>
          <nav className="flex flex-col gap-4">
            <div>
              <button onClick={() => setIsSiswaOpen(!isSiswaOpen)} className="w-full flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <img src="src/assets/images/icon-profile.png" alt="" className='w-5 h-5'/>
                  Siswa
                </div>
                <img src="src/assets/images/icon-chevron-down.png" alt="" className={`w-4 h-4 transition-transform ${isSiswaOpen ? 'rotate-180' : ''}`}/>
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
              <img src="src/assets/images/icon-teacher.png" alt="" className='w-6 h-6'/>
              Guru
            </Link>
            <div>
              <button onClick={() => setIsPresensiOpen(!isPresensiOpen)} className="w-full flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <img src="src/assets/images/icon-presence.png" alt="" className='w-6 h-6'/>
                  Presensi
                </div>
                <img src="src/assets/images/icon-chevron-down.png" alt="" className={`w-4 h-4 transition-transform ${isPresensiOpen ? 'rotate-180' : ''}`}/>
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
            <img src="src/assets/images/icon-profile.png" alt="" className='w-5 h-5'/>
            Admin
          </div>
          <button className="flex items-center gap-2 text-gray-300 hover:text-red-400">
            <img src="src/assets/images/icon-logout.png" alt="" className='w-5 h-5'/>
            Logout
          </button>
        </div>
    </div>
  )
}

export default Navigation