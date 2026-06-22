function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Attendance Dashboard
          </h1>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            + Add Student
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Total Students</p>
            <h2 className="text-2xl font-bold text-blue-600">120</h2>
          </div>

          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Present Today</p>
            <h2 className="text-2xl font-bold text-green-600">98</h2>
          </div>

          <div className="bg-red-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Absent</p>
            <h2 className="text-2xl font-bold text-red-600">22</h2>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t hover:bg-gray-50">
                <td className="p-3">Nguyen Van A</td>
                <td className="p-3">Class 10A</td>
                <td className="p-3 text-green-600 font-semibold">Present</td>
              </tr>

              <tr className="border-t hover:bg-gray-50">
                <td className="p-3">Tran Thi B</td>
                <td className="p-3">Class 10A</td>
                <td className="p-3 text-red-600 font-semibold">Absent</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}

export default App